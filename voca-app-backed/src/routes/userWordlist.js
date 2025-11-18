const express = require('express');
const router = express.Router();
const { WordListController, validationRules } = require('../controller/wordListController');
const { authenticateToken } = require('../middleware/auth');
const { validateBody } = require('../middleware/validation');

/**
 * 用户词单管理相关路由
 * 所有操作都需要用户认证
 */

// 添加认证中间件
router.use(authenticateToken);

// 获取用户已添加的词单列表 - 需要认证
router.get('/my', WordListController.getMyWordLists);

// 添加词单到用户词单列表 - 需要认证
router.post('/', validateBody(validationRules.addUserWordList), WordListController.addUserWordList);

// 从用户词单列表移除词单 - 需要认证
router.delete('/:wordListId', WordListController.removeUserWordList);

module.exports = router;