<script setup lang="ts">
import { useDictStore } from '@vben/stores';

import { useVbenForm } from '#/adapter/form';
import { useVbenVxeGrid } from '#/adapter/vxe-table';

const dictStore = useDictStore();
const [Form] = useVbenForm<{ status: string }>({
  schema: [
    {
      component: 'ApiSelect',
      componentProps: {
        api: () => dictStore.getDict('project_status'),
      },
      fieldName: 'status',
      label: '项目状态',
    },
  ],
});

const [Grid] = useVbenVxeGrid<{ id: string; status: string }>({
  gridOptions: {
    columns: [
      {
        field: 'status',
        title: '项目状态',
        cellRender: { name: 'CellDict', props: { code: 'project_status' } },
      },
    ],
    data: [{ id: 'example', status: 'in_progress' }],
    pagerConfig: { enabled: false },
  },
});
</script>

<template>
  <Form />
  <Grid />
</template>
