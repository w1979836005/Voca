const express = require('express');
const router = express.Router();
const { AuthController, validationRules } = require('../controller/authController');
const { validateBody } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');

/**
 * 认证相关路由
 */

// 用户注册
router.post('/register',
    validateBody(validationRules.register),
    AuthController.register
);

// 用户登录
router.post('/login',
    validateBody(validationRules.login),
    AuthController.login
);

// 刷新Token
router.post('/refresh',
    validateBody(validationRules.refreshToken),
    AuthController.refreshToken
);

// 发送邮箱验证码
router.post('/send-code',
    validateBody(validationRules.sendCode),
    AuthController.sendVerificationCode
);

// 忘记密码
router.post('/forgot-password',
    validateBody(validationRules.forgotPassword),
    AuthController.forgotPassword
);

// 退出登录
router.post('/logout',
    authenticateToken,
    AuthController.logout
);

module.exports = router;