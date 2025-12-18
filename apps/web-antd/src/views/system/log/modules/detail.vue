<script lang="ts" setup>
import type { SystemLogApi } from '#/api/system/log';

import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { Descriptions, Tag } from 'ant-design-vue';
import dayjs from 'dayjs';

import { $t } from '#/locales';

import { BUSINESS_TYPE_MAP, OPER_STATUS_MAP } from '../data';

const [Drawer, drawerApi] = useVbenDrawer({
  footer: false,
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      const data = drawerApi.getData<SystemLogApi.OperLog>();
      if (data) {
        operLog.value = data;
      }
    }
  },
});

const operLog = ref<null | SystemLogApi.OperLog>(null);

const businessTypeInfo = computed(() => {
  if (operLog.value?.businessType !== undefined) {
    const info = BUSINESS_TYPE_MAP[operLog.value.businessType];
    return {
      color: info?.color || 'default',
      label: info?.label ? $t(info.label) : String(operLog.value.businessType),
    };
  }
  return { color: 'default', label: '-' };
});

const statusInfo = computed(() => {
  if (operLog.value?.status !== undefined) {
    const info = OPER_STATUS_MAP[operLog.value.status];
    return {
      color: info?.color || 'default',
      label: info?.label ? $t(info.label) : String(operLog.value.status),
    };
  }
  return { color: 'default', label: '-' };
});

const formattedOperTime = computed(() => {
  if (operLog.value?.operTime) {
    return dayjs(operLog.value.operTime).format('YYYY-MM-DD HH:mm:ss');
  }
  return '-';
});

/**
 * 格式化 JSON 字符串用于显示
 */
const formatJsonString = (str?: string): string => {
  if (!str) return '-';
  try {
    const parsed = JSON.parse(str);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return str;
  }
};
</script>

<template>
  <Drawer :title="$t('system.log.detail')" class="w-[600px]">
    <Descriptions v-if="operLog" :column="2" bordered size="small">
      <Descriptions.Item :label="$t('system.log.title')" :span="1">
        {{ operLog.title || '-' }}
      </Descriptions.Item>
      <Descriptions.Item :label="$t('system.log.businessType.label')" :span="1">
        <Tag :color="businessTypeInfo.color">
          {{ businessTypeInfo.label }}
        </Tag>
      </Descriptions.Item>
      <Descriptions.Item :label="$t('system.log.requestMethod')" :span="1">
        {{ operLog.requestMethod || '-' }}
      </Descriptions.Item>
      <Descriptions.Item :label="$t('system.log.status')" :span="1">
        <Tag :color="statusInfo.color">
          {{ statusInfo.label }}
        </Tag>
      </Descriptions.Item>
      <Descriptions.Item :label="$t('system.log.operName')" :span="1">
        {{ operLog.operName || '-' }}
      </Descriptions.Item>
      <Descriptions.Item :label="$t('system.log.deptName')" :span="1">
        {{ operLog.deptName || '-' }}
      </Descriptions.Item>
      <Descriptions.Item :label="$t('system.log.operIp')" :span="1">
        {{ operLog.operIp || '-' }}
      </Descriptions.Item>
      <Descriptions.Item :label="$t('system.log.operLocation')" :span="1">
        {{ operLog.operLocation || '-' }}
      </Descriptions.Item>
      <Descriptions.Item :label="$t('system.log.operUrl')" :span="2">
        {{ operLog.operUrl || '-' }}
      </Descriptions.Item>
      <Descriptions.Item :label="$t('system.log.method')" :span="2">
        {{ operLog.method || '-' }}
      </Descriptions.Item>
      <Descriptions.Item :label="$t('system.log.operTime')" :span="1">
        {{ formattedOperTime }}
      </Descriptions.Item>
      <Descriptions.Item :label="$t('system.log.costTime')" :span="1">
        {{ operLog.costTime ? `${operLog.costTime}ms` : '-' }}
      </Descriptions.Item>
      <Descriptions.Item :label="$t('system.log.operParam')" :span="2">
        <pre class="m-0 max-h-40 overflow-auto whitespace-pre-wrap text-xs">{{
          formatJsonString(operLog.operParam)
        }}</pre>
      </Descriptions.Item>
      <Descriptions.Item :label="$t('system.log.jsonResult')" :span="2">
        <pre class="m-0 max-h-40 overflow-auto whitespace-pre-wrap text-xs">{{
          formatJsonString(operLog.jsonResult)
        }}</pre>
      </Descriptions.Item>
      <Descriptions.Item
        v-if="operLog.status === 1 && operLog.errorMsg"
        :label="$t('system.log.errorMsg')"
        :span="2"
      >
        <span class="text-red-500">{{ operLog.errorMsg }}</span>
      </Descriptions.Item>
    </Descriptions>
  </Drawer>
</template>
