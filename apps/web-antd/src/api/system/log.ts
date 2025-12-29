import { requestClient } from '#/api/request';

/**
 * 日志管理 API 命名空间
 */
export namespace SystemLogApi {
  /** 业务类型枚举 */
  export enum BusinessType {
    /** 清空 */
    CLEAN = 8,
    /** 删除 */
    DELETE = 3,
    /** 导出 */
    EXPORT = 5,
    /** 强退 */
    FORCE = 7,
    /** 授权 */
    GRANT = 4,
    /** 导入 */
    IMPORT = 6,
    /** 新增 */
    INSERT = 1,
    /** 其他 */
    OTHER = 0,
    /** 修改 */
    UPDATE = 2,
  }

  /** 操作状态枚举 */
  export enum OperStatus {
    /** 失败 */
    FAIL = 1,
    /** 成功 */
    SUCCESS = 0,
  }

  /** 操作日志信息 */
  export interface OperLog {
    /** 日志ID */
    id: string;
    /** 模块标题 */
    title: string;
    /** 业务类型 */
    businessType: BusinessType;
    /** 方法名称 */
    method: string;
    /** 请求方式 */
    requestMethod: string;
    /** 操作人员 */
    operName: string;
    /** 部门名称 */
    deptName?: string;
    /** 请求URL */
    operUrl: string;
    /** 操作IP地址 */
    operIp: string;
    /** 操作地点 */
    operLocation?: string;
    /** 请求参数 */
    operParam?: string;
    /** 返回参数 */
    jsonResult?: string;
    /** 操作状态 */
    status: OperStatus;
    /** 错误消息 */
    errorMsg?: string;
    /** 操作时间 */
    operTime: string;
    /** 消耗时间(毫秒) */
    costTime: number;
    /** 创建时间 */
    createdAt?: string;
    /** 更新时间 */
    updatedAt?: string;
  }

  /** 操作日志列表返回结果 */
  export interface OperLogListResult {
    list: OperLog[];
    total: number;
  }

  /** 查询操作日志请求 */
  export interface QueryOperLogRequest {
    /** 当前页码 */
    page?: number;
    /** 每页数量 */
    pageSize?: number;
    /** 模块标题（模糊匹配） */
    title?: string;
    /** 操作人员（模糊匹配） */
    operName?: string;
    /** 业务类型 */
    businessType?: BusinessType;
    /** 操作状态 */
    status?: OperStatus;
    /** 开始时间 */
    beginTime?: string;
    /** 结束时间 */
    endTime?: string;
  }
}

/**
 * 获取操作日志列表
 */
export const getOperLogList = (params?: SystemLogApi.QueryOperLogRequest) => {
  return requestClient.get<SystemLogApi.OperLogListResult>('/system/log/list', {
    params,
  });
};

/**
 * 获取操作日志详情
 */
export const getOperLog = (id: string) => {
  return requestClient.get<SystemLogApi.OperLog>(`/system/log/${id}`);
};

/**
 * 删除操作日志
 */
export const deleteOperLog = (ids: string | string[]) => {
  const idsStr = Array.isArray(ids) ? ids.join(',') : ids;
  return requestClient.delete<{ deletedCount: number }>(
    `/system/log/${idsStr}`,
  );
};

/**
 * 清空操作日志
 */
export const cleanOperLog = () => {
  return requestClient.delete<{ deletedCount: number }>('/system/log/clean');
};
