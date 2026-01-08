# Vben Form 表单组件

`Vben-Form` 是一个数据驱动的表单组件，它的核心思想是通过 **Schema** 来定义表单的结构、校验规则和行为，从而让你从繁琐的表单布局和逻辑中解脱出来。

## 1. 核心用法：`useVbenForm`

在几乎所有的示例中，我们都能看到这两个核心元素：

- **`useVbenForm`**: 这是一个 Composition API，用于创建一个表单实例。
  - **导入**: `import { useVbenForm } from '#/adapter/form';`
  - **使用**: 它接收一个包含 `schema` 和其他表单配置的选项对象，并返回一个数组 `[Form, formApi]`。
    - `Form`: 一个可以直接在 `<template>` 中渲染的表单组件。
    - `formApi`: 一个包含了所有操作表单方法的控制器。
- **`<Form />`**: 这是由 `useVbenForm` Hook 返回的 UI 组件，直接在模板中使用即可。

**基础示例**

```vue
<script lang="ts" setup>
import { useVbenForm } from '#/adapter/form';

const schema = [
  {
    component: 'Input',
    fieldName: 'field1',
    label: '字段1',
  },
  {
    component: 'Input',
    fieldName: 'field2',
    label: '字段2',
  },
];

const [Form] = useVbenForm({
  schema,
});
</script>

<template>
  <Form />
</template>
```

## 2. Schema 配置详解

`schema` 是一个数组，数组中的每个对象都定义了一个表单项。下面是一个典型的 Schema 对象及其常用属性：

| 属性 | 类型 | 描述 |
| :-- | :-- | :-- |
| `fieldName` | `string` | **必需。** 表单项的字段名，用于和数据对象进行双向绑定。 |
| `label` | `string` | 表单项的标签文本。 |
| `component` | `string` | **必需。** 所使用的组件类型，例如 `'Input'`, `'Select'` 等。 |
| `componentProps` | `object` \| `function` | 传递给组件的 `props`。可以是一个对象，也可以是一个返回对象的函数，以实现动态 `props`。 |
| `rules` | `string` \| zod 对象 | 校验规则。 |
| `defaultValue` | `any` | 表单项的默认值。 |
| `ifShow` | `boolean` \| `function` | 控制表单项是否显示。可以是一个布尔值，也可以是一个返回布尔值的函数，以实现动态显示/隐藏。 |

## 3. 常见使用场景

### 3.1 表单校验

校验规则通过 `rules` 属性来定义，它是一个数组，每个对象代表一条校验规则。

```typescript
const schema = [
  {
    component: 'InputPassword',
    fieldName: 'password',
    label: '密码',
    rules: z.string().min(1, { message: '最少输入6个字符' }),
  },
];
```

### 3.2 动态表单

通过 `useVbenForm` 返回的 `formApi`，可以动态地更新、添加或删除表单项。

- **`updateSchema`**: 更新指定 `fieldName` 的 `schema`。
- **`appendSchema`**: 在指定 `fieldName` 之后追加一个新的 `schema`。
- **`removeSchema`**: 删除指定的 `schema`。

```typescript
const [Form, formApi] = useVbenForm({
  // ...
});

function changeLabel() {
  formApi.updateSchema({
    fieldName: 'fieldA',
    label: '新的标签',
  });
}

function addField() {
  formApi.appendSchema(
    {
      component: 'Input',
      fieldName: 'newField',
      label: '新增字段',
    },
    'fieldC', // 在 fieldC 后面添加
  );
}
```

### 3.3 与 API 交互

在很多场景下，表单的某些字段（如下拉框的选项）需要从后端 API 获取。`Vben-Form` 对此提供了很好的支持。你可以在 `componentProps` 中传入一个返回 `Promise` 的 `api` 函数。

```typescript
import { getProvinceList } from '@/api/examples/form';

const schema = [
  {
    component: 'Select',
    fieldName: 'province',
    label: '省份',
    componentProps: {
      api: getProvinceList,
      resultField: 'items',
    },
  },
];
```

### 3.4 查询表单

对于查询场景，`useVbenForm` 提供了一些便利的配置项来控制布局和交互。

