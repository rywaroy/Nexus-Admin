# 上游同步说明

## 本次基线

- 开源仓库：`vbenjs/vue-vben-admin`，Git remote 名称 `upstream`。
- 二开仓库：`rywaroy/Nexus-Admin`，Git remote 名称 `origin`。
- 同步到上游 `main` 的 `4ca6b09e399c`，日期 2026-10-27，本次接入日期 2026-10-28。
- 前次同步基线：`533e2464670f525204428e37c2a9a3d39eac3e4b`（2026-10-09）。本次合入其后的 11 个上游提交。

共享表单底层的二开差异主要是格式，采用上游实现。公共包、构建配置、其他 UI 应用和官方文档随上游更新；Nexus 业务、后端 API、登录入口精简、通知隐藏和已删除的 Ant Design 演示页面保留。

## 保留的二开边界

| 范围 | 位置 |
| --- | --- |
| 业务页面与接口 | `apps/web-antd/src/views/system`、`src/api/system` |
| Nexus 登录/用户/菜单及代理 | `apps/web-antd/src/api/core`、`src/api/request.ts`、`src/router`、`vite.config.ts` |
| 品牌和 Logo | `apps/web-antd/src/preferences.ts`、`public/logo.png` |
| 隐藏登录入口、通知和外链入口 | 应用登录页、`src/layouts/basic.vue` |
| 表格业务渲染器 | `apps/web-antd/src/adapter/vxe-table.ts` |
| 修改密码 | 应用页面和 `packages/effects/common-ui/src/ui/authentication/change-password.vue` |
| admin 按钮权限放行 | `packages/effects/access/src/use-access.ts` |
| 富文本视频、尺寸及上传 | `packages/effects/plugins/src/tiptap/media.ts`、`media-upload.ts`，以及组件接入代码 |
| AI 指南 | `development.md`、`devdocs` |

品牌配置和登录入口隐藏已经移到应用层，减少修改共享默认值。未来不能直接用 upstream 覆盖上表中的公共二开文件。

## 2026-10-28 接入

- 同步字典 Store、IconPicker 双向绑定、共享滚动锁、缓存页面弹窗、双列菜单和 StateHandler 并发等待修复。
- Ant Design 表单新增 `IconPicker: 'modelValue'` 映射，保留 `Tiptap: 'modelValue'`。
- 业务字典通过 Nexus `/system/dict/options` 读取，初始化阶段注册处理器，首次完成权限路由检查后异步预加载；版本匹配时复用持久化缓存。
- 原有字典管理接口与权限保持；新增只读选项接口要求登录，并筛选启用的类型和字典项。字典写入成功后清除前端缓存；管理页支持手动刷新服务端与前端缓存。
- `CellDict` 渲染字典标签；`CellOperation` 支持 `renderMode: 'menu'`、`menuCodes`。Ant Design Vue 使用 `overlay` 插槽，用户列表将重置密码收进更多菜单，保留编辑、删除及原有权限判断。
- 依赖采用上游 catalog，修复合并后富文本测试依赖残留的锁文件引用。富文本上传、视频、尺寸扩展继续保留。
- 同级 Nexus 新增字典选项控制器和版本查询，无数据库结构或初始化数据变更。前后端需一同发布。

## 前次 API 迁移（2026-10-10）

- 表单底层由 vee-validate 切换为 TanStack Vue Form，Zod 升级为 4。
- 表单、表格适配器使用新的组件属性映射与值类型泛型。
- `drawerApi.getData<T>()` 改为 `useVbenDrawer<T>()` + `getData()`，Modal 同理。
- 自定义字段插槽的更新回调位于 `componentField` 或 `componentProps`。
- 表单重置使用 `reset()`；需要校验并提交时使用 `validateAndSubmit()`。旧的 resetForm/submitForm 仅作兼容保留。
- Zod refine 动态错误使用 error 回调；表单跨字段组件参数使用 dependencies.resolve。
- Node、pnpm、Vite 等版本以根目录 package.json、catalog 和锁文件为准。

表单运行时代码保持上游实现。两个上游测试文件补充异步校验等待，测试组件按钮明确为 button，避免测试尚未完成校验或意外提交表单。

## 以后同步的检查顺序

1. 先检查工作区并保留未提交业务改动；fetch upstream，确认目标提交。
2. 在升级分支合并上游，检查真实逻辑差异；格式冲突不能当作底层二开。
3. 以最新上游公共实现为基础迁移上述少量扩展，保留精简行为和后端接口。
4. 更新 development.md 的基线和相关子文档，不只改版本号。
5. 执行 `pnpm check:devdocs`、应用类型检查、构建和相关单测，再验证实际页面。
6. 确认结果后合并升级分支。后续 Git 合并必须保留上游父提交，便于从新的共同基线继续同步。

文档检查覆盖本地链接和示例类型；API 联调和浏览器行为仍需对应验证。没有持续自动监控，未来同步时必须重复此流程。

## 本次验证（2026-10-28）

- 升级前：前端相关测试 90 项、后端测试 11 项通过。
- 升级后：`pnpm test:unit`，97 个测试文件、705 项测试通过；涵盖登录跳转、业务列表、表单、弹窗、菜单、字典缓存和富文本媒体扩展。
- `pnpm check:type`：六个应用类型检查通过；`pnpm check:devdocs`：开发文档链接及示例类型检查通过。
- `pnpm build:antd`、Nexus `pnpm build` 通过。
- Nexus `pnpm exec jest --runInBand`：17 项测试通过，含真实认证/权限守卫下的业务字典读取与管理权限验证，数据库调用使用测试替身。
- `pnpm install --frozen-lockfile --offline` 通过。

验证覆盖自动化测试和构建，真实数据库联调及浏览器交互验收待执行。
