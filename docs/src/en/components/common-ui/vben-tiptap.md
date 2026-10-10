# Tiptap Rich Text Editor

Import `VbenTiptap` and `VbenTiptapPreview` from `@vben/plugins/tiptap`. The editor supports text formatting, links, images, and videos. Drag a media corner to resize, or select it and enter its width and height. Dimensions are saved in the HTML content.

```vue
<script setup lang="ts">
import { ref } from "vue";
import { VbenTiptap } from "@vben/plugins/tiptap";
import { uploadEditorMedia } from "#/api/core/file";

const content = ref("");
const mediaUpload = { upload: uploadEditorMedia };
</script>

<template>
  <VbenTiptap v-model="content" :image-upload="mediaUpload" :video-upload="mediaUpload" />
</template>
```

`v-model` contains HTML. Provide an `upload(file, onProgress)` function returning a media URL through `imageUpload` and `videoUpload`. Optional settings include `accept`, `maxSize`, and `onUploadError`. Toolbar selection, pasted files, and dropped files use the same upload function.

The Ant Design Vue template connects `uploadEditorMedia` to Nexus's `/file/upload`, including authentication and progress. The Playground example at `/examples/tiptap` returns sample media through its mock API. For backend menus, use `examples/tiptap/index` as the component path. Vben Form supports `component: 'Tiptap'`, with upload options passed through `componentProps`.
