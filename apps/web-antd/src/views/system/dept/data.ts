import type { Ref } from 'vue';

import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SystemDeptApi } from '#/api/system/dept';

import { $t } from '#/locales';

/** 权限码常量 */
export const PERMISSION_CODES = {
  create: 'system:dept:create',
  delete: 'system:dept:delete',
  list: 'system:dept:list',
  update: 'system:dept:update',
} as const;

/**
 * 部门列表筛选表单 Schema
 */
export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('system.dept.deptName'),
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
      label: $t('system.dept.status'),
    },
  ];
}

/**
 * 部门表单 Schema
 */
export function useFormSchema(
  deptTree: Ref<SystemDeptApi.SystemDept[]>,
): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('system.dept.deptName'),
      rules: 'required',
    },
    {
      component: 'TreeSelect',
      componentProps: () => ({
        allowClear: true,
        fieldNames: {
          children: 'children',
          label: 'name',
          value: 'id',
        },
        showSearch: true,
        treeData: deptTree.value,
        treeDefaultExpandAll: true,
      }),
      fieldName: 'pid',
      label: $t('system.dept.parent'),
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
      label: $t('system.dept.status'),
    },
    {
      component: 'Textarea',
      fieldName: 'remark',
      label: $t('system.dept.remark'),
    },
  ];
}

/**
 * 部门列表列定义
 * @param onActionClick 操作按钮点击回调
 * @param onStatusChange 状态切换回调
 * @param hasAccess 权限检查函数
 */
export function useColumns(
  onActionClick: OnActionClickFn<SystemDeptApi.SystemDept>,
  onStatusChange?: (
    newStatus: number,
    row: SystemDeptApi.SystemDept,
  ) => PromiseLike<boolean | undefined>,
  hasAccess?: (codes: string[]) => boolean,
): VxeTableGridOptions<SystemDeptApi.SystemDept>['columns'] {
  return [
    {
      align: 'left',
      field: 'name',
      title: $t('system.dept.deptName'),
      treeNode: true,
      width: 220,
    },
    {
      field: 'id',
      title: $t('system.dept.id'),
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
      title: $t('system.dept.status'),
      width: 100,
    },
    {
      field: 'remark',
      minWidth: 180,
      title: $t('system.dept.remark'),
    },
    {
      field: 'createTime',
      title: $t('system.dept.createTime'),
      width: 180,
    },
    {
      align: 'center',
      cellRender: {
        attrs: {
          nameField: 'name',
          nameTitle: $t('system.dept.name'),
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: [
          {
            code: 'append',
            icon: 'mdi:plus',
            show: () => !hasAccess || hasAccess([PERMISSION_CODES.create]),
            text: $t('system.dept.appendChild'),
          },
          {
            code: 'edit',
            show: () => !hasAccess || hasAccess([PERMISSION_CODES.update]),
          },
          {
            code: 'delete',
            disabled: (row: SystemDeptApi.SystemDept) =>
              Array.isArray(row.children) && row.children.length > 0,
            show: () => !hasAccess || hasAccess([PERMISSION_CODES.delete]),
          },
        ],
      },
      field: 'operation',
      fixed: 'right',
      title: $t('system.dept.operation'),
      width: 200,
    },
  ];
}
