import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { MonitorOperLogApi } from '#/api/monitor/operlog';

import dayjs from 'dayjs';

import { $t } from '#/locales';

/** 权限码常量 */
export const PERMISSION_CODES = {
  delete: 'monitor:operlog:delete',
  list: 'monitor:operlog:list',
  query: 'monitor:operlog:query',
} as const;

/** 业务类型映射 */
export const BUSINESS_TYPE_MAP: Record<
  number,
  { color: string; label: string }
> = {
  0: { color: 'default', label: 'monitor.operlog.businessType.other' },
  1: { color: 'success', label: 'monitor.operlog.businessType.insert' },
  2: { color: 'processing', label: 'monitor.operlog.businessType.update' },
  3: { color: 'error', label: 'monitor.operlog.businessType.delete' },
  4: { color: 'warning', label: 'monitor.operlog.businessType.grant' },
  5: { color: 'cyan', label: 'monitor.operlog.businessType.export' },
  6: { color: 'purple', label: 'monitor.operlog.businessType.import' },
  7: { color: 'magenta', label: 'monitor.operlog.businessType.force' },
  8: { color: 'red', label: 'monitor.operlog.businessType.clean' },
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
    label: $t('monitor.operlog.title'),
  },
  {
    component: 'Input',
    fieldName: 'operName',
    label: $t('monitor.operlog.operName'),
  },
  {
    component: 'Select',
    componentProps: {
      allowClear: true,
      options: getBusinessTypeOptions(),
    },
    fieldName: 'businessType',
    label: $t('monitor.operlog.businessType.label'),
  },
  {
    component: 'Select',
    componentProps: {
      allowClear: true,
      options: getStatusOptions(),
    },
    fieldName: 'status',
    label: $t('monitor.operlog.status'),
  },
  {
    component: 'RangePicker',
    fieldName: 'dateRange',
    label: $t('monitor.operlog.operTime'),
  },
];

/**
 * 操作日志列表列定义
 * @param onActionClick 操作按钮点击回调
 * @param hasAccess 权限检查函数
 */
export const useColumns = (
  onActionClick: OnActionClickFn<MonitorOperLogApi.OperLog>,
  hasAccess?: (codes: string[]) => boolean,
): VxeTableGridOptions<MonitorOperLogApi.OperLog>['columns'] => [
  {
    type: 'checkbox',
    width: 50,
  },
  {
    field: 'title',
    minWidth: 140,
    title: $t('monitor.operlog.title'),
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
    title: $t('monitor.operlog.businessType.label'),
    width: 100,
  },
  {
    field: 'requestMethod',
    title: $t('monitor.operlog.requestMethod'),
    width: 90,
  },
  {
    field: 'operName',
    title: $t('monitor.operlog.operName'),
    width: 100,
  },
  {
    field: 'operIp',
    title: $t('monitor.operlog.operIp'),
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
    title: $t('monitor.operlog.status'),
    width: 90,
  },
  {
    field: 'costTime',
    formatter: ({ cellValue }) => (cellValue ? `${cellValue}ms` : ''),
    title: $t('monitor.operlog.costTime'),
    width: 100,
  },
  {
    field: 'operTime',
    formatter: ({ cellValue }) =>
      cellValue ? dayjs(cellValue).format('YYYY-MM-DD HH:mm:ss') : '',
    title: $t('monitor.operlog.operTime'),
    width: 170,
  },
  {
    align: 'center',
    cellRender: {
      attrs: {
        nameField: 'title',
        nameTitle: $t('monitor.operlog.title'),
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
