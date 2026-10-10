<script setup lang="ts">
import type { MediaUploadOptions } from "@vben/plugins/tiptap";

import { ref } from "vue";

import { Page } from "@vben/common-ui";
import { VbenTiptap, VbenTiptapPreview } from "@vben/plugins/tiptap";

import { Card, message, Switch } from "ant-design-vue";

import { uploadEditorMedia } from "#/api/examples/tiptap";

const content = ref(
  "<h2>Tiptap 富文本编辑器</h2><p>支持图片和视频上传。选中媒体后可输入宽高，也可以拖动四角调整尺寸。</p>",
);
const editable = ref(true);
const mediaUpload: MediaUploadOptions = {
  maxSize: 10 * 1024 * 1024,
  upload: uploadEditorMedia,
  onUploadError: (error) => message.error((error as Error).message),
};
</script>

<template>
  <Page
    title="Tiptap 富文本编辑器"
    description="支持文本排版、图片和视频上传、媒体尺寸调整与内容预览。此示例使用 Mock 上传接口，返回示例媒体地址。"
  >
    <Card title="编辑器" class="mb-4">
      <div class="mb-4 flex items-center gap-2">
        <span>允许编辑</span>
        <Switch v-model:checked="editable" />
      </div>
      <VbenTiptap
        v-model="content"
        :editable="editable"
        :image-upload="mediaUpload"
        :video-upload="mediaUpload"
      />
    </Card>
    <Card title="内容预览" class="mb-4">
      <VbenTiptapPreview :content="content" />
    </Card>
    <Card title="HTML 内容">
      <pre class="whitespace-pre-wrap break-all text-sm">{{ content }}</pre>
    </Card>
  </Page>
</template>
