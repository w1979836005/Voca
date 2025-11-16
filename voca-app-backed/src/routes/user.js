const express = require('express');
const router = express.Router();
const { UserController, validationRules } = require('../controller/userController');
const { authenticateToken } = require('../middleware/auth');
const { validateBody, validateQuery } = require('../middleware/validation');
const { uploadAvatar, uploadErrorHandler } = require('../middleware/upload');

/**
 * 用户相关路由
 * 所有路由都需要认证中间件
 */

// 获取用户信息 - 不需要验证参数，只需要认证
router.get('/profile', authenticateToken, UserController.getUserProfile);

// 更新用户信息 - 需要验证请求体
router.put('/profile', authenticateToken, validateBody(validationRules.updateProfile), UserController.updateUserProfile);

// 上传头像 - 需要认证和文件上传中间件
router.post('/avatar',
    authenticateToken,
    uploadAvatar,
    UserController.uploadAvatar
);

// 获取学习统计 - 不需要验证参数，只需要认证
router.get('/stats', authenticateToken, UserController.getUserStats);

// 更新学习目标 - 需要验证请求体
router.put('/study-goal', authenticateToken, validateBody(validationRules.updateStudyGoal), UserController.updateStudyGoal);

// 获取用户词单列表 - 需要验证查询参数
router.get('/wordlists', authenticateToken, validateQuery(validationRules.getWordLists), UserController.getUserWordLists);

module.exports = router;