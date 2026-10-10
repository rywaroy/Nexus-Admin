# 页面构建

新业务先确认 Nexus 后端实体、接口和权限码，再按已有系统模块组织页面。参考 [角色模块](../../apps/web-antd/src/views/system/role/) 和 [列表页模板](../templates/list-page.md)。

## 实现顺序

1. 在 `src/api/system` 定义实体、请求和响应类型，并通过现有 requestClient 调用接口。
2. 在 `src/views/system/模块` 编写 `list.vue`、`data.ts` 和 `modules/form.vue`。
3. 列表使用 `#/adapter/vxe-table`，表单使用 `#/adapter/form`，抽屉使用 `@vben/common-ui`。
4. 添加应用翻译，复用状态和操作列渲染器，按后端权限码控制新增、编辑和删除入口。
5. 配置后端菜单和角色权限，再登录对应角色核对页面访问与按钮行为。

## 菜单和路由

应用使用 `accessMode: 'backend'`，配置在 [preferences.ts](../../apps/web-antd/src/preferences.ts)。菜单由 [菜单 API](../../apps/web-antd/src/api/core/menu.ts) 和 [访问守卫](../../apps/web-antd/src/router/guard.ts) 接入。

例如用户页面文件为 `src/views/system/user/list.vue`，后端菜单组件路径使用 `system/user/list`，路由 path 使用 `/system/user`。组件路径不包含 `src/views/` 或 `.vue`。具体菜单字段以 Nexus 后端接口和已有菜单为准；按钮节点使用相应权限码。

仅添加页面文件或本地路由不能替代后端菜单授权。富文本示例的组件路径为 `examples/tiptap/index`，未配置菜单时直接访问示例地址可能显示 404。

## 数据与提交

Nexus 系统列表通常返回 `{ list, total }`，表格分页查询需要转成 `{ items, total }`。状态 0 表示启用，1 表示停用。不要照搬上游 Mock 的字段或账户结构。

抽屉参数类型在 `useVbenDrawer<TData>()` 上声明。打开时 await reset 后读取和回填本次数据；确认时 validate，通过后 getValues 并保存，保存成功刷新列表。详见 [表单](../components/vben-form.md) 与 [抽屉](../components/vben-drawer.md)。

完成后更新文档和示例，运行 `pnpm check:devdocs`、应用类型检查与构建，验证实际后端菜单和页面交互。
