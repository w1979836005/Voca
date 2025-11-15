/**
 * 用户管理API接口
 */

import request from '../utils/request.js';

// 用户管理接口路径
const USER_API = {
  // 获取用户信息
  PROFILE: '/user/profile',
  // 更新用户信息
  UPDATE_PROFILE: '/user/profile',
  // 上传头像
  UPLOAD_AVATAR: '/user/avatar',
  // 获取学习统计
  STATS: '/user/stats',
  // 更新学习目标
  UPDATE_STUDY_GOAL: '/user/study-goal',
  // 获取用户词单
  WORDLISTS: '/user/wordlists'
};

/**
 * 用户管理API类
 */
export class UserAPI {
  /**
   * 获取用户信息
   * @returns {Promise<Object>} 用户信息
   */
  async getProfile() {
    return request.get(USER_API.PROFILE);
  }

  /**
   * 更新用户信息
   * @param {Object} data 更新数据
   * @param {string} data.username 用户名
   * @param {string} data.userProfile 用户简介
   * @param {number} data.studyGoal 学习目标
   * @returns {Promise<Object>} 更新结果
   */
  async updateProfile(data) {
    return request.put(USER_API.UPDATE_PROFILE, data);
  }

  /**
   * 上传头像
   * @param {string} filePath 文件路径
   * @returns {Promise<Object>} 上传结果
   */
  async uploadAvatar(filePath) {
    return request.upload(USER_API.UPLOAD_AVATAR, filePath);
  }

  /**
   * 获取学习统计
   * @returns {Promise<Object>} 学习统计数据
   */
  async getStats() {
    return request.get(USER_API.STATS);
  }

  /**
   * 更新学习目标
   * @param {Object} data 学习目标数据
   * @param {number} data.studyGoal 每日学习单词数
   * @returns {Promise<Object>} 更新结果
   */
  async updateStudyGoal(data) {
    return request.put(USER_API.UPDATE_STUDY_GOAL, data);
  }

  /**
   * 获取用户词单
   * @param {Object} params 查询参数
   * @param {number} params.page 页码
   * @param {number} params.limit 每页数量
   * @param {string} params.type 词单类型 (all/system/custom)
   * @returns {Promise<Object>} 词单列表
   */
  async getWordlists(params = {}) {
    return request.get(USER_API.WORDLISTS, params);
  }
}

// 导出单例实例
export const userAPI = new UserAPI();

// 导出类
export { UserAPI };