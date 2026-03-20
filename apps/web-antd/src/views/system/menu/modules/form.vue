<script lang="ts" setup>
import type { ChangeEvent } from 'ant-design-vue/es/_util/EventInterface';

import type { Recordable } from '@vben/types';

import type { VbenFormSchema } from '#/adapter/form';

import { computed, h, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';
import { IconifyIcon } from '@vben/icons';
import { $te } from '@vben/locales';
import { getPopupContainer } from '@vben/utils';

import { breakpointsTailwind, useBreakpoints } from '@vueuse/core';

import { useVbenForm, z } from '#/adapter/form';
import {
  createMenu,
  getMenuList,
  isMenuNameExists,
  isMenuPathExists,
  SystemMenuApi,
  updateMenu,
} from '#/api/system/menu';
import { $t } from '#/locales';

import { getMenuTypeOptions } from '../data';

const emit = defineEmits<{
  success: [];
}>();

const formData = ref<SystemMenuApi.SystemMenu>();
const titleSuffix = ref<string>();

const schema: VbenFormSchema[] = [
  {
    component: 'RadioGroup',
    componentProps: {
      buttonStyle: 'solid',
      options: getMenuTypeOptions(),
      optionType: 'button',
    },
    defaultValue: 'menu',
    fieldName: 'type',
    formItemClass: 'col-span-2 md:col-span-2',
    label: $t('system.menu.type'),
  },
  {
    component: 'Input',
    fieldName: 'name',
    label: $t('system.menu.menuName'),
    rules: z
      .string()
      .min(2, $t('ui.formRules.minLength', [$t('system.menu.menuName'), 2]))
      .max(30, $t('ui.formRules.maxLength', [$t('system.menu.menuName'), 30]))
      .refine(
        async (value: string) => {
          return !(await isMenuNameExists(value, formData.value?.id));
        },
        (value) => ({
          message: $t('ui.formRules.alreadyExists', [
            $t('system.menu.menuName'),
            value,
          ]),
        }),
      ),
  },
  {
    component: 'ApiTreeSelect',
    componentProps: {
      api: getMenuList,
      class: 'w-full',
      filterTreeNode(input: string, node: Recordable<any>) {
        if (!input || input.length === 0) {
          return true;
        }
        const title: string = node.meta?.title ?? '';
        if (!title) return false;
        return title.includes(input) || $t(title).includes(input);
      },
      getPopupContainer,
      labelField: 'meta.title',
      showSearch: true,
      treeDefaultExpandAll: true,
      valueField: 'id',
      childrenField: 'children',
    },
    fieldName: 'pid',
    label: $t('system.menu.parent'),
    renderComponentContent() {
      return {
        title({ label, meta }: { label: string; meta: Recordable<any> }) {
          const coms = [];
          if (!label) return '';
          if (meta?.icon) {
            coms.push(h(IconifyIcon, { class: 'size-4', icon: meta.icon }));
          }
          coms.push(h('span', { class: '' }, $t(label || '')));
          return h('div', { class: 'flex items-center gap-1' }, coms);
        },
      };
    },
  },
  {
    component: 'Input',
    componentProps() {
      return {
        ...(titleSuffix.value && { addonAfter: titleSuffix.value }),
        onChange({ target: { value } }: ChangeEvent) {
          titleSuffix.value = value && $te(value) ? $t(value) : undefined;
        },
      };
    },
    fieldName: 'title',
    label: $t('system.menu.menuTitle'),
    rules: 'required',
  },
  {
    component: 'Input',
    dependencies: {
      show: (values) => {
        return ['catalog', 'embedded', 'menu'].includes(values.type);
      },
      triggerFields: ['type'],
    },
    fieldName: 'path',
    label: $t('system.menu.path'),
    rules: z
      .string()
      .min(2, $t('ui.formRules.minLength', [$t('system.menu.path'), 2]))
      .max(100, $t('ui.formRules.maxLength', [$t('system.menu.path'), 100]))
      .refine(
        async (value: string) => {
          return !(await isMenuPathExists(value, formData.value?.id));
        },
        (value) => ({
          message: $t('ui.formRules.alreadyExists', [
            $t('system.menu.path'),
            value,
          ]),
        }),
      ),
  },
  {
    component: 'Input',
    dependencies: {
      show: (values) => {
        return ['embedded', 'menu'].includes(values.type);
      },
      triggerFields: ['type'],
    },
    fieldName: 'activePath',
    help: $t('system.menu.activePathHelp'),
    label: $t('system.menu.activePath'),
    rules: z
      .string()
      .min(2, $t('ui.formRules.minLength', [$t('system.menu.path'), 2]))
      .max(100, $t('ui.formRules.maxLength', [$t('system.menu.path'), 100]))
      .refine(
        (value: string) => {
          return value.startsWith('/');
        },
        $t('ui.formRules.startWith', [$t('system.menu.path'), '/']),
      )
      .refine(async (value: string) => {
        return await isMenuPathExists(value, formData.value?.id);
      }, $t('system.menu.activePathMustExist'))
      .optional(),
  },
  {
    component: 'IconPicker',
    componentProps: {
      prefix: 'carbon',
    },
    dependencies: {
      show: (values) => {
        return ['catalog', 'embedded', 'link', 'menu'].includes(values.type);
      },
      triggerFields: ['type'],
    },
    fieldName: 'icon',
    label: $t('system.menu.icon'),
  },
  {
    component: 'IconPicker',
    componentProps: {
      prefix: 'carbon',
    },
    dependencies: {
      show: (values) => {
        return ['catalog', 'embedded', 'menu'].includes(values.type);
      },
      triggerFields: ['type'],
    },
    fieldName: 'activeIcon',
    label: $t('system.menu.activeIcon'),
  },
  {
    component: 'Input',
    dependencies: {
      rules: (values) => {
        return values.type === 'menu' ? 'required' : null;
      },
      show: (values) => {
        return values.type === 'menu';
      },
      triggerFields: ['type'],
    },
    fieldName: 'component',
    label: $t('system.menu.component'),
  },
  {
    component: 'Input',
    dependencies: {
      show: (values) => {
        return ['embedded', 'link'].includes(values.type);
      },
      triggerFields: ['type'],
    },
    fieldName: 'linkSrc',
    label: $t('system.menu.linkSrc'),
    rules: z.string().url($t('ui.formRules.invalidURL')),
  },
  {
    component: 'Input',
    dependencies: {
      rules: (values) => {
        return values.type === 'button' ? 'required' : null;
      },
      show: (values) => {
        return ['button', 'catalog', 'embedded', 'menu'].includes(values.type);
      },
      triggerFields: ['type'],
    },
    fieldName: 'authCode',
    label: $t('system.menu.authCode'),
  },
  {
    component: 'InputNumber',
    componentProps: {
      min: 0,
      placeholder: $t('system.menu.orderHelp'),
      style: { width: '100%' },
    },
    defaultValue: 0,
    fieldName: 'order',
    help: $t('system.menu.orderHelp'),
    label: $t('system.menu.order'),
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
    label: $t('system.menu.status'),
  },
  {
    component: 'Select',
    componentProps: {
      allowClear: true,
      class: 'w-full',
      options: [
        { label: $t('system.menu.badgeType.dot'), value: 'dot' },
        { label: $t('system.menu.badgeType.normal'), value: 'normal' },
      ],
    },
    dependencies: {
      show: (values) => {
        return values.type !== 'button';
      },
      triggerFields: ['type'],
    },
    fieldName: 'badgeType',
    label: $t('system.menu.badgeType.title'),
  },
  {
    component: 'Input',
    componentProps: (values) => {
      return {
        allowClear: true,
        class: 'w-full',
        disabled: values.badgeType !== 'normal',
      };
    },
    dependencies: {
      show: (values) => {
        return values.type !== 'button';
      },
      triggerFields: ['type'],
    },
    fieldName: 'badge',
    label: $t('system.menu.badge'),
  },
  {
    component: 'Select',
    componentProps: {
      allowClear: true,
      class: 'w-full',
      options: SystemMenuApi.BadgeVariants.map((v) => ({
        label: v,
        value: v,
      })),
    },
    dependencies: {
      show: (values) => {
        return values.type !== 'button';
      },
      triggerFields: ['type'],
    },
    fieldName: 'badgeVariants',
    label: $t('system.menu.badgeVariants'),
  },
  {
    component: 'Divider',
    dependencies: {
      show: (values) => {
        return !['button', 'link'].includes(values.type);
      },
      triggerFields: ['type'],
    },
    fieldName: 'divider1',
    formItemClass: 'col-span-2 md:col-span-2 pb-0',
    hideLabel: true,
    renderComponentContent() {
      return {
        default: () => $t('system.menu.advancedSettings'),
      };
    },
  },
  {
    component: 'Checkbox',
    dependencies: {
      show: (values) => {
        return ['menu'].includes(values.type);
      },
      triggerFields: ['type'],
    },
    fieldName: 'keepAlive',
    renderComponentContent() {
      return {
        default: () => $t('system.menu.keepAlive'),
      };
    },
  },
  {
    component: 'Checkbox',
    dependencies: {
      show: (values) => {
        return ['embedded', 'menu'].includes(values.type);
      },
      triggerFields: ['type'],
    },
    fieldName: 'affixTab',
    renderComponentContent() {
      return {
        default: () => $t('system.menu.affixTab'),
      };
    },
  },
  {
    component: 'Checkbox',
    dependencies: {
      show: (values) => {
        return !['button'].includes(values.type);
      },
      triggerFields: ['type'],
    },
    fieldName: 'hideInMenu',
    renderComponentContent() {
      return {
        default: () => $t('system.menu.hideInMenu'),
      };
    },
  },
  {
    component: 'Checkbox',
    dependencies: {
      show: (values) => {
        return ['catalog', 'menu'].includes(values.type);
      },
      triggerFields: ['type'],
    },
    fieldName: 'hideChildrenInMenu',
    renderComponentContent() {
      return {
        default: () => $t('system.menu.hideChildrenInMenu'),
      };
    },
  },
  {
    component: 'Checkbox',
    dependencies: {
      show: (values) => {
        return !['button', 'link'].includes(values.type);
      },
      triggerFields: ['type'],
    },
    fieldName: 'hideInBreadcrumb',
    renderComponentContent() {
      return {
        default: () => $t('system.menu.hideInBreadcrumb'),
      };
    },
  },
  {
    component: 'Checkbox',
    dependencies: {
      show: (values) => {
        return !['button', 'link'].includes(values.type);
      },
      triggerFields: ['type'],
    },
    fieldName: 'hideInTab',
    renderComponentContent() {
      return {
        default: () => $t('system.menu.hideInTab'),
      };
    },
  },
];

const breakpoints = useBreakpoints(breakpointsTailwind);
const isHorizontal = computed(() => breakpoints.greaterOrEqual('md').value);

const [Form, formApi] = useVbenForm({
  commonConfig: {
    colon: true,
    formItemClass: 'col-span-2 md:col-span-1',
  },
  schema,
  showDefaultActions: false,
  wrapperClass: 'grid-cols-2 gap-x-4',
});

/**
 * 将表单数据转换为 API 请求格式
 */
const transformFormData = (data: any): SystemMenuApi.CreateMenuRequest => {
  // 根据类型计算 path
  let path: string;
  if (['catalog', 'embedded', 'menu'].includes(data.type)) {
    path = data.path;
  } else if (data.type === 'link') {
    // link 类型自动生成 path
    path = data.path || `/external-link-${Date.now()}`;
  } else if (data.type === 'button') {
    // button 类型不需要 path，使用权限标识作为路径标识
    path = data.authCode ? `/${data.authCode}` : `/button-${Date.now()}`;
  } else {
    path = data.path || `/unknown-${Date.now()}`;
  }

  const result: SystemMenuApi.CreateMenuRequest = {
    name: data.name,
    title: data.title,
    path,
    type: data.type,
    status: data.status,
  };

  // 父级菜单
  if (data.pid) {
    result.parentId = data.pid;
  }

  // 组件路径
  if (data.component) {
    result.component = data.component;
  }

  // 权限标识
  if (data.authCode) {
    result.authCode = data.authCode;
  }

  // 图标
  if (data.icon) {
    result.icon = data.icon;
  }
  if (data.activeIcon) {
    result.activeIcon = data.activeIcon;
  }

  // 外链/iframe
  if (data.type === 'link' && data.linkSrc) {
    result.link = data.linkSrc;
  }
  if (data.type === 'embedded' && data.linkSrc) {
    result.iframeSrc = data.linkSrc;
  }

  // 激活路径
  if (data.activePath) {
    result.activePath = data.activePath;
  }

  // 徽标
  if (data.badge) {
    result.badge = data.badge;
  }
  if (data.badgeType) {
    result.badgeType = data.badgeType;
  }
  if (data.badgeVariants) {
    result.badgeVariants = data.badgeVariants;
  }

  // 排序值
  if (data.order !== undefined && data.order !== null) {
    result.order = data.order;
  }

  // 布尔属性 - 仅在类型支持时设置
  if (['menu'].includes(data.type)) {
    result.keepAlive = !!data.keepAlive;
  }
  if (['embedded', 'menu'].includes(data.type)) {
    result.affixTab = !!data.affixTab;
  }
  if (!['button'].includes(data.type)) {
    result.hideInMenu = !!data.hideInMenu;
  }
  if (['catalog', 'menu'].includes(data.type)) {
    result.hideChildrenInMenu = !!data.hideChildrenInMenu;
  }
  if (!['button', 'link'].includes(data.type)) {
    result.hideInBreadcrumb = !!data.hideInBreadcrumb;
    result.hideInTab = !!data.hideInTab;
  }

  return result;
};

/**
 * 将 API 数据转换为表单数据格式
 */
const transformToFormData = (data: SystemMenuApi.SystemMenu): any => {
  const result: any = {
    name: data.name,
    title: data.meta?.title,
    path: data.path,
    type: data.type,
    status: data.status ?? 0,
    pid: data.pid,
    component: data.component,
    authCode: data.authCode,
    icon: data.meta?.icon,
    activeIcon: data.meta?.activeIcon,
    activePath: data.meta?.activePath,
    badge: data.meta?.badge,
    badgeType: data.meta?.badgeType,
    badgeVariants: data.meta?.badgeVariants,
    keepAlive: data.meta?.keepAlive,
    affixTab: data.meta?.affixTab,
    hideInMenu: data.meta?.hideInMenu,
    hideChildrenInMenu: data.meta?.hideChildrenInMenu,
    hideInBreadcrumb: data.meta?.hideInBreadcrumb,
    hideInTab: data.meta?.hideInTab,
    order: data.meta?.order ?? 0,
  };

  // 外链/iframe
  if (data.type === 'link') {
    result.linkSrc = data.meta?.link;
  } else if (data.type === 'embedded') {
    result.linkSrc = data.meta?.iframeSrc;
  }

  return result;
};

const [Drawer, drawerApi] = useVbenDrawer({
  onConfirm: onSubmit,
  onOpenChange(isOpen) {
    if (isOpen) {
      const data = drawerApi.getData<SystemMenuApi.SystemMenu>();
      if (data?.id) {
        // 编辑模式
        formData.value = data;
        const formValues = transformToFormData(data);
        formApi.setValues(formValues);

        if (formValues.title) {
          titleSuffix.value = $te(formValues.title)
            ? $t(formValues.title)
            : undefined;
        } else {
          titleSuffix.value = '';
        }
      } else if (data?.pid) {
        // 新增下级模式
        formData.value = undefined;
        formApi.resetForm();
        formApi.setValues({ pid: data.pid });
        titleSuffix.value = '';
      } else {
        // 新增模式
        formData.value = undefined;
        formApi.resetForm();
        titleSuffix.value = '';
      }
    }
  },
});

async function onSubmit() {
  const { valid } = await formApi.validate();
  if (valid) {
    drawerApi.lock();
    const rawData = await formApi.getValues();
    const data = transformFormData(rawData);

    try {
      await (formData.value?.id
        ? updateMenu(formData.value.id, data)
        : createMenu(data));
      drawerApi.close();
      emit('success');
    } finally {
      drawerApi.unlock();
    }
  }
}

const getDrawerTitle = computed(() =>
  formData.value?.id
    ? $t('ui.actionTitle.edit', [$t('system.menu.name')])
    : $t('ui.actionTitle.create', [$t('system.menu.name')]),
);
</script>
<template>
  <Drawer class="w-full max-w-[800px]" :title="getDrawerTitle">
    <Form class="mx-4" :layout="isHorizontal ? 'horizontal' : 'vertical'" />
  </Drawer>
</template>
