import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SystemPostApi } from '#/api/system/post';

import dayjs from 'dayjs';

import { $t } from '#/locales';

/** 权限码常量 */
export const PERMISSION_CODES = {
  create: 'system:post:create',
  delete: 'system:post:delete',
  list: 'system:post:list',
  query: 'system:post:query',
  update: 'system:post:update',
} as const;

/**
 * 岗位列表筛选表单 Schema
 */
export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'postCode',
      label: $t('system.post.postCode'),
    },
    {
      component: 'Input',
      fieldName: 'postName',
      label: $t('system.post.postName'),
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: [
          { label: $t('common.enabled'), value: 0 },
          { label: $t('common.disabled'), value: 1 },
        ],
      },
      fieldName: 'status',
      label: $t('system.post.status'),
    },
  ];
}

/**
 * 岗位表单 Schema
 */
export function useFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'postCode',
      label: $t('system.post.postCode'),
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'postName',
      label: $t('system.post.postName'),
      rules: 'required',
    },
    {
      component: 'InputNumber',
      componentProps: {
        min: 0,
        style: { width: '100%' },
      },
      defaultValue: 0,
      fieldName: 'postSort',
      label: $t('system.post.postSort'),
    },
    {
      component: 'RadioGroup',
      componentProps: {
        buttonStyle: 'solid',
        options: [
          { label: $t('common.enabled'), value: 0 },
          { label: $t('common.disabled'), value: 1 },
        ],
        optionType: 'button',
      },
      defaultValue: 0,
      fieldName: 'status',
      label: $t('system.post.status'),
    },
    {
      component: 'Textarea',
      fieldName: 'remark',
      label: $t('system.post.remark'),
    },
  ];
}

/**
 * 岗位列表列定义
 * @param onActionClick 操作按钮点击回调
 * @param onStatusChange 状态切换回调
 * @param hasAccess 权限检查函数
 */
export function useColumns(
  onActionClick: OnActionClickFn<SystemPostApi.SystemPost>,
  onStatusChange?: (
    newStatus: number,
    row: SystemPostApi.SystemPost,
  ) => PromiseLike<boolean | undefined>,
  hasAccess?: (codes: string[]) => boolean,
): VxeTableGridOptions<SystemPostApi.SystemPost>['columns'] {
  return [
    {
      field: 'postCode',
      title: $t('system.post.postCode'),
      width: 150,
    },
    {
      field: 'postName',
      title: $t('system.post.postName'),
      width: 200,
    },
    {
      field: 'postSort',
      title: $t('system.post.postSort'),
      width: 100,
    },
    {
      cellRender: {
        attrs: { beforeChange: onStatusChange },
        name: onStatusChange ? 'CellSwitch' : 'CellTag',
        props: {
          checkedValue: 0,
          unCheckedValue: 1,
        },
        options: [
          { color: 'success', label: $t('common.enabled'), value: 0 },
          { color: 'error', label: $t('common.disabled'), value: 1 },
        ],
      },
      field: 'status',
      title: $t('system.post.status'),
      width: 100,
    },
    {
      field: 'remark',
      minWidth: 150,
      title: $t('system.post.remark'),
    },
    {
      field: 'createTime',
      formatter: ({ cellValue }) =>
        cellValue ? dayjs(cellValue).format('YYYY-MM-DD HH:mm:ss') : '',
      title: $t('system.post.createTime'),
      width: 180,
    },
    {
      align: 'center',
      cellRender: {
        attrs: {
          nameField: 'postName',
          nameTitle: $t('system.post.name'),
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: [
          {
            code: 'edit',
            show: () => !hasAccess || hasAccess([PERMISSION_CODES.update]),
          },
          {
            code: 'delete',
            show: () => !hasAccess || hasAccess([PERMISSION_CODES.delete]),
          },
        ],
      },
      field: 'operation',
      fixed: 'right',
      title: $t('system.post.operation'),
      width: 130,
    },
  ];
}
