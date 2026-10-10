<script setup lang="ts">
import type { Editor } from '@tiptap/core';

import type {
  TipTapProps,
  ToolbarAction,
  ToolbarMenuItem,
  VbenTiptapChangeEvent,
} from './types';

import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue';

import { Check, ChevronDown, Eye } from '@vben/icons';
import { $t } from '@vben/locales';

import { useVbenModal } from '@vben-core/popup-ui';
import { VbenIconButton, VbenPopover } from '@vben-core/shadcn-ui';
import { cn } from '@vben-core/shared/utils';

import { NodeSelection } from '@tiptap/pm/state';
import { EditorContent, useEditor } from '@tiptap/vue-3';

import { createDefaultTiptapExtensions } from './extensions';
import Preview from './preview.vue';
import { createToolbarGroups } from './toolbar';
import { useTiptapToolbar } from './use-tiptap-toolbar';

import './style.css';
const props = withDefaults(defineProps<TipTapProps>(), {
  editable: true,
  extensions: undefined,
  imageUpload: undefined,
  videoUpload: undefined,
  minHeight: 240,
  maxHeight: 400,
  placeholder: $t('ui.tiptap.placeholder'),
  previewable: true,
  toolbar: true,
});
const emit = defineEmits<{
  change: [payload: VbenTiptapChangeEvent];
}>();
const modelValue = defineModel<string>({ default: '' });
const contentMinHeight = computed(() =>
  typeof props.minHeight === 'number'
    ? `${props.minHeight}px`
    : props.minHeight,
);
const contentMaxHeight = computed(() =>
  typeof props.maxHeight === 'number'
    ? `${props.maxHeight}px`
    : props.maxHeight,
);
const tiptapContentClass = cn(
  'vben-tiptap-content vben-tiptap__content',
  'text-foreground max-h-(--vben-tiptap-max-height) min-h-(--vben-tiptap-min-height) overflow-auto leading-7 outline-none',
);
const selectedMedia = ref<'image' | 'video'>();
const mediaSize = reactive({ width: 0, height: 0 });
const syncMediaSelection = (currentEditor: Editor) => {
  const { selection } = currentEditor.state;
  const type =
    selection instanceof NodeSelection ? selection.node.type.name : undefined;
  selectedMedia.value = type === 'image' || type === 'video' ? type : undefined;
  if (selectedMedia.value) {
    const attributes = currentEditor.getAttributes(selectedMedia.value);
    const dom = currentEditor.view.nodeDOM(selection.from) as HTMLElement;
    const media = (
      dom.matches('img, video') ? dom : dom.querySelector('img, video')
    ) as HTMLImageElement | HTMLVideoElement;
    mediaSize.width = Number(attributes.width ?? media.clientWidth);
    mediaSize.height = Number(attributes.height ?? media.clientHeight);
  }
};

const editor = useEditor({
  content: modelValue.value,
  editable: props.editable,
  editorProps: {
    attributes: {
      class: tiptapContentClass,
    },
  },
  extensions:
    props.extensions ??
    createDefaultTiptapExtensions({
      videoUpload: props.videoUpload,
      imageUpload: props.imageUpload,
      placeholder: props.placeholder,
    }),
  onTransaction: ({ editor }) => syncMediaSelection(editor),
  onUpdate: ({ editor }) => {
    const html = editor.getHTML();
    if (html !== modelValue.value) {
      modelValue.value = html;
    }
    emit('change', {
      html,
      json: editor.getJSON(),
      text: editor.getText(),
    });
  },
});
const toolbarGroups = computed<ToolbarAction[][]>(() => {
  // Only show upload toolbar option when using default extensions
  // (custom extensions may not include the uploadImage command)
  const effectiveImageUpload = props.extensions ? undefined : props.imageUpload;
  const effectiveVideoUpload = props.extensions ? undefined : props.videoUpload;
  return createToolbarGroups(effectiveImageUpload, effectiveVideoUpload);
});
const previewContent = computed(
  () => editor.value?.getHTML() ?? modelValue.value,
);
const [PreviewModal, previewModalApi] = useVbenModal({
  footer: false,
  fullscreenButton: false,
});
const {
  applyPaletteColor,
  canRunAction,
  canRunMenuItem,
  clearPaletteColor,
  getActionIndicatorColor,
  getMenuItemClass,
  getPaletteCurrentColor,
  getPaletteSwatchClass,
  getToolbarButtonClass,
  isMenuItemActive,
  runAction,
  runMenuItem,
} = useTiptapToolbar({
  editable: () => props.editable,
  editor,
});

