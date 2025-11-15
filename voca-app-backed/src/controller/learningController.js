const Joi = require('joi');
const LearningService = require('../service/learningService');
const { asyncHandler } = require('../middleware/errorHandler');
const ResponseUtil = require('../utils/ResponseUtil');

/**
 * 学习控制器
 */
class LearningController {
    /**
     * 获取学习模式
     */
    static getLearningModes = asyncHandler(async (req, res) => {
        const userId = req.user.userId;
        const modes = await LearningService.getLearningModes(userId);

        res.json(ResponseUtil.success(modes, '获取学习模式成功'));
    });

    /**
     * 开始学习会话
     */
    static startLearningSession = asyncHandler(async (req, res) => {
        const userId = req.user.userId;
        const sessionData = req.body;

        const session = await LearningService.startLearningSession(userId, sessionData);

        res.json(ResponseUtil.success(session, '开始学习会话成功'));
    });

    /**
     * 获取下一个单词
     */
    static getNextWord = asyncHandler(async (req, res) => {
        const { sessionId } = req.params;
        const userId = req.user.userId;

        const nextWord = await LearningService.getNextWord(sessionId, userId);

        res.json(ResponseUtil.success(nextWord, '获取下一个单词成功'));
    });

    /**
     * 提交答案
     */
    static submitAnswer = asyncHandler(async (req, res) => {
        const { sessionId } = req.params;
        const userId = req.user.userId;
        const answerData = req.body;

        const result = await LearningService.submitAnswer(sessionId, userId, answerData);

        res.json(ResponseUtil.success(result, '提交答案成功'));
    });

    /**
     * 结束学习会话
     */
    static completeLearningSession = asyncHandler(async (req, res) => {
        const { sessionId } = req.params;
        const userId = req.user.userId;

        const result = await LearningService.completeLearningSession(sessionId, userId);

        res.json(ResponseUtil.success(result, '学习会话完成'));
    });

    /**
     * 获取学习进度
     */
    static getLearningProgress = asyncHandler(async (req, res) => {
        const userId = req.user.userId;

        const progress = await LearningService.getLearningProgress(userId);

        res.json(ResponseUtil.success(progress, '获取学习进度成功'));
    });

    /**
     * 获取学习历史
     */
    static getLearningHistory = asyncHandler(async (req, res) => {
        const userId = req.user.userId;
        const { page, limit, startDate, endDate } = req.query;

        const history = await LearningService.getLearningHistory(userId, {
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 20,
            startDate,
            endDate
        });

        res.json(ResponseUtil.success(history, '获取学习历史成功'));
    });

    /**
     * 获取学习统计
     */
    static getLearningStats = asyncHandler(async (req, res) => {
        const userId = req.user.userId;
        const { period = 'weekly' } = req.query;

        const stats = await LearningService.getLearningStats(userId, period);

        res.json(ResponseUtil.success(stats, '获取学习统计成功'));
    });
}

// 定义验证规则
const validationRules = {
    startLearningSession: Joi.object({
        wordListId: Joi.number().integer().positive().required(),
        mode: Joi.string().valid('word_meaning', 'meaning_word', 'spelling', 'listening').optional(),
        wordCount: Joi.number().integer().min(1).max(100).optional()
    }),

    submitAnswer: Joi.object({
        wordId: Joi.number().integer().positive().required(),
        answer: Joi.string().required(),
        timeSpent: Joi.number().integer().min(0).optional()
    }),

    getLearningHistory: Joi.object({
        page: Joi.number().min(1).optional(),
        limit: Joi.number().min(1).max(100).optional(),
        startDate: Joi.date().optional(),
        endDate: Joi.date().optional()
    }),

    getLearningStats: Joi.object({
        period: Joi.string().valid('daily', 'weekly', 'monthly').optional()
    })
};

module.exports = {
    LearningController,
    validationRules
};