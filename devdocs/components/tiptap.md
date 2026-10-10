# 富文本编辑器

项目提供基于 Tiptap 的 `VbenTiptap` 和 `VbenTiptapPreview`，从 `@vben/plugins/tiptap` 导入。支持常用文本排版、图片和视频上传，以及拖拽缩放和输入宽高。

`v-model` 保存 HTML；`imageUpload` / `videoUpload` 接收返回媒体 URL 的上传函数。Ant Design Vue 模板已有 `api/core/file.ts` 对接 `/file/upload`，可直接复用。表单可使用 `component: 'Tiptap'`，其模型字段为 `modelValue`。

示例页面：`apps/web-antd/src/views/examples/tiptap/index.vue`。后端菜单的组件路径为 `examples/tiptap/index`；Playground 示例地址为 `/examples/tiptap`。

简要用法见 [组件文档](../../docs/src/components/common-ui/vben-tiptap.md)。
