# VxeTable 表格组件

`vxe-table` 是一个功能强大的表格组件，经过了二次封装，通过 `useVbenVxeGrid` hook 来简化使用。它支持本地/远程数据加载、单元格/行编辑、树形表格、虚拟滚动等多种高级功能。

## 1. 基础用法

基础表格展示了如何初始化组件、加载本地数据以及处理基本交互。

- **初始化**: 使用 `useVbenVxeGrid` hook，传入 `gridOptions` 来创建表格实例。
- **列配置 (`columns`)**: 在 `gridOptions` 中定义 `columns` 数组，每个对象代表一列。
  - `type: 'seq'`：显示序号列。
  - `field`：对应数据源中的字段名。
  - `title`：列头显示的标题。
  - `sortable: true`：开启该列的排序功能。
- **数据源 (`data`)**: 直接在 `gridOptions` 中提供一个数组作为本地数据源。
- **事件监听 (`gridEvents`)**: 可以传入一个包含事件监听函数的对象，例如 `cellClick`。
- **动态控制**: `useVbenVxeGrid` 返回的 `gridApi` 提供了一系列方法来动态控制表格，如 `setGridOptions` 和 `setLoading`。

**示例代码**

```vue
<script lang="ts" setup>
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { MOCK_TABLE_DATA } from './table-data';

const gridOptions: VxeGridProps<RowType> = {
  columns: [
    { title: '序号', type: 'seq', width: 50 },
    { field: 'name', title: 'Name' },
    { field: 'age', sortable: true, title: 'Age' },
  ],
  data: MOCK_TABLE_DATA,
  sortConfig: {
    multiple: true,
  },
};

const gridEvents: VxeGridListeners<RowType> = {
  cellClick: ({ row }) => {
    message.info(`cell-click: ${row.name}`);
  },
};

const [Grid, gridApi] = useVbenVxeGrid<RowType>({
  gridEvents,
  gridOptions,
});

function changeBorder() {
  gridApi.setGridOptions({
    border: !gridApi.useStore((state) => state.gridOptions?.border).value,
  });
}
</script>

<template>
  <Page>
    <Grid table-title="基础列表" />
  </Page>
</template>
```

## 2. 远程数据与排序

通过配置 `proxyConfig`，表格可以实现远程数据的加载、分页和排序。

- **代理配置 (`proxyConfig`)**:
  - `ajax.query`: 定义一个异步函数，用于请求数据。该函数接收分页和排序参数，并返回一个包含 `items` 和 `total` 的对象。
  - `sort: true`: 启用远程排序。
- **排序配置 (`sortConfig`)**:
  - `remote: true`: 必须设置为 `true` 来启用远程排序。
  - `defaultSort`: 设置默认的排序列和顺序。

**示例代码**

```vue
<script lang="ts" setup>
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getExampleTableApi } from '#/api';

const gridOptions: VxeGridProps<RowType> = {
  columns: [
    /* ... */
  ],
  proxyConfig: {
    ajax: {
      query: async ({ page, sort }) => {
        return await getExampleTableApi({
          page: page.currentPage,
          pageSize: page.pageSize,
          sortBy: sort.field,
          sortOrder: sort.order,
        });
      },
    },
    sort: true,
  },
  sortConfig: {
    defaultSort: { field: 'category', order: 'desc' },
    remote: true,
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });
</script>
```

## 3. 与搜索表单联动

`useVbenVxeGrid` 支持传入 `formOptions`，可以方便地创建一个与表格联动的搜索表单。

- **表单配置 (`formOptions`)**:
  - `schema`: 定义表单项，语法与 `VbenForm` 一致。
  - `submitOnChange: true`: 当表单项的值改变时，自动触发表格数据查询。
  - `fieldMappingTime`: 用于处理范围选择器的时间字段映射。

**示例代码**

```vue
<script lang="ts" setup>
import { useVbenVxeGrid } from '#/adapter/vxe-table';

const formOptions: VbenFormProps = {
  collapsed: false,
  fieldMappingTime: [['date', ['start', 'end']]],
  schema: [
    { component: 'Input', fieldName: 'category', label: 'Category' },
    { component: 'Input', fieldName: 'productName', label: 'ProductName' },
  ],
  submitOnChange: true,
};

const gridOptions: VxeTableGridOptions<RowType> = {
  columns: [
    /* ... */
  ],
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues) => {
        return await getExampleTableApi({
          page: page.currentPage,
          pageSize: page.pageSize,
          ...formValues,
        });
      },
    },
  },
};

const [Grid] = useVbenVxeGrid({ formOptions, gridOptions });
</script>
```

## 4. 编辑功能

表格支持单元格编辑和行编辑两种模式。

- **开启编辑 (`editConfig`)**:
  - `trigger`: 设置触发编辑的方式，如 `'click'`。
  - `mode`: `'cell'` (单元格编辑) 或 `'row'` (行编辑)。
- **可编辑列 (`editRender`)**: 在列配置中，通过 `editRender` 属性指定编辑时使用的组件，例如 `{ name: 'input' }`。
- **行编辑操作**: 在行编辑模式下，通常需要自定义操作列，提供"编辑"、"保存"、"取消"等按钮，并调用 `gridApi` 的方法（如 `setEditRow`, `clearEdit`）来控制编辑状态。

**示例代码（行编辑）**

```vue
<script lang="ts" setup>
const gridOptions: VxeGridProps<RowType> = {
  columns: [
    { editRender: { name: 'input' }, field: 'category', title: 'Category' },
    { slots: { default: 'action' }, title: '操作' },
  ],
  editConfig: {
    mode: 'row',
    trigger: 'click',
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });

function editRowEvent(row: RowType) {
  gridApi.grid?.setEditRow(row);
}

async function saveRowEvent(row: RowType) {
  await gridApi.grid?.clearEdit();
}
</script>

<template>
  <Grid>
    <template #action="{ row }">
      <!-- 编辑/保存按钮 -->
    </template>
  </Grid>
</template>
```

## 5. 其他高级功能

### 树形表格

通过 `treeConfig` 开启树形结构。

- `transform: true`: 自动将列表数据转换为树形结构。
- `rowField`: 行数据的唯一主键字段。
- `parentField`: 指向父级节点的字段。
- 在列配置中设置 `treeNode: true` 的列会显示展开/收起图标。

### 固定列

在需要固定的列配置中添加 `fixed: 'left'` 或 `fixed: 'right'`。

### 自定义单元格

- **插槽**: 使用 `#<field>="{ row }"` 的形式自定义单元格内容。
- **`cellRender`**: 使用预设的渲染器，如 `CellImage`、`CellLink`、`CellTag` 等，简化常见自定义场景。

### 虚拟滚动

当数据量巨大时，通过 `scrollY: { enabled: true }` 来开启纵向虚拟滚动，提升渲染性能。
