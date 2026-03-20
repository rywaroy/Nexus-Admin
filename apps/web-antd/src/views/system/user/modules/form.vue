<script lang="ts" setup>
import type { SystemDeptApi } from '#/api/system/dept';
import type { SystemUserApi } from '#/api/system/user';

import { computed, nextTick, reactive, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { getDeptTree } from '#/api/system/dept';
import { createUser, updateUser } from '#/api/system/user';
import { $t } from '#/locales';

import { useFormSchema } from '../data';

const emit = defineEmits<{
  success: [];
}>();

const formData = ref<SystemUserApi.SystemUser>();
const deptTree = ref<SystemDeptApi.SystemDept[]>([]);

const isEdit = computed(() => !!formData.value?.id);

const formOptions = computed(() => ({
  deptTree: deptTree.value,
}));

const [Form, formApi] = useVbenForm(
  reactive({
    schema: computed(() => useFormSchema(isEdit.value, formOptions.value)),
    showDefaultActions: false,
  }),
);

const [Drawer, drawerApi] = useVbenDrawer({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;

    drawerApi.lock();
    const values = (await formApi.getValues()) as any;

    try {
      await (formData.value?.id
        ? updateUser(formData.value.id, values)
        : createUser(values as SystemUserApi.CreateUserRequest));
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

      formData.value = data?.id ? data : undefined;

      // 加载部门树
      await loadOptions();

      await nextTick();
      if (data?.id) {
        formApi.setValues({
          username: data.username,
          nickName: data.nickName,
          email: data.email,
          phone: data.phone,
          status: data.status,
          remark: data.remark,
          deptId: data.deptId,
          roles: data.roles,
          postIds: data.postIds,
        });
      }
    }
  },
});

/**
 * 加载部门树
 */
const loadOptions = async () => {
  try {
    deptTree.value = await getDeptTree({ status: 0 });
  } catch {
    message.error($t('ui.actionMessage.operationFailed'));
  }
};

const getDrawerTitle = computed(() =>
  formData.value?.id
    ? $t('ui.actionTitle.edit', [$t('system.user.name')])
    : $t('ui.actionTitle.create', [$t('system.user.name')]),
);
</script>

<template>
  <Drawer :title="getDrawerTitle">
    <Form />
  </Drawer>
</template>
