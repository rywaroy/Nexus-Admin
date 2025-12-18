import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'mdi:monitor-eye',
      order: 9998,
      title: $t('monitor.title'),
    },
    name: 'Monitor',
    path: '/monitor',
    children: [
      {
        path: 'operlog',
        name: 'MonitorOperLog',
        meta: {
          icon: 'mdi:clipboard-text-clock-outline',
          title: $t('monitor.operlog.title'),
        },
        component: () => import('#/views/monitor/operlog/list.vue'),
      },
    ],
  },
];

export default routes;
