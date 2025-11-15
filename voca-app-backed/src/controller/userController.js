const Joi = require('joi');
const UserService = require('../service/userService');
const { asyncHandler } = require('../middleware/errorHandler');
const ResponseUtil = require('../utils/ResponseUtil');

/**
 * 用户控制器
 */
class UserController {
    /**
     * 获取用户信息
     */
    static getUserProfile = asyncHandler(async (req, res) => {
        const userId = req.user.userId;
        const userProfile = await UserService.getUserProfile(userId);

        res.json(ResponseUtil.success(userProfile, '获取用户信息成功'));
    });

    /**
     * 更新用户信息
     */
    static updateUserProfile = asyncHandler(async (req, res) => {
        const userId = req.user.userId;
        const updateData = req.body;

        const updatedProfile = await UserService.updateUserProfile(userId, updateData);

        res.json(ResponseUtil.success(updatedProfile, '更新用户信息成功'));
    });

    /**
     * 上传用户头像
     */
    static uploadAvatar = asyncHandler(async (req, res) => {
        const userId = req.user.userId;

        // TODO: 实现文件上传逻辑
        // 这里应该从req.file获取上传的文件，并保存到文件系统或云存储
        // 目前返回示例URL
        const avatarUrl = `/uploads/avatars/${userId}_${Date.now()}.jpg`;

        const updatedAvatar = await UserService.updateUserAvatar(userId, avatarUrl);

        res.json(ResponseUtil.success(updatedAvatar, '头像上传成功'));
    });

    /**
     * 获取学习统计
     */
    static getUserStats = asyncHandler(async (req, res) => {
        const userId = req.user.userId;
        const userStats = await UserService.getUserStats(userId);

        res.json(ResponseUtil.success(userStats, '获取学习统计成功'));
    });

    /**
     * 更新学习目标
     */
    static updateStudyGoal = asyncHandler(async (req, res) => {
        const userId = req.user.userId;
        const { studyGoal } = req.body;

        const updatedGoal = await UserService.updateStudyGoal(userId, studyGoal);

        res.json(ResponseUtil.success(updatedGoal, '学习目标更新成功'));
    });

    /**
     * 获取用户词单列表
     */
    static getUserWordLists = asyncHandler(async (req, res) => {
        const userId = req.user.userId;
        const { page = 1, limit = 10, type = 'all' } = req.query;

        const wordLists = await UserService.getUserWordLists(userId, {
            page: parseInt(page),
            limit: parseInt(limit),
            type
        });

        res.json(ResponseUtil.success(wordLists, '获取词单列表成功'));
    });
}

// 定义验证规则
const validationRules = {
    updateProfile: Joi.object({
        username: Joi.string().min(2).max(50).optional(),
        userProfile: Joi.string().max(200).optional(),
        studyGoal: Joi.number().min(1).max(100).optional()
    }),

    updateStudyGoal: Joi.object({
        studyGoal: Joi.number().min(1).max(100).required()
    }),

    getWordLists: Joi.object({
        page: Joi.number().min(1).optional(),
        limit: Joi.number().min(1).max(100).optional(),
        type: Joi.string().valid('all', 'system', 'custom').optional()
    })
};

module.exports = {
    UserController,
    validationRules
};