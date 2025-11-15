const express = require('express');
const router = express.Router();

// 临时返回词单路由占位符
router.get('/', (req, res) => {
    res.json({ message: '词单路由开发中...' });
});

module.exports = router;