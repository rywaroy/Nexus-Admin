<script lang="ts" setup>
import type { SystemDictApi } from '#/api/system/dict';

import { computed, nextTick, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { createDictData, updateDictData } from '#/api/system/dict';
import { $t } from '#/locales';

import { useDataFormSchema } from '../data';

interface DictDataFormDrawerData {
  currentType: SystemDictApi.DictType;
  record?: SystemDictApi.DictData;
}

const emit = defineEmits<{
  success: [];
}>();

const currentType = ref<SystemDictApi.DictType>();
const formData = ref<SystemDictApi.DictData>();

const [Form, formApi] = useVbenForm({
  schema: useDataFormSchema(),
  showDefaultActions: false,
});

const [Drawer, drawerApi] = useVbenDrawer({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;

    drawerApi.lock();
    const values = await formApi.getValues();
    const payload: SystemDictApi.CreateDictDataRequest = {
      cssClass: values.cssClass,
      dictLabel: values.dictLabel,
      dictSort: values.dictSort ?? 0,
      dictValue: values.dictValue,
      isDefault: values.isDefault ?? false,
      listClass: values.listClass,
      remark: values.remark,
      status: values.status ?? 0,
      typeId: currentType.value!.id,
    };

    try {
      await (formData.value?.id
        ? updateDictData(formData.value.id, payload)
        : createDictData(payload));
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

    const data = drawerApi.getData<DictDataFormDrawerData>();
    currentType.value = data.currentType;
    formData.value = data.record?.id ? data.record : undefined;
    formApi.resetForm();

    await nextTick();
    if (data.record?.id) {
      formApi.setValues({
        cssClass: data.record.cssClass,
        dictLabel: data.record.dictLabel,
        dictSort: data.record.dictSort,
        dictType: data.currentType.dictType,
        dictValue: data.record.dictValue,
        isDefault: data.record.isDefault,
        listClass: data.record.listClass,
        remark: data.record.remark,
        status: data.record.status,
      });
      return;
    }

    formApi.setValues({
      dictSort: 0,
      dictType: data.currentType.dictType,
      isDefault: false,
      status: 0,
    });
  },
});

const getDrawerTitle = computed(() =>
  formData.value?.id
    ? $t('ui.actionTitle.edit', [$t('system.dict.dataName')])
    : $t('ui.actionTitle.create', [$t('system.dict.dataName')]),
);
</script>

<template>
  <Drawer :title="getDrawerTitle">
    <Form />
  </Drawer>
</template>
