import type { RouteRecordRaw } from 'vue-router';

import type { RouteRecordStringComponent, UserInfo } from '@vben/types';

import { h } from 'vue';
import { createMemoryHistory, createRouter } from 'vue-router';

import { generateAccessible } from '@vben/access';
import { LOGIN_PATH } from '@vben/constants';
import { useAccessStore, useUserStore } from '@vben/stores';
import { mapTree, traverseTreeValues } from '@vben/utils';

import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createRouterGuard } from '../guard';
import { coreRoutes, fallbackNotFoundRoute } from '../routes/core';

const mocks = vi.hoisted(() => ({
  fetchUserInfo: vi.fn(),
  getAccessCodes: vi.fn().mockResolvedValue([]),
  menuRoutes: [] as RouteRecordStringComponent[],
}));

const Page = { render: () => h('div') };
const Forbidden = { render: () => h('div', '403') };

vi.mock('@vben/preferences', () => ({
  preferences: {
    app: { defaultHomePath: '/dashboard' },
    transition: { progress: false },
  },
}));

vi.mock('#/api', () => ({ getAccessCodesApi: mocks.getAccessCodes }));
vi.mock('#/locales', () => ({ $t: (key: string) => key }));
vi.mock('#/store', () => ({
  useAuthStore: () => ({ fetchUserInfo: mocks.fetchUserInfo }),
}));

vi.mock('#/router/routes', async () => {
  const { coreRoutes: routes } = await import('../routes/core');
  const { traverseTreeValues: traverse } = await import('@vben/utils');
  return {
    accessRoutes: [],
    coreRouteNames: traverse(routes, (route) => route.name),
  };
});

vi.mock('../access', () => ({
  generateAccess: (options: Parameters<typeof generateAccessible>[1]) =>
    generateAccessible('backend', {
      ...options,
      fetchMenuListAsync: async () => mocks.menuRoutes,
      forbiddenComponent: Forbidden,
      pageMap: { '../views/test/page.vue': async () => ({ default: Page }) },
    }),
}));

function page(
  name: string,
  path: string,
  meta: Partial<NonNullable<RouteRecordStringComponent['meta']>> = {},
): RouteRecordStringComponent {
  return { component: 'test/page', meta: { title: name, ...meta }, name, path };
}

function catalog(
  name: string,
  path: string,
  children: RouteRecordStringComponent[],
  meta: Partial<NonNullable<RouteRecordStringComponent['meta']>> = {},
): RouteRecordStringComponent {
  return {
    children,
    component: '',
    meta: { title: name, ...meta },
    name,
    path,
  };
}

function createTestRouter() {
  const routes = mapTree<RouteRecordRaw, RouteRecordRaw>(
    [...coreRoutes, fallbackNotFoundRoute],
    (route) => ({
      children: route.children ?? [],
      component: Page,
      meta: route.meta,
      name: route.name,
      path: route.path,
      redirect: route.redirect,
    }),
  );
  const router = createRouter({ history: createMemoryHistory(), routes });
  createRouterGuard(router);
  return router;
}

async function login(redirect?: string) {
  const router = createTestRouter();
  await router.push({
    path: LOGIN_PATH,
    query: redirect ? { redirect: encodeURIComponent(redirect) } : {},
  });
  useAccessStore().setAccessToken('test-token');
  await router.push('/');
  return router;
}

