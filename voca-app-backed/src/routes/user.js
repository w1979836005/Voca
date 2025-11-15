const express = require('express');
const router = express.Router();
const { UserController, validationRules } = require('../controller/userController');
const { authenticateToken } = require('../middleware/auth');
const { validateBody, validateQuery } = require('../middleware/validation');

// 用户信息相关路由
router.get('/profile', authenticateToken, UserController.getUserProfile);
router.put('/profile', authenticateToken, validateBody(validationRules.updateProfile), UserController.updateUserProfile);

// 头像上传路由
router.post('/avatar', authenticateToken, UserController.uploadAvatar);

// 学习统计相关路由
router.get('/stats', authenticateToken, UserController.getUserStats);
router.put('/study-goal', authenticateToken, validateBody(validationRules.updateStudyGoal), UserController.updateStudyGoal);

// 用户词单相关路由
router.get('/wordlists', authenticateToken, validateQuery(validationRules.getWordLists), UserController.getUserWordLists);

module.exports = router;