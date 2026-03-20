<script lang="ts" setup>
import type { TreeProps } from "ant-design-vue/es/tree";

import type { OnActionClickParams, VxeTableGridOptions } from "#/adapter/vxe-table";
import type { SystemDeptApi } from "#/api/system/dept";
import type { SystemUserApi } from "#/api/system/user";

import { computed, onMounted, ref } from "vue";

import { useAccess } from "@vben/access";
import { Page, useVbenDrawer } from "@vben/common-ui";
import { Plus } from "@vben/icons";

import { Button, Card, message, Modal, Spin, Tree } from "ant-design-vue";

import { useVbenVxeGrid } from "#/adapter/vxe-table";
import { getDeptTree } from "#/api/system/dept";
import { deleteUser, getUserList, updateUserStatus } from "#/api/system/user";
import { $t } from "#/locales";

import { PERMISSION_CODES, useColumns, useGridFormSchema } from "./data";
import Form from "./modules/form.vue";
import ResetPasswordForm from "./modules/reset-password.vue";

const { hasAccessByCodes } = useAccess();
type TreeKey = number | string;

const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: Form,
  destroyOnClose: true,
});

const [ResetPasswordDrawer, resetPasswordDrawerApi] = useVbenDrawer({
  connectedComponent: ResetPasswordForm,
  destroyOnClose: true,
});

// 部门树相关
const deptTree = ref<SystemDeptApi.SystemDept[]>([]);
const loadingDept = ref(false);
const selectedDeptId = ref<string>();
const expandedKeys = ref<TreeKey[]>([]);
const deptTreeData = computed<TreeProps["treeData"]>(
  () => deptTree.value as unknown as TreeProps["treeData"],
);

// 加载部门树
const loadDeptTree = async () => {
  loadingDept.value = true;
  try {
    const res = await getDeptTree();
    deptTree.value = res;
    // 默认展开所有节点
    expandedKeys.value = getAllDeptIds(res);
  } catch {
    message.error($t("ui.actionMessage.operationFailed"));
  } finally {
    loadingDept.value = false;
  }
};

// 获取所有部门 ID（用于默认展开）
const getAllDeptIds = (list: SystemDeptApi.SystemDept[]): string[] => {
  const ids: string[] = [];
  const traverse = (items: SystemDeptApi.SystemDept[]) => {
    for (const item of items) {
      ids.push(item.id);
      if (item.children?.length) {
        traverse(item.children);
      }
    }
  };
  traverse(list);
  return ids;
};

// 部门树选中处理
const onDeptSelect = (selectedKeys: TreeKey[]) => {
  selectedDeptId.value = selectedKeys[0] as string | undefined;
  gridApi.query();
};

// 清除部门筛选
const onClearDeptFilter = () => {
  selectedDeptId.value = undefined;
  gridApi.query();
};

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    schema: useGridFormSchema(),
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
            deptId: selectedDeptId.value,
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

/**
 * 将 Modal.confirm 封装为 Promise
 */
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

/**
 * 状态切换处理
 */
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

/**
 * 删除用户
 */
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

    <div class="flex h-full gap-4">
      <!-- 左侧部门树 -->
      <Card class="w-64 shrink-0 overflow-auto" :body-style="{ padding: '12px' }">
        <template #title>
          <div class="flex items-center justify-between">
            <span>{{ $t("system.user.deptTree") }}</span>
            <Button v-if="selectedDeptId" type="link" size="small" @click="onClearDeptFilter">
              {{ $t("common.clear") }}
            </Button>
          </div>
        </template>
        <Spin :spinning="loadingDept">
          <Tree
            v-if="deptTree.length > 0"
            v-model:expanded-keys="expandedKeys"
            :tree-data="deptTreeData"
            :field-names="{ title: 'name', key: 'id', children: 'children' }"
            :selected-keys="selectedDeptId ? [selectedDeptId] : []"
            block-node
            @select="onDeptSelect"
          />
          <div v-else class="py-4 text-center text-gray-400">
            {{ $t("common.noData") }}
          </div>
        </Spin>
      </Card>

      <!-- 右侧用户列表 -->
      <div class="flex-1 overflow-hidden">
        <Grid :table-title="$t('system.user.list')">
          <template #toolbar-tools>
            <Button v-access:code="PERMISSION_CODES.create" type="primary" @click="onCreate">
              <Plus class="size-5" />
              {{ $t("ui.actionTitle.create", [$t("system.user.name")]) }}
            </Button>
          </template>
        </Grid>
      </div>
    </div>
  </Page>
</template>
