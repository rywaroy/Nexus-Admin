<script lang="ts" setup>
import type { Recordable } from '@vben/types';

import type { SystemMenuApi } from '#/api/system/menu';
import type { SystemRoleApi } from '#/api/system/role';

import { computed, nextTick, ref } from 'vue';

import { Tree, useVbenDrawer } from '@vben/common-ui';
import { IconifyIcon } from '@vben/icons';

import { message, Spin } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { getMenuList } from '#/api/system/menu';
import { createRole, updateRole } from '#/api/system/role';
import { $t } from '#/locales';

import { useFormSchema } from '../data';

const emit = defineEmits<{
  success: [];
}>();

const formData = ref<SystemRoleApi.SystemRole>();
const permissions = ref<SystemMenuApi.SystemMenu[]>([]);
const loadingPermissions = ref(false);
const loadError = ref(false);

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
        ? updateRole(formData.value.id, values)
        : createRole(values as SystemRoleApi.CreateRoleRequest));
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
      const data = drawerApi.getData<SystemRoleApi.SystemRole>();
      formApi.resetForm();

      formData.value = data?.id ? data : undefined;

      // 每次打开都刷新权限树（菜单可能有变化）
      await loadPermissions();

      // 等待 DOM 更新后设置表单值
      await nextTick();
      if (data?.id) {
        formApi.setValues({
          name: data.name,
          status: data.status,
          remark: data.remark,
          permissions: data.permissions,
        });
      }
    }
  },
});

async function loadPermissions() {
  loadingPermissions.value = true;
  loadError.value = false;
  try {
    const res = await getMenuList();
    permissions.value = res;
  } catch {
    loadError.value = true;
    message.error($t('ui.actionMessage.operationFailed'));
  } finally {
    loadingPermissions.value = false;
  }
}

const getDrawerTitle = computed(() =>
  formData.value?.id
    ? $t('ui.actionTitle.edit', [$t('system.role.name')])
    : $t('ui.actionTitle.create', [$t('system.role.name')]),
);

function getNodeClass(node: Recordable<any>) {
  const classes: string[] = [];
  if (node.value?.type === 'button') {
    classes.push('inline-flex');
  }
  return classes.join(' ');
}
</script>

<template>
  <Drawer :title="getDrawerTitle">
    <Form>
      <template #permissions="slotProps">
        <Spin :spinning="loadingPermissions" wrapper-class-name="w-full">
          <Tree
            v-if="!loadError"
            :tree-data="permissions"
            multiple
            bordered
            :default-expanded-level="2"
            :get-node-class="getNodeClass"
            :model-value="slotProps.modelValue"
            @update:model-value="slotProps['onUpdate:modelValue']"
            value-field="id"
            label-field="meta.title"
            icon-field="meta.icon"
          >
            <template #node="{ value }">
              <IconifyIcon v-if="value.meta?.icon" :icon="value.meta.icon" />
              {{ value.meta?.title ? $t(value.meta.title) : value.name }}
            </template>
          </Tree>
          <div v-else class="text-red-500">
            {{ $t('ui.actionMessage.operationFailed') }}
          </div>
        </Spin>
      </template>
    </Form>
  </Drawer>
</template>

<style lang="css" scoped>
:deep(.ant-tree-title) {
  .tree-actions {
    display: none;
    margin-left: 20px;
  }
}

:deep(.ant-tree-title:hover) {
  .tree-actions {
    display: flex;
    flex: auto;
    justify-content: flex-end;
    margin-left: 20px;
  }
}
</style>
