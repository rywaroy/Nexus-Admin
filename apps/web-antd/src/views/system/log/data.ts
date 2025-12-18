import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SystemLogApi } from '#/api/system/log';

import dayjs from 'dayjs';

import { $t } from '#/locales';

/** 权限码常量 */
export const PERMISSION_CODES = {
  delete: 'system:log:delete',
  list: 'system:log:list',
  query: 'system:log:query',
} as const;

/** 业务类型映射 */
export const BUSINESS_TYPE_MAP: Record<
  number,
  { color: string; label: string }
> = {
  0: { color: 'default', label: 'system.log.businessType.other' },
  1: { color: 'success', label: 'system.log.businessType.insert' },
  2: { color: 'processing', label: 'system.log.businessType.update' },
  3: { color: 'error', label: 'system.log.businessType.delete' },
  4: { color: 'warning', label: 'system.log.businessType.grant' },
  5: { color: 'cyan', label: 'system.log.businessType.export' },
  6: { color: 'purple', label: 'system.log.businessType.import' },
  7: { color: 'magenta', label: 'system.log.businessType.force' },
  8: { color: 'red', label: 'system.log.businessType.clean' },
};

/** 操作状态映射 */
export const OPER_STATUS_MAP: Record<number, { color: string; label: string }> =
  {
    0: { color: 'success', label: 'common.success' },
    1: { color: 'error', label: 'common.fail' },
  };

/**
 * 获取业务类型选项
 */
export const getBusinessTypeOptions = () =>
  Object.entries(BUSINESS_TYPE_MAP).map(([value, { label }]) => ({
    label: $t(label),
    value: Number(value),
  }));

/**
 * 获取操作状态选项
 */
export const getStatusOptions = () =>
  Object.entries(OPER_STATUS_MAP).map(([value, { label }]) => ({
    label: $t(label),
    value: Number(value),
  }));

/**
 * 操作日志列表筛选表单 Schema
 */
export const useGridFormSchema = (): VbenFormSchema[] => [
  {
    component: 'Input',
    fieldName: 'title',
    label: $t('system.log.title'),
  },
  {
    component: 'Input',
    fieldName: 'operName',
    label: $t('system.log.operName'),
  },
  {
    component: 'Select',
    componentProps: {
      allowClear: true,
      options: getBusinessTypeOptions(),
    },
    fieldName: 'businessType',
    label: $t('system.log.businessType.label'),
  },
  {
    component: 'Select',
    componentProps: {
      allowClear: true,
      options: getStatusOptions(),
    },
    fieldName: 'status',
    label: $t('system.log.status'),
  },
  {
    component: 'RangePicker',
    fieldName: 'dateRange',
    label: $t('system.log.operTime'),
  },
];

/**
 * 操作日志列表列定义
 * @param onActionClick 操作按钮点击回调
 * @param hasAccess 权限检查函数
 */
export const useColumns = (
  onActionClick: OnActionClickFn<SystemLogApi.OperLog>,
  hasAccess?: (codes: string[]) => boolean,
): VxeTableGridOptions<SystemLogApi.OperLog>['columns'] => [
  {
    type: 'checkbox',
    width: 50,
  },
  {
    field: 'title',
    minWidth: 140,
    title: $t('system.log.title'),
  },
  {
    cellRender: {
      name: 'CellTag',
      options: Object.entries(BUSINESS_TYPE_MAP).map(
        ([value, { color, label }]) => ({
          color,
          label: $t(label),
          value: Number(value),
        }),
      ),
    },
    field: 'businessType',
    title: $t('system.log.businessType.label'),
    width: 100,
  },
  {
    field: 'requestMethod',
    title: $t('system.log.requestMethod'),
    width: 90,
  },
  {
    field: 'operName',
    title: $t('system.log.operName'),
    width: 100,
  },
  {
    field: 'operIp',
    title: $t('system.log.operIp'),
    width: 130,
  },
  {
    cellRender: {
      name: 'CellTag',
      options: Object.entries(OPER_STATUS_MAP).map(
        ([value, { color, label }]) => ({
          color,
          label: $t(label),
          value: Number(value),
        }),
      ),
    },
    field: 'status',
    title: $t('system.log.status'),
    width: 90,
  },
  {
    field: 'costTime',
    formatter: ({ cellValue }) => (cellValue ? `${cellValue}ms` : ''),
    title: $t('system.log.costTime'),
    width: 100,
  },
  {
    field: 'operTime',
    formatter: ({ cellValue }) =>
      cellValue ? dayjs(cellValue).format('YYYY-MM-DD HH:mm:ss') : '',
    title: $t('system.log.operTime'),
    width: 170,
  },
  {
    align: 'center',
    cellRender: {
      attrs: {
        nameField: 'title',
        nameTitle: $t('system.log.title'),
        onClick: onActionClick,
      },
      name: 'CellOperation',
      options: [
        {
          code: 'view',
          show: () => !hasAccess || hasAccess([PERMISSION_CODES.query]),
          text: $t('common.view'),
        },
        {
          code: 'delete',
          show: () => !hasAccess || hasAccess([PERMISSION_CODES.delete]),
        },
      ],
    },
    field: 'operation',
    fixed: 'right',
    title: $t('common.operation'),
    width: 140,
  },
];
