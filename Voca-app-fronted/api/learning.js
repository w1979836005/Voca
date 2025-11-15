/**
 * 学习相关API接口
 */

import request from '../utils/request.js';

// 学习相关接口路径
const LEARNING_API = {
  // 获取学习模式
  MODES: '/learning/mode',
  // 开始学习会话
  START_SESSION: '/learning/session',
  // 获取下一个单词
  NEXT_WORD: '/learning/session',
  // 提交答案
  SUBMIT_ANSWER: '/learning/session',
  // 结束学习会话
  COMPLETE_SESSION: '/learning/session',
  // 获取学习进度
  PROGRESS: '/learning/progress',
  // 获取学习历史
  HISTORY: '/learning/history',
  // 获取学习统计
  STATS: '/learning/stats'
};

/**
 * 学习相关API类
 */
export class LearningAPI {
  /**
   * 获取学习模式
   * @returns {Promise<Object>} 学习模式列表
   */
  async getLearningModes() {
    return request.get(LEARNING_API.MODES);
  }

  /**
   * 开始学习会话
   * @param {Object} data 会话数据
   * @param {number} data.wordListId 词单ID
   * @param {string} data.mode 学习模式
   * @param {number} data.wordCount 学习单词数量
   * @returns {Promise<Object>} 会话信息
   */
  async startLearningSession(data) {
    return request.post(LEARNING_API.START_SESSION, data);
  }

  /**
   * 获取下一个单词
   * @param {string} sessionId 会话ID
   * @returns {Promise<Object>} 下一个单词信息
   */
  async getNextWord(sessionId) {
    return request.get(`${LEARNING_API.NEXT_WORD}/${sessionId}/next`);
  }

  /**
   * 提交答案
   * @param {string} sessionId 会话ID
   * @param {Object} data 答案数据
   * @param {number} data.wordId 单词ID
   * @param {string} data.answer 用户答案
   * @param {number} data.timeSpent 答题用时（毫秒）
   * @returns {Promise<Object>} 答案结果
   */
  async submitAnswer(sessionId, data) {
    return request.post(`${LEARNING_API.SUBMIT_ANSWER}/${sessionId}/answer`, data);
  }

  /**
   * 结束学习会话
   * @param {string} sessionId 会话ID
   * @returns {Promise<Object>} 会话结果
   */
  async completeLearningSession(sessionId) {
    return request.post(`${LEARNING_API.COMPLETE_SESSION}/${sessionId}/complete`);
  }

  /**
   * 获取学习进度
   * @returns {Promise<Object>} 学习进度数据
   */
  async getLearningProgress() {
    return request.get(LEARNING_API.PROGRESS);
  }

  /**
   * 获取学习历史
   * @param {Object} params 查询参数
   * @param {number} params.page 页码
   * @param {number} params.limit 每页数量
   * @param {string} params.startDate 开始日期
   * @param {string} params.endDate 结束日期
   * @returns {Promise<Object>} 学习历史列表
   */
  async getLearningHistory(params = {}) {
    return request.get(LEARNING_API.HISTORY, params);
  }

  /**
   * 获取学习统计
   * @param {Object} params 查询参数
   * @param {string} params.period 统计周期 (daily/weekly/monthly)
   * @returns {Promise<Object>} 学习统计数据
   */
  async getLearningStats(params = {}) {
    return request.get(LEARNING_API.STATS, params);
  }

  /**
   * 批量提交答案
   * @param {string} sessionId 会话ID
   * @param {Array} answers 答案数组
   * @returns {Promise<Object>} 批量提交结果
   */
  async batchSubmitAnswers(sessionId, answers) {
    const promises = answers.map(answer =>
      this.submitAnswer(sessionId, answer)
    );
    return Promise.all(promises);
  }

  /**
   * 暂停学习会话
   * @param {string} sessionId 会话ID
   * @returns {Promise<Object>} 暂停结果
   */
  async pauseLearningSession(sessionId) {
    return request.post(`${LEARNING_API.START_SESSION}/${sessionId}/pause`);
  }

  /**
   * 恢复学习会话
   * @param {string} sessionId 会话ID
   * @returns {Promise<Object>} 恢复结果
   */
  async resumeLearningSession(sessionId) {
    return request.post(`${LEARNING_API.START_SESSION}/${sessionId}/resume`);
  }
}

// 导出单例实例
export const learningAPI = new LearningAPI();

// 导出类
export { LearningAPI };