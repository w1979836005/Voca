const express = require('express');
const router = express.Router();
const db = require('../model/index.js');

/**
 * 测试用户模型
 */
router.get('/users', async (req, res) => {
    try {
        const users = await db.user.findAll({
            attributes: { exclude: ['isDelete'] }
        });
        res.json({
            code: 200,
            message: '获取用户列表成功',
            data: users
        });
    } catch (error) {
        res.status(500).json({
            code: 500,
            message: '获取用户列表失败',
            error: error.message
        });
    }
});

/**
 * 测试词单模型
 */
router.get('/wordlists', async (req, res) => {
    try {
        const wordlists = await db.wordlist.scope('active').findAll();
        res.json({
            code: 200,
            message: '获取词单列表成功',
            data: wordlists
        });
    } catch (error) {
        res.status(500).json({
            code: 500,
            message: '获取词单列表失败',
            error: error.message
        });
    }
});

/**
 * 测试单词模型
 */
router.get('/words', async (req, res) => {
    try {
        const words = await db.word.scope('active').findAll({
            attributes: { exclude: ['isDelete'] }
        });
        res.json({
            code: 200,
            message: '获取单词列表成功',
            data: words
        });
    } catch (error) {
        res.status(500).json({
            code: 500,
            message: '获取单词列表失败',
            error: error.message
        });
    }
});

/**
 * 测试关联查询 - 获取词单及其包含的单词
 */
router.get('/wordlists-with-words', async (req, res) => {
    try {
        const wordlists = await db.wordlist.findAll({
            include: [{
                model: db.word,
                as: 'words',
                through: { attributes: [] }, // 排除中间表的属性
                required: false // LEFT JOIN
            }],
            where: { isDelete: 0 }
        });

        res.json({
            code: 200,
            message: '获取词单及单词列表成功',
            data: wordlists
        });
    } catch (error) {
        res.status(500).json({
            code: 500,
            message: '获取词单及单词列表失败',
            error: error.message
        });
    }
});

/**
 * 创建测试用户
 */
router.post('/create-user', async (req, res) => {
    try {
        const { username, email } = req.body;

        if (!username || !email) {
            return res.status(400).json({
                code: 400,
                message: '用户名和邮箱不能为空'
            });
        }

        const user = await db.user.create({
            username,
            email
        });

        res.status(201).json({
            code: 201,
            message: '用户创建成功',
            data: user
        });
    } catch (error) {
        res.status(500).json({
            code: 500,
            message: '用户创建失败',
            error: error.message
        });
    }
});

module.exports = router;