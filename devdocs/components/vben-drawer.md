# Vben Drawer

从 `@vben/common-ui` 导入 useVbenDrawer，返回 `[Drawer, drawerApi]`。可编译示例见 [drawer.vue](../../apps/web-antd/src/documentation/drawer.vue)，父列表接入见 [list.vue](../../apps/web-antd/src/documentation/list.vue)。

## 参数与打开

新版在 `useVbenDrawer<TData>()` 或 `createVbenDrawer<TData>()` 上声明类型，随后调用 getData；旧的 drawerApi.getData<T>() 已移除。getData 返回 TData 或 undefined，新增表单使用 Partial 实体或明确的新建/编辑数据类型。

父页面配置 connectedComponent 和 destroyOnClose，并调用 `drawerApi.setData(record).open()`。子表单在 onOpenChange(true) 中 await reset，再读取本次参数并 setValues。编辑 ID 保留在 record 中，提交值只包含接口要求的业务字段。

## 保存

确认回调先 validate，通过后 lock，再 getValues 并调用创建或编辑接口。保存成功 emit success 并 close；finally 中 unlock。父列表收到 success 后刷新。取消与关闭不保存数据。

常用方法为 open、close、setData、getData、setState、lock 和 unlock，常用事件为 onOpenChange、onConfirm、onCancel、onBeforeClose、onOpened 和 onClosed。完整配置见 [上游文档](../../docs/src/components/common-ui/vben-drawer.md)。

已有业务实例见 [用户抽屉](../../apps/web-antd/src/views/system/user/modules/form.vue)，字典数据的额外参数约定见 [数据表单](../../apps/web-antd/src/views/system/dict/modules/data-form.vue)。
