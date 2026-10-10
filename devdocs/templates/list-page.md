# 列表页模板

以下 Vue 文件与应用共用类型检查，不在 Markdown 内维护另一份副本：

- [list.vue](../../apps/web-antd/src/documentation/list.vue)：角色列表、查询分页、编辑和新增。
- [drawer.vue](../../apps/web-antd/src/documentation/drawer.vue)：创建/编辑表单及提交。
- [form.vue](../../apps/web-antd/src/documentation/form.vue)：类型化字段、选择值和 dependencies.resolve。
- [modal.vue](../../apps/web-antd/src/documentation/modal.vue)：类型化弹窗参数。

示例调用真实角色 API，复制到业务模块前替换实体类型、接口、标题和 schema。list.vue 的 `./drawer.vue` 是示例目录相对路径，落地业务时改成该模块的 `./modules/form.vue`。

正式页面通常使用 `list.vue + data.ts + modules/form.vue`，参考 [角色模块](../../apps/web-antd/src/views/system/role/)。系统列表响应 `{ list, total }` 需要适配为 `{ items, total }`，状态 0=启用、1=停用。

实际业务还需要后端菜单、按钮权限、翻译、删除确认、成功提示和接口校验。示例展示可用 API，不能替代业务授权设计；路由接入见 [页面构建](../guidelines/page-building.md)。

复制或升级后执行 `pnpm check:devdocs`、应用 typecheck 和 build:antd；公共逻辑变化运行相关 Vitest 验证。
