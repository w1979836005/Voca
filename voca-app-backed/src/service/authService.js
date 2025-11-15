const db = require('../model/index.js');
const CryptoUtil = require('../utils/CryptoUtil');
const JwtUtil = require('../utils/JwtUtil');
const { ConflictException, NotFoundException, AuthenticationException, BusinessException } = require('../exceptions/CustomException');

// 临时验证码存储（开发环境）
const verificationCodes = new Map();

/**
 * 认证服务类
 */
class AuthService {
    /**
     * 用户注册
     * @param {Object} userData - 用户数据
     * @param {String} userData.username - 用户名
     * @param {String} userData.email - 邮箱
     * @param {String} userData.password - 密码
     * @param {String} userData.confirmPassword - 确认密码
     * @param {String} userData.code - 邮箱验证码
     * @returns {Promise<Object>} 注册结果
     */
    static async register(userData) {
        const { username, email, password, confirmPassword, code } = userData;

        // 验证密码和确认密码是否一致（双重验证）
        if (password !== confirmPassword) {
            throw new BusinessException('密码和确认密码不匹配');
        }

        // 验证邮箱验证码
        const storedCode = verificationCodes.get(email);
        if (!storedCode || storedCode !== code) {
            throw new BusinessException('验证码错误');
        }

        // 验证成功后清除验证码
        verificationCodes.delete(email);

        // 检查邮箱是否已存在
        const existingUser = await db.user.findOne({ where: { email } });
        if (existingUser) {
            throw new ConflictException('邮箱已被注册');
        }

        // 加密密码
        const hashedPassword = await CryptoUtil.hashPassword(password);

        // 创建用户
        const user = await db.user.create({
            username: username || email.split('@')[0],
            email,
            password: hashedPassword,
            role: 'user',
            isBan: 0,
            isDelete: 0
        });

        // 生成Token
        const payload = {
            userId: user.id,
            username: user.username,
            email: user.email,
            role: user.role
        };

        const accessToken = JwtUtil.generateAccessToken(payload);
        const refreshToken = JwtUtil.generateRefreshToken({ userId: user.id });

        return {
            userId: user.id,
            username: user.username,
            email: user.email,
            userAvatar: user.userAvatar,
            studyGoal: user.studyGoal,
            role: user.role,
            token: accessToken,
            refreshToken
        };
    }

    /**
     * 用户登录
     * @param {String} email - 邮箱或用户名
     * @param {String} password - 密码
     * @returns {Promise<Object>} 登录结果
     */
    static async login(email, password) {
        // 查找用户（支持邮箱或用户名）
        const user = await db.user.findOne({
            where: {
                [db.Sequelize.Op.or]: [
                    { email },
                    { username: email }
                ],
                isDelete: 0
            }
        });
        if (!user) {
            throw new AuthenticationException('用户不存在或密码错误');
        }

        // 检查用户是否被禁用
        if (user.isBan) {
            throw new AuthenticationException('账户已被禁用');
        }

        // 验证密码
        const isPasswordValid = await CryptoUtil.verifyPassword(password, user.password);
        if (!isPasswordValid) {
            throw new AuthenticationException('用户不存在或密码错误');
        }

        // 生成Token
        const payload = {
            userId: user.id,
            username: user.username,
            email: user.email,
            role: user.role
        };

        const accessToken = JwtUtil.generateAccessToken(payload);
        const refreshToken = JwtUtil.generateRefreshToken({ userId: user.id });

        return {
            userId: user.id,
            username: user.username,
            email: user.email,
            userAvatar: user.userAvatar,
            userProfile: user.userProfile,
            studyGoal: user.studyGoal,
            role: user.role,
            currentWordListId: user.currentWordListId,
            token: accessToken,
            refreshToken
        };
    }

    /**
     * 刷新Token
     * @param {String} refreshToken - 刷新令牌
     * @returns {Promise<Object>} 新的Token
     */
    static async refreshToken(refreshToken) {
        // 验证刷新令牌
        const decoded = JwtUtil.verifyRefreshToken(refreshToken);

        // 查找用户
        const user = await db.user.findOne({ where: { id: decoded.userId, isDelete: 0 } });
        if (!user) {
            throw new AuthenticationException('用户不存在');
        }

        // 检查用户是否被禁用
        if (user.isBan) {
            throw new AuthenticationException('账户已被禁用');
        }

        // 生成新的访问令牌
        const payload = {
            userId: user.id,
            username: user.username,
            email: user.email,
            role: user.role
        };

        const newAccessToken = JwtUtil.generateAccessToken(payload);
        const newRefreshToken = JwtUtil.generateRefreshToken({ userId: user.id });

        return {
            token: newAccessToken,
            refreshToken: newRefreshToken
        };
    }

    /**
     * 发送邮箱验证码
     * @param {String} email - 邮箱地址
     * @returns {Promise<Object>} 发送结果
     */
    static async sendVerificationCode(email) {
        // 生成验证码
        const verificationCode = CryptoUtil.generateVerificationCode(6);

        // 存储验证码（开发环境使用内存存储）
        verificationCodes.set(email, verificationCode);

        // TODO: 实际项目中应该调用邮件服务
        // await EmailService.sendVerificationCode(email, verificationCode);

        console.log(`验证码已发送到 ${email}: ${verificationCode}`);

        return {
            email,
            message: '验证码发送成功',
            // 开发环境下返回验证码，生产环境不应该返回
            verificationCode: process.env.NODE_ENV === 'development' ? verificationCode : undefined
        };
    }

    /**
     * 重置密码
     * @param {String} email - 邮箱
     * @param {String} code - 验证码
     * @param {String} newPassword - 新密码
     * @returns {Promise<Object>} 重置结果
     */
    static async resetPassword(email, code, newPassword) {
        // 验证邮箱验证码
        const storedCode = verificationCodes.get(email);
        if (!storedCode || storedCode !== code) {
            throw new BusinessException('验证码错误');
        }

        // 验证成功后清除验证码
        verificationCodes.delete(email);

        // 查找用户
        const user = await db.user.findOne({ where: { email, isDelete: 0 } });
        if (!user) {
            throw new NotFoundException('用户不存在');
        }

        // 加密新密码
        const hashedPassword = await CryptoUtil.hashPassword(newPassword);

        // 更新密码
        await user.update({ password: hashedPassword });

        return { message: '密码重置成功' };
    }

    /**
     * 用户退出登录
     * @param {Number} userId - 用户ID
     * @returns {Promise<Object>} 退出结果
     */
    static async logout(userId) {
        // 这里可以将Token加入黑名单
        // 或者清理相关的缓存

        return { message: '退出登录成功' };
    }
}

module.exports = AuthService;