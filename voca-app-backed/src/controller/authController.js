const Joi = require('joi');
const AuthService = require('../service/authService');
const ResponseUtil = require('../utils/responseUtil');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * 认证控制器
 */
class AuthController {
    /**
     * 用户注册
     */
    static register = asyncHandler(async (req, res) => {
        const result = await AuthService.register(req.body);
        res.status(201).json(ResponseUtil.success(result, '注册成功'));
    });

    /**
     * 用户登录
     */
    static login = asyncHandler(async (req, res) => {
        const { email, password } = req.body;
        const result = await AuthService.login(email, password);
        res.json(ResponseUtil.success(result, '登录成功'));
    });

    /**
     * 刷新Token
     */
    static refreshToken = asyncHandler(async (req, res) => {
        const { refreshToken } = req.body;
        const result = await AuthService.refreshToken(refreshToken);
        res.json(ResponseUtil.success(result, 'Token刷新成功'));
    });

    /**
     * 发送邮箱验证码
     */
    static sendVerificationCode = asyncHandler(async (req, res) => {
        const { email } = req.body;
        const result = await AuthService.sendVerificationCode(email);
        res.json(ResponseUtil.success(result, '验证码发送成功'));
    });

    /**
     * 忘记密码
     */
    static forgotPassword = asyncHandler(async (req, res) => {
        const { email, code, newPassword } = req.body;
        const result = await AuthService.resetPassword(email, code, newPassword);
        res.json(ResponseUtil.success(result, '密码重置成功'));
    });

    /**
     * 退出登录
     */
    static logout = asyncHandler(async (req, res) => {
        const { userId } = req.user;
        const result = await AuthService.logout(userId);
        res.json(ResponseUtil.success(result, '退出登录成功'));
    });
}

// 定义验证规则
const validationRules = {
    register: Joi.object({
        username: Joi.string().min(2).max(50).optional(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).max(100).required(),
        confirmPassword: Joi.string().min(6).max(100).required(),
        code: Joi.string().required()
    }).custom((value, helpers) => {
        // 验证密码和确认密码是否一致
        if (value.password !== value.confirmPassword) {
            return helpers.error('custom.passwordMatch');
        }
        return value;
    }).messages({
        'custom.passwordMatch': '密码和确认密码不匹配'
    }),

    login: Joi.object({
        email: Joi.string().required(), // 支持邮箱或用户名
        password: Joi.string().min(6).max(100).required()
    }),

    refreshToken: Joi.object({
        refreshToken: Joi.string().required()
    }),

    sendCode: Joi.object({
        email: Joi.string().email().required()
    }),

    forgotPassword: Joi.object({
        email: Joi.string().email().required(),
        code: Joi.string().required(),
        newPassword: Joi.string().min(6).max(100).required()
    })
};

module.exports = {
    AuthController,
    validationRules
};