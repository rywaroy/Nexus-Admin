# 图标使用文档

Vben Admin 项目深度集成了图标方案，提供了多种灵活的方式来使用图标，主要包括 Iconify、本地 SVG 图标和图标选择器组件。

## 1. Iconify 图标库 (推荐)

项目集成了 [Iconify](https://icon-sets.iconify.design/)，它是一个海量的图标库集合，包含了 Material Design Icons (mdi), Ant Design Icons, Font Awesome 等超过200,000个图标。这是最推荐的使用方式。

**用法**

你可以直接将 Iconify 图标作为 Vue 组件来使用。组件名称遵循 `@vben/icons` 规范。

- **命名**: 组件名由 `[IconSet]` + `[IconName]` 组成，例如 `MdiGithub`、`MdiGoogle`。
- **样式**: 可以像普通 HTML 元素一样，通过 `class` 属性来控制图标的大小、颜色等。

```vue
<script lang="ts" setup>
import { MdiGithub, MdiGoogle, MdiQqchat, MdiWechat } from '@vben/icons';
</script>

<template>
  <Card title="Iconify">
    <div class="flex items-center gap-5">
      <MdiGithub class="size-8" />
      <MdiGoogle class="size-8 text-red-500" />
      <MdiQqchat class="size-8 text-green-500" />
      <MdiWechat class="size-8" />
    </div>
  </Card>
</template>
```

## 2. 本地 SVG 图标

对于项目特有或者需要离线使用的图标，可以将其作为 SVG 文件存放在项目中，并像 Iconify 图标一样作为组件导入和使用。

- **命名**: 同样遵循 `@vben/icons` 规范，例如 `SvgAvatar1Icon`、`SvgBellIcon`。
- **存放位置**: 放在 `packages/icons/src/svg/icons` 文件夹，`packages/icons/src/svg/index.ts` 文件中导出。

```vue
<script lang="ts" setup>
import {
  SvgAvatar1Icon,
  SvgBellIcon,
  SvgCardIcon,
  SvgDownloadIcon,
} from '@vben/icons';
</script>

<template>
  <Card title="Svg Icons">
    <div class="flex items-center gap-5">
      <SvgAvatar1Icon class="size-8" />
      <SvgBellIcon class="size-8" />
      <SvgCardIcon class="size-8" />
      <SvgDownloadIcon class="size-8" />
    </div>
  </Card>
</template>
```

## 3. Tailwind CSS 类名方式

可以直接通过 `class` 的方式使用 Iconify 图标，无需在 `<script>` 中导入。

- **格式**: `icon-[<icon-set>--<icon-name>]`。
- **优点**: 非常便捷，适合在模板中快速添加图标。

```vue
<template>
  <Card title="Tailwind CSS">
    <div class="flex items-center gap-5 text-3xl">
      <span class="icon-[ant-design--alipay-circle-outlined]"></span>
      <span class="icon-[ant-design--account-book-filled]"></span>
      <span class="icon-[svg-spinners--wind-toy]"></span>
      <span class="icon-[svg-spinners--blocks-wave]"></span>
    </div>
  </Card>
</template>
```

## 4. 统一渲染组件：VbenIcon（推荐）

在项目里，菜单、面包屑、Tab、按钮等位置最终都是通过 `VbenIcon` 统一渲染图标。它支持多种输入形式：

- **Iconify 图标名（推荐）**：`icon="ant-design:upload-outlined"`（格式：`前缀:名称`）
- **Vue 组件**：`:icon="UploadOutlined"`（例如 `@ant-design/icons-vue`）
- **远程图片**：`icon="https://xxx/icon.svg"`（http/https）
- **默认占位**：`fallback`（没有传 `icon` 时显示默认图标）

```vue
<script lang="ts" setup>
import { UploadOutlined } from '@ant-design/icons-vue';
import { VbenIcon } from '@vben-core/shadcn-ui';
</script>

<template>
  <!-- Iconify：前缀:名称 -->
  <VbenIcon icon="ant-design:upload-outlined" class="size-5" />

  <!-- Ant Design Vue 图标组件 -->
  <VbenIcon :icon="UploadOutlined" class="size-5" />

  <!-- 远程图片 -->
  <VbenIcon icon="https://example.com/icon.svg" class="size-5" />

  <!-- 没有 icon 时使用默认占位 -->
  <VbenIcon fallback class="size-5" />
</template>
```

## 5. IconifyIcon（只渲染 Iconify 字符串）

如果你只需要渲染 Iconify 图标名字符串（例如路由 `meta.icon`、后端下发的 `icon` 字段），也可以直接用 `IconifyIcon`：

```vue
<script lang="ts" setup>
import { IconifyIcon } from '@vben/icons';
</script>

<template>
  <IconifyIcon icon="ant-design:upload-outlined" class="size-5" />
</template>
```

## 6. Ant Design 图标使用方式

项目里"Ant Design 图标"通常有三条路线，按推荐顺序如下：

### Iconify（推荐）

使用 `ant-design:<icon-name>`，适合路由 `meta.icon`、菜单配置、`VbenIcon/IconifyIcon`。

```ts
// 路由 meta.icon 示例
meta: {
  title: '系统管理',
  icon: 'ant-design:setting-outlined',
}
```

### Tailwind 类名方式

注意这里用 `--` 连接（`icon-[ant-design--setting-outlined]`），不是 `:`

```vue
<template>
  <span class="icon-[ant-design--setting-outlined] text-xl"></span>
</template>
```

### @ant-design/icons-vue 组件方式

适合你希望以"组件"形态直接使用

```vue
<script lang="ts" setup>
import { SettingOutlined } from '@ant-design/icons-vue';
</script>

<template>
  <SettingOutlined class="text-xl" />
</template>
```

## 7. IconPicker（图标选择器）

`IconPicker` 选择后输出的值是 **Iconify 图标名字符串**（例如 `ant-design:upload-outlined`），适合保存到数据库、写入路由 `meta.icon` 或菜单配置中。

- `prefix`：图标集前缀（如 `ant-design`、`carbon`、`mdi`）
- `autoFetchApi`：默认 `true`，会请求 `https://api.iconify.design` 获取图标列表（需要网络）
  - 如果你的环境无法访问该接口：可设置 `autoFetchApi: false` 并手动传入 `icons: string[]`，或直接使用本地 `svg:` 图标

```ts
// 表单 Schema 示例（以 vben-form 为例）
{
  component: 'IconPicker',
  componentProps: {
    prefix: 'ant-design',
  },
  fieldName: 'icon',
  label: '图标',
}
```
