import { requestClient } from '#/api/request';

export namespace SystemDictApi {
  export interface DictType {
    createTime?: string;
    dictName: string;
    dictType: string;
    id: string;
    remark?: string;
    status: 0 | 1;
  }

  export interface DictData {
    createTime?: string;
    cssClass?: string;
    dictLabel: string;
    dictName?: string;
    dictSort: number;
    dictType?: string;
    dictValue: string;
    id: string;
    isDefault: boolean;
    listClass?: string;
    remark?: string;
    status: 0 | 1;
    typeId?: string;
  }

  export interface DictTypeListResult {
    list: DictType[];
    total: number;
  }

  export interface DictDataListResult {
    list: DictData[];
    total: number;
  }

  export interface QueryDictTypeRequest {
    dictName?: string;
    dictType?: string;
    page?: number;
    pageSize?: number;
    status?: 0 | 1;
  }

  export interface QueryDictDataRequest {
    dictLabel?: string;
    dictType?: string;
    page?: number;
    pageSize?: number;
    status?: 0 | 1;
    typeId?: string;
  }

  export interface CreateDictTypeRequest {
    dictName: string;
    dictType: string;
    remark?: string;
    status?: 0 | 1;
  }

  export type UpdateDictTypeRequest = Partial<CreateDictTypeRequest>;

  export interface CreateDictDataRequest {
    cssClass?: string;
    dictLabel: string;
    dictSort?: number;
    dictValue: string;
    isDefault?: boolean;
    listClass?: string;
    remark?: string;
    status?: 0 | 1;
    typeId: string;
  }

  export type UpdateDictDataRequest = Partial<CreateDictDataRequest>;
}

export const getDictTypeList = (
  params?: SystemDictApi.QueryDictTypeRequest,
) => {
  return requestClient.get<SystemDictApi.DictTypeListResult>(
    '/system/dict/type/list',
    { params },
  );
};

export const getDictTypeOptions = () => {
  return requestClient.get<SystemDictApi.DictType[]>(
    '/system/dict/type/options',
  );
};

export const getDictType = (id: string) => {
  return requestClient.get<SystemDictApi.DictType>(`/system/dict/type/${id}`);
};

export const createDictType = (data: SystemDictApi.CreateDictTypeRequest) => {
  return requestClient.post<SystemDictApi.DictType>('/system/dict/type', data);
};

export const updateDictType = (
  id: string,
  data: SystemDictApi.UpdateDictTypeRequest,
) => {
  return requestClient.put<SystemDictApi.DictType>(
    `/system/dict/type/${id}`,
    data,
  );
};

export const deleteDictType = (id: string) => {
  return requestClient.delete(`/system/dict/type/${id}`);
};

export const getDictDataList = (
  params?: SystemDictApi.QueryDictDataRequest,
) => {
  return requestClient.get<SystemDictApi.DictDataListResult>(
    '/system/dict/data/list',
    { params },
  );
};

export const getDictDataByType = (dictType: string) => {
  return requestClient.get<SystemDictApi.DictData[]>(
    `/system/dict/data/type/${dictType}`,
  );
};

export const getDictData = (id: string) => {
  return requestClient.get<SystemDictApi.DictData>(`/system/dict/data/${id}`);
};

export const createDictData = (data: SystemDictApi.CreateDictDataRequest) => {
  return requestClient.post<SystemDictApi.DictData>('/system/dict/data', data);
};

export const updateDictData = (
  id: string,
  data: SystemDictApi.UpdateDictDataRequest,
) => {
  return requestClient.put<SystemDictApi.DictData>(
    `/system/dict/data/${id}`,
    data,
  );
};

export const deleteDictData = (id: string) => {
  return requestClient.delete(`/system/dict/data/${id}`);
};
