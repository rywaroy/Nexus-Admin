import { requestClient } from '#/api/request';

/**
 * 角色管理 API 命名空间
 */
export namespace SystemRoleApi {
  /** 角色信息 */
  export interface SystemRole {
    /** 角色ID */
    id: string;
    /** 角色名称 */
    name: string;
    /** 权限标识数组 */
    permissions: string[];
    /** 备注 */
    remark?: string;
    /** 状态：0-启用，1-停用 */
    status: 0 | 1;
    /** 创建时间 */
    createTime?: string;
  }

  /** 角色列表返回结果 */
  export interface RoleListResult {
    list: SystemRole[];
    total: number;
  }

  /** 创建角色请求 */
  export interface CreateRoleRequest {
    /** 角色名称 */
    name: string;
    /** 权限标识数组 */
    permissions?: string[];
    /** 备注 */
    remark?: string;
    /** 状态：0-启用，1-停用 */
    status?: 0 | 1;
  }

  /** 更新角色请求 */
  export type UpdateRoleRequest = Partial<CreateRoleRequest>;

  /** 查询角色请求 */
  export interface QueryRoleRequest {
    /** 当前页码 */
    page?: number;
    /** 每页数量 */
    pageSize?: number;
    /** 角色名称（模糊匹配） */
    name?: string;
    /** 状态：0-启用，1-停用 */
    status?: 0 | 1;
  }
}

/**
 * 获取角色列表
 */
export const getRoleList = (params?: SystemRoleApi.QueryRoleRequest) => {
  return requestClient.get<SystemRoleApi.RoleListResult>('/system/role/list', {
    params,
  });
};

/**
 * 获取所有启用的角色（用于下拉选择）
 */
export const getRoleOptions = () => {
  return requestClient.get<SystemRoleApi.SystemRole[]>('/system/role/options');
};

/**
 * 获取角色详情
 */
export const getRole = (id: string) => {
  return requestClient.get<SystemRoleApi.SystemRole>(`/system/role/${id}`);
};

/**
 * 创建角色
 */
export const createRole = (data: SystemRoleApi.CreateRoleRequest) => {
  return requestClient.post<SystemRoleApi.SystemRole>('/system/role', data);
};

/**
 * 更新角色
 */
export const updateRole = (
  id: string,
  data: SystemRoleApi.UpdateRoleRequest,
) => {
  return requestClient.put<SystemRoleApi.SystemRole>(
    `/system/role/${id}`,
    data,
  );
};

/**
 * 删除角色
 */
export const deleteRole = (id: string) => {
  return requestClient.delete<any>(`/system/role/${id}`);
};
