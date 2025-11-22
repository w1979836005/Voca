const Joi = require('joi');
const WordListService = require('../service/wordListService');
const { asyncHandler } = require('../middleware/errorHandler');
const ResponseUtil = require('../utils/responseUtil');

/**
 * 词单控制器
 */
class WordListController {
    /**
     * 获取词单列表
     */
    static getWordLists = asyncHandler(async (req, res) => {
        const { page, limit, type, search } = req.query;
        // 从认证信息中获取用户ID（如果已认证）
        const userId = req.user?.userId || null;

        const wordLists = await WordListService.getWordLists({
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 10,
            type: type || 'all',
            search: search || '',
            userId: userId
        });

        res.json(ResponseUtil.success(wordLists, '获取词单列表成功'));
    });

    /**
     * 获取词单详情
     */
    static getWordListDetail = asyncHandler(async (req, res) => {
        const { id } = req.params;
        // 从认证信息中获取用户ID（如果已认证）
        const userId = req.user?.userId || null;

        const wordList = await WordListService.getWordListDetail(parseInt(id), userId);

        res.json(ResponseUtil.success(wordList, '获取词单详情成功'));
    });

    /**
     * 获取用户的词单列表（包含用户是否已添加的状态）
     */
    static getUserWordLists = asyncHandler(async (req, res) => {
        const userId = req.user.userId;
        const { page, limit, type, search } = req.query;

        const wordLists = await WordListService.getUserWordLists(userId, {
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 10,
            type: type || 'all',
            search: search || ''
        });

        res.json(ResponseUtil.success(wordLists, '获取用户词单列表成功'));
    });

    /**
     * 创建词单
     */
    static createWordList = asyncHandler(async (req, res) => {
        const userId = req.user.userId;
        const wordListData = req.body;

        const wordList = await WordListService.createWordList(wordListData, userId);

        res.json(ResponseUtil.success(wordList, '创建词单成功'));
    });

    /**
     * 更新词单
     */
    static updateWordList = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const userId = req.user.userId;
        const updateData = req.body;

        const wordList = await WordListService.updateWordList(parseInt(id), updateData, userId);

        res.json(ResponseUtil.success(wordList, '更新词单成功'));
    });

    /**
     * 删除词单
     */
    static deleteWordList = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const userId = req.user.userId;

        const result = await WordListService.deleteWordList(parseInt(id), userId);

        res.json(ResponseUtil.success(result, '删除词单成功'));
    });

    /**
     * 获取词单中的单词
     */
    static getWordsInWordList = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { page, limit } = req.query;

        const words = await WordListService.getWordsInWordList(parseInt(id), {
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 20
        });

        res.json(ResponseUtil.success(words, '获取词单单词成功'));
    });

    /**
     * 添加单词到词单
     */
    static addWordsToWordList = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const userId = req.user.userId;
        const { wordIds } = req.body;

        const result = await WordListService.addWordsToWordList(parseInt(id), wordIds, userId);

        res.json(ResponseUtil.success(result, '添加单词成功'));
    });

    /**
     * 从词单移除单词
     */
    static removeWordFromWordList = asyncHandler(async (req, res) => {
        const { id, wordId } = req.params;
        const userId = req.user.userId;

        const result = await WordListService.removeWordFromWordList(parseInt(id), parseInt(wordId), userId);

        res.json(ResponseUtil.success(result, '移除单词成功'));
    });

    /**
     * 添加词单到用户词单列表
     */
    static addUserWordList = asyncHandler(async (req, res) => {
        const userId = req.user.userId;
        const { wordListId } = req.body;

        const result = await WordListService.addUserWordList(parseInt(wordListId), userId);

        res.json(ResponseUtil.success(result, '添加词单成功'));
    });

    /**
     * 从用户词单列表移除词单
     */
    static removeUserWordList = asyncHandler(async (req, res) => {
        const userId = req.user.userId;
        const { wordListId } = req.params;

        const result = await WordListService.removeUserWordList(parseInt(wordListId), userId);

        res.json(ResponseUtil.success(result, '移除词单成功'));
    });

    /**
     * 获取用户已添加的词单列表（仅返回已添加的词单）
     */
    static getMyWordLists = asyncHandler(async (req, res) => {
        const userId = req.user.userId;
        const { page, limit, search } = req.query;

        const wordLists = await WordListService.getMyWordLists(userId, {
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 50, // 默认返回更多，用于弹窗选择
            search: search || ''
        });

        res.json(ResponseUtil.success(wordLists, '获取我的词单列表成功'));
    });
}

// 定义验证规则
const validationRules = {
    createWordList: Joi.object({
        wordListName: Joi.string().min(1).max(100).required(),
        description: Joi.string().max(500).optional()
    }),

    updateWordList: Joi.object({
        wordListName: Joi.string().min(1).max(100).optional(),
        description: Joi.string().max(500).optional()
    }),

    getWordLists: Joi.object({
        page: Joi.number().min(1).optional(),
        limit: Joi.number().min(1).max(100).optional(),
        type: Joi.string().valid('all', 'system', 'custom').optional(),
        search: Joi.string().max(50).allow('').optional()
    }).unknown(true),

    getUserWordLists: Joi.object({
        page: Joi.number().min(1).optional(),
        limit: Joi.number().min(1).max(100).optional(),
        type: Joi.string().valid('all', 'system', 'custom').optional(),
        search: Joi.string().max(50).allow('').optional()
    }).unknown(true),

    getWordsInWordList: Joi.object({
        page: Joi.number().min(1).optional(),
        limit: Joi.number().min(1).max(100).optional()
    }).unknown(true),

    addWordsToWordList: Joi.object({
        wordIds: Joi.array().items(Joi.number().integer().positive()).min(1).max(100).required()
    }),

    addUserWordList: Joi.object({
        wordListId: Joi.number().integer().positive().required()
    })
};

module.exports = {
    WordListController,
    validationRules
};