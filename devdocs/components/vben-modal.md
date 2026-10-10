# Vben Modal

从 `@vben/common-ui` 导入 useVbenModal，返回 `[Modal, modalApi]`。完整可编译示例见 [modal.vue](../../apps/web-antd/src/documentation/modal.vue)，属性和事件见 [上游文档](../../docs/src/components/common-ui/vben-modal.md)。

## 传参

`useVbenModal<TData>({ ... })` 在创建时声明数据类型；`modalApi.setData(data).open()` 写入数据并打开，`modalApi.getData()` 取得 `TData | undefined`。新版不使用 getData<T>()。

拆分子组件时，父页面配置 connectedComponent，子组件再次调用 useVbenModal。destroyOnClose 用于关闭后重新创建子组件。重复使用编辑弹窗时，在 onOpenChange 中重置表单并读取本次数据。多处共享同一参数约定可使用 createVbenModal<TData>() 工厂。

## 生命周期与提交

常用事件为 onOpenChange、onConfirm、onCancel、onBeforeClose、onOpened 和 onClosed。提交先 validate，再 getValues，再调用接口。`modalApi.lock()` 进入提交状态，在 finally 中 unlock，保存成功后 close。

常用方法为 open、close、setData、getData、setState、lock 和 unlock。属性如 title、footer、fullscreenButton、draggable、destroyOnClose 以实际源码为准，不复制旧版完整属性表。

轻量提示可从 `@vben/common-ui` 导入 alert、confirm、prompt。prompt 使用 `await prompt<string>({ content, defaultValue, componentProps })`；取消会拒绝 Promise，应按明确的取消行为处理。
