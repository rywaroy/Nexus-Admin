import type { UserInfo } from '@vben/types';

import { useAccessStore } from '@vben/stores';

import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useAuthStore } from '../auth';

const mocks = vi.hoisted(() => ({
  getUserInfo: vi.fn(),
  login: vi.fn().mockResolvedValue({ accessToken: 'test-token' }),
  routerPush: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mocks.routerPush }),
}));

vi.mock('ant-design-vue', () => ({
  notification: { success: vi.fn() },
}));

vi.mock('#/api', () => ({
  getUserInfoApi: mocks.getUserInfo,
  loginApi: mocks.login,
  logoutApi: vi.fn(),
}));

vi.mock('#/locales', () => ({ $t: (key: string) => key }));

describe('authStore login navigation', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    mocks.getUserInfo.mockResolvedValue({
      homePath: '/removed-home',
      roles: ['user'],
    } as UserInfo);
  });

  it('enters the root URL so the guard can select a page after loading menus', async () => {
    await useAuthStore().authLogin({ password: 'password', username: 'user' });
    expect(useAccessStore().accessToken).toBe('test-token');
    expect(mocks.routerPush).toHaveBeenCalledExactlyOnceWith('/');
  });

  it('preserves a custom successful-login callback', async () => {
    const onSuccess = vi.fn();
    await useAuthStore().authLogin(
      { password: 'password', username: 'user' },
      onSuccess,
    );
    expect(onSuccess).toHaveBeenCalledOnce();
    expect(mocks.routerPush).not.toHaveBeenCalled();
  });

  it('keeps the current page when renewing an expired login in a modal', async () => {
    useAccessStore().setLoginExpired(true);
    await useAuthStore().authLogin({ password: 'password', username: 'user' });
    expect(useAccessStore().loginExpired).toBe(false);
    expect(mocks.routerPush).not.toHaveBeenCalled();
  });
});
