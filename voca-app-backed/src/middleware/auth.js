const JwtUtil = require('../utils/JwtUtil');
const { AuthenticationException, AuthorizationException } = require('../exceptions/CustomException');

/**
 * JWT 认证中间件
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 下一个中间件函数
 */
const authenticateToken = (req, res, next) => {
    try {
        const token = JwtUtil.extractToken(req);

        if (!token) {
            throw new AuthenticationException('缺少认证 Token');
        }

        const decoded = JwtUtil.verifyAccessToken(token);

        // 将用户信息添加到请求对象中
        req.user = {
            userId: decoded.userId,
            username: decoded.username,
            email: decoded.email,
            role: decoded.role
        };

        next();
    } catch (error) {
        next(error);
    }
};

/**
 * 角色授权中间件
 * @param {Array} allowedRoles - 允许的角色列表
 * @returns {Function} 中间件函数
 */
const authorizeRoles = (allowedRoles = []) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                throw new AuthenticationException('用户未认证');
            }

            if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
                throw new AuthorizationException('权限不足');
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};

/**
 * 管理员权限中间件
 */
const requireAdmin = authorizeRoles(['admin']);

/**
 * 可选认证中间件（不强制要求登录）
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 下一个中间件函数
 */
const optionalAuth = (req, res, next) => {
    try {
        const token = JwtUtil.extractToken(req);

        if (token) {
            const decoded = JwtUtil.verifyAccessToken(token);
            req.user = {
                userId: decoded.userId,
                username: decoded.username,
                email: decoded.email,
                role: decoded.role
            };
        }

        next();
    } catch (error) {
        // 可选认证失败时不抛出异常，继续执行
        next();
    }
};

/**
 * 检查用户是否为资源所有者或管理员
 * @param {String} userIdField - 用户ID字段名，默认 'userId'
 * @returns {Function} 中间件函数
 */
const requireOwnershipOrAdmin = (userIdField = 'userId') => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                throw new AuthenticationException('用户未认证');
            }

            const resourceUserId = req.params[userIdField] || req.body[userIdField];

            // 检查是否为资源所有者或管理员
            if (req.user.userId !== parseInt(resourceUserId) && req.user.role !== 'admin') {
                throw new AuthorizationException('只能访问自己的资源');
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};

module.exports = {
    authenticateToken,
    authorizeRoles,
    requireAdmin,
    optionalAuth,
    requireOwnershipOrAdmin
};