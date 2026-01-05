<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { SystemPostApi } from '#/api/system/post';

import { useAccess } from '@vben/access';
import { Page, useVbenDrawer } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, message, Modal } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { deletePost, getPostList, updatePost } from '#/api/system/post';
import { $t } from '#/locales';

import { PERMISSION_CODES, useColumns, useGridFormSchema } from './data';
import Form from './modules/form.vue';

const { hasAccessByCodes } = useAccess();

const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: Form,
  destroyOnClose: true,
});

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    schema: useGridFormSchema(),
    submitOnChange: false,
  },
  gridOptions: {
    columns: useColumns(onActionClick, onStatusChange, hasAccessByCodes),
    height: 'auto',
    keepSource: true,
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          const result = await getPostList({
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
  } as VxeTableGridOptions<SystemPostApi.SystemPost>,
});

function onActionClick(e: OnActionClickParams<SystemPostApi.SystemPost>) {
  switch (e.code) {
    case 'delete': {
      onDelete(e.row);
      break;
    }
    case 'edit': {
      onEdit(e.row);
      break;
    }
  }
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

async function onStatusChange(
  newStatus: number,
  row: SystemPostApi.SystemPost,
) {
  const statusText =
    newStatus === 0
      ? $t('system.post.statusEnabled')
      : $t('system.post.statusDisabled');
  try {
    await confirm(
      $t('system.post.switchStatusConfirm', [row.postName, statusText]),
      $t('system.post.switchStatus'),
    );
    await updatePost(row.id, { status: newStatus as 0 | 1 });
    return true;
  } catch (error) {
    if (error instanceof Error && error.message === 'cancelled') {
      return false;
    }
    message.error($t('ui.actionMessage.operationFailed'));
    return false;
  }
}

function onEdit(row: SystemPostApi.SystemPost) {
  formDrawerApi.setData(row).open();
}

function onDelete(row: SystemPostApi.SystemPost) {
  const hideLoading = message.loading({
    content: $t('ui.actionMessage.deleting', [row.postName]),
    duration: 0,
    key: 'action_process_msg',
  });
  deletePost(row.id)
    .then(() => {
      message.success({
        content: $t('ui.actionMessage.deleteSuccess', [row.postName]),
        key: 'action_process_msg',
      });
      onRefresh();
    })
    .catch((error) => {
      hideLoading();
      message.error({
        content:
          error?.response?.data?.message || $t('system.post.deleteFailed'),
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
    <Grid :table-title="$t('system.post.list')">
      <template #toolbar-tools>
        <Button
          v-access:code="PERMISSION_CODES.create"
          type="primary"
          @click="onCreate"
        >
          <Plus class="size-5" />
          {{ $t('ui.actionTitle.create', [$t('system.post.name')]) }}
        </Button>
      </template>
    </Grid>
  </Page>
</template>
