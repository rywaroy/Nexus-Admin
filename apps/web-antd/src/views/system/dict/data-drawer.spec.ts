import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';

import { describe, expect, it } from 'vitest';

describe('system dict data drawer', () => {
  it('supports create, edit and delete actions for dict data', () => {
    const drawerView = readFileSync(
      join(
        process.cwd(),
        'apps/web-antd/src/views/system/dict/modules/data-drawer.vue',
      ),
      'utf8',
    );
    const dataFormView = readFileSync(
      join(
        process.cwd(),
        'apps/web-antd/src/views/system/dict/modules/data-form.vue',
      ),
      'utf8',
    );
    const apiFile = readFileSync(
      join(process.cwd(), 'apps/web-antd/src/api/system/dict.ts'),
      'utf8',
    );

    expect(drawerView).toContain('connectedComponent: DataForm');
    expect(drawerView).toContain('onCreate');
    expect(drawerView).toContain('onEdit');
    expect(drawerView).toContain('onDelete');
    expect(drawerView).toContain('@success="loadData"');

    expect(dataFormView).toContain('createDictData');
    expect(dataFormView).toContain('updateDictData');
    expect(dataFormView).toContain('formData.value?.id');

    expect(apiFile).toContain('export const getDictData =');
    expect(apiFile).toContain('export const createDictData =');
    expect(apiFile).toContain('export const updateDictData =');
    expect(apiFile).toContain('export const deleteDictData =');
  });

  it('supports quick status switching for dict data', () => {
    const drawerView = readFileSync(
      join(
        process.cwd(),
        'apps/web-antd/src/views/system/dict/modules/data-drawer.vue',
      ),
      'utf8',
    );

    expect(drawerView).toContain('Switch');
    expect(drawerView).toContain('function onStatusChange(');
    expect(drawerView).toContain(
      'await updateDictData(record.id, { status: newStatus as 0 | 1 })',
    );
    expect(drawerView).toContain('checked: record.status === 0');
  });
});
