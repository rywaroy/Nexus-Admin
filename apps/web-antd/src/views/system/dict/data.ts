import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SystemDictApi } from '#/api/system/dict';

import dayjs from 'dayjs';

import { $t } from '#/locales';

export const PERMISSION_CODES = {
  create: 'system:dict:create',
  delete: 'system:dict:delete',
  list: 'system:dict:list',
  query: 'system:dict:query',
  update: 'system:dict:update',
} as const;

export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'dictName',
      label: $t('system.dict.dictName'),
    },
    {
      component: 'Input',
      fieldName: 'dictType',
      label: $t('system.dict.dictType'),
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
      label: $t('system.dict.status'),
    },
  ];
}

export function useFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'dictName',
      label: $t('system.dict.dictName'),
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'dictType',
      label: $t('system.dict.dictType'),
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
      label: $t('system.dict.status'),
    },
    {
      component: 'Textarea',
      fieldName: 'remark',
      label: $t('system.dict.remark'),
    },
  ];
}

export function getDictDataClassOptions() {
  return [
    {
      label: $t('system.dict.listClassDefault'),
      value: 'default',
    },
    {
      label: $t('system.dict.listClassPrimary'),
      value: 'primary',
    },
    {
      label: $t('system.dict.listClassSuccess'),
      value: 'success',
    },
    {
      label: $t('system.dict.listClassInfo'),
      value: 'info',
    },
    {
      label: $t('system.dict.listClassWarning'),
      value: 'warning',
    },
    {
      label: $t('system.dict.listClassDanger'),
      value: 'danger',
    },
  ];
}

export function useDataFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      componentProps: {
        disabled: true,
      },
      fieldName: 'dictType',
      label: $t('system.dict.dictType'),
    },
    {
      component: 'Input',
      fieldName: 'dictLabel',
      label: $t('system.dict.dictLabel'),
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'dictValue',
      label: $t('system.dict.dictValue'),
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'cssClass',
      label: $t('system.dict.cssClass'),
    },
    {
      component: 'InputNumber',
      componentProps: {
        min: 0,
        style: { width: '100%' },
      },
      defaultValue: 0,
      fieldName: 'dictSort',
      label: $t('system.dict.dictSort'),
      rules: 'required',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: getDictDataClassOptions(),
      },
      fieldName: 'listClass',
      label: $t('system.dict.listClass'),
    },
    {
      component: 'RadioGroup',
      componentProps: {
        buttonStyle: 'solid',
        options: [
          { label: $t('system.dict.defaultYes'), value: true },
          { label: $t('system.dict.defaultNo'), value: false },
        ],
        optionType: 'button',
      },
      defaultValue: false,
      fieldName: 'isDefault',
      label: $t('system.dict.isDefault'),
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
      label: $t('system.dict.status'),
    },
    {
      component: 'Textarea',
      fieldName: 'remark',
      label: $t('system.dict.remark'),
    },
  ];
}

export function useColumns(
  onActionClick: OnActionClickFn<SystemDictApi.DictType>,
  onStatusChange?: (
    newStatus: number,
    row: SystemDictApi.DictType,
  ) => PromiseLike<boolean | undefined>,
  hasAccess?: (codes: string[]) => boolean,
): VxeTableGridOptions<SystemDictApi.DictType>['columns'] {
  return [
    {
      field: 'dictName',
      minWidth: 180,
      title: $t('system.dict.dictName'),
    },
    {
      field: 'dictType',
      minWidth: 220,
      title: $t('system.dict.dictType'),
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
      title: $t('system.dict.status'),
      width: 100,
    },
    {
      field: 'remark',
      minWidth: 180,
      title: $t('system.dict.remark'),
    },
    {
      field: 'createTime',
      formatter: ({ cellValue }) =>
        cellValue ? dayjs(cellValue).format('YYYY-MM-DD HH:mm:ss') : '',
      title: $t('system.dict.createTime'),
      width: 180,
    },
    {
      align: 'center',
      cellRender: {
        attrs: {
          nameField: 'dictName',
          nameTitle: $t('system.dict.name'),
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
          {
            code: 'view',
            show: () => !hasAccess || hasAccess([PERMISSION_CODES.query]),
            text: $t('system.dict.viewData'),
          },
        ],
      },
      field: 'operation',
      fixed: 'right',
      title: $t('system.dict.operation'),
      width: 210,
    },
  ];
}
