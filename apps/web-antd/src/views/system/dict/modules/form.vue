<script lang="ts" setup>
import type { SystemDictApi } from '#/api/system/dict';

import { computed, nextTick, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { createDictType, updateDictType } from '#/api/system/dict';
import { $t } from '#/locales';

import { useFormSchema } from '../data';

const emit = defineEmits<{
  success: [];
}>();

const formData = ref<SystemDictApi.DictType>();

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
        ? updateDictType(
            formData.value.id,
            values as SystemDictApi.UpdateDictTypeRequest,
          )
        : createDictType(values as SystemDictApi.CreateDictTypeRequest));
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
    if (!isOpen) return;

    const data = drawerApi.getData<SystemDictApi.DictType>();
    formData.value = data?.id ? data : undefined;
    formApi.resetForm();

    await nextTick();
    if (data?.id) {
      formApi.setValues({
        dictName: data.dictName,
        dictType: data.dictType,
        remark: data.remark,
        status: data.status,
      });
      return;
    }

    formApi.setValues({
      status: 0,
    });
  },
});

const getDrawerTitle = computed(() =>
  formData.value?.id
    ? $t('ui.actionTitle.edit', [$t('system.dict.name')])
    : $t('ui.actionTitle.create', [$t('system.dict.name')]),
);
</script>

<template>
  <Drawer :title="getDrawerTitle">
    <Form />
  </Drawer>
</template>
