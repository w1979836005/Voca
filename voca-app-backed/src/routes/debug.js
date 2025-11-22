const express = require('express');
const router = express.Router();
const db = require('../model/index.js');
const { asyncHandler } = require('../middleware/errorHandler');
const ResponseUtil = require('../utils/responseUtil');

/**
 * 调试路由 - 检查数据库表结构
 */
router.get('/check-table-structure', asyncHandler(async (req, res) => {
    console.log('=== 检查表结构 ===');

    try {
        // 检查 word_list_word 表结构
        const tableStructure = await db.sequelize.query(`
            DESCRIBE word_list_word
        `, {
            type: db.Sequelize.QueryTypes.SELECT
        });

        console.log('word_list_word 表结构:', JSON.stringify(tableStructure, null, 2));

        // 检查实际的表名
        const tables = await db.sequelize.query(`
            SHOW TABLES LIKE '%word%'
        `, {
            type: db.Sequelize.QueryTypes.SELECT
        });

        console.log('包含word的表:', JSON.stringify(tables, null, 2));

        // 检查word表结构
        const wordTableStructure = await db.sequelize.query(`
            DESCRIBE word
        `, {
            type: db.Sequelize.QueryTypes.SELECT
        });

        console.log('word表结构:', JSON.stringify(wordTableStructure, null, 2));

        return res.json(ResponseUtil.success({
            tableStructure,
            wordTableStructure,
            tables
        }, '表结构检查完成'));

    } catch (error) {
        console.error('检查表结构失败:', error);
        return res.json(ResponseUtil.error('检查表结构失败: ' + error.message));
    }
}));

/**
 * 调试路由 - 检查音频数据
 */
router.get('/check-audio', asyncHandler(async (req, res) => {
    console.log('=== 检查音频数据 ===');

    try {
        // 检查单词表中的音频字段
        const words = await db.word.findAll({
            attributes: ['id', 'word', 'audioUrl'],
            limit: 10
        });

        console.log('单词音频数据:', JSON.stringify(words, null, 2));

        // 检查是否有音频文件
        const wordsWithAudio = words.filter(w => w.audioUrl && w.audioUrl.trim() !== '');
        console.log(`有音频的单词数量: ${wordsWithAudio.length}/${words.length}`);

        if (wordsWithAudio.length > 0) {
            console.log('音频URL示例:');
            wordsWithAudio.forEach((w, index) => {
                console.log(`${index + 1}. ${w.word}: ${w.audioUrl}`);
            });
        }

        return res.json(ResponseUtil.success({
            totalWords: words.length,
            wordsWithAudio: wordsWithAudio.length,
            audioExamples: wordsWithAudio.slice(0, 3).map(w => ({
                word: w.word,
                audioUrl: w.audioUrl
            }))
        }, '音频数据检查完成'));

    } catch (error) {
        console.error('检查音频数据失败:', error);
        return res.json(ResponseUtil.error('检查音频数据失败: ' + error.message));
    }
}));

/**
 * 调试路由 - 检查数据库数据
 */
router.get('/check-data', asyncHandler(async (req, res) => {
    console.log('=== 数据库调试信息 ===');

    // 检查词单表
    const wordlists = await db.wordlist.findAll({
        attributes: ['id', 'wordListName', 'isDelete'],
        limit: 10
    });
    console.log('词单数据:', JSON.stringify(wordlists, null, 2));

    // 检查单词表
    const words = await db.word.findAll({
        attributes: ['id', 'word', 'definition', 'isDelete'],
        limit: 10
    });
    console.log('单词数据:', JSON.stringify(words, null, 2));

    // 检查关联表
    const associations = await db.word_list_word.findAll({
        attributes: ['id', 'wordListId', 'wordId'],
        limit: 10
    });
    console.log('关联表数据:', JSON.stringify(associations, null, 2));

    // 检查词单1的单词数量
    const wordlist1Words = await db.word_list_word.findAll({
        where: {
            wordListId: 1
        }
    });
    console.log(`词单1的关联单词数量: ${wordlist1Words.length}`);

    // 获取词单1的详细单词信息
    if (wordlist1Words.length > 0) {
        const wordIds = wordlist1Words.map(item => item.wordId);
        const detailedWords = await db.word.findAll({
            where: {
                id: wordIds,
                isDelete: 0
            }
        });
        console.log(`词单1的详细单词:`, JSON.stringify(detailedWords, null, 2));

        const result = await db.word.findAndCountAll({
            include: [{
                model: db.wordlist,
                through: { where: { wordListId: 1 } },
                where: { isDelete: 0 }
            }],
            limit: 10
        });

        console.log(`最终查询结果:`, {
            total: result.count,
            words: result.rows.map(word => ({
                wordId: word.id,
                word: word.word,
                pronunciation: word.phonetic,
                definition: word.definition,
                example: word.exampleSentence,
                affixes: word.affixes,
                difficulty: word.difficulty
            }))
        });

        return res.json(ResponseUtil.success({
            wordlists: wordlists.length,
            words: words.length,
            associations: associations.length,
            wordlist1Associations: wordlist1Words.length,
            finalQueryResult: {
                total: result.count,
                words: result.rows.length
            }
        }, '数据检查完成'));
    }

    return res.json(ResponseUtil.success({
        wordlists: wordlists.length,
        words: words.length,
        associations: associations.length,
        wordlist1Associations: 0,
        message: '词单1没有关联的单词'
    }, '数据检查完成'));
}));

module.exports = router;