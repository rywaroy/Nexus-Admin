# 列表页模板

此文档旨在分析角色管理页面的实现方式，并提供一个可复用的模板和最佳实践，用于快速创建其他数据列表管理页面。

## 一、核心设计思想

该页面遵循关注点分离 (SoC) 的原则，将页面结构、配置和业务逻辑拆分到不同的文件中，使得代码更易于维护和复用。

- `index.vue`: 页面主入口，负责组合表格、抽屉和处理用户交互事件。
- `data.ts`: 配置文件，负责定义表格列 (`columns`)、搜索表单 (`GridFormSchema`) 和编辑/新建表单 (`FormSchema`) 的结构。
- `components/form.vue`: 独立的表单组件，用于新建和编辑数据，被 `index.vue` 中的抽屉 (Drawer) 调用。
- `hooks`: hooks 文件夹，负责存放 useXXX 等封装业务逻辑的 hooks 方法

## 二、文件结构详解

### 1. `data.ts` - 配置文件

这是创建管理页面的第一步。将所有静态配置（如表单结构、表格列）集中在此，使得主页面 (`index.vue`) 的逻辑更纯粹。

- **`useGridFormSchema()`**: 定义了表格上方的搜索表单的字段。
  - `component`: 指定要渲染的组件类型 (e.g., 'Input', 'Select')。
  - `fieldName`: 字段名，用于数据绑定。
  - `label`: 字段标签。
- **`useColumns()`**: 定义了 `VxeTable` 的列。
  - **自定义渲染**: 使用 `cellRender` 来自定义单元格的显示方式。
    - `name: 'CellSwitch'`: 渲染成一个开关组件，常用于修改状态。通过 `attrs: { beforeChange: onStatusChange }` 可以在状态改变前执行异步确认操作。
    - `name: 'CellOperation'`: 渲染成标准的操作按钮组（如编辑、删除）。通过 `attrs: { onClick: onActionClick }` 将点击事件传递给父组件处理。
- **`useFormSchema()`**: 定义了在抽屉中用于新建/编辑角色的表单字段。

### 2. `components/form.vue` - 新建/编辑表单组件

这是一个独立的、可复用的表单组件，被包裹在抽屉中。

- **初始化**:
  - 使用 `useVbenForm` 创建表单实例，并从 `data.ts` 引入 `useFormSchema` 来定义表单结构。
  - 使用 `useVbenDrawer` 创建抽屉实例，并定义其核心逻辑。
- **核心逻辑**:
  - `onOpenChange`: 抽屉打开时触发。通过 `drawerApi.getData()` 获取从列表页传来的数据。
    - 如果 `data` 存在，则为 **编辑模式**，使用 `formApi.setValues(data)` 回填表单数据。
    - 如果 `data` 不存在，则为 **新建模式**，表单为空。
  - `onConfirm`: 点击抽屉的确认按钮时触发。
    - 调用 `formApi.validate()` 进行表单校验。
    - 校验成功后，调用 `createRole` 或 `updateRole` API 提交数据。
    - 成功后，触发 `emits('success')` 事件通知父组件刷新列表，并关闭抽屉。

**示例代码 (`components/form.vue`):**

```vue
<script lang="ts" setup>
// ...
const [Form, formApi] = useVbenForm({
  schema: useFormSchema(),
  showDefaultActions: false,
});

const [Drawer, drawerApi] = useVbenDrawer({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;
    const values = await formApi.getValues();
    drawerApi.lock();
    (id.value ? updateRole(id.value, values) : createRole(values)).then(() => {
      emits('success');
      drawerApi.close();
    });
  },
  onOpenChange(isOpen) {
    if (isOpen) {
      const data = drawerApi.getData<SystemRoleApi.SystemRole>();
      if (data) {
        formApi.setValues(data);
      }
    }
  },
});
</script>
<template>
  <Drawer :title="getDrawerTitle">
    <Form />
  </Drawer>
</template>
```

### 3. `index.vue` - 列表页面

这是页面的主容器，负责将各个部分组合起来。

- **初始化**:
  - `useVbenDrawer`: 创建一个与 `Form` 组件连接的抽屉实例。
  - `useVbenVxeGrid`: 创建表格实例，并整合了搜索表单和表格的配置。
    - `formOptions`: 传入 `useGridFormSchema()` 的配置，并设置 `submitOnChange: true` 使表单值变化时自动刷新表格。
    - `gridOptions`: 传入 `useColumns()` 的配置，并定义数据请求代理 `proxyConfig`。
- **数据请求**:
  - `proxyConfig.ajax.query`: 定义了获取列表数据的异步函数。它会自动接收分页信息 (`page`) 和搜索表单的值 (`formValues`) 作为参数，然后调用 `getRoleList` API。
- **核心交互逻辑**:
  - **新建**: 点击 "新建" 按钮，调用 `formDrawerApi.setData({}).open()` 打开一个空的表单抽屉。
  - **编辑**: `onActionClick` 中，当 `code` 为 `'edit'` 时，调用 `formDrawerApi.setData(row).open()` 打开抽屉并传入当前行的数据。
  - **删除**: `onActionClick` 中，当 `code` 为 `'delete'` 时，显示确认提示，然后调用 `deleteRole` API，成功后调用 `onRefresh` 刷新表格。
  - **刷新**: `onRefresh` 函数调用 `gridApi.query()` 来重新加载表格数据。
  - **监听成功事件**: 在 `<FormDrawer @success="onRefresh" />` 上监听 `success` 事件。当 `form.vue` 成功保存数据后，会触发此事件来刷新列表。

**示例代码 (`index.vue`):**

```vue
<script lang="ts" setup>
// 1. 创建与 Form.vue 连接的抽屉
const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: Form,
  destroyOnClose: true,
});

// 2. 创建表格实例
const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    schema: useGridFormSchema(),
    submitOnChange: true,
  },
  gridOptions: {
    columns: useColumns(onActionClick, onStatusChange),
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          return await getRoleList({
            /* ...params */
          });
        },
      },
    },
  } as VxeTableGridOptions<SystemRoleApi.SystemRole>,
});

// 3. 处理表格操作列的点击事件
function onActionClick(e: OnActionClickParams<SystemRoleApi.SystemRole>) {
  switch (e.code) {
    case 'delete':
      onDelete(e.row);
      break;
    case 'edit':
      onEdit(e.row);
      break;
  }
}

// 4. 编辑操作
function onEdit(row: SystemRoleApi.SystemRole) {
  formDrawerApi.setData(row).open();
}

// 5. 刷新表格
function onRefresh() {
  gridApi.query();
}
</script>

<template>
  <Page auto-content-height>
    <FormDrawer @success="onRefresh" />
    <Grid :table-title="$t('system.role.list')">
      <template #toolbar-tools>
        <Button type="primary" @click="onCreate">
          <Plus class="size-5" />
          {{ $t('ui.actionTitle.create', [$t('system.role.name')]) }}
        </Button>
      </template>
    </Grid>
  </Page>
</template>
```