const menuOpenState = reactive<Record<string, boolean>>({});

function getMenuOpen(action: ToolbarAction): boolean {
  return menuOpenState[action.label] ?? false;
}

function setMenuOpen(action: ToolbarAction, open: boolean) {
  menuOpenState[action.label] = open;
}

function handleMenuItemClick(action: ToolbarAction, item: ToolbarMenuItem) {
  runMenuItem(item);
  setMenuOpen(action, false);
}

function openPreviewModal() {
  previewModalApi.open();
}
watch(
  () => props.editable,
  (editable) => {
    editor.value?.setEditable(editable);
  },
);
watch(
  () => modelValue.value,
  (nextValue = '') => {
    if (!editor.value) {
      return;
    }
    const currentValue = editor.value.getHTML();
    if (nextValue === currentValue) {
      return;
    }
    editor.value.commands.setContent(nextValue, {
      emitUpdate: false,
    });
  },
);
const canApplySize = computed(
  () => mediaSize.width >= 50 && mediaSize.height >= 50,
);
const applyMediaSize = () => {
  if (editor.value && selectedMedia.value) {
    editor.value
      .chain()
      .focus()
      .updateAttributes(selectedMedia.value, { ...mediaSize })
      .run();
  }
};

onBeforeUnmount(() => editor.value?.destroy());
</script>

