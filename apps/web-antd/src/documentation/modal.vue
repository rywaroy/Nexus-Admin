<script setup lang="ts">
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

const title = ref('提示');
const [Modal, modalApi] = useVbenModal<{ title: string }>({
  onOpenChange: (open) => {
    if (open) title.value = (modalApi.getData() as { title: string }).title;
  },
  onConfirm: () => modalApi.close(),
});

const open = () => modalApi.setData({ title: '操作确认' }).open();
</script>

<template>
  <button type="button" @click="open">打开弹窗</button>
  <Modal :title><p>确认后关闭。</p></Modal>
</template>
