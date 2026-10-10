import type { MediaUploadOptions } from "./types";

import { Editor } from "@tiptap/core";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createDefaultTiptapExtensions } from "./extensions";

const editors: Editor[] = [];
const createEditor = (
  options: Parameters<typeof createDefaultTiptapExtensions>[0] = {},
  content = "<p>Text</p>",
  editable = true,
) => {
  const element = document.createElement("div");
  document.body.append(element);
  const editor = new Editor({
    element,
    editable,
    content,
    extensions: createDefaultTiptapExtensions(options),
  });
  editors.push(editor);
  return editor;
};

const chooseFile = (editor: Editor, type: "image" | "video", file: File) => {
  if (type === "image") editor.commands.uploadImage();
  else editor.commands.uploadVideo();
  const input = document.querySelector<HTMLInputElement>('input[type="file"]')!;
  Object.defineProperty(input, "files", { value: [file] });
  input.dispatchEvent(new Event("change"));
};

beforeEach(() => {
  let id = 0;
  vi.spyOn(URL, "createObjectURL").mockImplementation(() => `blob:upload-${++id}`);
  vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
});

afterEach(() => {
  editors.splice(0).forEach((editor) => editor.destroy());
  document.body.innerHTML = "";
  vi.restoreAllMocks();
});

describe("Tiptap media sizing", () => {
  it.each(["image", "video"] as const)(
    "persists dragged %s dimensions and restores them from HTML",
    (type) => {
      const tag = type === "image" ? "img" : "video";
      const editor = createEditor(
        {},
        `<${tag} src="https://example.com/media" width="320" height="180"></${tag}>`,
      );
      const element = editor.view.dom.querySelector<HTMLElement>(tag)!;
      Object.defineProperties(element, {
        offsetWidth: { get: () => Number.parseFloat(element.style.width) },
        offsetHeight: { get: () => Number.parseFloat(element.style.height) },
      });
      const handle = editor.view.dom.querySelector('[data-resize-handle="bottom-right"]')!;
      expect(editor.view.dom.querySelectorAll("[data-resize-handle]")).toHaveLength(4);
      handle.dispatchEvent(new MouseEvent("mousedown", { clientX: 0, clientY: 0 }));
      document.dispatchEvent(new MouseEvent("mousemove", { clientX: 80, clientY: 45 }));
      document.dispatchEvent(new MouseEvent("mouseup"));
      expect(editor.getHTML()).toContain('width="400"');
      expect(editor.getHTML()).toContain('height="225"');
      const restored = createEditor({}, editor.getHTML());
      const restoredMedia = restored.view.dom.querySelector<HTMLElement>(tag)!;
      expect(restoredMedia.style.width).toBe("400px");
      expect(restoredMedia.style.height).toBe("225px");
    },
  );

  it.each(["image", "video"] as const)(
    "updates %s DOM dimensions after manually entering a different aspect ratio",
    (type) => {
      const tag = type === "image" ? "img" : "video";
      const editor = createEditor(
        {},
        `<${tag} src="https://example.com/media" width="320" height="180"></${tag}>`,
      );
      editor.chain().setNodeSelection(0).updateAttributes(type, { width: 240, height: 240 }).run();
      const media = editor.view.dom.querySelector<HTMLElement>(tag)!;
      expect(media.style.width).toBe("240px");
      expect(media.style.height).toBe("240px");
      expect(editor.getHTML()).toContain("aspect-ratio: 240 / 240");
      editor.commands.undo();
      expect(media.style.width).toBe("320px");
      expect(media.style.height).toBe("180px");
    },
  );

  it("keeps native video controls and poster through HTML serialization", () => {
    const editor = createEditor();
    editor.commands.setVideo({
      src: "https://example.com/movie.mp4",
      poster: "https://example.com/poster.png",
      width: 480,
      height: 270,
    });
    const restored = createEditor({}, editor.getHTML());
    const video = restored.view.dom.querySelector("video")!;
    expect(video.controls).toBe(true);
    expect(video.poster).toBe("https://example.com/poster.png");
    expect(video.style.width).toBe("480px");
  });

  it("removes resize handles when the editor becomes read-only", () => {
    const editor = createEditor({}, '<video src="https://example.com/movie.mp4"></video>');
    expect(editor.view.dom.querySelectorAll("[data-resize-handle]")).toHaveLength(4);
    editor.setEditable(false);
    expect(editor.view.dom.querySelectorAll("[data-resize-handle]")).toHaveLength(0);
  });
});

