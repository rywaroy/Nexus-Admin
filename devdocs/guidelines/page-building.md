# 页面构建指南

在 `vue-vben-admin` 中添加一个新的页面、路由和菜单项是一个常规操作，遵循其约定即可。下面以 `web-antd` 应用为例，提供详细的步骤。

## 1. 创建页面组件

首先，你需要在 `apps/web-antd/src/views` 目录下创建一个新的 `.vue` 文件作为你的页面。为了更好地组织代码，建议根据业务模块创建子目录。

例如，创建一个新的 `demo` 页面：

- 在 `apps/web-antd/src/views` 下创建一个 `demo` 目录。
- 在 `apps/web-antd/src/views/demo` 目录下创建一个 `index.vue` 文件。

```vue
<template>
  <div class="p-4">这是一个新的演示页面</div>
</template>

<script lang="ts" setup>
// 你的页面逻辑
</script>
```

## 2. 添加路由配置

路由的配置是模块化的，存放在 `apps/web-antd/src/router/routes/modules` 目录下。你可以选择一个现有的模块文件（如 `demos.ts`）添加新的路由，或者创建一个新的模块文件。

创建一个新的 `demo.ts` 文件来管理演示页面的路由：

```typescript
// apps/web-antd/src/router/routes/modules/demo.ts
import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/demo',
    name: 'Demo',
    component: () => import('@/layouts/basic.vue'),
    meta: {
      title: '演示页面',
      icon: 'radix-icons:dashboard',
    },
    children: [
      {
        path: 'index',
        name: 'DemoIndex',
        component: () => import('@/views/demo/index.vue'),
        meta: {
          title: '演示页面',
        },
      },
    ],
  },
];

export default routes;
```

**关键配置说明：**

- `path`: 路由的访问路径。
- `name`: 路由的唯一名称，建议大写驼峰。
- `component`: 页面所使用的布局组件。通常，业务页面都使用 `basic.vue` 这个基础布局。
- `meta`: 路由的元信息，这是生成菜单的关键。
  - `title`: 会显示在菜单和 Tab 标签页上的标题。
  - `icon`: 菜单项的图标。项目内置了基于 Iconify（`@iconify/vue`）的图标方案，推荐直接使用 [Iconify](https://icones.js.org/) 上的图标名称（`前缀:名称`），例如 `ant-design:upload-outlined`。

## 3. 自动注册路由模块

`vue-vben-admin` 会自动加载 `apps/web-antd/src/router/routes/modules` 目录下的所有路由模块文件，所以你不需要手动导入新建的 `demo.ts` 文件。这个自动加载的逻辑可以在 `apps/web-antd/src/router/routes/index.ts` 文件中看到。

## 4. meta 对象详解

`meta` 对象是 `vue-router` 中一个非常强大和灵活的配置项，`vue-vben-admin` 在此基础上进行了扩展，用于实现菜单、权限、布局等各种功能。

### 核心字段

| 字段 | 类型 | 描述 |
| :-- | :-- | :-- |
| `title` | `string` | **必需。** 用于在菜单、面包屑和标签页中显示的标题。它支持国际化，你可以直接写入 `i18n` 的 `key`。 |
| `icon` | `string \| Component` | 菜单和面包屑的图标。推荐使用 [Iconify](https://icones.js.org/) 图标名（`前缀:名称`）；也支持直接传入 Vue 组件（如 `@ant-design/icons-vue`）。 |
| `roles` | `string[]` | **权限控制**：指定哪些角色可以访问该路由。 |
| `permissions` | `string[]` | **权限控制**：指定需要哪些权限点才能访问该路由。 |
| `access` | `(route: RouteLocationNormalized) => boolean` | **权限控制**：更灵活的函数式权限判断，返回 `true` 表示有权限。 |
| `hideMenu` | `boolean` | 如果设置为 `true`，该路由将不会显示在菜单中。 |
| `hideChildrenInMenu` | `boolean` | 如果设置为 `true`，子路由将不会显示在菜单中，通常用于只有一个子路由的情况。 |
| `order` | `number` | 菜单的排序，值越小越靠前。 |
| `keepAlive` | `boolean` | 如果设置为 `true`，页面在切换后会被缓存。 |
| `frameSrc` | `string` | 内嵌 `iframe` 的 `src` 地址。 |
| `external` | `boolean` | 如果设置为 `true`，表示该路由为外部链接。 |

### 权限限制的实现

`vue-vben-admin` 的权限控制主要通过 `meta` 对象中的 `roles`、`permissions` 和 `access` 字段来实现的。

#### 基于角色的权限控制 (`roles`)

这是最常见的权限控制方式。你可以在路由的 `meta` 对象中定义一个 `roles` 数组，只有当用户拥有该数组中至少一个角色时，才能访问该路由。

```typescript
meta: {
  title: '某个页面',
  roles: ['admin', 'editor'],
}
```

用户的角色信息通常在登录后从后端获取，并存储在 `pinia` 的 `access` store 中。路由守卫 (`router/guard.ts`) 会在每次路由跳转时，检查用户角色是否满足目标路由的 `roles` 要求。

#### 基于权限点的权限控制 (`permissions`)

对于更细粒度的权限控制（例如，控制页面上的某个按钮是否显示），`vue-vben-admin` 提供了基于权限点的控制。

```typescript
meta: {
  title: '用户管理',
  permissions: ['user:create', 'user:edit'],
}
```

#### 动态权限控制 (`access` 函数)

如果你需要更复杂的权限判断逻辑，可以使用 `access` 函数。这个函数会接收当前的路由对象作为参数，你可以根据路由信息、用户信息或其他状态来进行动态判断。

```typescript
meta: {
  title: '动态页面',
  access: (route) => {
    return someCondition;
  },
}
```

### 综合示例

```typescript
import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/advanced-demo',
    name: 'AdvancedDemo',
    component: () => import('@/layouts/basic.vue'),
    meta: {
      title: '高级演示',
      icon: 'radix-icons:gear',
      order: 10,
    },
    children: [
      {
        path: 'admin-only',
        name: 'AdminOnlyPage',
        component: () => import('@/views/demo/admin-only.vue'),
        meta: {
          title: '仅管理员可见',
          roles: ['admin'],
        },
      },
      {
        path: 'permission-required',
        name: 'PermissionRequiredPage',
        component: () => import('@/views/demo/permission-required.vue'),
        meta: {
          title: '需要特定权限',
          permissions: ['feature:export-data'],
          keepAlive: true,
        },
      },
      {
        path: 'hidden-page',
        name: 'HiddenPage',
        component: () => import('@/views/demo/hidden-page.vue'),
        meta: {
          title: '隐藏的页面',
          hideMenu: true,
        },
      },
    ],
  },
];

export default routes;
```
