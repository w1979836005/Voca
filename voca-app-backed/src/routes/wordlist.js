const express = require('express');
const router = express.Router();
const { WordListController, validationRules } = require('../controller/wordListController');
const { authenticateToken } = require('../middleware/auth');
const { validateBody, validateQuery } = require('../middleware/validation');

/**
 * 词单相关路由
 * 获取词单列表不需要认证，其他操作需要认证
 */

// 获取词单列表 - 公开接口，支持分页和搜索
router.get('/', validateQuery(validationRules.getWordLists), WordListController.getWordLists);

// 获取词单详情 - 公开接口
router.get('/:id', WordListController.getWordListDetail);

// 获取词单中的单词 - 公开接口
router.get('/:id/words', validateQuery(validationRules.getWordsInWordList), WordListController.getWordsInWordList);

// 以下操作需要用户认证
router.use(authenticateToken);

// 获取用户的词单列表（包含用户是否已添加的状态）- 需要认证
router.get('/user', validateQuery(validationRules.getWordLists), WordListController.getUserWordLists);

// 创建词单 - 需要认证
router.post('/', validateBody(validationRules.createWordList), WordListController.createWordList);

// 更新词单 - 需要认证
router.put('/:id', validateBody(validationRules.updateWordList), WordListController.updateWordList);

// 删除词单 - 需要认证
router.delete('/:id', WordListController.deleteWordList);

// 添加单词到词单 - 需要认证
router.post('/:id/words', validateBody(validationRules.addWordsToWordList), WordListController.addWordsToWordList);

// 从词单移除单词 - 需要认证
router.delete('/:id/words/:wordId', WordListController.removeWordFromWordList);

module.exports = router;