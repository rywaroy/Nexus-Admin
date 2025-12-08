<script lang="ts" setup>
import type { SystemUserApi } from '#/api/system/user';

import { computed, nextTick, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { resetUserPassword } from '#/api/system/user';
import { $t } from '#/locales';

import { useResetPasswordSchema } from '../data';

const emit = defineEmits<{
  success: [];
}>();

const formData = ref<SystemUserApi.SystemUser>();

const [Form, formApi] = useVbenForm({
  schema: useResetPasswordSchema(),
  showDefaultActions: false,
});

const [Drawer, drawerApi] = useVbenDrawer({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;

    const values = await formApi.getValues();

    if (values.password !== values.confirmPassword) {
      message.error($t('system.user.passwordMismatch'));
      return;
    }

    if (!formData.value?.id) return;

    drawerApi.lock();

    try {
      await resetUserPassword(formData.value.id, values.password);
      message.success($t('ui.actionMessage.operationSuccess'));
      emit('success');
      drawerApi.close();
    } catch (error: any) {
      message.error(
        error?.response?.data?.message ||
          $t('ui.actionMessage.operationFailed'),
      );
    } finally {
      drawerApi.unlock();
    }
  },

  async onOpenChange(isOpen) {
    if (isOpen) {
      const data = drawerApi.getData<SystemUserApi.SystemUser>();
      formApi.resetForm();
      formData.value = data;

      await nextTick();
    }
  },
});

const getDrawerTitle = computed(() =>
  $t('system.user.resetPasswordTitle', [formData.value?.username || '']),
);
</script>

<template>
  <Drawer :title="getDrawerTitle">
    <Form />
  </Drawer>
</template>
