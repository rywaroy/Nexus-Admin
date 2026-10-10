import type {
  RouteLocationRaw,
  RouteLocationResolved,
  Router,
  RouteRecordRaw,
} from 'vue-router';

import type { MenuRecordRaw } from '@vben/types';

import { isHttpUrl, traverseTreeValues } from '@vben/utils';

function createLandingPageResolver(router: Router, routes: RouteRecordRaw[]) {
  const routeNames = new Set([
    ...traverseTreeValues(routes, (route) => route.name),
    // 修改密码是登录后的公共页面，不依赖业务菜单授权。
    'ChangePassword',
  ]);

  function resolvePage(
    target: RouteLocationRaw,
  ): RouteLocationResolved | undefined {
    if (typeof target === 'string' && isHttpUrl(target)) {
      return;
    }

    let location = router.resolve(target);
    let record = location.matched.at(-1);

    // 路由仍可能保留上一个账号的记录，返回地址必须属于本次生成的权限路由。
    while (record && routeNames.has(record.name)) {
      if (
        location.meta.link ||
        location.meta.menuVisibleWithForbidden ||
        location.path.includes('/:')
      ) {
        return;
      }

      if (!record.redirect) {
        return record.components?.default ? location : undefined;
      }

      const redirect =
        typeof record.redirect === 'function'
          ? record.redirect(location, router.currentRoute.value)
          : record.redirect;
      let redirectTarget: Exclude<RouteLocationRaw, string>;
      if (typeof redirect === 'string') {
        redirectTarget =
          redirect.includes('?') || redirect.includes('#')
            ? router.resolve(redirect)
            : { path: redirect };
      } else {
        redirectTarget = redirect;
      }

      location = router.resolve({
        query: location.query,
        hash: location.hash,
        ...('path' in redirectTarget ? {} : { params: location.params }),
        ...redirectTarget,
      });
      record = location.matched.at(-1);
    }
  }

  function findFirstPage(
    menus: MenuRecordRaw[],
  ): RouteLocationResolved | undefined {
    for (const menu of menus) {
      // 折叠菜单沿用原路由的 redirect，因此 path 也可能是 { name }。
      const target = menu.path as RouteLocationRaw;
      if (
        menu.disabled ||
        (typeof target === 'string' &&
          (isHttpUrl(target) || target.includes('/:')))
      ) {
        continue;
      }

      if (menu.children?.length) {
        const page = findFirstPage(menu.children);
        if (page) {
          return page;
        }
        continue;
      }

      const record = router.resolve(target).matched.at(-1);
      if (
        record?.children.length &&
        !record.components?.default &&
        !record.meta.hideChildrenInMenu
      ) {
        continue;
      }

      const page = resolvePage({
        ...(typeof target === 'string' ? { path: target } : target),
        query: menu.query,
      });
      if (page) {
        return page;
      }
    }
  }

  return { findFirstPage, resolvePage };
}

export { createLandingPageResolver };
