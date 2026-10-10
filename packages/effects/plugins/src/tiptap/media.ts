import type { NodeViewRenderer } from "@tiptap/core";

import { mergeAttributes, Node, ResizableNodeView } from "@tiptap/core";
import Image from "@tiptap/extension-image";

const renderMediaAttributes = (attributes: Record<string, any>) => {
  const { width, height } = attributes;
  return width && height
    ? mergeAttributes(attributes, {
        style: `width: ${width}px; aspect-ratio: ${width} / ${height};`,
      })
    : attributes;
};

const createMediaNodeView =
  (tag: "img" | "video"): NodeViewRenderer =>
  ({ node, editor, getPos }) => {
    const element = document.createElement(tag);
    element.draggable = false;

    const syncAttributes = (attributes: Record<string, any>) => {
      if (element.getAttribute("src") !== attributes.src)
        element.setAttribute("src", attributes.src);
      element.className = tag === "img" ? "vben-tiptap__image" : "vben-tiptap__video";
      element.style.width = attributes.width ? `${attributes.width}px` : "";
      element.style.height = attributes.height ? `${attributes.height}px` : "";
      if (element instanceof HTMLImageElement) {
        element.alt = attributes.alt ?? "";
        element.title = attributes.title ?? "";
      } else {
        element.controls = true;
        element.preload = "metadata";
        element.poster = attributes.poster ?? "";
      }
    };
    syncAttributes(node.attrs);

    return new ResizableNodeView({
      element,
      editor,
      node,
      getPos,
      onResize: (width, height) => {
        element.style.width = `${width}px`;
        element.style.height = `${height}px`;
      },
      onCommit: (width, height) => {
        const pos = getPos();
        if (pos === undefined) return;
        editor
          .chain()
          .setNodeSelection(pos)
          .updateAttributes(node.type.name, { width, height })
          .run();
      },
      onUpdate: (updatedNode) => {
        syncAttributes(updatedNode.attrs);
        return true;
      },
      options: {
        min: { width: 50, height: 50 },
        preserveAspectRatio: true,
      },
    });
  };

export const ResizableImage = Image.extend({
  addNodeView() {
    return createMediaNodeView("img");
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "img",
      renderMediaAttributes(mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)),
    ];
  },
}).configure({
  allowBase64: true,
  HTMLAttributes: { class: "vben-tiptap__image" },
});

export const Video = Node.create({
  name: "video",
  group: "block",
  atom: true,
  draggable: true,
  addAttributes() {
    return {
      src: { default: null },
      width: { default: 640 },
      height: { default: 360 },
      poster: { default: null },
    };
  },
  parseHTML() {
    return [{ tag: "video[src]" }];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "video",
      renderMediaAttributes(
        mergeAttributes(HTMLAttributes, {
          class: "vben-tiptap__video",
          controls: "",
          preload: "metadata",
        }),
      ),
    ];
  },
  addCommands() {
    return {
      setVideo:
        (attrs) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs }),
    };
  },
  addNodeView() {
    return createMediaNodeView("video");
  },
});
