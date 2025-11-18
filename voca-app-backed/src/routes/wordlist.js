const express = require('express');
const router = express.Router();
const { WordListController, validationRules } = require('../controller/wordListController');
const { authenticateToken } = require('../middleware/auth');
const { validateBody, validateQuery } = require('../middleware/validation');

/**
 * 词单相关路由
 * 获取词单列表不需要认证，其他操作需要认证
 */

// 添加可选认证中间件 - 如果提供了token则认证，没有则不认证
router.use((req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token) {
        const { authenticateToken } = require('../middleware/auth');
        authenticateToken(req, res, (err) => {
            if (err) {
                // 如果认证失败，仍然继续处理请求，但不设置用户信息
                req.user = null;
            }
            next();
        });
    } else {
        next();
    }
});

// 获取词单列表 - 支持可选认证，有token时返回joined状态
router.get('/', validateQuery(validationRules.getWordLists), WordListController.getWordLists);

// 获取词单详情 - 支持可选认证，有token时返回joined状态
router.get('/:id', WordListController.getWordListDetail);

// 获取词单中的单词 - 公开接口
router.get('/:id/words', validateQuery(validationRules.getWordsInWordList), WordListController.getWordsInWordList);

// 以下操作需要严格用户认证
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

// 添加词单到用户词单列表 - 需要认证
router.post('/user-wordlist', validateBody(validationRules.addUserWordList), WordListController.addUserWordList);

// 从用户词单列表移除词单 - 需要认证
router.delete('/user-wordlist/:wordListId', WordListController.removeUserWordList);

module.exports = router;