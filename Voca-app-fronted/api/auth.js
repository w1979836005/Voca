/**
 * 认证相关API接口
 */

import request from '../utils/request.js';

// 认证相关接口路径
const AUTH_API = {
  // 用户注册
  REGISTER: '/auth/register',
  // 用户登录
  LOGIN: '/auth/login',
  // 刷新token
  REFRESH: '/auth/refresh',
  // 发送验证码
  SEND_CODE: '/auth/send-code',
  // 忘记密码
  FORGOT_PASSWORD: '/auth/forgot-password',
  // 退出登录
  LOGOUT: '/auth/logout'
};

/**
 * 认证API类
 */
export class AuthAPI {
  /**
   * 用户注册
   * @param {Object} data 注册数据
   * @param {string} data.username 用户名
   * @param {string} data.email 邮箱
   * @param {string} data.password 密码
   * @param {string} data.code 验证码
   * @returns {Promise<Object>} 注册结果
   */
  async register(data) {
    return request.post(AUTH_API.REGISTER, data);
  }

  /**
   * 用户登录
   * @param {Object} data 登录数据
   * @param {string} data.email 邮箱
   * @param {string} data.password 密码
   * @returns {Promise<Object>} 登录结果
   */
  async login(data) {
    return request.post(AUTH_API.LOGIN, data);
  }

  /**
   * 刷新token
   * @param {Object} data 刷新数据
   * @param {string} data.refreshToken 刷新令牌
   * @returns {Promise<Object>} 刷新结果
   */
  async refreshToken(data) {
    return request.post(AUTH_API.REFRESH, data);
  }

  /**
   * 发送验证码
   * @param {Object} data 验证码数据
   * @param {string} data.email 邮箱地址
   * @returns {Promise<Object>} 发送结果
   */
  async sendVerificationCode(data) {
    return request.post(AUTH_API.SEND_CODE, data);
  }

  /**
   * 忘记密码
   * @param {Object} data 密码重置数据
   * @param {string} data.email 邮箱地址
   * @param {string} data.code 验证码
   * @param {string} data.newPassword 新密码
   * @returns {Promise<Object>} 重置结果
   */
  async forgotPassword(data) {
    return request.post(AUTH_API.FORGOT_PASSWORD, data);
  }

  /**
   * 退出登录
   * @returns {Promise<Object>} 退出结果
   */
  async logout() {
    return request.post(AUTH_API.LOGOUT);
  }
}

// 导出单例实例
export const authAPI = new AuthAPI();

// 默认导出
export default authAPI;