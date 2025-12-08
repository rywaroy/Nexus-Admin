import { requestClient } from '#/api/request';

/**
 * 用户管理 API 命名空间
 */
export namespace SystemUserApi {
  /** 用户信息 */
  export interface SystemUser {
    /** 用户ID */
    id: string;
    /** 用户名 */
    username: string;
    /** 昵称 */
    nickName: string;
    /** 邮箱 */
    email?: string;
    /** 手机号 */
    phone?: string;
    /** 头像 URL */
    avatar?: string;
    /** 状态：0-启用，1-停用 */
    status: 0 | 1;
    /** 部门ID */
    deptId?: string;
    /** 角色列表 */
    roles: string[];
    /** 备注 */
    remark?: string;
    /** 创建时间 */
    createTime?: string;
  }

  /** 用户列表返回结果 */
  export interface UserListResult {
    list: SystemUser[];
    total: number;
  }

  /** 查询用户请求 */
  export interface QueryUserRequest {
    /** 当前页码 */
    page?: number;
    /** 每页数量 */
    pageSize?: number;
    /** 用户名（模糊匹配） */
    username?: string;
    /** 昵称（模糊匹配） */
    nickName?: string;
    /** 手机号 */
    phone?: string;
    /** 状态：0-启用，1-停用 */
    status?: 0 | 1;
    /** 部门ID */
    deptId?: string;
  }

  /** 创建用户请求 */
  export interface CreateUserRequest {
    /** 用户名 */
    username: string;
    /** 密码 */
    password: string;
    /** 昵称 */
    nickName: string;
    /** 邮箱 */
    email?: string;
    /** 手机号 */
    phone?: string;
    /** 头像 URL */
    avatar?: string;
    /** 状态：0-启用，1-停用 */
    status?: 0 | 1;
    /** 部门ID */
    deptId?: string;
    /** 角色列表 */
    roles?: string[];
    /** 备注 */
    remark?: string;
  }

  /** 更新用户请求（不含用户名和密码） */
  export type UpdateUserRequest = Partial<
    Omit<CreateUserRequest, 'password' | 'username'>
  >;
}

/**
 * 获取用户列表
 */
export const getUserList = (params?: SystemUserApi.QueryUserRequest) => {
  return requestClient.get<SystemUserApi.UserListResult>('/system/user/list', {
    params,
  });
};

/**
 * 获取用户详情
 */
export const getUser = (id: string) => {
  return requestClient.get<SystemUserApi.SystemUser>(`/system/user/${id}`);
};

/**
 * 创建用户
 */
export const createUser = (data: SystemUserApi.CreateUserRequest) => {
  return requestClient.post<SystemUserApi.SystemUser>('/system/user', data);
};

/**
 * 更新用户
 */
export const updateUser = (
  id: string,
  data: SystemUserApi.UpdateUserRequest,
) => {
  return requestClient.put<SystemUserApi.SystemUser>(
    `/system/user/${id}`,
    data,
  );
};

/**
 * 删除用户
 */
export const deleteUser = (id: string) => {
  return requestClient.delete<any>(`/system/user/${id}`);
};

/**
 * 更新用户状态
 */
export const updateUserStatus = (id: string, status: 0 | 1) => {
  return requestClient.put<SystemUserApi.SystemUser>(
    `/system/user/${id}/status`,
    { status },
  );
};

/**
 * 重置用户密码
 */
export const resetUserPassword = (id: string, password: string) => {
  return requestClient.put<any>(`/system/user/${id}/reset-password`, {
    password,
  });
};
