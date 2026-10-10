# 富文本编辑器

从 `@vben/plugins/tiptap` 导入 VbenTiptap、VbenTiptapPreview。默认扩展采用上游文本排版能力，二开保留图片/视频上传、进度、URL 插入、拖拽缩放和宽高输入。

v-model 保存 HTML；change 返回 `{ html, json, text }`。editable=false 禁止编辑并隐藏尺寸调整，toolbar=false 隐藏工具栏。minHeight 默认 240，maxHeight 默认 400。

## 上传与尺寸

imageUpload 和 videoUpload 都接受 `{ accept?, maxSize?, onUploadError?, upload }`。upload 签名为 `(file: File, onProgress?: (percent: number) => void) => Promise<string>`，返回可访问 URL。未设置 maxSize 时组件不限制大小；业务应按后端要求明确指定，不能依赖旧文档的 5MB 默认值。

[应用示例](../../apps/web-antd/src/views/examples/tiptap/index.vue) 使用 [上传 API](../../apps/web-antd/src/api/core/file.ts) 对接 `/file/upload`。上传过程的装饰节点不会把临时 blob URL 写进 v-model，组件销毁时清理预览 URL。图片和视频的 width、height 保留在 HTML 中，预览也能显示尺寸。

## 表单与路由

表单使用 `component: 'Tiptap'`，模型字段映射为 modelValue。后端菜单组件路径为 `examples/tiptap/index`；Playground 示例地址为 `/examples/tiptap`。

传入 extensions 会替换整个默认扩展集合，图片/视频上传菜单会隐藏。自行组合扩展时，必须包含对应的媒体节点和上传命令。

类型与实现见 [types.ts](../../packages/effects/plugins/src/tiptap/types.ts)、[extensions.ts](../../packages/effects/plugins/src/tiptap/extensions.ts)、[media-upload.ts](../../packages/effects/plugins/src/tiptap/media-upload.ts)、[media.ts](../../packages/effects/plugins/src/tiptap/media.ts)。其他属性见 [组件文档](../../docs/src/components/common-ui/vben-tiptap.md)。
