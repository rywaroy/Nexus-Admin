# Nexus 前端开发文档（AI 入口）

本文档对应当前代码。上游同步基线为 `vbenjs/vue-vben-admin` 的 `main` 提交 `4ca6b09e399c`（2026-10-27），见 [同步说明](devdocs/upstream-sync.md)。根目录版本号仍为 5.7.0；底层 API 以源码和锁文件为准。

## 开发前必读

1. 业务应用是 `apps/web-antd`，Nexus 后端在同级 `../Nexus`。应用源码使用 `#/` 别名。
2. 表单、表格必须从 `#/adapter/form`、`#/adapter/vxe-table` 导入，以获得 Ant Design Vue 的组件适配和类型。Page、弹窗和抽屉从 `@vben/common-ui` 导入。
3. 当前表单底层为 TanStack Vue Form，校验为 Zod 4。不要引用旧版 vee-validate API。新联动使用 `dependencies.resolve`，重置使用 `reset()`。
4. 当前采用后端菜单模式：页面文件存在不代表用户能访问，还需要后端菜单、角色和权限配置。
5. 新业务放在应用层，使用 `<script setup lang="ts">`、箭头函数和 async/await。禁止无目的的兜底代码、无意义注释和子代理；未经用户主动要求，不使用 Playwright。
6. 修改公共组件、示例或依赖后，更新对应指南并运行 `pnpm check:devdocs`。示例 Vue 文件参与应用类型检查，不维护另一份完整教程。

## 文档索引

| 需求 | 文档 |
| --- | --- |
| 环境、目录、运行和构建 | [项目结构](devdocs/project-structure.md) |
| 同步上游、二开边界、API 迁移 | [同步说明](devdocs/upstream-sync.md) |
| 编码和验证要求 | [代码规范](devdocs/guidelines/code-style.md) |
| 页面、后端菜单和权限 | [页面构建](devdocs/guidelines/page-building.md) |
| 表单、校验、联动和插槽 | [Vben Form](devdocs/components/vben-form.md) |
| 远程表格、分页和操作列 | [VxeTable](devdocs/components/vxe-table.md) |
| 弹窗与传参 | [Vben Modal](devdocs/components/vben-modal.md) |
| CRUD 抽屉与传参 | [Vben Drawer](devdocs/components/vben-drawer.md) |
| 富文本、媒体上传和尺寸 | [Tiptap](devdocs/components/tiptap.md) |
| 字典缓存、业务选项和标签 | [字典](devdocs/components/dict.md) |
| 图标 | [Icon](devdocs/components/icon.md) |
| 可复制的列表页示例 | [列表页模板](devdocs/templates/list-page.md) |

## 验证命令

```sh
pnpm install --frozen-lockfile
pnpm dev:antd
pnpm check:devdocs
pnpm check:type
pnpm build:antd
```

完整底层 API 见仓库内的 [上游组件文档](docs/src/components/common-ui/)。本项目指南解释 Nexus 的实际接入方式；接口类型和组件属性以链接的源码为准。后续升级仍需核对指南，当前检查通过不代表未来版本自动兼容。
