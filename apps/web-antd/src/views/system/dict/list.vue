<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { SystemDictApi } from '#/api/system/dict';

import { useAccess } from '@vben/access';
import { Page, useVbenDrawer } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, message, Modal } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteDictType,
  getDictTypeList,
  updateDictType,
} from '#/api/system/dict';
import { $t } from '#/locales';

import { PERMISSION_CODES, useColumns, useGridFormSchema } from './data';
import DataDrawer from './modules/data-drawer.vue';
import Form from './modules/form.vue';

const { hasAccessByCodes } = useAccess();

const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: Form,
  destroyOnClose: true,
});

const [DataDetailDrawer, dataDrawerApi] = useVbenDrawer({
  connectedComponent: DataDrawer,
  destroyOnClose: true,
});

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    schema: useGridFormSchema(),
    submitOnChange: false,
  },
  gridOptions: {
    columns: useColumns(
      onActionClick,
      hasAccessByCodes([PERMISSION_CODES.update]) ? onStatusChange : undefined,
      hasAccessByCodes,
    ),
    height: 'auto',
    keepSource: true,
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          const result = await getDictTypeList({
            page: page.currentPage,
            pageSize: page.pageSize,
            ...formValues,
          });
          return {
            items: result.list,
            total: result.total,
          };
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
  } as VxeTableGridOptions<SystemDictApi.DictType>,
});

function onActionClick(e: OnActionClickParams<SystemDictApi.DictType>) {
  switch (e.code) {
    case 'delete': {
      onDelete(e.row);
      break;
    }
    case 'edit': {
      onEdit(e.row);
      break;
    }
    case 'view': {
      dataDrawerApi.setData(e.row).open();
      break;
    }
  }
}

function onRefresh() {
  gridApi.query();
}

function onCreate() {
  formDrawerApi.setData({}).open();
}

function onEdit(row: SystemDictApi.DictType) {
  formDrawerApi.setData(row).open();
}

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

async function onStatusChange(newStatus: number, row: SystemDictApi.DictType) {
  const statusText =
    newStatus === 0
      ? $t('system.dict.statusEnabled')
      : $t('system.dict.statusDisabled');

  try {
    await confirm(
      $t('system.dict.switchStatusConfirm', [row.dictName, statusText]),
      $t('system.dict.switchStatus'),
    );
    await updateDictType(row.id, { status: newStatus as 0 | 1 });
    return true;
  } catch (error) {
    if (error instanceof Error && error.message === 'cancelled') {
      return false;
    }
    message.error($t('ui.actionMessage.operationFailed'));
    return false;
  }
}

async function onDelete(row: SystemDictApi.DictType) {
  try {
    await confirm(
      $t('ui.actionMessage.deleteConfirm', [row.dictName]),
      $t('common.confirmTitle'),
    );
  } catch (error) {
    if (error instanceof Error && error.message === 'cancelled') {
      return;
    }
  }

  const hideLoading = message.loading({
    content: $t('ui.actionMessage.deleting', [row.dictName]),
    duration: 0,
    key: 'action_process_msg',
  });

  deleteDictType(row.id)
    .then(() => {
      message.success({
        content: $t('ui.actionMessage.deleteSuccess', [row.dictName]),
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
</script>

<template>
  <Page auto-content-height>
    <FormDrawer @success="onRefresh" />
    <DataDetailDrawer />
    <Grid :table-title="$t('system.dict.list')" @reload="onRefresh">
      <template #toolbar-tools>
        <Button
          v-access:code="PERMISSION_CODES.create"
          type="primary"
          @click="onCreate"
        >
          <Plus class="size-5" />
          {{ $t('ui.actionTitle.create', [$t('system.dict.name')]) }}
        </Button>
      </template>
    </Grid>
  </Page>
</template>
