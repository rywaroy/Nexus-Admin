# Vben Modal 弹窗组件

`Vben Modal` 是一个灵活且功能丰富的弹窗组件，通过 `useVbenModal` 这个 Hook 进行创建和管理。它支持基础展示、动态内容更新、嵌套、拖拽以及与表单组件的深度集成等多种功能。

## 1. 核心用法

### 创建与连接

- 使用 `useVbenModal` Hook 来创建弹窗实例和控制器 (`modalApi`)。
- 通过 `connectedComponent` 选项，可以将弹窗的逻辑和内容拆分到独立的组件中，使代码更清晰。

### 打开与关闭

- `modalApi.open()`: 打开弹窗。
- `modalApi.close()`: 关闭弹窗。

### 生命周期事件

- `onConfirm`: 点击确认按钮时的回调。
- `onCancel`: 点击取消按钮或遮罩层时的回调。
- `onOpened` / `onClosed`: 弹窗打开/关闭动画结束后的回调。

### 基本配置

- `title`: 设置弹窗标题。
- `title-tooltip`: 为标题添加提示信息。
- `class`: 自定义弹窗样式，如宽度 `w-[600px]`。

**示例代码**

```vue
<script lang="ts" setup>
import { useVbenModal } from '@vben/common-ui';

const [Modal, modalApi] = useVbenModal({
  onCancel() {
    modalApi.close();
  },
  onConfirm() {
    message.info('onConfirm');
  },
});

function lockModal() {
  modalApi.lock();
  setTimeout(() => {
    modalApi.unlock();
  }, 3000);
}
</script>

<template>
  <Modal class="w-[600px]" title="基础弹窗示例"> 基础内容 </Modal>
</template>
```

## 2. 动态与数据交互

### 动态修改属性

使用 `modalApi.setState()` 可以动态地修改弹窗的任意属性（如 `title`, `fullscreen` 等）。

```vue
<script lang="ts" setup>
const [Modal, modalApi] = useVbenModal({ title: '动态修改配置示例' });

function handleUpdateTitle() {
  modalApi.setState({ title: '内部动态标题' });
}

function handleToggleFullscreen() {
  modalApi.setState((prev) => ({ ...prev, fullscreen: !prev.fullscreen }));
}
</script>
```

### 内外数据共享

- `modalApi.setData(data)`: 在打开弹窗前，通过此方法将外部数据传递给弹窗。
- `modalApi.getData()`: 在弹窗内部，通过此方法获取外部传入的数据。

## 3. 高级功能

### 内嵌表单

弹窗可以与 `VbenForm` 无缝集成。将表单组件作为 `connectedComponent`，并通过 `setData` 传递表单的初始值 `values`。在 `onConfirm` 回调中，可以调用表单实例的 `validateAndSubmitForm()` 来执行校验和提交逻辑。

### 内容高度自适应

弹窗可以根据其内部内容的高度自动调整自身高度，非常适合展示动态列表或不确定高度的内容。

### 可拖拽

设置 `draggable: true` 即可开启拖拽功能，用户可以通过按住弹窗头部来移动弹窗。

### 遮罩层模糊

通过 `overlayBlur` 属性可以为弹窗的遮罩层添加毛玻璃（模糊）效果，数值越大越模糊。

### 嵌套弹窗

支持在一个弹窗中打开另一个弹窗，实现复杂的交互流程。

## 4. 轻量级快捷弹窗

除了使用 `useVbenModal` 创建组件式弹窗外，项目还提供了几个便捷的函数式调用方法：

- `alert({ content, icon })`: 显示一个提示框。
- `confirm({ content, icon, beforeClose })`: 显示一个确认框，支持在关闭前执行异步操作。
- `prompt({ content, icon, componentProps })`: 显示一个带输入框的提示，用于获取用户输入。

```javascript
import { alert, confirm, prompt } from '@vben/common-ui';

function openAlert() {
  alert({
    content: '这是一个弹窗',
    icon: 'success',
  });
}

function openConfirm() {
  confirm({
    content: '这是一个确认弹窗',
    icon: 'question',
  }).then(() => {
    message.success('用户确认了操作');
  });
}

async function openPrompt() {
  prompt <
    string >
    {
      content: '中午吃了什么？',
    }.then((res) => {
      message.success(`用户输入了：${res}`);
    });
}
```

## 5. 内嵌表单完整示例

### 第 1 步：创建弹窗内容组件 (`form-modal-demo.vue`)

```vue
<script lang="ts" setup>
import { useVbenModal } from '@vben/common-ui';
import { message } from 'ant-design-vue';
import { useVbenForm } from '#/adapter/form';

defineOptions({
  name: 'FormModelDemo',
});

const [Form, formApi] = useVbenForm({
  handleSubmit: onSubmit,
  schema: [
    {
      component: 'Input',
      fieldName: 'field1',
      label: '字段1',
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'field2',
      label: '字段2',
      rules: z.string().min(1, { message: '最少输入1个字符' }),
    },
    {
      component: 'Select',
      componentProps: {
        options: [
          { label: '选项1', value: '1' },
          { label: '选项2', value: '2' },
        ],
      },
      fieldName: 'field3',
      label: '字段3',
      rules: 'required',
    },
  ],
  showDefaultActions: false,
});

const [Modal, modalApi] = useVbenModal({
  title: '内嵌表单示例',
  onCancel() {
    modalApi.close();
  },
  async onConfirm() {
    await formApi.validateAndSubmitForm();
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      const { values } = modalApi.getData<Record<string, any>>();
      if (values) {
        formApi.setValues(values);
      }
    }
  },
});

function onSubmit(values: Record<string, any>) {
  message.loading({
    content: '正在提交中...',
    duration: 0,
    key: 'is-form-submitting',
  });
  modalApi.lock();
  setTimeout(() => {
    modalApi.close();
    message.success({
      content: `提交成功：${JSON.stringify(values)}`,
      key: 'is-form-submitting',
    });
  }, 3000);
}
</script>

<template>
  <Modal>
    <Form />
  </Modal>
</template>
```

### 第 2 步：在父组件中调用 (`index.vue`)

```vue
<script lang="ts" setup>
import { Page, useVbenModal } from '@vben/common-ui';
import { Button } from 'ant-design-vue';
import FormModalDemo from './form-modal-demo.vue';

const [FormModal, formModalApi] = useVbenModal({
  connectedComponent: FormModalDemo,
});

function openFormModal() {
  formModalApi
    .setData({
      values: { field1: '外部传入的值', field2: '123' },
    })
    .open();
}
</script>

<template>
  <Page title="弹窗组件示例">
    <FormModal />

    <Card title="表单弹窗示例">
      <p>弹窗与表单结合</p>
      <template #actions>
        <Button type="primary" @click="openFormModal"> 打开表单弹窗 </Button>
      </template>
    </Card>
  </Page>
</template>
```
