import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';

import { describe, expect, it } from 'vitest';

describe('system dict list toolbar', () => {
  it('renders create entry and mounts form drawer', () => {
    const listView = readFileSync(
      join(process.cwd(), 'apps/web-antd/src/views/system/dict/list.vue'),
      'utf8',
    );

    expect(listView).toContain('<template #toolbar-tools>');
    expect(listView).toContain('v-access:code="PERMISSION_CODES.create"');
    expect(listView).toContain('<FormDrawer @success="onRefresh" />');
    expect(listView).toContain('@click="onCreate"');
  });

  it('supports edit and delete actions for dict types', () => {
    const listView = readFileSync(
      join(process.cwd(), 'apps/web-antd/src/views/system/dict/list.vue'),
      'utf8',
    );
    const dataFile = readFileSync(
      join(process.cwd(), 'apps/web-antd/src/views/system/dict/data.ts'),
      'utf8',
    );
    const formView = readFileSync(
      join(
        process.cwd(),
        'apps/web-antd/src/views/system/dict/modules/form.vue',
      ),
      'utf8',
    );
    const apiFile = readFileSync(
      join(process.cwd(), 'apps/web-antd/src/api/system/dict.ts'),
      'utf8',
    );

    expect(dataFile).toContain("code: 'edit'");
    expect(dataFile).toContain("code: 'delete'");
    expect(listView).toContain("case 'edit'");
    expect(listView).toContain("case 'delete'");
    expect(formView).toContain('updateDictType');
    expect(formView).toContain('formData.value?.id');
    expect(apiFile).toContain('export const updateDictType');
    expect(apiFile).toContain('export const deleteDictType');
  });

  it('supports quick status switching for dict types', () => {
    const listView = readFileSync(
      join(process.cwd(), 'apps/web-antd/src/views/system/dict/list.vue'),
      'utf8',
    );
    const dataFile = readFileSync(
      join(process.cwd(), 'apps/web-antd/src/views/system/dict/data.ts'),
      'utf8',
    );

    expect(dataFile).toContain(
      "name: onStatusChange ? 'CellSwitch' : 'CellTag'",
    );
    expect(dataFile).toContain('attrs: { beforeChange: onStatusChange }');
    expect(listView).toContain('function onStatusChange(');
    expect(listView).toContain(
      'await updateDictType(row.id, { status: newStatus as 0 | 1 })',
    );
  });
});
