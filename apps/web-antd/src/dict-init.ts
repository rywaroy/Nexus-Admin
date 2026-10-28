import { setDictHandler } from '@vben/stores';

import {
  getAllDictOptions,
  getDictOptions,
  getDictVersion,
} from '#/api/core/dict';

export const initDict = () => {
  setDictHandler({
    getAllDicts: getAllDictOptions,
    getDict: getDictOptions,
    getVersion: getDictVersion,
  });
};
