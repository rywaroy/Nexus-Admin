import type { VNode } from 'vue';

import { DOMWrapper, flushPromises, mount } from '@vue/test-utils';
import { h } from 'vue';

import { useDictStore } from '@vben/stores';

import { Dropdown, Popconfirm } from 'ant-design-vue';
import { createPinia, setActivePinia } from 'pinia';
import {
  afterEach,
  assert,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import './vxe-table';

const renderers = vi.hoisted(
  () =>
    new Map<
      string,
      {
        renderTableDefault: (options: object, params: object) => string | VNode;
      }
    >(),
);

vi.mock('@vben/plugins/vxe-table', () => ({
  setupVbenVxeTable: ({
    configVxeTable,
  }: {
    configVxeTable: (ui: object) => void;
  }) =>
    configVxeTable({
      setConfig: vi.fn(),
      renderer: {
        forEach: vi.fn(),
        delete: vi.fn(),
        add: (name: string, value: never) => renderers.set(name, value),
      },
    }),
  useVbenVxeGrid: vi.fn(),
}));
vi.mock('./form', () => ({ useVbenForm: vi.fn() }));
vi.mock('#/locales', () => ({ $t: (key: string) => key }));
vi.mock('@vben/locales', () => ({ $te: () => false }));
vi.mock('@vben/icons', () => ({ IconifyIcon: { render: () => h('span') } }));

describe('nexus table renderers', () => {
  const wrappers: ReturnType<typeof mount>[] = [];
  const row = { id: 'user-1', username: 'alice', status: '01' };

  beforeEach(() => {
    setActivePinia(createPinia());
  });
  afterEach(() => {
    wrappers.splice(0).forEach((wrapper) => wrapper.unmount());
    document.body.innerHTML = '';
  });

  const mountOperations = (
    props = {},
    options = ['edit', 'delete'] as unknown[],
    onClick = vi.fn(),
  ) => {
    const renderer = renderers.get('CellOperation');
    assert.isDefined(renderer);
    const wrapper = mount(
      {
        render: () =>
          renderer.renderTableDefault(
            { props, options, attrs: { onClick, nameField: 'username' } },
            { column: { align: 'center' }, row },
          ),
      },
      { attachTo: document.body },
    );
    wrappers.push(wrapper);
    return { wrapper, onClick };
  };

  it('keeps default buttons and requires delete confirmation', async () => {
    const { wrapper, onClick } = mountOperations();
    expect(wrapper.findComponent(Dropdown).exists()).toBe(false);
    await wrapper.get('button').trigger('click');
    expect(onClick).toHaveBeenCalledExactlyOnceWith({ code: 'edit', row });
    onClick.mockClear();
    const confirm = wrapper.findComponent(Popconfirm);
    await confirm.find('button').trigger('click');
    expect(onClick).not.toHaveBeenCalled();
    confirm.vm.$emit('confirm');
    expect(onClick).toHaveBeenCalledExactlyOnceWith({ code: 'delete', row });
  });

  it('moves selected actions into the Ant Design overlay and preserves permission visibility', async () => {
    const { wrapper, onClick } = mountOperations(
      { renderMode: 'menu', menuCodes: ['resetPassword', 'delete'] },
      [
        'edit',
        { code: 'resetPassword', text: 'Reset password' },
        { code: 'delete', show: () => false },
      ],
    );
    expect(wrapper.text()).toContain('common.edit');
    expect(wrapper.text()).not.toContain('Reset password');
    await wrapper.findComponent(Dropdown).get('button').trigger('click');
    await flushPromises();
    await vi.waitFor(() => {
      expect(document.body.textContent).toContain('Reset password');
    });
    expect(document.body.textContent).not.toContain('common.delete');
    await new DOMWrapper(document.body)
      .get('.ant-dropdown button')
      .trigger('click');
    expect(onClick).toHaveBeenCalledExactlyOnceWith({
      code: 'resetPassword',
      row,
    });
  });

  it('omits the menu when all grouped actions are hidden', () => {
    const { wrapper } = mountOperations(
      { renderMode: 'menu', menuCodes: ['resetPassword'] },
      ['edit', { code: 'resetPassword', show: () => false }],
    );
    expect(wrapper.findComponent(Dropdown).exists()).toBe(false);
    expect(wrapper.text()).toBe('common.edit');
  });

  it('renders cached dictionary labels and tag colors', () => {
    useDictStore().dictMap = {
      project_status: [{ label: '进行中', value: '01', color: 'processing' }],
    };
    const renderer = renderers.get('CellDict');
    assert.isDefined(renderer);
    const wrapper = mount({
      render: () =>
        renderer.renderTableDefault(
          { props: { code: 'project_status' } },
          { column: { field: 'status' }, row },
        ),
    });
    wrappers.push(wrapper);
    expect(wrapper.text()).toBe('进行中');
    expect(wrapper.classes()).toContain('ant-tag-processing');
  });
});