- **`showCollapseButton`**: 是否显示展开/收起按钮。
- **`submitButtonOptions`**: 操作按钮（查询、重置）的布局配置。
- **`showDefaultActions`**: (默认为`true`) 控制是否显示默认的提交和重置按钮。

## 4. 自定义与扩展

- **自定义组件**: 你可以通过在 `schema` 中定义 `slot` 属性，然后在 `<Form>` 组件上使用同名插槽来自定义渲染。

```typescript
// In your schema
{
  fieldName: 'customField',
  label: '自定义内容',
  component: 'Input',
  slot: 'custom',
}
```

```vue
<Form>
  <template #custom="{ model, fieldName }">
    <YourCustomComponent v-model="model[fieldName]" />
  </template>
</Form>
```

- **自定义布局**: 通过 `schema` 中的 `colProps` 属性，可以精细地控制每个表单项的栅格布局。

## 5. 支持的组件

`Vben-Form` 的 `schema` 中的 `component` 属性所支持的组件，是根据你当前使用的 UI 框架 (`antd`, `naive`, `element-plus`) 动态适配的。

**基础输入组件**

- `'Input'`: 文本输入框
- `'InputNumber'`: 数字输入框
- `'InputPassword'`: 密码输入框
- `'Textarea'`: 多行文本域

**选择类组件**

- `'Select'`: 下拉选择器
- `'TreeSelect'`: 树形选择器
- `'RadioGroup'`: 单选框组
- `'Checkbox'` & `'CheckboxGroup'`: 复选框与复选框组
- `'AutoComplete'`: 自动完成输入框
- `'Cascader'`: 级联选择器
- `'Switch'`: 开关

**日期与时间组件**

- `'DatePicker'`: 日期选择器
- `'TimePicker'`: 时间选择器
- `'RangePicker'`: 日期范围选择器
- `'TimeRangePicker'`: 时间范围选择器

**高级组件**

- `'IconPicker'`: 图标选择器
- `'Upload'`: 上传组件
- `'StrengthMeter'`: 密码强度计
- `'VbenButton'`
- `'VbenDivider'`

**异步数据组件**

- `'ApiSelect'`: 异步加载选项的下拉选择器
- `'ApiTreeSelect'`: 异步加载选项的树形选择器

## 6. ApiSelect 组件

`ApiSelect` 是项目封装的支持异步加载数据的选择器组件。与普通 `Select` 不同，它可以通过 `api` 属性自动调用接口获取选项数据。

**注意**：普通的 `Select` 组件不支持 `api` 属性，必须使用 `ApiSelect` 才能实现异步加载。

**基础用法**

```typescript
{
  component: 'ApiSelect',
  fieldName: 'orgId',
  label: '所属机构',
  rules: 'required',
  componentProps: {
    placeholder: '请选择机构',
    api: () => getOrgAllApi({ status: 'active' }),
    labelField: 'name',
    valueField: 'id',
  },
}
```

**核心属性**

| 属性 | 类型 | 描述 |
| :-- | :-- | :-- |
| `api` | `() => Promise<T[]>` | **必需。** 返回选项数据的异步函数 |
| `labelField` | `string` | 指定选项显示文本对应的字段名，默认 `'label'` |
| `valueField` | `string` | 指定选项值对应的字段名，默认 `'value'` |
| `resultField` | `string` | 如果接口返回的是对象而非数组，指定数据所在的字段名 |
| `params` | `object` | 传递给 api 函数的参数 |
| `immediate` | `boolean` | 是否立即加载数据，默认 `true` |

**完整示例**

```typescript
// 方式一：api 函数内部处理参数
{
  component: 'ApiSelect',
  fieldName: 'orgId',
  label: '所属机构',
  componentProps: {
    placeholder: '请选择机构',
    class: 'w-full',
    showSearch: true,
    filterOption: true,
    optionFilterProp: 'label',
    api: () => getOrgAllApi({ status: 'active' }),
    labelField: 'name',
    valueField: 'id',
  },
}

// 方式二：通过 params 传递参数
{
  component: 'ApiSelect',
  fieldName: 'orgId',
  label: '所属机构',
  componentProps: {
    api: getOrgAllApi,
    params: { status: 'active' },
    labelField: 'name',
    valueField: 'id',
  },
}
```

