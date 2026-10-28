import type { Router } from 'vue-router';

import { LOGIN_PATH } from '@vben/constants';
import { preferences } from '@vben/preferences';
import { useAccessStore, useDictStore, useUserStore } from '@vben/stores';
import { startProgress, stopProgress } from '@vben/utils';

import { getAccessCodesApi } from '#/api';
import { accessRoutes, coreRouteNames } from '#/router/routes';
import { useAuthStore } from '#/store';

import { generateAccess } from './access';
import { createLandingPageResolver } from './landing';

/**
 * 通用守卫配置
 * @param router
 */
function setupCommonGuard(router: Router) {
  // 记录已经加载的页面
  const loadedPaths = new Set<string>();

  router.beforeEach((to) => {
    to.meta.loaded = loadedPaths.has(to.path);

    // 页面加载进度条
    if (!to.meta.loaded && preferences.transition.progress) {
      startProgress();
    }
    return true;
  });

  router.afterEach((to) => {
    // 记录页面是否加载,如果已经加载，后续的页面切换动画等效果不在重复执行

    loadedPaths.add(to.path);

    // 关闭页面加载进度条
    if (preferences.transition.progress) {
      stopProgress();
    }
  });
}

/**
 * 权限访问守卫配置
 * @param router
 */
function setupAccessGuard(router: Router) {
  router.beforeEach(async (to, from) => {
    const accessStore = useAccessStore();
    const userStore = useUserStore();
    const authStore = useAuthStore();

    // 基本路由，这些路由不需要进入权限拦截
    if (to.path !== '/' && coreRouteNames.includes(to.name as string)) {
      if (to.path === LOGIN_PATH && accessStore.accessToken) {
        return { path: '/', query: to.query, replace: true };
      }
      return true;
    }

    // accessToken 检查
    if (!accessStore.accessToken) {
      // 明确声明忽略权限访问权限，则可以访问
      if (to.meta.ignoreAccess) {
        return true;
      }

      // 没有访问权限，跳转登录页面
      if (to.fullPath !== LOGIN_PATH) {
        return {
          path: LOGIN_PATH,
          // 如不需要，直接删除 query
          query:
            to.path === '/'
              ? {}
              : { redirect: encodeURIComponent(to.fullPath) },
          // 携带当前跳转的页面，登录后重新跳转该页面
          replace: true,
        };
      }
      return to;
    }

    const needsAccessCheck = !accessStore.isAccessChecked;
    if (needsAccessCheck) {
      const userInfo = userStore.userInfo || (await authStore.fetchUserInfo());
      const { accessibleMenus, accessibleRoutes } = await generateAccess({
        roles: userInfo.roles ?? [],
        router,
        routes: accessRoutes,
      });

      // 获取并设置权限码（用于按钮级权限控制）
      try {
        const accessCodes = await getAccessCodesApi();
        accessStore.setAccessCodes(accessCodes);
      } catch {
        // 获取权限码失败时不阻断流程，仅清空权限码
        accessStore.setAccessCodes([]);
      }

      accessStore.setAccessMenus(accessibleMenus);
      accessStore.setAccessRoutes(accessibleRoutes);
      accessStore.setIsAccessChecked(true);
      void useDictStore()
        .loadAllDicts()
        .catch((error) => {
          console.error('Failed to preload dictionaries:', error);
        });
    }

    if (to.path === '/') {
      const { findFirstPage, resolvePage } = createLandingPageResolver(
        router,
        accessStore.accessRoutes,
      );
      const redirect =
        to.query.redirect ??
        (from.path === LOGIN_PATH ? from.query.redirect : undefined);
      const page =
        (typeof redirect === 'string'
          ? resolvePage(decodeURIComponent(redirect))
          : undefined) ?? findFirstPage(accessStore.accessMenus);

      return page
        ? { path: page.path, query: page.query, hash: page.hash, replace: true }
        : { name: 'NoAccess', replace: true };
    }

    return needsAccessCheck
      ? { ...router.resolve(to.fullPath), replace: true }
      : true;
  });
}

/**
 * 项目守卫配置
 * @param router
 */
function createRouterGuard(router: Router) {
  /** 通用 */
  setupCommonGuard(router);
  /** 权限访问 */
  setupAccessGuard(router);
}

export { createRouterGuard };
