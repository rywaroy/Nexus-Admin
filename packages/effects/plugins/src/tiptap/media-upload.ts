import type { Editor } from "@tiptap/core";

import type { MediaUploadOptions, VbenTiptapExtensionOptions } from "./types";

import { $t } from "@vben/locales";

import { alert } from "@vben-core/popup-ui";

import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

type MediaType = "image" | "video";
type UploadAction = { add: Decoration } | { remove: string };
const uploadKey = new PluginKey<DecorationSet>("tiptapMediaUpload");

const reportError = (error: unknown, options: MediaUploadOptions) => {
  if (options.onUploadError) {
    options.onUploadError(error);
  } else {
    void alert(
      error instanceof Error ? error.message : String(error),
      $t("ui.tiptap.upload.uploadFailed"),
    ).catch(() => {
      // 提示框关闭会拒绝 Promise，关闭错误提示不应再次触发上传错误。
    });
  }
};

const validateFile = (file: File, type: MediaType, options: MediaUploadOptions) => {
  if (options.maxSize !== undefined && file.size > options.maxSize) {
    throw new Error($t("ui.tiptap.upload.fileTooLarge"));
  }
  const accepted = (options.accept ?? `${type}/*`).split(",").some((entry) => {
    const value = entry.trim();
    if (value === "*/*") return true;
    if (value.startsWith(".")) return file.name.toLowerCase().endsWith(value.toLowerCase());
    if (value.endsWith("/*")) return file.type.startsWith(value.slice(0, -1));
    return file.type === value;
  });
  if (!file.type.startsWith(`${type}/`) || !accepted) {
    throw new Error($t("ui.tiptap.upload.fileTypeNotAllowed"));
  }
};

export const createMediaUpload = (options: VbenTiptapExtensionOptions) => {
  const blobUrls = new Set<string>();

  const uploadFile = async (editor: Editor, file: File, type: MediaType, pos: number) => {
    const uploadOptions = options[`${type}Upload`]!;
    try {
      validateFile(file, type, uploadOptions);
    } catch (error) {
      reportError(error, uploadOptions);
      return;
    }

    const blobUrl = URL.createObjectURL(file);
    blobUrls.add(blobUrl);
    const wrapper = document.createElement("span");
    wrapper.className = "vben-tiptap-upload-wrapper";
    wrapper.contentEditable = "false";
    const media = document.createElement(type === "image" ? "img" : "video");
    media.src = blobUrl;
    if (media instanceof HTMLVideoElement) media.controls = true;
    const spinner = document.createElement("span");
    spinner.className = "vben-tiptap-upload-spinner";
    const progress = document.createElement("span");
    progress.className = "vben-tiptap-upload-progress";
    progress.hidden = true;
    const fill = document.createElement("span");
    fill.className = "vben-tiptap-upload-progress-fill";
    progress.append(fill);
    wrapper.append(media, spinner, progress);

    // 装饰节点会随事务映射位置，上传时输入文字不会改变文件的插入位置或写入 blob URL。
    const decoration = Decoration.widget(pos, () => wrapper, { key: blobUrl, side: -1 });
    editor.view.dispatch(
      editor.state.tr.setMeta(uploadKey, { add: decoration }).setMeta("addToHistory", false),
    );

    try {
      const url = await uploadOptions.upload(file, (percent) => {
        spinner.hidden = true;
        progress.hidden = false;
        fill.style.width = `${percent}%`;
      });
      if (editor.isDestroyed) return;
      const placeholder = uploadKey
        .getState(editor.state)!
        .find()
        .find((item) => item.spec.key === blobUrl);
      if (placeholder) {
        const transaction = editor.state.tr
          .replaceRangeWith(
            placeholder.from,
            placeholder.from,
            editor.schema.nodes[type]!.create({ src: url }),
          )
          .setMeta(uploadKey, { remove: blobUrl });
        editor.view.dispatch(transaction);
      }
    } catch (error) {
      if (editor.isDestroyed) return;
      editor.view.dispatch(
        editor.state.tr.setMeta(uploadKey, { remove: blobUrl }).setMeta("addToHistory", false),
      );
      reportError(error, uploadOptions);
    } finally {
      if (blobUrls.delete(blobUrl)) URL.revokeObjectURL(blobUrl);
    }
  };

  const selectFile = (editor: Editor, type: MediaType) => {
    const uploadOptions = options[`${type}Upload`]!;
    const input = document.createElement("input");
    input.type = "file";
    input.accept = uploadOptions.accept ?? `${type}/*`;
    input.hidden = true;
    const pos = editor.state.selection.from;
    input.addEventListener(
      "change",
      () => {
        const file = input.files?.[0];
        input.remove();
        if (file) void uploadFile(editor, file, type, pos);
      },
      { once: true },
    );
    input.addEventListener("cancel", () => input.remove(), { once: true });
    document.body.append(input);
    input.click();
    return true;
  };

  return Extension.create({
    name: "mediaUpload",
    addCommands() {
      return {
        uploadImage:
          () =>
          ({ editor, dispatch }) =>
            editor.isEditable &&
            Boolean(options.imageUpload) &&
            (!dispatch || selectFile(editor, "image")),
        uploadVideo:
          () =>
          ({ editor, dispatch }) =>
            editor.isEditable &&
            Boolean(options.videoUpload) &&
            (!dispatch || selectFile(editor, "video")),
      };
    },
    addProseMirrorPlugins() {
      const editor = this.editor;
      const handleFiles = (files: File[], pos: number) => {
        if (!editor.isEditable) return false;
        const mediaFiles = files.filter(
          (file) =>
            (file.type.startsWith("image/") && options.imageUpload) ||
            (file.type.startsWith("video/") && options.videoUpload),
        );
        for (const file of mediaFiles) {
          const type = file.type.startsWith("image/") ? "image" : "video";
          void uploadFile(editor, file, type, pos);
        }
        return mediaFiles.length > 0;
      };

      return [
        new Plugin<DecorationSet>({
          key: uploadKey,
          state: {
            init: () => DecorationSet.empty,
            apply: (transaction, decorations) => {
              // DecorationSet.map 接收事务映射和文档，并非数组回调。
              // eslint-disable-next-line unicorn/no-array-callback-reference, unicorn/no-array-method-this-argument
              const mapped = decorations.map(transaction.mapping, transaction.doc);
              const action = transaction.getMeta(uploadKey) as undefined | UploadAction;
              if (!action) return mapped;
              if ("add" in action) return mapped.add(transaction.doc, [action.add]);
              return mapped.remove(mapped.find().filter((item) => item.spec.key === action.remove));
            },
          },
          props: {
            decorations: (state) => uploadKey.getState(state),
            handlePaste: (view, event) => {
              const files = [...(event.clipboardData?.files ?? [])];
              return handleFiles(files, view.state.selection.from);
            },
            handleDrop: (view, event, _slice, moved) => {
              if (moved) return false;
              const files = [...(event.dataTransfer?.files ?? [])];
              if (files.length === 0) return false;
              const position = view.posAtCoords({ left: event.clientX, top: event.clientY });
              return handleFiles(files, position?.pos ?? view.state.selection.from);
            },
          },
          view: () => ({
            destroy: () => {
              for (const url of blobUrls) URL.revokeObjectURL(url);
              blobUrls.clear();
            },
          }),
        }),
      ];
    },
  });
};
