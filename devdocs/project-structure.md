# 项目结构

Nexus 是 Vue Vben Admin 的二开项目。业务运行于 `apps/web-antd`，UI 使用 Ant Design Vue；其他 UI 应用和 Playground 跟随上游维护。

## 环境

当前 Node 要求为 `^22.18.0 || ^24.12.0`，包管理器为 pnpm 11.16.0。精确要求见 [package.json](../package.json)，依赖目录和版本见 [pnpm-workspace.yaml](../pnpm-workspace.yaml) 与 [锁文件](../pnpm-lock.yaml)。Vue、Vite、TypeScript、TanStack Vue Form 和 Zod 随上游升级，不复制旧版本安装指令。

```sh
pnpm install --frozen-lockfile
pnpm dev:antd
pnpm check:devdocs
pnpm check:type
pnpm build:antd
```

Nexus 后端目录是同级 `../Nexus`。前端开发代理将 `/api` 转发到 `http://localhost:3000`，保留 `/api` 前缀，见 [vite.config.ts](../apps/web-antd/vite.config.ts)。业务调试需要启动该后端，不能用上游 Mock 的账户或响应结构代替。

## 常用目录

| 位置 | 用途 |
| --- | --- |
| `apps/web-antd/src/views/system` | 菜单、部门、角色、用户、字典、日志和岗位页面 |
| `apps/web-antd/src/api/system` | Nexus 业务接口与类型 |
| `apps/web-antd/src/api/core` | 登录、用户、菜单和文件上传 |
| `apps/web-antd/src/adapter` | 表单和表格的应用适配器 |
| `apps/web-antd/src/router` | 路由、后端菜单和访问守卫 |
| `apps/web-antd/src/preferences.ts` | 应用品牌与后端菜单模式 |
| `apps/web-antd/src/locales/langs` | 应用翻译 |
| `apps/web-antd/src/documentation` | 参与类型检查的开发示例 |
| `packages/@core` | 上游基础 UI 与工具 |
| `packages/effects` | 对外公共组件、插件、请求和布局 |
| `internal`、`scripts` | 构建、检查和开发工具 |
| `docs`、`playground` | 上游文档与示例 |

`#/` 指向应用的 src，`@vben/*` 是工作区公共包。需要新增公共 API 时先检查已有导出；应用表单和表格仍通过 adapter 导入。二开边界见 [同步说明](upstream-sync.md)。
