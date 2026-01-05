<script lang="ts" setup>
import type { SystemPostApi } from '#/api/system/post';

import { computed, nextTick, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { createPost, updatePost } from '#/api/system/post';
import { $t } from '#/locales';

import { useFormSchema } from '../data';

const emit = defineEmits<{
  success: [];
}>();

const formData = ref<SystemPostApi.SystemPost>();

const [Form, formApi] = useVbenForm({
  schema: useFormSchema(),
  showDefaultActions: false,
});

const [Drawer, drawerApi] = useVbenDrawer({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;

    drawerApi.lock();
    const values = await formApi.getValues();

    try {
      await (formData.value?.id
        ? updatePost(formData.value.id, values)
        : createPost(values as SystemPostApi.CreatePostRequest));
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
      const data = drawerApi.getData<SystemPostApi.SystemPost>();
      formApi.resetForm();

      formData.value = data?.id ? data : undefined;

      await nextTick();
      if (data?.id) {
        formApi.setValues({
          postCode: data.postCode,
          postName: data.postName,
          postSort: data.postSort,
          status: data.status,
          remark: data.remark,
        });
      }
    }
  },
});

const getDrawerTitle = computed(() =>
  formData.value?.id
    ? $t('ui.actionTitle.edit', [$t('system.post.name')])
    : $t('ui.actionTitle.create', [$t('system.post.name')]),
);
</script>

<template>
  <Drawer :title="getDrawerTitle">
    <Form />
  </Drawer>
</template>
