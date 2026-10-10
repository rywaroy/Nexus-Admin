<script setup lang="ts">
import type { SystemRoleApi } from '#/api/system/role';

import { ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import { createRole, updateRole } from '#/api/system/role';

type DrawerData = Partial<SystemRoleApi.SystemRole>;
const emit = defineEmits<{ success: [] }>();
const record = ref<DrawerData>();
const [Form, formApi] = useVbenForm<SystemRoleApi.CreateRoleRequest>({
  showDefaultActions: false,
  schema: [
    {
      component: 'Input',
      fieldName: 'name',
      label: '角色名称',
      rules: 'required',
    },
  ],
});

const [Drawer, drawerApi] = useVbenDrawer<DrawerData>({
  onOpenChange: async (open) => {
    if (!open) return;
    await formApi.reset();
    record.value = drawerApi.getData();
    if (record.value?.id) await formApi.setValues(record.value);
  },
  onConfirm: async () => {
    const { valid } = await formApi.validate();
    if (!valid) return;
    drawerApi.lock();
    try {
      const values = await formApi.getValues();
      await (record.value?.id
        ? updateRole(record.value.id, values)
        : createRole(values));
      emit('success');
      await drawerApi.close();
    } finally {
      drawerApi.unlock();
    }
  },
});

defineExpose({ drawerApi });
</script>

<template>
  <Drawer :title="record?.id ? '编辑角色' : '新增角色'"><Form /></Drawer>
</template>
