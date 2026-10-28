import { setDictHandler, useDictStore } from '@vben/stores';

import { createPinia, setActivePinia } from 'pinia';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  createDictData,
  createDictType,
  deleteDictData,
  deleteDictType,
  refreshDictCache,
  updateDictData,
  updateDictType,
} from './api/system/dict';
import { initDict } from './dict-init';

const request = vi.hoisted(() => ({
  delete: vi.fn(),
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
}));

vi.mock('#/api/request', () => ({ requestClient: request }));

describe('nexus dictionary integration', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    setActivePinia(createPinia());
    initDict();
  });

  afterEach(() => {
    useDictStore().$reset();
    setDictHandler({});
  });

  it('preloads enabled business options, maps tag colors and reuses the versioned cache', async () => {
    request.get.mockImplementation(async (url: string) =>
      url.endsWith('/version')
        ? 'v1'
        : {
            project_status: [
              { label: '进行中', value: '01', color: 'primary' },
            ],
          },
    );
    const store = useDictStore();
    await store.loadAllDicts();
    await store.loadAllDicts();
    expect(store.getDictSync('project_status')).toEqual([
      { label: '进行中', value: '01', color: 'processing' },
    ]);
    expect(request.get.mock.calls.map(([url]) => url)).toEqual([
      '/system/dict/options/version',
      '/system/dict/options',
      '/system/dict/options/version',
    ]);
  });

  it('loads a code on demand and reuses it for labels', async () => {
    request.get.mockResolvedValue([
      { label: '完成', value: '2', color: 'success' },
    ]);
    const store = useDictStore();
    await Promise.all([
      store.getDict('project_status'),
      store.getDict('project_status'),
    ]);
    expect(request.get).toHaveBeenCalledExactlyOnceWith(
      '/system/dict/options/data/project_status',
    );
    expect(store.getDictLabel('project_status', 2)).toBe('完成');
  });

  it.each([
    [
      'create type',
      () =>
        createDictType({ dictName: '项目状态', dictType: 'project_status' }),
    ],
    [
      'rename type',
      () => updateDictType('type-1', { dictType: 'renamed_status' }),
    ],
    ['delete type', () => deleteDictType('type-1')],
    [
      'create data',
      () =>
        createDictData({ typeId: 'type-1', dictLabel: '完成', dictValue: '2' }),
    ],
    ['update data', () => updateDictData('data-1', { status: 1 })],
    ['delete data', () => deleteDictData('data-1')],
    ['refresh cache', () => refreshDictCache()],
  ])('invalidates cached business options after %s', async (_name, mutate) => {
    const store = useDictStore();
    store.dictMap = { project_status: [{ label: '进行中', value: '1' }] };
    store.version = 'v1';
    await mutate();
    expect(store.dictMap).toEqual({});
    expect(store.version).toBeUndefined();
  });

  it('retains cached options when a management write fails', async () => {
    const store = useDictStore();
    store.dictMap = { project_status: [{ label: '进行中', value: '1' }] };
    request.put.mockRejectedValue(new Error('request failed'));
    await expect(updateDictData('data-1', { status: 1 })).rejects.toThrow(
      'request failed',
    );
    expect(store.getDictLabel('project_status', '1')).toBe('进行中');
  });
});
