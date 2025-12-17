<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { SystemDeptApi } from '#/api/system/dept';

import { useAccess } from '@vben/access';
import { Page, useVbenDrawer } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, message, Modal } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { deleteDept, getDeptTree, updateDept } from '#/api/system/dept';
import { $t } from '#/locales';

import { PERMISSION_CODES, useColumns, useGridFormSchema } from './data';
import Form from './modules/form.vue';

const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: Form,
  destroyOnClose: true,
});

const { hasAccessByCodes } = useAccess();

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    schema: useGridFormSchema(),
    submitOnChange: false,
  },
  gridOptions: {
    columns: useColumns(onActionClick, onStatusChange, hasAccessByCodes),
    height: 'auto',
    keepSource: true,
    pagerConfig: {
      enabled: false,
    },
    proxyConfig: {
      ajax: {
        query: async (_params, formValues) => {
          return await getDeptTree(formValues);
        },
      },
    },
    rowConfig: {
      keyField: 'id',
    },
    toolbarConfig: {
      custom: true,
      export: false,
      refresh: true,
      search: true,
      zoom: true,
    },
    treeConfig: {
      parentField: 'pid',
      rowField: 'id',
      transform: false,
    },
  } as VxeTableGridOptions<SystemDeptApi.SystemDept>,
});

function onActionClick({
  code,
  row,
}: OnActionClickParams<SystemDeptApi.SystemDept>) {
  switch (code) {
    case 'append': {
      onAppend(row);
      break;
    }
    case 'delete': {
      onDelete(row);
      break;
    }
    case 'edit': {
      onEdit(row);
      break;
    }
    default: {
      break;
    }
  }
}

/**
 * 将 Modal.confirm 封装为 Promise
 */
function confirm(content: string, title: string) {
  return new Promise((resolve, reject) => {
    Modal.confirm({
      content,
      onCancel() {
        reject(new Error('cancelled'));
      },
      onOk() {
        resolve(true);
      },
      title,
    });
  });
}

/**
 * 状态切换处理
 * @param newStatus 期望改变的状态值
 * @param row 行数据
 * @returns 返回 false 则中止改变
 */
async function onStatusChange(
  newStatus: number,
  row: SystemDeptApi.SystemDept,
) {
  const statusText =
    newStatus === 0 ? $t('common.enabled') : $t('common.disabled');
  try {
    await confirm(
      $t('system.dept.switchStatusConfirm', [row.name, statusText]),
      $t('system.dept.switchStatus'),
    );
    await updateDept(row.id, { status: newStatus as 0 | 1 });
    return true;
  } catch (error) {
    if (error instanceof Error && error.message === 'cancelled') {
      return false;
    }
    message.error($t('ui.actionMessage.operationFailed'));
    return false;
  }
}

function onEdit(row: SystemDeptApi.SystemDept) {
  formDrawerApi.setData(row).open();
}

function onAppend(row: SystemDeptApi.SystemDept) {
  formDrawerApi.setData({ pid: row.id }).open();
}

function onDelete(row: SystemDeptApi.SystemDept) {
  if (row.children && row.children.length > 0) {
    message.warning($t('system.dept.cannotDeleteWithChildren'));
    return;
  }

  const hideLoading = message.loading({
    content: $t('ui.actionMessage.deleting', [row.name]),
    duration: 0,
    key: 'action_process_msg',
  });
  deleteDept(row.id)
    .then(() => {
      message.success({
        content: $t('ui.actionMessage.deleteSuccess', [row.name]),
        key: 'action_process_msg',
      });
      onRefresh();
    })
    .catch((error) => {
      hideLoading();
      message.error({
        content:
          error?.response?.data?.message ||
          $t('ui.actionMessage.operationFailed'),
        key: 'action_process_msg',
      });
    });
}

function onRefresh() {
  gridApi.query();
}

function onCreate() {
  formDrawerApi.setData({}).open();
}
</script>

<template>
  <Page auto-content-height>
    <FormDrawer @success="onRefresh" />
    <Grid :table-title="$t('system.dept.list')">
      <template #toolbar-tools>
        <Button
          v-access:code="PERMISSION_CODES.create"
          type="primary"
          @click="onCreate"
        >
          <Plus class="size-5" />
          {{ $t('ui.actionTitle.create', [$t('system.dept.name')]) }}
        </Button>
      </template>
    </Grid>
  </Page>
</template>
