# 开发文档

> **AI 助手提示**：本文档为概览索引。根据你的具体需求，请查阅对应的子文档以获取详细信息。
>
> - 需要了解项目结构？→ 查阅 [项目结构](./devdocs/project-structure.md)
> - 需要使用组件？→ 查阅 [组件文档](./devdocs/components/)
> - 需要创建页面？→ 查阅 [页面构建指南](./devdocs/guidelines/page-building.md) 和 [列表页模板](./devdocs/templates/list-page.md)

## 快速索引

### 项目基础

| 文档 | 描述 |
| --- | --- |
| [项目结构](./devdocs/project-structure.md) | 技术栈、目录结构、web-antd 应用详解 |

### 组件文档

| 组件 | 文档 | 适用场景 |
| --- | --- | --- |
| Vben Form | [vben-form.md](./devdocs/components/vben-form.md) | 表单创建、校验、动态表单 |
| VxeTable | [vxe-table.md](./devdocs/components/vxe-table.md) | 数据表格、远程加载、编辑功能 |
| Vben Modal | [vben-modal.md](./devdocs/components/vben-modal.md) | 弹窗、表单弹窗 |
| Vben Drawer | [vben-drawer.md](./devdocs/components/vben-drawer.md) | 抽屉面板、表单抽屉 |
| Icon | [icon.md](./devdocs/components/icon.md) | 图标使用、Iconify、图标选择器 |

### 开发指南

| 文档 | 描述 |
| --- | --- |
| [代码规范](./devdocs/guidelines/code-style.md) | 编码规范、通用组件 |
| [页面构建](./devdocs/guidelines/page-building.md) | 路由配置、meta 详解、权限控制 |

### 页面模板

| 模板 | 文档 | 适用场景 |
| --- | --- | --- |
| 列表页 | [list-page.md](./devdocs/templates/list-page.md) | CRUD 列表、数据管理页面 |

## 核心规范速览

1. **方法定义**：使用箭头函数
2. **异步处理**：优先使用 async/await
3. **Vue 模式**：严格使用 setup 模式
4. **组件优先级**：Vben 封装组件 > Ant Design Vue 组件

## 技术栈

- **前端框架**: Vue 3
- **构建工具**: Vite
- **包管理器**: pnpm (Monorepo)
- **UI 框架**: Ant Design Vue
- **状态管理**: Pinia
- **路由**: Vue Router
