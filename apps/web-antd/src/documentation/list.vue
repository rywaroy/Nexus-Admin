<script setup lang="ts">
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SystemRoleApi } from '#/api/system/role';

import { Page, useVbenDrawer } from '@vben/common-ui';

import { Button } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getRoleList } from '#/api/system/role';

import RoleForm from './drawer.vue';

const [FormDrawer, drawerApi] = useVbenDrawer({
  connectedComponent: RoleForm,
  destroyOnClose: true,
});
const [Grid, gridApi] = useVbenVxeGrid<SystemRoleApi.SystemRole>({
  formOptions: {
    schema: [{ component: 'Input', fieldName: 'name', label: '角色名称' }],
  },
  gridOptions: {
    height: 'auto',
    columns: [
      { field: 'name', title: '角色名称' },
      {
        field: 'status',
        title: '状态',
        cellRender: {
          name: 'CellTag',
          options: [
            { value: 0, label: '启用', color: 'success' },
            { value: 1, label: '停用', color: 'error' },
          ],
        },
      },
      { field: 'operation', title: '操作', slots: { default: 'operation' } },
    ],
    rowConfig: { keyField: 'id' },
    proxyConfig: {
      ajax: {
        query: async ({ page }, values) => {
          const result = await getRoleList({
            ...values,
            page: page.currentPage,
            pageSize: page.pageSize,
          });
          return { items: result.list, total: result.total };
        },
      },
    },
    toolbarConfig: { refresh: true, search: true },
  } satisfies VxeTableGridOptions<SystemRoleApi.SystemRole>,
});

const create = () => drawerApi.setData({}).open();
const edit = (row: SystemRoleApi.SystemRole) => drawerApi.setData(row).open();
const refresh = () => gridApi.query();
</script>

<template>
  <Page auto-content-height>
    <FormDrawer @success="refresh" />
    <Grid>
      <template #toolbar-tools>
        <Button type="primary" @click="create">新增角色</Button>
      </template>
      <template #operation="{ row }">
        <Button type="link" @click="edit(row)">编辑</Button>
      </template>
    </Grid>
  </Page>
</template>
