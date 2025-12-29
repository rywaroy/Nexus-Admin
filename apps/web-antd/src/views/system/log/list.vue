<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { SystemLogApi } from '#/api/system/log';

import { ref } from 'vue';

import { useAccess } from '@vben/access';
import { Page, useVbenDrawer } from '@vben/common-ui';

import { Button, message, Modal, Popconfirm } from 'ant-design-vue';
import dayjs from 'dayjs';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { cleanOperLog, deleteOperLog, getOperLogList } from '#/api/system/log';
import { $t } from '#/locales';

import { PERMISSION_CODES, useColumns, useGridFormSchema } from './data';
import Detail from './modules/detail.vue';

const { hasAccessByCodes } = useAccess();

const [DetailDrawer, detailDrawerApi] = useVbenDrawer({
  connectedComponent: Detail,
  destroyOnClose: true,
});

// 选中的行 ID
const selectedIds = ref<string[]>([]);

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    schema: useGridFormSchema(),
    submitOnChange: false,
  },
  gridOptions: {
    checkboxConfig: {
      highlight: true,
      reserve: true,
    },
    columns: useColumns(onActionClick, hasAccessByCodes),
    height: 'auto',
    keepSource: true,
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          // 处理日期范围
          const { dateRange, ...rest } = formValues;
          const params: SystemLogApi.QueryOperLogRequest = {
            page: page.currentPage,
            pageSize: page.pageSize,
            ...rest,
          };
          if (dateRange?.length === 2) {
            params.beginTime = dayjs(dateRange[0]).startOf('day').toISOString();
            params.endTime = dayjs(dateRange[1]).endOf('day').toISOString();
          }

          const result = await getOperLogList(params);
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
  } as VxeTableGridOptions<SystemLogApi.OperLog>,
  gridEvents: {
    checkboxAll: onCheckboxChange,
    checkboxChange: onCheckboxChange,
  },
});

function onCheckboxChange() {
  const records = gridApi.grid?.getCheckboxRecords() || [];
  selectedIds.value = records.map((row: SystemLogApi.OperLog) => row.id);
}

function onActionClick(e: OnActionClickParams<SystemLogApi.OperLog>) {
  switch (e.code) {
    case 'delete': {
      onDelete(e.row);
      break;
    }
    case 'view': {
      onView(e.row);
      break;
    }
  }
}

/**
 * 查看详情
 */
function onView(row: SystemLogApi.OperLog) {
  detailDrawerApi.setData(row).open();
}

/**
 * 删除单条日志
 */
async function onDelete(row: SystemLogApi.OperLog) {
  const hideLoading = message.loading({
    content: $t('ui.actionMessage.deleting', [row.title]),
    duration: 0,
    key: 'action_process_msg',
  });

  try {
    await deleteOperLog(row.id);
    message.success({
      content: $t('ui.actionMessage.deleteSuccess', [row.title]),
      key: 'action_process_msg',
    });
    onRefresh();
  } catch (error: any) {
    hideLoading();
    message.error({
      content:
        error?.response?.data?.message ||
        $t('ui.actionMessage.operationFailed'),
      key: 'action_process_msg',
    });
  }
}

/**
 * 批量删除日志
 */
async function onBatchDelete() {
  if (selectedIds.value.length === 0) {
    message.warning($t('system.log.selectTip'));
    return;
  }

  const hideLoading = message.loading({
    content: $t('ui.actionMessage.processing'),
    duration: 0,
    key: 'action_process_msg',
  });

  try {
    await deleteOperLog(selectedIds.value);
    message.success({
      content: $t('system.log.batchDeleteSuccess'),
      key: 'action_process_msg',
    });
    // 清除选中状态
    gridApi.grid?.clearCheckboxRow();
    gridApi.grid?.clearCheckboxReserve();
    selectedIds.value = [];
    onRefresh();
  } catch (error: any) {
    hideLoading();
    message.error({
      content:
        error?.response?.data?.message ||
        $t('ui.actionMessage.operationFailed'),
      key: 'action_process_msg',
    });
  }
}

/**
 * 清空所有日志
 */
async function onClean() {
  Modal.confirm({
    content: $t('system.log.cleanConfirm'),
    title: $t('common.confirmTitle'),
    okType: 'danger',
    onOk: async () => {
      const hideLoading = message.loading({
        content: $t('ui.actionMessage.processing'),
        duration: 0,
        key: 'action_process_msg',
      });

      try {
        const result = await cleanOperLog();
        message.success({
          content: $t('system.log.cleanSuccess', [result.deletedCount]),
          key: 'action_process_msg',
        });
        selectedIds.value = [];
        onRefresh();
      } catch (error: any) {
        hideLoading();
        message.error({
          content:
            error?.response?.data?.message ||
            $t('ui.actionMessage.operationFailed'),
          key: 'action_process_msg',
        });
      }
    },
  });
}

function onRefresh() {
  gridApi.query();
}
</script>

<template>
  <Page auto-content-height>
    <DetailDrawer />

    <Grid :table-title="$t('system.log.list')">
      <template #toolbar-tools>
        <div class="flex gap-2">
          <span v-access:code="PERMISSION_CODES.delete">
            <Popconfirm
              :title="$t('system.log.batchDeleteConfirm', [selectedIds.length])"
              :disabled="selectedIds.length === 0"
              @confirm="onBatchDelete"
            >
              <Button :disabled="selectedIds.length === 0" danger>
                {{ $t('common.batchDelete') }}
              </Button>
            </Popconfirm>
          </span>
          <Button
            v-access:code="PERMISSION_CODES.delete"
            danger
            type="primary"
            @click="onClean"
          >
            {{ $t('system.log.clean') }}
          </Button>
        </div>
      </template>
    </Grid>
  </Page>
</template>
