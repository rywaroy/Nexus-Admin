<script lang="ts" setup>
import type { SystemDeptApi } from '#/api/system/dept';

import { computed, nextTick, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { message, Spin } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { createDept, getDeptTree, updateDept } from '#/api/system/dept';
import { $t } from '#/locales';

import { useFormSchema } from '../data';

const emit = defineEmits<{
  success: [];
}>();

const formData = ref<SystemDeptApi.SystemDept>();
const deptTree = ref<SystemDeptApi.SystemDept[]>([]);
const loadingTree = ref(false);

const [Form, formApi] = useVbenForm({
  schema: useFormSchema(deptTree),
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
        ? updateDept(formData.value.id, values)
        : createDept(values as SystemDeptApi.CreateDeptRequest));
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
      const data = drawerApi.getData<SystemDeptApi.SystemDept>();
      formApi.resetForm();

      formData.value = data?.id ? data : undefined;

      await loadDeptTree(data?.id);

      await nextTick();
      if (data) {
        formApi.setValues({
          name: data.name,
          pid: data.pid,
          status: data.status ?? 0,
          remark: data.remark,
        });
      }
    }
  },
});

async function loadDeptTree(currentId?: string) {
  loadingTree.value = true;
  try {
    const tree = await getDeptTree();
    deptTree.value = disableSelfAndChildren(tree, currentId);
  } catch {
    message.error($t('ui.actionMessage.operationFailed'));
    deptTree.value = [];
  } finally {
    loadingTree.value = false;
  }
}

/**
 * 禁用当前节点及其子节点，避免选择自身或后代作为父级
 */
function disableSelfAndChildren(
  list: SystemDeptApi.SystemDept[],
  targetId?: string,
  parentDisabled = false,
): SystemDeptApi.SystemDept[] {
  return list.map((item) => {
    const disabled = parentDisabled || item.id === targetId;
    const children = item.children
      ? disableSelfAndChildren(item.children, targetId, disabled)
      : undefined;
    return {
      ...item,
      children,
      disabled,
    };
  });
}

const getDrawerTitle = computed(() =>
  formData.value?.id
    ? $t('ui.actionTitle.edit', [$t('system.dept.name')])
    : $t('ui.actionTitle.create', [$t('system.dept.name')]),
);
</script>

<template>
  <Drawer :title="getDrawerTitle">
    <Spin :spinning="loadingTree">
      <Form />
    </Spin>
  </Drawer>
</template>
