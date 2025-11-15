const express = require('express');
const router = express.Router();
const { LearningController, validationRules } = require('../controller/learningController');
const { authenticateToken } = require('../middleware/auth');
const { validateBody, validateQuery } = require('../middleware/validation');

// 所有学习路由都需要认证
router.use(authenticateToken);

// 获取学习模式
router.get('/mode', LearningController.getLearningModes);

// 开始学习会话
router.post('/session', validateBody(validationRules.startLearningSession), LearningController.startLearningSession);

// 获取下一个单词
router.get('/session/:sessionId/next', LearningController.getNextWord);

// 提交答案
router.post('/session/:sessionId/answer', validateBody(validationRules.submitAnswer), LearningController.submitAnswer);

// 结束学习会话
router.post('/session/:sessionId/complete', LearningController.completeLearningSession);

// 获取学习进度
router.get('/progress', LearningController.getLearningProgress);

// 获取学习历史
router.get('/history', validateQuery(validationRules.getLearningHistory), LearningController.getLearningHistory);

// 获取学习统计
router.get('/stats', validateQuery(validationRules.getLearningStats), LearningController.getLearningStats);

module.exports = router;