describe('login landing page', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    mocks.menuRoutes = [];
    useUserStore().setUserInfo({
      homePath: '/removed-home',
      roles: ['user'],
    } as UserInfo);
  });

  it('enters the first user page when the fixed dashboard is unavailable', async () => {
    mocks.menuRoutes = [page('Users', '/users')];
    const router = await login();
    expect(router.currentRoute.value.name).toBe('Users');
    expect(useAccessStore().isAccessChecked).toBe(true);
  });

  it('uses displayed menu order and skips hidden pages, external links, empty catalogs and parameterized details', async () => {
    mocks.menuRoutes = [
      page('Later', '/later', { order: 20 }),
      catalog(
        'First',
        '/first',
        [
          page('Hidden', 'hidden', { hideInMenu: true, order: 0 }),
          page('Detail', ':id', { order: 1 }),
          page('External', 'external', {
            link: 'https://example.com',
            order: 2,
          }),
          catalog('Empty', 'empty', [], { order: 3 }),
          page('List', 'list', { order: 4, query: { status: 'pending' } }),
        ],
        { order: 1 },
      ),
    ];
    const router = await login();
    expect(router.currentRoute.value.name).toBe('List');
    expect(router.currentRoute.value.path).toBe('/first/list');
    expect(router.currentRoute.value.query).toEqual({ status: 'pending' });
  });

  it('does not follow a catalog redirect to a hidden page when its visible pages are unavailable', async () => {
    const first = catalog(
      'First',
      '/first',
      [
        page('Hidden', 'hidden', { hideInMenu: true }),
        page('Forbidden', 'forbidden', { menuVisibleWithForbidden: true }),
      ],
      { order: 1 },
    );
    first.redirect = '/first/hidden';
    mocks.menuRoutes = [first, page('Allowed', '/allowed', { order: 2 })];
    const router = await login();
    expect(router.currentRoute.value.name).toBe('Allowed');
  });

  it('skips a catalog whose children are all hidden', async () => {
    const first = catalog(
      'First',
      '/first',
      [page('Hidden', 'hidden', { hideInMenu: true })],
      { order: 1 },
    );
    first.redirect = '/first/hidden';
    mocks.menuRoutes = [first, page('Allowed', '/allowed', { order: 2 })];
    const router = await login();
    expect(router.currentRoute.value.name).toBe('Allowed');
  });

  it('restores an allowed detail page with its query and hash', async () => {
    mocks.menuRoutes = [
      page('First', '/first'),
      catalog('Users', '/users', [
        page('UserDetail', ':id', { hideInMenu: true }),
      ]),
    ];
    const router = await login('/users/42?tab=roles#permissions');
    expect(router.currentRoute.value.name).toBe('UserDetail');
    expect(router.currentRoute.value.fullPath).toBe(
      '/users/42?tab=roles#permissions',
    );
  });

  it('restores the core change-password page independently of menu permissions', async () => {
    mocks.menuRoutes = [page('First', '/first')];
    const router = await login('/auth/change-password');
    expect(router.currentRoute.value.name).toBe('ChangePassword');
  });

  it.each(['/deleted', '/auth/login', 'https://example.com'])(
    'uses the first page when the login return address is %s',
    async (redirect) => {
      mocks.menuRoutes = [page('First', '/first')];
      const router = await login(redirect);
      expect(router.currentRoute.value.name).toBe('First');
    },
  );

  it('skips menus that display a forbidden page', async () => {
    mocks.menuRoutes = [
      page('Forbidden', '/forbidden', {
        menuVisibleWithForbidden: true,
        order: 1,
      }),
      page('Allowed', '/allowed', { order: 2 }),
    ];
    const router = await login('/forbidden');
    expect(router.currentRoute.value.name).toBe('Allowed');
  });

  it('resolves a collapsed catalog redirect before selecting its page', async () => {
    const menu = catalog(
      'Collapsed',
      '/collapsed',
      [page('CollapsedPage', 'page')],
      { hideChildrenInMenu: true },
    );
    menu.redirect = '/collapsed/page';
    mocks.menuRoutes = [menu];
    const router = await login();
    expect(router.currentRoute.value.name).toBe('CollapsedPage');
  });

  it('resolves named redirects and preserves the login return query', async () => {
    const first = catalog('First', '/first', [page('List', 'list')]);
    first.redirect = { name: 'List' };
    mocks.menuRoutes = [first];
    const router = await login('/first?status=active#results');
    expect(router.currentRoute.value.fullPath).toBe(
      '/first/list?status=active#results',
    );
  });

  it('selects a collapsed menu whose path is a named redirect', async () => {
    const first = catalog('Collapsed', '/collapsed', [page('List', 'list')], {
      hideChildrenInMenu: true,
      query: { status: 'active' },
    });
    first.redirect = { name: 'List' };
    mocks.menuRoutes = [first];
    const router = await login();
    expect(router.currentRoute.value.fullPath).toBe(
      '/collapsed/list?status=active',
    );
  });

  it('does not select a redirect with an unfilled route parameter', async () => {
    const first = catalog('Collapsed', '/collapsed', [page('Detail', ':id')], {
      hideChildrenInMenu: true,
      order: 1,
    });
    first.redirect = '/collapsed/:id';
    mocks.menuRoutes = [first, page('Allowed', '/allowed', { order: 2 })];
    const router = await login();
    expect(router.currentRoute.value.name).toBe('Allowed');
  });

  it('shows the no-access page when there are no accessible menus', async () => {
    const router = await login();
    expect(router.currentRoute.value.name).toBe('NoAccess');
    expect(router.currentRoute.value.path).toBe('/403');
  });

  it('uses the same landing page for returning home and revisiting login', async () => {
    mocks.menuRoutes = [page('First', '/first'), page('Second', '/second')];
    const router = await login();
    await router.push('/second');
    await router.push('/');
    expect(router.currentRoute.value.name).toBe('First');
    await router.push('/second');
    await router.push(LOGIN_PATH);
    expect(router.currentRoute.value.name).toBe('First');
    expect(mocks.getAccessCodes).toHaveBeenCalledTimes(1);
  });

  it('loads permissions before restoring an authenticated login URL', async () => {
    mocks.menuRoutes = [page('First', '/first'), page('Second', '/second')];
    useAccessStore().setAccessToken('test-token');
    const router = createTestRouter();
    await router.push({
      path: LOGIN_PATH,
      query: { redirect: encodeURIComponent('/second?tab=2') },
    });
    expect(router.currentRoute.value.fullPath).toBe('/second?tab=2');
  });

  it('fetches user information when reloading the root URL with a saved token', async () => {
    mocks.menuRoutes = [page('First', '/first')];
    mocks.fetchUserInfo.mockResolvedValue({ roles: ['user'] });
    useUserStore().$reset();
    useAccessStore().setAccessToken('test-token');
    const router = createTestRouter();
    await router.push('/');
    expect(router.currentRoute.value.name).toBe('First');
    expect(mocks.fetchUserInfo).toHaveBeenCalledOnce();
  });

  it('recalculates the page for another account and rejects its previous routes', async () => {
    mocks.menuRoutes = [page('OldPage', '/old')];
    const router = await login();
    useAccessStore().$reset();
    await router.push({
      path: LOGIN_PATH,
      query: { redirect: encodeURIComponent('/old') },
    });
    mocks.menuRoutes = [page('NewPage', '/new')];
    useAccessStore().setAccessToken('new-token');
    await router.push('/');
    expect(router.currentRoute.value.name).toBe('NewPage');
    expect(
      traverseTreeValues(useAccessStore().accessRoutes, (route) => route.name),
    ).toEqual(['NewPage']);
  });

  it('preserves direct URLs on refresh and keeps unknown URLs as 404', async () => {
    mocks.menuRoutes = [page('First', '/first'), page('Second', '/second')];
    useAccessStore().setAccessToken('test-token');
    const router = createTestRouter();
    await router.push('/second?tab=2');
    expect(router.currentRoute.value.fullPath).toBe('/second?tab=2');
    expect(router.currentRoute.value.name).toBe('Second');
    await router.push('/unknown');
    expect(router.currentRoute.value.name).toBe('FallbackNotFound');
  });

  it('requires login at the root URL without saving the root as a return address', async () => {
    const router = createTestRouter();
    await router.push('/');
    expect(router.currentRoute.value.path).toBe(LOGIN_PATH);
    expect(router.currentRoute.value.query).toEqual({});
  });
});
