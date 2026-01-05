<script lang="ts" setup>
import type { VbenFormSchema } from '@vben/common-ui';

import { computed, ref } from 'vue';

import { AuthenticationChangePassword, z } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { message } from 'ant-design-vue';

import { changePasswordApi } from '#/api/core';

defineOptions({ name: 'ChangePassword' });

const loading = ref(false);

const formSchema = computed((): VbenFormSchema[] => {
  return [
    {
      component: 'VbenInputPassword',
      componentProps: {
        placeholder: $t('authentication.oldPassword'),
      },
      fieldName: 'oldPassword',
      label: $t('authentication.oldPassword'),
      rules: z
        .string()
        .min(1, { message: $t('authentication.oldPasswordTip') }),
    },
    {
      component: 'VbenInputPassword',
      componentProps: {
        passwordStrength: true,
        placeholder: $t('authentication.newPassword'),
      },
      fieldName: 'newPassword',
      label: $t('authentication.newPassword'),
      rules: z
        .string()
        .min(6, { message: $t('authentication.passwordLengthTip') })
        .max(20, { message: $t('authentication.passwordLengthTip') }),
    },
    {
      component: 'VbenInputPassword',
      componentProps: {
        placeholder: $t('authentication.confirmPassword'),
      },
      fieldName: 'confirmPassword',
      label: $t('authentication.confirmPassword'),
      dependencies: {
        rules(values) {
          const { newPassword } = values;
          return z
            .string()
            .min(1, { message: $t('authentication.confirmPasswordTip') })
            .refine((value) => value === newPassword, {
              message: $t('authentication.passwordMismatch'),
            });
        },
        triggerFields: ['newPassword'],
      },
    },
  ];
});

const handleSubmit = async (values: Record<string, any>) => {
  try {
    loading.value = true;
    await changePasswordApi({
      oldPassword: values.oldPassword,
      newPassword: values.newPassword,
    });
    message.success($t('authentication.passwordChangeSuccess'));
    window.history.back();
  } catch {
    // Error is handled by request interceptor
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <AuthenticationChangePassword
    :form-schema="formSchema"
    :loading="loading"
    @submit="handleSubmit"
  />
</template>
