# Tiptap 富文本编辑器

`@vben/plugins/tiptap` 提供 `VbenTiptap` 编辑器和 `VbenTiptapPreview` 预览组件，支持常用文本排版、链接、图片及视频。图片和视频可以拖拽缩放，也可以选中后输入宽高；尺寸会保存在 HTML 内容中。

```vue
<script setup lang="ts">
import { ref } from "vue";
import { VbenTiptap } from "@vben/plugins/tiptap";
import { uploadEditorMedia } from "#/api/core/file";

const content = ref("");
const mediaUpload = {
  maxSize: 10 * 1024 * 1024,
  upload: uploadEditorMedia,
};
</script>

<template>
  <VbenTiptap v-model="content" :image-upload="mediaUpload" :video-upload="mediaUpload" />
</template>
```

`v-model` 保存 HTML。`imageUpload` / `videoUpload` 的 `upload(file, onProgress)` 返回媒体 URL，即可对接自己的上传接口；还可配置 `accept`、`maxSize` 和 `onUploadError`。工具栏、粘贴和拖入文件都支持上传。

Ant Design Vue 模板的 `uploadEditorMedia` 已对接 Nexus 的 `/file/upload`，沿用请求客户端的鉴权和上传进度。Playground 的 `/examples/tiptap` 使用 Mock 接口返回示例媒体地址。后台菜单模式下，菜单组件路径配置为 `examples/tiptap/index`。在 Vben Form 中可使用 `component: 'Tiptap'`，通过 `componentProps` 传入上传配置。
