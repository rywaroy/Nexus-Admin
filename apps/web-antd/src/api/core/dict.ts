import type { DictItem } from '@vben/stores';

import { requestClient } from '#/api/request';

const tagColors: Record<string, string> = {
  danger: 'error',
  default: 'default',
  info: 'default',
  primary: 'processing',
  success: 'success',
  warning: 'warning',
};

const toOptions = (items: DictItem[]): DictItem[] =>
  items.map((item) => ({
    ...item,
    color: item.color ? (tagColors[item.color] ?? item.color) : undefined,
  }));

export const getDictOptions = async (code: string) =>
  toOptions(
    await requestClient.get<DictItem[]>(
      `/system/dict/options/data/${encodeURIComponent(code)}`,
    ),
  );

export const getAllDictOptions = async () => {
  const dictionaries = await requestClient.get<Record<string, DictItem[]>>(
    '/system/dict/options',
  );
  return Object.fromEntries(
    Object.entries(dictionaries).map(([code, items]) => [
      code,
      toOptions(items),
    ]),
  );
};

export const getDictVersion = () =>
  requestClient.get<string>('/system/dict/options/version');
