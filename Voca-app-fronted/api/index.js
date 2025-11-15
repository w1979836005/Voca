/**
 * API接口模块导出
 */

import { authAPI } from './auth.js';
import { userAPI } from './user.js';
import { wordlistAPI } from './wordlist.js';
import { learningAPI } from './learning.js';

// 统一导出所有API
const api = {
  auth: authAPI,
  user: userAPI,
  wordlist: wordlistAPI,
  learning: learningAPI
};

// 分别导出各模块
export {
  authAPI,
  userAPI,
  wordlistAPI,
  learningAPI,
  api
};

export default api;