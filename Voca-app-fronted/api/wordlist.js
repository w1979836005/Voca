/**
 * 词单管理API接口
 */

import request from '../utils/request.js';

// 词单管理接口路径
const WORDLIST_API = {
  // 获取词单列表
  LIST: '/wordlist',
  // 获取词单详情
  DETAIL: '/wordlist',
  // 创建词单
  CREATE: '/wordlist',
  // 更新词单
  UPDATE: '/wordlist',
  // 删除词单
  DELETE: '/wordlist',
  // 获取词单中的单词
  WORDS: '/wordlist',
  // 添加单词到词单
  ADD_WORDS: '/wordlist',
  // 从词单移除单词
  REMOVE_WORD: '/wordlist'
};

/**
 * 词单管理API类
 */
export class WordlistAPI {
  /**
   * 获取词单列表
   * @param {Object} params 查询参数
   * @param {number} params.page 页码
   * @param {number} params.limit 每页数量
   * @param {string} params.type 词单类型 (all/system/custom)
   * @param {string} params.search 搜索关键词
   * @returns {Promise<Object>} 词单列表
   */
  async getWordlists(params = {}) {
    return request.get(WORDLIST_API.LIST, params);
  }

  /**
   * 获取词单详情
   * @param {number} id 词单ID
   * @returns {Promise<Object>} 词单详情
   */
  async getWordlistDetail(id) {
    return request.get(`${WORDLIST_API.DETAIL}/${id}`);
  }

  /**
   * 创建词单
   * @param {Object} data 词单数据
   * @param {string} data.wordListName 词单名称
   * @param {string} data.description 词单描述
   * @returns {Promise<Object>} 创建结果
   */
  async createWordlist(data) {
    return request.post(WORDLIST_API.CREATE, data);
  }

  /**
   * 更新词单
   * @param {number} id 词单ID
   * @param {Object} data 更新数据
   * @param {string} data.wordListName 词单名称
   * @param {string} data.description 词单描述
   * @returns {Promise<Object>} 更新结果
   */
  async updateWordlist(id, data) {
    return request.put(`${WORDLIST_API.UPDATE}/${id}`, data);
  }

  /**
   * 删除词单
   * @param {number} id 词单ID
   * @returns {Promise<Object>} 删除结果
   */
  async deleteWordlist(id) {
    return request.delete(`${WORDLIST_API.DELETE}/${id}`);
  }

  /**
   * 获取词单中的单词
   * @param {number} id 词单ID
   * @param {Object} params 查询参数
   * @param {number} params.page 页码
   * @param {number} params.limit 每页数量
   * @returns {Promise<Object>} 单词列表
   */
  async getWordsInWordlist(id, params = {}) {
    return request.get(`${WORDLIST_API.WORDS}/${id}/words`, params);
  }

  /**
   * 添加单词到词单
   * @param {number} id 词单ID
   * @param {Object} data 单词数据
   * @param {number[]} data.wordIds 单词ID数组
   * @returns {Promise<Object>} 添加结果
   */
  async addWordsToWordlist(id, data) {
    return request.post(`${WORDLIST_API.ADD_WORDS}/${id}/words`, data);
  }

  /**
   * 从词单移除单词
   * @param {number} id 词单ID
   * @param {number} wordId 单词ID
   * @returns {Promise<Object>} 移除结果
   */
  async removeWordFromWordlist(id, wordId) {
    return request.delete(`${WORDLIST_API.REMOVE_WORD}/${id}/words/${wordId}`);
  }

  /**
   * 批量删除词单中的单词
   * @param {number} id 词单ID
   * @param {number[]} wordIds 单词ID数组
   * @returns {Promise<Object>} 删除结果
   */
  async batchRemoveWords(id, wordIds) {
    const promises = wordIds.map(wordId =>
      this.removeWordFromWordlist(id, wordId)
    );
    return Promise.all(promises);
  }
}

// 导出单例实例
export const wordlistAPI = new WordlistAPI();

// 导出类作为默认导出
export default WordlistAPI;