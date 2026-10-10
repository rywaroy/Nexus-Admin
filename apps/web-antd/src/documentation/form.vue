<script setup lang="ts">
import { ref } from 'vue';

import { useVbenForm, z } from '#/adapter/form';

interface FormValues {
  name: string;
  remark: string;
  status: 0 | 1;
}

const submitted = ref<FormValues>();
const [Form, formApi] = useVbenForm<FormValues>({
  commonConfig: { componentProps: { class: 'w-full' } },
  schema: [
    {
      component: 'Input',
      fieldName: 'name',
      label: '名称',
      rules: z.string().min(1),
    },
    {
      component: 'Select',
      fieldName: 'status',
      label: '状态',
      defaultValue: 0,
      componentProps: {
        options: [
          { label: '启用', value: 0 },
          { label: '停用', value: 1 },
        ],
      },
      rules: 'selectRequired',
    },
    {
      component: 'Textarea',
      fieldName: 'remark',
      label: '备注',
      dependencies: {
        triggerFields: ['status'],
        resolve: ({ values }) => ({ disabled: values.status === 1 }),
      },
    },
  ],
  handleSubmit: (values) => {
    submitted.value = values;
  },
});

const clear = async () => {
  await formApi.reset();
};
</script>

<template>
  <Form />
  <button type="button" @click="clear">重置</button>
  <pre>{{ submitted }}</pre>
</template>
