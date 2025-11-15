const bcrypt = require('bcryptjs');
const { BusinessException } = require('../exceptions/CustomException');

/**
 * 加密工具类
 */
class CryptoUtil {
    /**
     * 生成密码哈希
     * @param {String} password - 明文密码
     * @param {Number} saltRounds - 盐的轮数，默认10
     * @returns {Promise<String>} 密码哈希
     */
    static async hashPassword(password, saltRounds = 10) {
        try {
            return await bcrypt.hash(password, saltRounds);
        } catch (error) {
            throw new BusinessException('密码加密失败');
        }
    }

    /**
     * 验证密码
     * @param {String} password - 明文密码
     * @param {String} hashedPassword - 哈希密码
     * @returns {Promise<Boolean>} 验证结果
     */
    static async verifyPassword(password, hashedPassword) {
        try {
            return await bcrypt.compare(password, hashedPassword);
        } catch (error) {
            throw new BusinessException('密码验证失败');
        }
    }

    /**
     * 生成随机字符串
     * @param {Number} length - 字符串长度
     * @returns {String} 随机字符串
     */
    static generateRandomString(length = 32) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    /**
     * 生成数字验证码
     * @param {Number} length - 验证码长度，默认6位
     * @returns {String} 数字验证码
     */
    static generateVerificationCode(length = 6) {
        let result = '';
        for (let i = 0; i < length; i++) {
            result += Math.floor(Math.random() * 10);
        }
        return result;
    }

    /**
     * 生成UUID
     * @returns {String} UUID
     */
    static generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
}

module.exports = CryptoUtil;