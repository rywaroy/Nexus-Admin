import type { Extensions, JSONContent } from "@tiptap/core";
import type { Editor } from "@tiptap/vue-3";

import type { Component } from "vue";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    mediaUpload: {
      uploadImage: () => ReturnType;
      uploadVideo: () => ReturnType;
    };
    video: {
      setVideo: (attributes: {
        height?: number;
        poster?: string;
        src: string;
        width?: number;
      }) => ReturnType;
    };
  }
}

export interface MediaUploadOptions {
  accept?: string;
  maxSize?: number;
  onUploadError?: (error: unknown) => void;
  /** 返回可访问的媒体 URL；进度回调接收 0–100 的百分比。 */
  upload: (file: File, onProgress?: (percent: number) => void) => Promise<string>;
}

export type ImageUploadOptions = MediaUploadOptions;
export type VideoUploadOptions = MediaUploadOptions;

export interface TipTapProps {
  editable?: boolean;
  extensions?: Extensions;
  imageUpload?: ImageUploadOptions;
  videoUpload?: VideoUploadOptions;
  minHeight?: number | string;
  maxHeight?: number | string;
  placeholder?: string;
  previewable?: boolean;
  toolbar?: boolean;
}

export interface TipTapPreviewProps {
  class?: string;
  content?: string;
  minHeight?: number | string;
}

export interface VbenTiptapChangeEvent {
  html: string;
  json: JSONContent;
  text: string;
}

export interface VbenTiptapExtensionOptions {
  imageUpload?: ImageUploadOptions;
  videoUpload?: VideoUploadOptions;
  placeholder?: string;
}

export interface ToolbarAction {
  action: (editor: Editor) => void;
  active?: { attrs?: Record<string, unknown>; name: string };
  can?: (editor: Editor) => boolean;
  icon?: Component;
  indicatorColor?: (editor: Editor) => string | undefined;
  isActive?: (editor: Editor) => boolean;
  label: string;
  menu?: { items: ToolbarMenuItem[] };
  palette?: {
    apply: (editor: Editor, color: string) => void;
    clear?: (editor: Editor) => void;
    colors: string[];
    currentColor?: (editor: Editor) => string | undefined;
  };
  triggerText?: ((editor?: Editor) => string) | string;
}

export interface ToolbarMenuItem {
  action: (editor: Editor) => void;
  can?: (editor: Editor) => boolean;
  isActive?: (editor: Editor) => boolean;
  label: string;
  shortLabel: string;
}
