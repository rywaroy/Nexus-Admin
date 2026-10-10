# Vben Form

业务统一从 `#/adapter/form` 导入 `useVbenForm`、`z` 和 `VbenFormSchema`。该适配器提供 Ant Design Vue 的组件属性、模型映射和 required 规则，业务页面不要绕过适配器。

当前底层是 TanStack Vue Form 和 Zod 4。完整可编译示例见 [form.vue](../../apps/web-antd/src/documentation/form.vue)，应用实例见 [用户 schema](../../apps/web-antd/src/views/system/user/data.ts)。

## 配置与组件

`useVbenForm<表单值类型, 提交值类型>(options)` 返回 `[Form, formApi]`。常用配置包括 schema、commonConfig、wrapperClass、showDefaultActions、handleSubmit、submitOnChange 和 codec。codec 的 decode 将提交值转成组件值，encode 将组件值转成提交值。

字段使用 fieldName、component、label、defaultValue、componentProps、rules、dependencies。字段占列使用 `formItemClass: 'col-span-2'`；不要使用旧版 colProps 或 ifShow。

Ant Design Vue 大多使用 value；Checkbox、Radio、Switch 使用 checked，Upload 使用 fileList，Tiptap 使用 modelValue。映射见 [form.ts](../../apps/web-antd/src/adapter/form.ts)，可用组件和属性见 [组件适配器](../../apps/web-antd/src/adapter/component/index.ts)。

固定选项使用 Select 的 options。远程数据使用 ApiSelect/ApiTreeSelect，并配置 api、labelField、valueField 和必要的 resultField；不要把 api 直接传给普通 Select。树组件还要匹配后端 children 和 fieldNames。

## 校验与联动

`rules: 'required'` 用于文本，`rules: 'selectRequired'` 用于选择值，数值 0 是有效选项。Zod schema 可直接作为 rules，异步 refine 可用于唯一性校验。

Zod 4 的 refine 第二个参数使用对象。动态错误使用 `error: (issue) => ...`，输入值是 issue.input；不要使用旧版 `(value) => ({ message: ... })`。实例见 [菜单表单](../../apps/web-antd/src/views/system/menu/modules/form.vue)。

新联动使用 `dependencies: { triggerFields: [...], resolve: ({ values, actions, controller, schema }) => ({ ... }) }`。返回值可含 disabled、show、if、required、rules 和 componentProps。show 通过 CSS 隐藏，if 移除字段渲染。

旧的 dependencies.show/disabled/rules/trigger 仍作兼容保留。schema 的 componentProps 函数接收字段或数组行上下文，不能当作完整表单值；读取其他字段时使用 dependencies.resolve。

## API

| API | 说明 |
| --- | --- |
| `await formApi.validate()` | 返回 `{ valid, errors }` |
| `await formApi.getValues()` | 取得经过 codec/值转换的提交值 |
| `await formApi.getRawValues()` | 取得组件原始值 |
| `await formApi.setValues(patch)` | 写入组件值 |
| `await formApi.setSubmitValues(values)` | 通过 codec 解码并写入提交值 |
| `await formApi.reset()` | 重置值和校验状态 |
| `await formApi.clearValidation()` | 只清除校验状态 |
| `await formApi.setFieldValue(name, value)` | 更新单字段 |
| `formApi.updateSchema([{ fieldName, ...修改项 }])` | 更新已有字段，参数为数组 |
| `formApi.setState({ schema: 新字段数组 })` | 替换完整 schema，可用于增删字段 |
| `await formApi.removeSchemaByFields([...])` | 删除字段 |
| `await formApi.validateAndSubmit()` | 校验通过后调用 handleSubmit |

不存在 appendSchema。新增字段应构造新 schema 后 setState。类型在 useVbenForm 调用时声明，避免旧的 getValues 泛型写法；旧 resetForm/submitForm 仅作兼容保留。完整语义见 [FormApi](../../packages/@core/ui-kit/form-ui/src/form-api.ts) 和 [类型](../../packages/@core/ui-kit/form-ui/src/types.ts)。

## 字段插槽

字段插槽名为 fieldName，例如 `#permissions`。插槽提供 componentProps、componentField、modelValue 和 field。一般通过 `v-bind="slotProps.componentProps"` 绑定自定义组件。

模型字段与适配器不同的组件应显式绑定，例如权限 Tree 使用 `:model-value="slotProps.modelValue"` 和 `@update:model-value="slotProps.componentField['onUpdate:modelValue']"`。更新回调不在 slotProps 顶层；见 [角色表单](../../apps/web-antd/src/views/system/role/modules/form.vue)。
