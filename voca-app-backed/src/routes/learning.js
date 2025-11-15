const express = require('express');
const router = express.Router();

// 临时返回学习路由占位符
router.get('/', (req, res) => {
    res.json({ message: '学习路由开发中...' });
});

module.exports = router;