const jwt = require('jsonwebtoken');
const { AuthenticationException } = require('../exceptions/customException');

/**
 * JWT 工具类
 */
class JwtUtil {
    /**
     * 生成访问令牌
     * @param {Object} payload - 载荷数据
     * @param {Number} expiresIn - 过期时间（秒）
     * @returns {String} JWT Token
     */
    static generateAccessToken(payload, expiresIn = 24 * 60 * 60) {
        return jwt.sign(payload, process.env.JWT_SECRET || 'your-secret-key', {
            expiresIn,
            issuer: 'voca-app',
            audience: 'voca-users'
        });
    }

    /**
     * 生成刷新令牌
     * @param {Object} payload - 载荷数据
     * @returns {String} JWT Refresh Token
     */
    static generateRefreshToken(payload) {
        return jwt.sign(payload, process.env.JWT_REFRESH_SECRET || 'your-refresh-secret', {
            expiresIn: '7d', // 7天有效期
            issuer: 'voca-app',
            audience: 'voca-users'
        });
    }

    /**
     * 验证访问令牌
     * @param {String} token - JWT Token
     * @returns {Object} 解析后的载荷数据
     */
    static verifyAccessToken(token) {
        try {
            return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', {
                issuer: 'voca-app',
                audience: 'voca-users'
            });
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                throw new AuthenticationException('Token 已过期');
            } else if (error.name === 'JsonWebTokenError') {
                throw new AuthenticationException('Token 无效');
            } else {
                throw new AuthenticationException('Token 验证失败');
            }
        }
    }

    /**
     * 验证刷新令牌
     * @param {String} refreshToken - JWT Refresh Token
     * @returns {Object} 解析后的载荷数据
     */
    static verifyRefreshToken(refreshToken) {
        try {
            return jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'your-refresh-secret', {
                issuer: 'voca-app',
                audience: 'voca-users'
            });
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                throw new AuthenticationException('RefreshToken 已过期');
            } else if (error.name === 'JsonWebTokenError') {
                throw new AuthenticationException('RefreshToken 无效');
            } else {
                throw new AuthenticationException('RefreshToken 验证失败');
            }
        }
    }

    /**
     * 从请求头中提取 Token
     * @param {Object} req - 请求对象
     * @returns {String|null} Token 或 null
     */
    static extractToken(req) {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            return authHeader.substring(7);
        }
        return null;
    }

    /**
     * 解析 Token 载荷（不验证签名）
     * @param {String} token - JWT Token
     * @returns {Object} 解析后的载荷数据
     */
    static decodeToken(token) {
        try {
            return jwt.decode(token);
        } catch (error) {
            throw new AuthenticationException('Token 解析失败');
        }
    }

    /**
     * 检查 Token 是否即将过期
     * @param {String} token - JWT Token
     * @param {Number} thresholdMinutes - 阈值分钟数
     * @returns {Boolean} 是否即将过期
     */
    static isTokenExpiringSoon(token, thresholdMinutes = 30) {
        try {
            const decoded = this.decodeToken(token);
            const now = Date.now() / 1000;
            const threshold = thresholdMinutes * 60;
            return (decoded.exp - now) < threshold;
        } catch (error) {
            return true; // 如果解析失败，认为已过期
        }
    }
}

module.exports = JwtUtil;