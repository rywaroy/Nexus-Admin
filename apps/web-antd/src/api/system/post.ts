import { requestClient } from '#/api/request';

/**
 * 岗位管理 API 命名空间
 */
export namespace SystemPostApi {
  /** 岗位信息 */
  export interface SystemPost {
    /** 岗位ID */
    id: string;
    /** 岗位编码 */
    postCode: string;
    /** 岗位名称 */
    postName: string;
    /** 排序 */
    postSort: number;
    /** 状态：0-启用，1-停用 */
    status: 0 | 1;
    /** 备注 */
    remark?: string;
    /** 创建时间 */
    createTime?: string;
  }

  /** 岗位列表返回结果 */
  export interface PostListResult {
    list: SystemPost[];
    total: number;
  }

  /** 创建岗位请求 */
  export interface CreatePostRequest {
    /** 岗位编码 */
    postCode: string;
    /** 岗位名称 */
    postName: string;
    /** 排序 */
    postSort?: number;
    /** 状态：0-启用，1-停用 */
    status?: 0 | 1;
    /** 备注 */
    remark?: string;
  }

  /** 更新岗位请求 */
  export type UpdatePostRequest = Partial<CreatePostRequest>;

  /** 查询岗位请求 */
  export interface QueryPostRequest {
    /** 当前页码 */
    page?: number;
    /** 每页数量 */
    pageSize?: number;
    /** 岗位编码（模糊匹配） */
    postCode?: string;
    /** 岗位名称（模糊匹配） */
    postName?: string;
    /** 状态：0-启用，1-停用 */
    status?: 0 | 1;
  }
}

/**
 * 获取岗位列表
 */
export const getPostList = (params?: SystemPostApi.QueryPostRequest) => {
  return requestClient.get<SystemPostApi.PostListResult>('/system/post/list', {
    params,
  });
};

/**
 * 获取所有启用的岗位（用于下拉选择）
 */
export const getPostOptions = () => {
  return requestClient.get<SystemPostApi.SystemPost[]>('/system/post/options');
};

/**
 * 获取岗位详情
 */
export const getPost = (id: string) => {
  return requestClient.get<SystemPostApi.SystemPost>(`/system/post/${id}`);
};

/**
 * 创建岗位
 */
export const createPost = (data: SystemPostApi.CreatePostRequest) => {
  return requestClient.post<SystemPostApi.SystemPost>('/system/post', data);
};

/**
 * 更新岗位
 */
export const updatePost = (
  id: string,
  data: SystemPostApi.UpdatePostRequest,
) => {
  return requestClient.put<SystemPostApi.SystemPost>(
    `/system/post/${id}`,
    data,
  );
};

/**
 * 删除岗位
 */
export const deletePost = (id: string) => {
  return requestClient.delete<any>(`/system/post/${id}`);
};
