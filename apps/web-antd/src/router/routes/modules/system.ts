import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'ion:settings-outline',
      order: 9997,
      title: $t('system.title'),
    },
    name: 'System',
    path: '/system',
    children: [
      {
        path: 'menu',
        name: 'SystemMenu',
        meta: {
          icon: 'mdi:menu',
          title: $t('system.menu.title'),
        },
        component: () => import('#/views/system/menu/list.vue'),
      },
      {
        path: 'dept',
        name: 'SystemDept',
        meta: {
          icon: 'mdi:file-tree-outline',
          title: $t('system.dept.title'),
        },
        component: () => import('#/views/system/dept/list.vue'),
      },
      {
        path: 'dict',
        name: 'SystemDict',
        meta: {
          icon: 'mdi:book-open-page-variant-outline',
          title: $t('system.dict.title'),
        },
        component: () => import('#/views/system/dict/list.vue'),
      },
      {
        path: 'role',
        name: 'SystemRole',
        meta: {
          icon: 'mdi:account-group',
          title: $t('system.role.title'),
        },
        component: () => import('#/views/system/role/list.vue'),
      },
      {
        path: 'user',
        name: 'SystemUser',
        meta: {
          icon: 'mdi:account-outline',
          title: $t('system.user.title'),
        },
        component: () => import('#/views/system/user/list.vue'),
      },
      {
        path: 'log',
        name: 'SystemLog',
        meta: {
          icon: 'mdi:clipboard-text-clock-outline',
          title: $t('system.log.title'),
        },
        component: () => import('#/views/system/log/list.vue'),
      },
    ],
  },
];

export default routes;
