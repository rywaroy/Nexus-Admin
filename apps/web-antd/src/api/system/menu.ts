import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

/**
 * 菜单管理 API 命名空间
 */
export namespace SystemMenuApi {
  /** 徽标颜色集合 */
  export const BadgeVariants = [
    'default',
    'destructive',
    'primary',
    'success',
    'warning',
  ] as const;

  /** 徽标类型集合 */
  export const BadgeTypes = ['dot', 'normal'] as const;

  /** 菜单类型集合 */
  export const MenuTypes = [
    'catalog',
    'menu',
    'embedded',
    'link',
    'button',
  ] as const;

  /** 菜单元数据 */
  export interface MenuMeta {
    /** 激活时显示的图标 */
    activeIcon?: string;
    /** 作为路由时，需要激活的菜单的Path */
    activePath?: string;
    /** 固定在标签栏 */
    affixTab?: boolean;
    /** 徽标内容(当徽标类型为normal时有效) */
    badge?: string;
    /** 徽标类型 */
    badgeType?: (typeof BadgeTypes)[number];
    /** 徽标颜色 */
    badgeVariants?: (typeof BadgeVariants)[number];
    /** 在菜单中隐藏下级 */
    hideChildrenInMenu?: boolean;
    /** 在面包屑中隐藏 */
    hideInBreadcrumb?: boolean;
    /** 在菜单中隐藏 */
    hideInMenu?: boolean;
    /** 在标签栏中隐藏 */
    hideInTab?: boolean;
    /** 菜单图标 */
    icon?: string;
    /** 内嵌Iframe的URL */
    iframeSrc?: string;
    /** 是否缓存页面 */
    keepAlive?: boolean;
    /** 外链页面的URL */
    link?: string;
    /** 菜单排序 */
    order?: number;
    /** 额外的路由参数 */
    query?: Recordable<any>;
    /** 菜单标题 */
    title?: string;
  }

  /** 系统菜单（后端返回格式） */
  export interface SystemMenu {
    /** 后端权限标识 */
    authCode?: string;
    /** 子级 */
    children?: SystemMenu[];
    /** 组件 */
    component?: string;
    /** 菜单ID */
    id: string;
    /** 菜单元数据 */
    meta?: MenuMeta;
    /** 菜单名称 */
    name: string;
    /** 路由路径 */
    path: string;
    /** 父级ID */
    pid: null | string;
    /** 状态：0-启用，1-停用 */
    status?: number;
    /** 菜单类型 */
    type: (typeof MenuTypes)[number];
  }

  /** 创建菜单请求 */
  export interface CreateMenuRequest {
    /** 激活时的图标 */
    activeIcon?: string;
    /** 激活路径 */
    activePath?: string;
    /** 是否固定在标签栏 */
    affixTab?: boolean;
    /** 权限标识 */
    authCode?: string;
    /** 徽标内容 */
    badge?: string;
    /** 徽标类型 */
    badgeType?: (typeof BadgeTypes)[number];
    /** 徽标颜色 */
    badgeVariants?: (typeof BadgeVariants)[number];
    /** 组件路径 */
    component?: string;
    /** 是否在菜单中隐藏子级 */
    hideChildrenInMenu?: boolean;
    /** 是否在面包屑中隐藏 */
    hideInBreadcrumb?: boolean;
    /** 是否在菜单中隐藏 */
    hideInMenu?: boolean;
    /** 是否在标签页中隐藏 */
    hideInTab?: boolean;
    /** 菜单图标 */
    icon?: string;
    /** iframe 地址 */
    iframeSrc?: string;
    /** 是否缓存页面 */
    keepAlive?: boolean;
    /** 外链地址 */
    link?: string;
    /** 菜单名称（路由 name） */
    name: string;
    /** 排序值 */
    order?: number;
    /** 父级菜单ID */
    parentId?: string;
    /** 路由路径 */
    path: string;
    /** 状态：0-启用，1-停用 */
    status?: number;
    /** 菜单标题 */
    title: string;
    /** 菜单类型 */
    type: (typeof MenuTypes)[number];
  }

  /** 更新菜单请求（所有字段可选） */
  export type UpdateMenuRequest = Partial<CreateMenuRequest>;

  /** 查询菜单请求 */
  export interface QueryMenuRequest {
    /** 菜单名称（模糊匹配） */
    name?: string;
    /** 父级菜单ID */
    parentId?: string;
    /** 状态：0-启用，1-停用 */
    status?: number;
    /** 菜单标题（模糊匹配） */
    title?: string;
    /** 菜单类型 */
    type?: (typeof MenuTypes)[number];
  }
}

/**
 * 获取菜单列表（树结构）
 */
export const getMenuList = (params?: SystemMenuApi.QueryMenuRequest) => {
  return requestClient.get<SystemMenuApi.SystemMenu[]>('/menu/list', {
    params,
  });
};

/**
 * 获取菜单树（用于选择器）
 */
export const getMenuTree = () => {
  return requestClient.get<SystemMenuApi.SystemMenu[]>('/menu/tree');
};

/**
 * 检查菜单名称是否存在
 */
export const isMenuNameExists = (name: string, id?: string) => {
  return requestClient.get<boolean>('/menu/name-exists', {
    params: { id, name },
  });
};

/**
 * 检查路由路径是否存在
 */
export const isMenuPathExists = (path: string, id?: string) => {
  return requestClient.get<boolean>('/menu/path-exists', {
    params: { id, path },
  });
};

/**
 * 获取菜单详情
 */
export const getMenu = (id: string) => {
  return requestClient.get<SystemMenuApi.SystemMenu>(`/menu/${id}`);
};

/**
 * 创建菜单
 */
export const createMenu = (data: SystemMenuApi.CreateMenuRequest) => {
  return requestClient.post('/menu', data);
};

/**
 * 更新菜单
 */
export const updateMenu = (
  id: string,
  data: SystemMenuApi.UpdateMenuRequest,
) => {
  return requestClient.put(`/menu/${id}`, data);
};

/**
 * 删除菜单
 */
export const deleteMenu = (id: string) => {
  return requestClient.delete(`/menu/${id}`);
};
