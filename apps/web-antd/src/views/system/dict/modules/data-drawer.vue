<script lang="ts" setup>
import type { SystemDictApi } from '#/api/system/dict';

import { computed, h, ref } from 'vue';

import { useAccess } from '@vben/access';
import { useVbenDrawer } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import {
  Button,
  Descriptions,
  message,
  Modal,
  Switch,
  Table,
  Tag,
} from 'ant-design-vue';
import dayjs from 'dayjs';

import {
  deleteDictData,
  getDictDataByType,
  updateDictData,
} from '#/api/system/dict';
import { $t } from '#/locales';

import { PERMISSION_CODES } from '../data';
import DataForm from './data-form.vue';

const { hasAccessByCodes } = useAccess();

const currentType = ref<null | SystemDictApi.DictType>(null);
const loading = ref(false);
const rows = ref<SystemDictApi.DictData[]>([]);
const statusUpdatingId = ref<null | string>(null);

const canCreate = computed(() => hasAccessByCodes([PERMISSION_CODES.create]));
const canUpdate = computed(() => hasAccessByCodes([PERMISSION_CODES.update]));
const canDelete = computed(() => hasAccessByCodes([PERMISSION_CODES.delete]));

const [DataFormDrawer, dataFormDrawerApi] = useVbenDrawer({
  connectedComponent: DataForm,
  destroyOnClose: true,
});

const [Drawer, drawerApi] = useVbenDrawer({
  footer: false,
  async onOpenChange(isOpen) {
    if (!isOpen) {
      currentType.value = null;
      rows.value = [];
      return;
    }

    currentType.value = drawerApi.getData<SystemDictApi.DictType>() ?? null;
    await loadData();
  },
});

const columns = computed(() => {
  const items = [
    {
      dataIndex: 'dictLabel',
      key: 'dictLabel',
      title: $t('system.dict.dictLabel'),
      customRender: ({ record }: { record: SystemDictApi.DictData }) => {
        const color = mapTagColor(record.listClass);
        if (!color) {
          return record.dictLabel;
        }
        return h(Tag, { color }, () => record.dictLabel);
      },
    },
    {
      dataIndex: 'dictValue',
      key: 'dictValue',
      title: $t('system.dict.dictValue'),
    },
    {
      dataIndex: 'dictSort',
      key: 'dictSort',
      title: $t('system.dict.dictSort'),
      width: 80,
    },
    {
      dataIndex: 'status',
      key: 'status',
      title: $t('system.dict.status'),
      width: 120,
      customRender: ({ record }: { record: SystemDictApi.DictData }) => {
        if (!canUpdate.value) {
          return h(
            Tag,
            { color: record.status === 0 ? 'success' : 'error' },
            () =>
              record.status === 0
                ? $t('common.enabled')
                : $t('common.disabled'),
          );
        }

        return h(Switch, {
          checked: record.status === 0,
          checkedChildren: $t('common.enabled'),
          loading: statusUpdatingId.value === record.id,
          onChange: (checked) => onStatusChange(checked ? 0 : 1, record),
          unCheckedChildren: $t('common.disabled'),
        });
      },
    },
    {
      dataIndex: 'isDefault',
      key: 'isDefault',
      title: $t('system.dict.isDefault'),
      width: 100,
      customRender: ({ record }: { record: SystemDictApi.DictData }) =>
        h(Tag, { color: record.isDefault ? 'processing' : 'default' }, () =>
          record.isDefault
            ? $t('system.dict.defaultYes')
            : $t('system.dict.defaultNo'),
        ),
    },
    {
      dataIndex: 'listClass',
      key: 'listClass',
      title: $t('system.dict.listClass'),
      width: 120,
      customRender: ({ record }: { record: SystemDictApi.DictData }) =>
        record.listClass || '-',
    },
    {
      dataIndex: 'cssClass',
      key: 'cssClass',
      title: $t('system.dict.cssClass'),
      width: 140,
      customRender: ({ record }: { record: SystemDictApi.DictData }) =>
        record.cssClass || '-',
    },
    {
      dataIndex: 'remark',
      key: 'remark',
      title: $t('system.dict.remark'),
    },
    {
      dataIndex: 'createTime',
      key: 'createTime',
      title: $t('system.dict.createTime'),
      width: 180,
      customRender: ({ record }: { record: SystemDictApi.DictData }) =>
        record.createTime
          ? dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss')
          : '',
    },
  ];

  if (canUpdate.value || canDelete.value) {
    items.push({
      dataIndex: 'operation',
      key: 'operation',
      title: $t('system.dict.operation'),
      width: 160,
      customRender: ({ record }: { record: SystemDictApi.DictData }) =>
        h('div', { class: 'flex items-center justify-center gap-1' }, [
          canUpdate.value
            ? h(
                Button,
                {
                  size: 'small',
                  type: 'link',
                  onClick: () => onEdit(record),
                },
                () => $t('system.dict.update'),
              )
            : null,
          canDelete.value
            ? h(
                Button,
                {
                  danger: true,
                  size: 'small',
                  type: 'link',
                  onClick: () => onDelete(record),
                },
                () => $t('system.dict.delete'),
              )
            : null,
        ]),
    });
  }

  return items;
});

