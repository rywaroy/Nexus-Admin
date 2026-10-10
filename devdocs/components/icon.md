# 图标

应用静态图标从 `@vben/icons` 导入，例如 Key、Video、Plus。图标组件按 Vue 组件使用，并通过 class 设置尺寸和颜色。已导出的 Lucide 图标见 [lucide.ts](../../packages/@core/base/icons/src/lucide.ts)。

后端菜单保存 Iconify 图标名称，例如 `lucide:user`。需要动态渲染时使用 IconifyIcon 的 icon 属性；不要把字符串名称当作 Vue 组件导入。

表单图标选择器使用 `component: 'IconPicker'`，由 [应用组件适配器](../../apps/web-antd/src/adapter/component/index.ts) 配置输入组件和模型字段。业务例子见 [菜单表单](../../apps/web-antd/src/views/system/menu/modules/form.vue)。

新增静态图标先确认现有导出；需要增加导出时在共享图标包中沿用上游导出方式。完整公共导出见 [图标包](../../packages/icons/src/index.ts)。
