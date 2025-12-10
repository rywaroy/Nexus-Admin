import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SystemRoleApi } from '#/api/system/role';

import { $t } from '#/locales';

/** 权限码常量 */
export const PERMISSION_CODES = {
  create: 'system:role:create',
  delete: 'system:role:delete',
  list: 'system:role:list',
  query: 'system:role:query',
  update: 'system:role:update',
} as const;

/**
 * 角色列表筛选表单 Schema
 */
export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('system.role.roleName'),
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
      label: $t('system.role.status'),
    },
  ];
}

/**
 * 角色表单 Schema
 */
export function useFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('system.role.roleName'),
      rules: 'required',
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
      label: $t('system.role.status'),
    },
    {
      component: 'Textarea',
      fieldName: 'remark',
      label: $t('system.role.remark'),
    },
    {
      component: 'Input',
      fieldName: 'permissions',
      formItemClass: 'items-start',
      label: $t('system.role.permissions'),
      modelPropName: 'modelValue',
    },
  ];
}

/**
 * 角色列表列定义
 * @param onActionClick 操作按钮点击回调
 * @param onStatusChange 状态切换回调
 * @param hasAccess 权限检查函数
 */
export function useColumns(
  onActionClick: OnActionClickFn<SystemRoleApi.SystemRole>,
  onStatusChange?: (
    newStatus: number,
    row: SystemRoleApi.SystemRole,
  ) => PromiseLike<boolean | undefined>,
  hasAccess?: (codes: string[]) => boolean,
): VxeTableGridOptions<SystemRoleApi.SystemRole>['columns'] {
  return [
    {
      field: 'name',
      title: $t('system.role.roleName'),
      width: 200,
    },
    {
      field: 'id',
      title: $t('system.role.id'),
      width: 220,
    },
    {
      cellRender: {
        attrs: { beforeChange: onStatusChange },
        name: onStatusChange ? 'CellSwitch' : 'CellTag',
        // 适配后端状态定义：0=启用，1=停用
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
      title: $t('system.role.status'),
      width: 100,
    },
    {
      field: 'remark',
      minWidth: 150,
      title: $t('system.role.remark'),
    },
    {
      field: 'createTime',
      title: $t('system.role.createTime'),
      width: 180,
    },
    {
      align: 'center',
      cellRender: {
        attrs: {
          nameField: 'name',
          nameTitle: $t('system.role.name'),
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
      title: $t('system.role.operation'),
      width: 130,
    },
  ];
}