const drawerTitle = computed(() =>
  currentType.value
    ? $t('system.dict.dataTitle', [currentType.value.dictName])
    : $t('system.dict.dataList'),
);

function onCreate() {
  dataFormDrawerApi
    .setData({
      currentType: currentType.value!,
    })
    .open();
}

function onEdit(record: SystemDictApi.DictData) {
  dataFormDrawerApi
    .setData({
      currentType: currentType.value!,
      record,
    })
    .open();
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

async function onDelete(record: SystemDictApi.DictData) {
  try {
    await confirm(
      $t('ui.actionMessage.deleteConfirm', [record.dictLabel]),
      $t('common.confirmTitle'),
    );
  } catch (error: any) {
    if (error instanceof Error && error.message === 'cancelled') {
      return;
    }
  }

  const hideLoading = message.loading({
    content: $t('ui.actionMessage.deleting', [record.dictLabel]),
    duration: 0,
    key: 'action_process_msg',
  });

  deleteDictData(record.id)
    .then(() => {
      message.success({
        content: $t('ui.actionMessage.deleteSuccess', [record.dictLabel]),
        key: 'action_process_msg',
      });
      loadData();
    })
    .catch((error: any) => {
      hideLoading();
      message.error({
        content:
          error?.response?.data?.message ||
          $t('ui.actionMessage.operationFailed'),
        key: 'action_process_msg',
      });
    });
}

async function onStatusChange(
  newStatus: number,
  record: SystemDictApi.DictData,
) {
  const statusText =
    newStatus === 0
      ? $t('system.dict.statusEnabled')
      : $t('system.dict.statusDisabled');

  try {
    await confirm(
      $t('system.dict.switchStatusConfirm', [record.dictLabel, statusText]),
      $t('system.dict.switchStatus'),
    );
    statusUpdatingId.value = record.id;
    await updateDictData(record.id, { status: newStatus as 0 | 1 });
    await loadData();
  } catch (error: any) {
    if (error instanceof Error && error.message === 'cancelled') {
      return;
    }
    message.error(
      error?.response?.data?.message || $t('ui.actionMessage.operationFailed'),
    );
  } finally {
    statusUpdatingId.value = null;
  }
}

async function loadData() {
  if (!currentType.value) {
    rows.value = [];
    return;
  }

  loading.value = true;
  try {
    rows.value = await getDictDataByType(currentType.value.dictType);
  } catch (error: any) {
    message.error(
      error?.response?.data?.message || $t('ui.actionMessage.operationFailed'),
    );
  } finally {
    loading.value = false;
  }
}

function mapTagColor(listClass?: string) {
  switch (listClass) {
    case 'danger': {
      return 'error';
    }
    case 'default':
    case 'info': {
      return 'default';
    }
    case 'primary': {
      return 'processing';
    }
    case 'success':
    case 'warning': {
      return listClass;
    }
    default: {
      return '';
    }
  }
}
</script>

<template>
  <Drawer class="w-full max-w-[1100px]" :title="drawerTitle">
    <div class="flex flex-col gap-4">
      <DataFormDrawer @success="loadData" />

      <Descriptions v-if="currentType" :column="3" bordered size="small">
        <Descriptions.Item :label="$t('system.dict.dictName')">
          {{ currentType.dictName }}
        </Descriptions.Item>
        <Descriptions.Item :label="$t('system.dict.dictType')">
          {{ currentType.dictType }}
        </Descriptions.Item>
        <Descriptions.Item :label="$t('system.dict.dataCount')">
          {{ rows.length }}
        </Descriptions.Item>
      </Descriptions>

      <div class="flex items-center justify-end gap-2">
        <Button v-if="canCreate" type="primary" @click="onCreate">
          <Plus class="size-5" />
          {{ $t('ui.actionTitle.create', [$t('system.dict.dataName')]) }}
        </Button>
        <Button :loading="loading" @click="loadData">
          {{ $t('system.dict.refreshData') }}
        </Button>
      </div>

      <Table
        :columns="columns"
        :data-source="rows"
        :loading="loading"
        :pagination="false"
        :locale="{ emptyText: $t('system.dict.emptyData') }"
        row-key="id"
        size="small"
      />
    </div>
  </Drawer>
</template>
