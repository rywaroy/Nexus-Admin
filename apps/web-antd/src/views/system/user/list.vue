<script lang="ts" setup>
import type { OnActionClickParams, VxeTableGridOptions } from "#/adapter/vxe-table";
import type { SystemDeptApi } from "#/api/system/dept";
import type { SystemUserApi } from "#/api/system/user";

import { onMounted, ref } from "vue";

import { useAccess } from "@vben/access";
import { Page, useVbenDrawer } from "@vben/common-ui";
import { Plus } from "@vben/icons";

import { Button, message, Modal } from "ant-design-vue";

import { useVbenVxeGrid } from "#/adapter/vxe-table";
import { getDeptTree } from "#/api/system/dept";
import { deleteUser, getUserList, updateUserStatus } from "#/api/system/user";
import { $t } from "#/locales";

import { PERMISSION_CODES, useColumns, useGridFormSchema } from "./data";
import Form from "./modules/form.vue";
import ResetPasswordForm from "./modules/reset-password.vue";

const { hasAccessByCodes } = useAccess();

const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: Form,
  destroyOnClose: true,
});

const [ResetPasswordDrawer, resetPasswordDrawerApi] = useVbenDrawer({
  connectedComponent: ResetPasswordForm,
  destroyOnClose: true,
});

const deptTree = ref<SystemDeptApi.SystemDept[]>([]);

const loadDeptTree = async () => {
  try {
    deptTree.value = await getDeptTree();
  } catch {
    message.error($t("ui.actionMessage.operationFailed"));
  }
};

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    schema: useGridFormSchema({ deptTree }),
    submitOnChange: false,
  },
  gridOptions: {
    columns: useColumns(onActionClick, onStatusChange, hasAccessByCodes),
    height: "auto",
    keepSource: true,
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          const result = await getUserList({
            page: page.currentPage,
            pageSize: page.pageSize,
            ...formValues,
          });
          return {
            items: result.list,
            total: result.total,
          };
        },
      },
    },
    rowConfig: {
      keyField: "id",
    },
    toolbarConfig: {
      custom: true,
      export: false,
      refresh: true,
      search: true,
      zoom: true,
    },
  } as VxeTableGridOptions<SystemUserApi.SystemUser>,
});

function onActionClick(e: OnActionClickParams<SystemUserApi.SystemUser>) {
  switch (e.code) {
    case "delete": {
      onDelete(e.row);
      break;
    }
    case "edit": {
      onEdit(e.row);
      break;
    }
    case "resetPassword": {
      onResetPassword(e.row);
      break;
    }
  }
}

const confirm = (content: string, title: string) =>
  new Promise((resolve, reject) => {
    Modal.confirm({
      content,
      onCancel() {
        reject(new Error("cancelled"));
      },
      onOk() {
        resolve(true);
      },
      title,
    });
  });

async function onStatusChange(newStatus: number, row: SystemUserApi.SystemUser) {
  const statusText =
    newStatus === 0 ? $t("system.user.statusEnabled") : $t("system.user.statusDisabled");
  try {
    await confirm(
      $t("system.user.switchStatusConfirm", [row.username, statusText]),
      $t("system.user.switchStatus"),
    );
    await updateUserStatus(row.id, newStatus as 0 | 1);
    return true;
  } catch (error) {
    if (error instanceof Error && error.message === "cancelled") {
      return false;
    }
    message.error($t("ui.actionMessage.operationFailed"));
    return false;
  }
}

function onEdit(row: SystemUserApi.SystemUser) {
  formDrawerApi.setData(row).open();
}

function onResetPassword(row: SystemUserApi.SystemUser) {
  resetPasswordDrawerApi.setData(row).open();
}

async function onDelete(row: SystemUserApi.SystemUser) {
  const hideLoading = message.loading({
    content: $t("ui.actionMessage.deleting", [row.username]),
    duration: 0,
    key: "action_process_msg",
  });

  try {
    await deleteUser(row.id);
    message.success({
      content: $t("ui.actionMessage.deleteSuccess", [row.username]),
      key: "action_process_msg",
    });
    onRefresh();
  } catch (error: any) {
    hideLoading();
    message.error({
      content: error?.response?.data?.message || $t("system.user.deleteFailed"),
      key: "action_process_msg",
    });
  }
}

function onRefresh() {
  gridApi.query();
}

function onCreate() {
  formDrawerApi.setData({}).open();
}

onMounted(() => {
  loadDeptTree();
});
</script>

<template>
  <Page auto-content-height>
    <FormDrawer @success="onRefresh" />
    <ResetPasswordDrawer @success="onRefresh" />

    <Grid :table-title="$t('system.user.list')">
      <template #toolbar-tools>
        <Button v-access:code="PERMISSION_CODES.create" type="primary" @click="onCreate">
          <Plus class="size-5" />
          {{ $t("ui.actionTitle.create", [$t("system.user.name")]) }}
        </Button>
      </template>
    </Grid>
  </Page>
</template>
