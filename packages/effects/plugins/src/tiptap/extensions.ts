import type { Extensions } from '@tiptap/vue-3';

import type { VbenTiptapExtensionOptions } from './types';

import { $t } from '@vben/locales';

import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import { Color, TextStyle } from '@tiptap/extension-text-style';
import StarterKit from '@tiptap/starter-kit';

import { ResizableImage, Video } from './media';
import { createMediaUpload } from './media-upload';

export function createDefaultTiptapExtensions(
  options: VbenTiptapExtensionOptions = {},
): Extensions {
  return [
    StarterKit.configure({
      heading: {
        levels: [1, 2, 3, 4],
      },
      link: false,
    }),
    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),
    TextStyle,
    Color.configure({
      types: ['textStyle'],
    }),
    Highlight.configure({
      multicolor: true,
    }),
    Link.configure({
      autolink: true,
      defaultProtocol: 'https',
      enableClickSelection: true,
      openOnClick: false,
      protocols: ['mailto', { optionalSlashes: true, scheme: 'tel' }],
    }),
    ResizableImage,
    Video,
    createMediaUpload(options),
    Placeholder.configure({
      placeholder: options.placeholder ?? $t('ui.tiptap.placeholder'),
    }),
  ];
}
