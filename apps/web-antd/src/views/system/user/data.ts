import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SystemDeptApi } from '#/api/system/dept';
import type { SystemUserApi } from '#/api/system/user';

import dayjs from 'dayjs';

import { getPostList } from '#/api/system/post';
import { getRoleList } from '#/api/system/role';
import { $t } from '#/locales';

/** 权限码常量 */
export const PERMISSION_CODES = {
  create: 'system:user:create',
  delete: 'system:user:delete',
  list: 'system:user:list',
  query: 'system:user:query',
  resetPassword: 'system:user:reset-password',
  update: 'system:user:update',
} as const;

interface FormSchemaOptions {
  deptTree: SystemDeptApi.SystemDept[];
}

/**
 * 用户列表筛选表单 Schema
 */
export const useGridFormSchema = (): VbenFormSchema[] => [
  {
    component: 'Input',
    fieldName: 'username',
    label: $t('system.user.username'),
  },
  {
    component: 'Input',
    fieldName: 'nickName',
    label: $t('system.user.nickName'),
  },
  {
    component: 'Input',
    fieldName: 'phone',
    label: $t('system.user.phone'),
  },
  {
    component: 'ApiSelect',
    componentProps: {
      allowClear: true,
      api: () => getPostList({ status: 0, pageSize: 1000 }),
      labelField: 'postName',
      valueField: 'id',
      resultField: 'list',
      placeholder: $t('system.user.postsPlaceholder'),
    },
    fieldName: 'postId',
    label: $t('system.user.posts'),
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
    label: $t('system.user.status'),
  },
];

/**
 * 用户表单 Schema
 */
export const useFormSchema = (
  isEdit: boolean,
  options: FormSchemaOptions,
): VbenFormSchema[] => [
  {
    component: 'Input',
    componentProps: {
      disabled: isEdit,
    },
    fieldName: 'username',
    label: $t('system.user.username'),
    rules: isEdit ? undefined : 'required',
  },
  {
    component: 'Input',
    componentProps: {
      type: 'password',
    },
    fieldName: 'password',
    label: $t('system.user.password'),
    rules: isEdit ? undefined : 'required',
    dependencies: {
      show: () => !isEdit,
      triggerFields: [],
    },
  },
  {
    component: 'Input',
    fieldName: 'nickName',
    label: $t('system.user.nickName'),
    rules: 'required',
  },
  {
    component: 'TreeSelect',
    componentProps: {
      allowClear: true,
      fieldNames: {
        children: 'children',
        label: 'name',
        value: 'id',
      },
      placeholder: $t('system.user.deptPlaceholder'),
      showSearch: true,
      style: { width: '100%' },
      treeData: options.deptTree,
      treeDefaultExpandAll: true,
    },
    fieldName: 'deptId',
    label: $t('system.user.dept'),
  },
  {
    component: 'ApiSelect',
    componentProps: {
      allowClear: true,
      mode: 'multiple',
      api: () => getRoleList({ status: 0, pageSize: 1000 }),
      // 后端 User.roles 以"角色名称"存储与鉴权，这里 label 和 value 都用 name
      labelField: 'name',
      valueField: 'name',
      resultField: 'list',
      placeholder: $t('system.user.rolesPlaceholder'),
      style: { width: '100%' },
    },
    fieldName: 'roles',
    label: $t('system.user.roles'),
  },
  {
    component: 'ApiSelect',
    componentProps: {
      allowClear: true,
      mode: 'multiple',
      api: () => getPostList({ status: 0, pageSize: 1000 }),
      labelField: 'postName',
      valueField: 'id',
      resultField: 'list',
      placeholder: $t('system.user.postsPlaceholder'),
      style: { width: '100%' },
    },
    fieldName: 'postIds',
    label: $t('system.user.posts'),
  },
  {
    component: 'Input',
    fieldName: 'email',
    label: $t('system.user.email'),
  },
  {
    component: 'Input',
    fieldName: 'phone',
    label: $t('system.user.phone'),
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
    label: $t('system.user.status'),
  },
  {
    component: 'Textarea',
    fieldName: 'remark',
    label: $t('system.user.remark'),
  },
];

/**
 * 重置密码表单 Schema
 */
export const useResetPasswordSchema = (): VbenFormSchema[] => [
  {
    component: 'Input',
    componentProps: {
      type: 'password',
    },
    fieldName: 'password',
    label: $t('system.user.newPassword'),
    rules: 'required',
  },
  {
    component: 'Input',
    componentProps: {
      type: 'password',
    },
    fieldName: 'confirmPassword',
    label: $t('system.user.confirmPassword'),
    rules: 'required',
  },
];

/**
 * 用户列表列定义
 * @param onActionClick 操作按钮点击回调
 * @param onStatusChange 状态切换回调
 * @param hasAccess 权限检查函数
 */
export const useColumns = (
  onActionClick: OnActionClickFn<SystemUserApi.SystemUser>,
  onStatusChange?: (
    newStatus: number,
    row: SystemUserApi.SystemUser,
  ) => PromiseLike<boolean | undefined>,
  hasAccess?: (codes: string[]) => boolean,
): VxeTableGridOptions<SystemUserApi.SystemUser>['columns'] => [
  {
    field: 'username',
    title: $t('system.user.username'),
    width: 120,
  },
  {
    field: 'nickName',
    title: $t('system.user.nickName'),
    width: 120,
  },
  {
    field: 'email',
    minWidth: 180,
    title: $t('system.user.email'),
  },
  {
    field: 'phone',
    title: $t('system.user.phone'),
    width: 130,
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
    title: $t('system.user.status'),
    width: 100,
  },
  {
    field: 'createTime',
    formatter: ({ cellValue }) =>
      cellValue ? dayjs(cellValue).format('YYYY-MM-DD HH:mm:ss') : '',
    title: $t('system.user.createTime'),
    width: 180,
  },
  {
    align: 'center',
    cellRender: {
      attrs: {
        nameField: 'username',
        nameTitle: $t('system.user.username'),
        onClick: onActionClick,
      },
      name: 'CellOperation',
      options: [
        {
          code: 'edit',
          show: () => !hasAccess || hasAccess([PERMISSION_CODES.update]),
        },
        {
          code: 'resetPassword',
          show: () => !hasAccess || hasAccess([PERMISSION_CODES.resetPassword]),
          text: $t('system.user.resetPassword'),
        },
        {
          code: 'delete',
          show: () => !hasAccess || hasAccess([PERMISSION_CODES.delete]),
        },
      ],
    },
    field: 'operation',
    fixed: 'right',
    title: $t('system.user.operation'),
    width: 200,
  },
];
