import { requestClient } from '#/api/request';

/**
 * 部门管理 API 命名空间
 */
export namespace SystemDeptApi {
  /** 部门信息 */
  export interface SystemDept {
    /** 部门ID */
    id: string;
    /** 父级部门ID */
    pid: null | string;
    /** 部门名称 */
    name: string;
    /** 状态：0-启用，1-停用 */
    status: 0 | 1;
    /** 备注 */
    remark?: string;
    /** 创建时间 */
    createTime?: string;
    /** 子部门 */
    children?: SystemDept[];
  }

  /** 查询部门请求 */
  export interface QueryDeptRequest {
    /** 部门名称（模糊匹配） */
    name?: string;
    /** 状态：0-启用，1-停用 */
    status?: 0 | 1;
  }

  /** 创建部门请求 */
  export interface CreateDeptRequest {
    /** 部门名称 */
    name: string;
    /** 父级部门ID */
    pid?: null | string;
    /** 状态：0-启用，1-停用 */
    status?: 0 | 1;
    /** 备注 */
    remark?: string;
  }

  /** 更新部门请求 */
  export type UpdateDeptRequest = Partial<CreateDeptRequest>;
}

/**
 * 获取部门树列表
 */
export const getDeptTree = (params?: SystemDeptApi.QueryDeptRequest) => {
  return requestClient.get<SystemDeptApi.SystemDept[]>('/system/dept/list', {
    params,
  });
};

/**
 * 创建部门
 */
export const createDept = (data: SystemDeptApi.CreateDeptRequest) => {
  return requestClient.post<SystemDeptApi.SystemDept>('/system/dept', data);
};

/**
 * 更新部门
 */
export const updateDept = (
  id: string,
  data: SystemDeptApi.UpdateDeptRequest,
) => {
  return requestClient.put<SystemDeptApi.SystemDept>(
    `/system/dept/${id}`,
    data,
  );
};

/**
 * 删除部门
 */
export const deleteDept = (id: string) => {
  return requestClient.delete<{ id: string }>(`/system/dept/${id}`);
};
