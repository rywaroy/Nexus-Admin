# VxeTable

业务从 `#/adapter/vxe-table` 导入 useVbenVxeGrid 和 VxeTableGridOptions，得到应用的表单适配和 CellTag、CellSwitch、CellOperation 渲染器。完整示例见 [list.vue](../../apps/web-antd/src/documentation/list.vue)。

`useVbenVxeGrid<行类型, 查询表单值类型, 查询提交值类型>({ formOptions, gridOptions, ... })` 返回 `[Grid, gridApi]`。查询表单字段遵循 [表单指南](vben-form.md)，表格列配置遵循 VxeTableGridOptions。

## 远程分页

在 gridOptions.proxyConfig.ajax.query 中读取 page.currentPage 和 page.pageSize，并合并查询表单参数。Nexus 系统接口返回 `{ list, total }`，分页表格查询需要返回 `{ items: result.list, total: result.total }`。不要照搬上游 Mock 的响应结构。

常用配置为 height、columns、rowConfig.keyField、proxyConfig 和 toolbarConfig。操作列可用 slots.default 对应模板插槽；查询表单使用 formOptions.schema，表格工具区使用 `#toolbar-tools`。

## 刷新与渲染器

保存成功后调用 `gridApi.query()` 或按已有模块使用 `reload()`。需要访问底层实例时使用 gridApi.grid；具体方法见 [表格实现](../../packages/effects/plugins/src/vxe-table/api.ts)。

业务渲染器的参数和事件见 [应用适配器](../../apps/web-antd/src/adapter/vxe-table.ts)。状态 0=启用、1=停用；CellSwitch 的 beforeChange 负责提交状态接口，CellOperation 结合业务权限决定操作项。不要修改公共默认配置去适配单个页面。

完整组件配置见 [上游文档](../../docs/src/components/common-ui/vben-vxe-table.md)，应用实例见 [用户列表](../../apps/web-antd/src/views/system/user/list.vue)。
