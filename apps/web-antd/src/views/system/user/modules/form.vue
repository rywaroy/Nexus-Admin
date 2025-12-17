<script lang="ts" setup>
import type { SystemDeptApi } from '#/api/system/dept';
import type { SystemRoleApi } from '#/api/system/role';
import type { SystemUserApi } from '#/api/system/user';

import { computed, nextTick, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { getDeptTree } from '#/api/system/dept';
import { getRoleList } from '#/api/system/role';
import { createUser, updateUser } from '#/api/system/user';
import { $t } from '#/locales';

import { useFormSchema } from '../data';

const emit = defineEmits<{
  success: [];
}>();

const formData = ref<SystemUserApi.SystemUser>();
const deptTree = ref<SystemDeptApi.SystemDept[]>([]);
const roleList = ref<SystemRoleApi.SystemRole[]>([]);

/**
 * 将 roles 统一转换为"角色名称数组"
 * 兼容历史数据里把角色ID写入 roles 的情况
 */
function normalizeRolesToNames(roles: unknown): string[] | undefined {
  if (!Array.isArray(roles)) return undefined;

  const roleIdToName = new Map(
    roleList.value.map((role) => [role.id, role.name]),
  );
  const roleNameSet = new Set(roleList.value.map((role) => role.name));

  return roles
    .map((item) => String(item).trim())
    .filter(Boolean)
    .map((item) =>
      roleNameSet.has(item) ? item : (roleIdToName.get(item) ?? item),
    );
}

const isEdit = computed(() => !!formData.value?.id);

const formOptions = computed(() => ({
  deptTree: deptTree.value,
  roleList: roleList.value,
}));

const [Form, formApi] = useVbenForm({
  schema: computed(() => useFormSchema(isEdit.value, formOptions.value)),
  showDefaultActions: false,
});

const [Drawer, drawerApi] = useVbenDrawer({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;

    drawerApi.lock();
    const values = (await formApi.getValues()) as any;
    // 将 roles 统一转换为角色名称数组
    const normalizedRoles = normalizeRolesToNames(values.roles);
    if (normalizedRoles) values.roles = normalizedRoles;

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

      // 加载部门树和角色列表
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
          // 兼容历史数据：将角色ID转换为角色名称
          roles: normalizeRolesToNames(data.roles) ?? data.roles,
        });
      }
    }
  },
});

/**
 * 加载部门树和角色列表
 */
const loadOptions = async () => {
  try {
    const [deptRes, roleRes] = await Promise.all([
      getDeptTree({ status: 0 }),
      getRoleList({ status: 0, pageSize: 1000 }),
    ]);
    deptTree.value = deptRes;
    roleList.value = roleRes.list;
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
