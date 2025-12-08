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
    ],
  },
];

export default routes;
