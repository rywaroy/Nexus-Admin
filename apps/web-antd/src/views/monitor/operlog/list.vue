<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { MonitorOperLogApi } from '#/api/monitor/operlog';

import { ref } from 'vue';

import { useAccess } from '@vben/access';
import { Page, useVbenDrawer } from '@vben/common-ui';

import { Button, message, Modal, Popconfirm } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  cleanOperLog,
  deleteOperLog,
  getOperLogList,
} from '#/api/monitor/operlog';
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
          const params: MonitorOperLogApi.QueryOperLogRequest = {
            page: page.currentPage,
            pageSize: page.pageSize,
            ...rest,
          };
          if (dateRange?.length === 2) {
            params.beginTime = dateRange[0];
            params.endTime = dateRange[1];
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
      keyField: '_id',
    },
    toolbarConfig: {
      custom: true,
      export: false,
      refresh: true,
      search: true,
      zoom: true,
    },
  } as VxeTableGridOptions<MonitorOperLogApi.OperLog>,
  gridEvents: {
    checkboxAll: onCheckboxChange,
    checkboxChange: onCheckboxChange,
  },
});

function onCheckboxChange() {
  const records = gridApi.grid?.getCheckboxRecords() || [];
  selectedIds.value = records.map((row: MonitorOperLogApi.OperLog) => row._id);
}

function onActionClick(e: OnActionClickParams<MonitorOperLogApi.OperLog>) {
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
function onView(row: MonitorOperLogApi.OperLog) {
  detailDrawerApi.setData(row).open();
}

/**
 * 删除单条日志
 */
async function onDelete(row: MonitorOperLogApi.OperLog) {
  const hideLoading = message.loading({
    content: $t('ui.actionMessage.deleting', [row.title]),
    duration: 0,
    key: 'action_process_msg',
  });

  try {
    await deleteOperLog(row._id);
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
    message.warning($t('monitor.operlog.selectTip'));
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
      content: $t('monitor.operlog.batchDeleteSuccess'),
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
    content: $t('monitor.operlog.cleanConfirm'),
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
          content: $t('monitor.operlog.cleanSuccess', [result.deletedCount]),
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

    <Grid :table-title="$t('monitor.operlog.list')">
      <template #toolbar-tools>
        <div class="flex gap-2">
          <Popconfirm
            v-access:code="PERMISSION_CODES.delete"
            :title="
              $t('monitor.operlog.batchDeleteConfirm', [selectedIds.length])
            "
            :disabled="selectedIds.length === 0"
            @confirm="onBatchDelete"
          >
            <Button :disabled="selectedIds.length === 0" danger>
              {{ $t('common.batchDelete') }}
            </Button>
          </Popconfirm>
          <Button
            v-access:code="PERMISSION_CODES.delete"
            danger
            type="primary"
            @click="onClean"
          >
            {{ $t('monitor.operlog.clean') }}
          </Button>
        </div>
      </template>
    </Grid>
  </Page>
</template>