describe("Tiptap media uploads", () => {
  it.each(["image", "video"] as const)(
    "does not open the file picker when checking whether a %s upload is enabled",
    (type) => {
      const editor = createEditor({ [`${type}Upload`]: { upload: vi.fn() } });
      const enabled = type === "image" ? editor.can().uploadImage() : editor.can().uploadVideo();
      expect(enabled).toBe(true);
      expect(document.querySelector('input[type="file"]')).toBeNull();
    },
  );
  it.each(["image", "video"] as const)(
    "uploads a %s with progress without saving a blob URL",
    async (type) => {
      let complete!: (url: string) => void;
      let onProgress!: (percent: number) => void;
      const upload = vi.fn((_file: File, progress?: (percent: number) => void) => {
        onProgress = progress!;
        return new Promise<string>((resolve) => {
          complete = resolve;
        });
      });
      const editor = createEditor({ [`${type}Upload`]: { upload } });
      editor.commands.setTextSelection(3);
      const file = new File(["media"], "media", { type: `${type}/test` });
      chooseFile(editor, type, file);
      expect(upload).toHaveBeenCalledWith(file, expect.any(Function));
      expect(editor.view.dom.querySelector(".vben-tiptap-upload-wrapper")).not.toBeNull();
      expect(editor.getHTML()).not.toContain("blob:");
      onProgress(45);
      expect(
        editor.view.dom.querySelector<HTMLElement>(".vben-tiptap-upload-progress-fill")!.style
          .width,
      ).toBe("45%");
      editor.commands.insertContentAt(1, "Prefix ");
      complete("https://example.com/uploaded");
      await vi.waitFor(() => expect(editor.getHTML()).toContain("https://example.com/uploaded"));
      expect(editor.getHTML()).toContain("Prefix Te");
      expect(editor.view.dom.querySelector(".vben-tiptap-upload-wrapper")).toBeNull();
      expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:upload-1");
      editor.commands.undo();
      expect(editor.getHTML()).not.toContain("https://example.com/uploaded");
      expect(editor.getHTML()).not.toContain("blob:");
    },
  );

  it("reports a failed upload and removes the temporary preview", async () => {
    const onUploadError = vi.fn();
    const error = new Error("Upload rejected");
    const editor = createEditor({
      imageUpload: {
        upload: async () => {
          throw error;
        },
        onUploadError,
      },
    });
    chooseFile(editor, "image", new File(["image"], "image.png", { type: "image/png" }));
    await vi.waitFor(() => expect(onUploadError).toHaveBeenCalledWith(error));
    expect(editor.getHTML()).toBe("<p>Text</p>");
    expect(editor.view.dom.querySelector(".vben-tiptap-upload-wrapper")).toBeNull();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:upload-1");
  });

  it.each([
    {
      name: "oversized image",
      file: new File(["large"], "image.png", { type: "image/png" }),
      maxSize: 1,
      accept: "image/*",
    },
    {
      name: "non-image file",
      file: new File(["text"], "text.txt", { type: "text/plain" }),
      accept: "image/*",
    },
    {
      name: "disallowed image format",
      file: new File(["image"], "image.gif", { type: "image/gif" }),
      accept: ".png,image/jpeg",
    },
  ])("rejects $name before starting an upload", ({ file, maxSize, accept }) => {
    const upload = vi.fn(async () => "https://example.com/uploaded");
    const onUploadError = vi.fn();
    const editor = createEditor({ imageUpload: { upload, onUploadError, maxSize, accept } });
    chooseFile(editor, "image", file);
    expect(upload).not.toHaveBeenCalled();
    expect(onUploadError).toHaveBeenCalledWith(expect.any(Error));
    expect(URL.createObjectURL).not.toHaveBeenCalled();
    expect(document.querySelector('input[type="file"]')).toBeNull();
  });

  it("uses the same callbacks for pasted images and videos", async () => {
    const imageUpload: MediaUploadOptions = {
      upload: vi.fn(async () => "https://example.com/image.png"),
    };
    const videoUpload: MediaUploadOptions = {
      upload: vi.fn(async () => "https://example.com/video.mp4"),
    };
    const editor = createEditor({ imageUpload, videoUpload });
    const files = [
      new File(["image"], "image.png", { type: "image/png" }),
      new File(["video"], "video.mp4", { type: "video/mp4" }),
    ];
    const event = new Event("paste", { bubbles: true, cancelable: true });
    Object.defineProperty(event, "clipboardData", { value: { files, getData: () => "" } });
    editor.view.dom.dispatchEvent(event);
    await vi.waitFor(() => expect(editor.getHTML()).toContain("https://example.com/video.mp4"));
    expect(editor.getHTML()).toContain("https://example.com/image.png");
    expect(event.defaultPrevented).toBe(true);
  });

  it("does not insert a pending upload after the document is replaced", async () => {
    let complete!: (url: string) => void;
    const editor = createEditor({
      imageUpload: {
        upload: () =>
          new Promise((resolve) => {
            complete = resolve;
          }),
      },
    });
    editor.commands.setTextSelection(3);
    chooseFile(editor, "image", new File(["image"], "image.png", { type: "image/png" }));
    editor.commands.setContent("<p>Replacement</p>");
    complete("https://example.com/old-upload");
    await vi.waitFor(() => expect(URL.revokeObjectURL).toHaveBeenCalled());
    expect(editor.getHTML()).toBe("<p>Replacement</p>");
  });

  it("cleans up an in-flight upload when the editor is destroyed", async () => {
    let complete!: (url: string) => void;
    const onUploadError = vi.fn();
    const editor = createEditor({
      videoUpload: {
        upload: () =>
          new Promise((resolve) => {
            complete = resolve;
          }),
        onUploadError,
      },
    });
    chooseFile(editor, "video", new File(["video"], "video.mp4", { type: "video/mp4" }));
    editor.destroy();
    expect(URL.revokeObjectURL).toHaveBeenCalledTimes(1);
    complete("https://example.com/late-upload");
    await Promise.resolve();
    expect(URL.revokeObjectURL).toHaveBeenCalledTimes(1);
    expect(onUploadError).not.toHaveBeenCalled();
  });

  it("disables file selection in read-only mode", () => {
    const editor = createEditor({ imageUpload: { upload: vi.fn() } }, "<p>Text</p>", false);
    expect(editor.commands.uploadImage()).toBe(false);
    expect(document.querySelector('input[type="file"]')).toBeNull();
  });
});
