const express = require('express');
const router = express.Router();
const { WordListController, validationRules } = require('../controller/wordListController');
const { authenticateToken } = require('../middleware/auth');
const { validateBody, validateQuery } = require('../middleware/validation');

// 获取词单列表（公开接口）
router.get('/', validateQuery(validationRules.getWordLists), WordListController.getWordLists);

// 获取词单详情（公开接口）
router.get('/:id', WordListController.getWordListDetail);

// 获取词单中的单词（公开接口）
router.get('/:id/words', validateQuery(validationRules.getWordsInWordList), WordListController.getWordsInWordList);

// 需要认证的路由
router.use(authenticateToken);

// 创建词单
router.post('/', validateBody(validationRules.createWordList), WordListController.createWordList);

// 更新词单
router.put('/:id', validateBody(validationRules.updateWordList), WordListController.updateWordList);

// 删除词单
router.delete('/:id', WordListController.deleteWordList);

// 添加单词到词单
router.post('/:id/words', validateBody(validationRules.addWordsToWordList), WordListController.addWordsToWordList);

// 从词单移除单词
router.delete('/:id/words/:wordId', WordListController.removeWordFromWordList);

module.exports = router;