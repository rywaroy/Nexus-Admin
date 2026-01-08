# Vben Drawer 抽屉组件

`Vben Drawer` 是一个从屏幕边缘滑出的面板组件，常用于展示详细信息、表单填写等场景。它通过 `useVbenDrawer` Hook 进行创建和管理，具有高度的灵活性和可配置性。

## 1. 核心用法

### 创建与连接

- 使用 `useVbenDrawer` Hook 创建抽屉实例 (`Drawer`) 和其控制器 (`drawerApi`)。
- 通过 `connectedComponent` 选项，可以将抽屉的内容和逻辑拆分到独立的 `.vue` 文件中，使代码结构更清晰。

### 打开与关闭

- `drawerApi.open()`: 打开抽屉。
- `drawerApi.close()`: 关闭抽屉。

### 基本配置与事件

- `title`: 设置抽屉标题。
- `placement`: 设置抽屉滑出的方向，可选值为 `'right'`, `'left'`, `'top'`, `'bottom'`。
- `onConfirm` / `onCancel`: 点击确认/取消按钮时的回调函数。
- `onClosed`: 关闭动画结束后的回调。

**示例代码**

```vue
// index.vue - 父组件
<script lang="ts" setup>
import { useVbenDrawer } from '@vben/common-ui';
import BaseDemo from './base-demo.vue';

const [BaseDrawer, baseDrawerApi] = useVbenDrawer({
  connectedComponent: BaseDemo,
});

function openBaseDrawer(placement: DrawerPlacement = 'right') {
  baseDrawerApi.setState({ placement }).open();
}
</script>
<template>
  <BaseDrawer />
  <Button type="primary" @click="openBaseDrawer('right')"> 右侧打开 </Button>
</template>

// base-demo.vue - 抽屉内容组件
<script lang="ts" setup>
import { useVbenDrawer } from '@vben/common-ui';

const [Drawer, drawerApi] = useVbenDrawer({
  onCancel() {
    drawerApi.close();
  },
});
</script>
<template>
  <Drawer title="基础抽屉示例"> 抽屉内容 </Drawer>
</template>
```

## 2. 特性与功能

### 动态配置

使用 `drawerApi.setState()` 方法可以从外部或内部动态修改抽屉的任何属性（如 `title`, `loading` 等）。

### 数据共享

- `drawerApi.setData(data)`: 在打开抽屉前，通过此方法将数据传递到抽屉内部。
- `drawerApi.getData()`: 在抽屉组件内部，通过此方法获取外部传入的数据。

### 内嵌表单

与 `VbenForm` 组件无缝集成。通过 `setData` 传入表单初始值 `values`。在 `onConfirm` 回调中调用表单的 `submitForm()` 方法，实现验证和提交一体化。

### 内容高度自适应

当抽屉内容高度超过可视区域时，会自动出现滚动条，无需手动计算。可以通过 `drawerApi.setState({ loading: true })` 来显示加载状态，常用于内容需要异步加载的场景。

### 在指定容器内打开

默认情况下，抽屉会覆盖整个页面。通过配置可以使其仅在父级内容区域内显示，不遮挡侧边栏和顶部导航。设置 `destroyOnClose: false` 可以在抽屉关闭后不清空内部状态（如输入框内容），实现类似 `KeepAlive` 的效果。

### 遮罩层模糊

通过 `setState({ overlayBlur: 5 })` 可以为抽屉的遮罩层添加毛玻璃（模糊）效果。

## 3. 内嵌表单示例

```vue
<script lang="ts" setup>
import { useVbenDrawer } from '@vben/common-ui';
import { useVbenForm } from '#/adapter/form';

const [Form, formApi] = useVbenForm({
  schema: [
    /* ...表单字段定义... */
  ],
  showDefaultActions: false,
});

const [Drawer, drawerApi] = useVbenDrawer({
  title: '内嵌表单示例',
  async onConfirm() {
    await formApi.submitForm();
    drawerApi.close();
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      const { values } = drawerApi.getData<Record<string, any>>();
      if (values) {
        formApi.setValues(values);
      }
    }
  },
});
</script>
<template>
  <Drawer>
    <Form />
  </Drawer>
</template>
```
