# 代码规范

## 基本规范

1. **方法定义请使用箭头函数**
2. **异步方法优先使用 async/await**
3. **本项目为 vue3 框架，请严格使用 setup 模式**
4. **请优先使用 Vben 框架的内部封装组件**如 Vben Form、Vben Modal、Vben Drawer、VxeTable 等，如果没有再使用 Ant Design Vue 组件

## 通用组件

### Page 容器组件

容器组件，展示页面信息，放在最外层

```vue
<script lang="ts" setup>
import { Page } from '@vben/common-ui';
</script>
<template>
  <Page></Page>
</template>
```

**Props 定义**

```ts
export interface PageProps {
  title?: string;
  description?: string;
  contentClass?: string;
  /**
   * 根据content可见高度自适应
   */
  autoContentHeight?: boolean;
  headerClass?: string;
  footerClass?: string;
  /**
   * Custom height offset value (in pixels) to adjust content area sizing
   * when used with autoContentHeight
   * @default 0
   */
  heightOffset?: number;
}
```