## 7. 查询和重置

`Vben-Form` 通过 `useVbenForm` 配置中的 `handleSubmit` 和 `handleReset` 回调来处理表单的提交和重置操作。

### 通过 `handleSubmit` 和 `handleReset`

```vue
<script lang="ts" setup>
import { useVbenForm } from '#/adapter/form';

function handleSubmit(values: Record<string, any>) {
  console.log('submit', values);
}

function handleReset() {
  console.log('reset');
}

const [Form] = useVbenForm({
  handleSubmit,
  handleReset,
  schema: [
    /* ... */
  ],
});
</script>

<template>
  <Form />
</template>
```

### 通过 `formApi` 手动操作

| 方法 | 描述 |
| :-- | :-- |
| `getValues()` | 获取所有表单项的值。 |
| `setValues(values)` | 设置一个或多个表单项的值。 |
| `resetFields()` | 将所有表单项的值重置为其初始 `defaultValue`。 |
| `validate()` | 手动触发整个表单的校验。 |
| `validateAndSubmitForm()` | 手动触发表单的提交（会先进行校验，成功后调用`handleSubmit`）。 |

**示例**

```vue
<script lang="ts" setup>
import { VbenButton } from '@vben/common-ui';
import { useVbenForm } from '#/adapter/form';

const [Form, formApi] = useVbenForm({
  handleSubmit: (values) => {
    console.log('手动提交成功', values);
  },
  schema: [
    /* ... */
  ],
  showDefaultActions: false,
});

async function customSubmit() {
  try {
    await formApi.validateAndSubmitForm();
  } catch (error) {
    console.error('校验失败', error);
  }
}

async function customReset() {
  await formApi.resetFields();
  console.log('表单已重置');
}
</script>

<template>
  <div>
    <Form />
    <VbenButton @click="customSubmit">手动提交</VbenButton>
    <VbenButton @click="customReset">手动重置</VbenButton>
  </div>
</template>
```

## 8. 表单联动

```vue
<script lang="ts" setup>
import { message } from 'ant-design-vue';
import { useVbenForm } from '#/adapter/form';

const [Form] = useVbenForm({
  handleSubmit: onSubmit,
  schema: [
    {
      component: 'Input',
      defaultValue: 'hidden value',
      dependencies: {
        show: false,
        triggerFields: ['field1Switch'],
      },
      fieldName: 'hiddenField',
      label: '隐藏字段',
    },
    {
      component: 'Switch',
      defaultValue: true,
      fieldName: 'field1Switch',
      help: '通过Dom控制销毁',
      label: '显示字段1',
    },
    {
      component: 'Input',
      dependencies: {
        show(values) {
          return !!values.field1Switch;
        },
        triggerFields: ['field1Switch'],
      },
      fieldName: 'field1',
      label: '字段1',
    },
    {
      component: 'Input',
      dependencies: {
        rules(values) {
          if (values.field1 === '123') {
            return 'required';
          }
          return null;
        },
        triggerFields: ['field1'],
      },
      fieldName: 'field5',
      help: '当字段1的值为`123`时，必填',
      label: '动态rules',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        class: 'w-full',
        filterOption: true,
        options: [
          { label: '选项1', value: '1' },
          { label: '选项2', value: '2' },
        ],
        placeholder: '请选择',
        showSearch: true,
      },
      dependencies: {
        componentProps(values) {
          if (values.field2 === '123') {
            return {
              options: [
                { label: '选项1', value: '1' },
                { label: '选项2', value: '2' },
                { label: '选项3', value: '3' },
              ],
            };
          }
          return {};
        },
        triggerFields: ['field2'],
      },
      fieldName: 'field6',
      help: '当字段2的值为`123`时，更改下拉选项',
      label: '动态配置',
    },
  ],
  wrapperClass: 'grid-cols-1 md:grid-cols-2',
});

function onSubmit(values: Record<string, any>) {
  message.success({
    content: `form values: ${JSON.stringify(values)}`,
  });
}
</script>

<template>
  <Form />
</template>
```
