<script lang="ts" setup>
import { Fallback } from '@vben/common-ui';

import { Button } from 'ant-design-vue';

import { $t } from '#/locales';
import { useAuthStore } from '#/store';

const authStore = useAuthStore();
</script>

<template>
  <Fallback
    status="403"
    :title="$t('page.noAccess.title')"
    :description="$t('page.noAccess.description')"
  >
    <template #action>
      <Button type="primary" @click="authStore.logout(false)">
        {{ $t('common.logout') }}
      </Button>
    </template>
  </Fallback>
</template>