<template>
  <div
    :style="{
      '--vben-tiptap-min-height': contentMinHeight,
      '--vben-tiptap-max-height': contentMaxHeight,
    }"
    class="vben-tiptap overflow-hidden rounded-xl border border-border bg-card"
  >
    <div
      v-if="toolbar"
      class="sticky top-0 z-10 flex flex-wrap items-center gap-2 border-b border-border p-2 backdrop-blur-[14px]"
    >
      <div
        v-for="(group, groupIndex) in toolbarGroups"
        :key="groupIndex"
        class="flex items-center gap-1"
      >
        <template v-for="action in group" :key="action.label">
          <VbenPopover
            v-if="action.menu || action.palette"
            :open="action.menu ? getMenuOpen(action) : undefined"
            :content-props="{ align: 'start', side: 'bottom', sideOffset: 8 }"
            content-class="w-auto p-2"
            @update:open="action.menu ? setMenuOpen(action, $event) : undefined"
          >
            <template #trigger>
              <VbenIconButton
                :aria-label="action.label"
                :class="getToolbarButtonClass(action)"
                :disabled="!canRunAction(action)"
                :tooltip="action.label"
                tooltip-side="top"
                variant="ghost"
              >
                <template v-if="action.triggerText">
                  <span class="text-xs font-semibold tracking-wide">
                    {{
                      typeof action.triggerText === 'function'
                        ? action.triggerText(editor)
                        : action.triggerText
                    }}
                  </span>
                  <ChevronDown class="size-4 opacity-70" />
                </template>
                <component
                  v-else-if="action.icon"
                  :is="action.icon"
                  class="size-4"
                />
                <span
                  v-if="getActionIndicatorColor(action)"
                  :style="{ backgroundColor: getActionIndicatorColor(action) }"
                  class="absolute bottom-1 left-1/2 h-1 w-4 -translate-x-1/2 rounded-full shadow-[0_0_0_1px_hsl(var(--card)/0.7)]"
                ></span>
              </VbenIconButton>
            </template>
            <div
              v-if="action.palette"
              class="flex max-w-52 flex-wrap items-center gap-2"
            >
              <button
                v-for="color in action.palette.colors"
                :key="color"
                :aria-label="`${action.label}-${color}`"
                :class="getPaletteSwatchClass(action, color)"
                :style="{ backgroundColor: color }"
                type="button"
                @click="applyPaletteColor(action, color)"
              >
                <Check
                  v-if="getPaletteCurrentColor(action) === color"
                  class="size-4 text-white drop-shadow-sm"
                />
              </button>
              <button
                v-if="action.palette.clear"
                class="h-8 w-full rounded-xl border border-border bg-secondary text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                type="button"
                @click="clearPaletteColor(action)"
              >
                {{ $t('ui.tiptap.toolbar.clear') }}
              </button>
            </div>
            <div v-else-if="action.menu" class="flex min-w-32 flex-col gap-1">
              <button
                v-for="item in action.menu.items"
                :key="item.shortLabel"
                :class="getMenuItemClass(item)"
                :disabled="!canRunMenuItem(item)"
                type="button"
                @click="handleMenuItemClick(action, item)"
              >
                <span class="w-7 text-xs font-semibold tracking-wide">
                  {{ item.shortLabel }}
                </span>
                <span class="flex-1">{{ item.label }}</span>
                <Check
                  v-if="isMenuItemActive(item)"
                  class="size-4 text-primary"
                />
              </button>
            </div>
          </VbenPopover>
          <VbenIconButton
            v-else
            :aria-label="action.label"
            :class="getToolbarButtonClass(action)"
            :disabled="!canRunAction(action)"
            :tooltip="action.label"
            tooltip-side="top"
            @click="runAction(action)"
          >
            <component :is="action.icon" class="size-4" />
            <span
              v-if="getActionIndicatorColor(action)"
              :style="{ backgroundColor: getActionIndicatorColor(action) }"
              class="absolute bottom-1 left-1/2 h-1 w-4 -translate-x-1/2 rounded-full shadow-[0_0_0_1px_hsl(var(--card)/0.7)]"
            ></span>
          </VbenIconButton>
        </template>
        <div
          v-if="groupIndex < toolbarGroups.length - 1"
          class="ml-1 h-5 w-px bg-border"
        ></div>
      </div>
      <div v-if="previewable" class="ml-auto flex items-center">
        <VbenIconButton
          :aria-label="$t('ui.tiptap.toolbar.preview')"
          :class="
            getToolbarButtonClass({
              action: () => {},
              label: $t('ui.tiptap.toolbar.preview'),
            })
          "
          :tooltip="$t('ui.tiptap.toolbar.preview')"
          tooltip-side="top"
          variant="ghost"
          @click="openPreviewModal"
        >
          <Eye class="size-4" />
        </VbenIconButton>
      </div>
    </div>
    <div
      v-if="toolbar && editable && selectedMedia"
      class="flex flex-wrap items-center gap-3 border-b border-border px-4 py-2 text-sm"
      @keydown.enter.prevent="canApplySize && applyMediaSize()"
    >
      <label class="flex items-center gap-2">
        {{ $t('ui.tiptap.media.width') }}
        <input
          v-model.number="mediaSize.width"
          type="number"
          min="50"
          required
          class="w-24 rounded border border-border bg-background px-2 py-1"
        />
      </label>
      <label class="flex items-center gap-2">
        {{ $t('ui.tiptap.media.height') }}
        <input
          v-model.number="mediaSize.height"
          type="number"
          min="50"
          required
          class="w-24 rounded border border-border bg-background px-2 py-1"
        />
      </label>
      <button
        type="button"
        :disabled="!canApplySize"
        class="rounded border border-border px-3 py-1 hover:bg-accent disabled:opacity-50"
        @click="applyMediaSize"
      >
        {{ $t('ui.tiptap.media.apply') }}
      </button>
    </div>
    <EditorContent v-if="editor" :editor="editor" class="p-4" />
    <PreviewModal
      v-if="previewable"
      :title="$t('ui.tiptap.toolbar.preview')"
      class="w-4/5"
    >
      <Preview :content="previewContent" :min-height="320" />
    </PreviewModal>
  </div>
</template>

<style scoped>
.vben-tiptap
  :deep(.vben-tiptap__content p.is-editor-empty:first-child::before) {
  float: left;
  height: 0;
  color: hsl(var(--input-placeholder));
  pointer-events: none;
  content: attr(data-placeholder);
}
</style>
