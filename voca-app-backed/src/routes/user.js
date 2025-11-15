const express = require('express');
const router = express.Router();

// 临时返回用户路由占位符
router.get('/profile', (req, res) => {
    res.json({ message: '用户路由开发中...' });
});

module.exports = router;