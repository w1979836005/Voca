const db = require('../model/index.js');
const CryptoUtil = require('../utils/CryptoUtil');
const { NotFoundException, BusinessException } = require('../exceptions/CustomException');

/**
 * 用户服务类
 */
class UserService {
    /**
     * 获取用户信息
     * @param {Number} userId - 用户ID
     * @returns {Promise<Object>} 用户信息
     */
    static async getUserProfile(userId) {
        const user = await db.user.findOne({
            where: { id: userId, isDelete: 0 },
            attributes: { exclude: ['password'] }
        });

        if (!user) {
            throw new NotFoundException('用户不存在');
        }

        return {
            userId: user.id,
            username: user.username,
            email: user.email,
            userAvatar: user.userAvatar,
            userProfile: user.userProfile,
            studyGoal: user.studyGoal,
            role: user.role,
            currentWordListId: user.currentWordListId,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };
    }

    /**
     * 更新用户信息
     * @param {Number} userId - 用户ID
     * @param {Object} updateData - 更新数据
     * @returns {Promise<Object>} 更新结果
     */
    static async updateUserProfile(userId, updateData) {
        const user = await db.user.findOne({
            where: { id: userId, isDelete: 0 }
        });

        if (!user) {
            throw new NotFoundException('用户不存在');
        }

        // 过滤允许更新的字段
        const allowedFields = ['username', 'userProfile', 'studyGoal'];
        const filteredData = {};

        for (const field of allowedFields) {
            if (updateData[field] !== undefined) {
                filteredData[field] = updateData[field];
            }
        }

        // 如果更新用户名，检查是否重复
        if (filteredData.username && filteredData.username !== user.username) {
            const existingUser = await db.user.findOne({
                where: {
                    username: filteredData.username,
                    id: { [db.Sequelize.Op.ne]: userId },
                    isDelete: 0
                }
            });

            if (existingUser) {
                throw new BusinessException('用户名已被使用');
            }
        }

        await user.update(filteredData);

        return await this.getUserProfile(userId);
    }

    /**
     * 更新用户头像
     * @param {Number} userId - 用户ID
     * @param {String} avatarUrl - 头像URL
     * @returns {Promise<Object>} 更新结果
     */
    static async updateUserAvatar(userId, avatarUrl) {
        const user = await db.user.findOne({
            where: { id: userId, isDelete: 0 }
        });

        if (!user) {
            throw new NotFoundException('用户不存在');
        }

        await user.update({ userAvatar: avatarUrl });

        return {
            userId: user.id,
            userAvatar: user.userAvatar
        };
    }

    /**
     * 获取用户学习统计
     * @param {Number} userId - 用户ID
     * @returns {Promise<Object>} 学习统计数据
     */
    static async getUserStats(userId) {
        const user = await db.user.findOne({
            where: { id: userId, isDelete: 0 }
        });

        if (!user) {
            throw new NotFoundException('用户不存在');
        }

        // TODO: 实现实际的学习统计逻辑
        // 这里应该从学习记录表查询实际数据
        // 目前返回模拟数据
        return {
            userId: userId,
            totalWords: 150,        // 总学习单词数
            masteredWords: 85,      // 已掌握单词数
            todayWords: 10,         // 今日学习单词数
            studyDays: 25,          // 学习天数
            accuracy: 0.87,         // 正确率
            streak: 5,              // 连续学习天数
            weeklyProgress: [       // 近7天学习进度
                { date: '2025-11-09', words: 8 },
                { date: '2025-11-10', words: 12 },
                { date: '2025-11-11', words: 6 },
                { date: '2025-11-12', words: 15 },
                { date: '2025-11-13', words: 9 },
                { date: '2025-11-14', words: 11 },
                { date: '2025-11-15', words: 10 }
            ]
        };
    }

    /**
     * 更新学习目标
     * @param {Number} userId - 用户ID
     * @param {Number} studyGoal - 每日学习单词数目标
     * @returns {Promise<Object>} 更新结果
     */
    static async updateStudyGoal(userId, studyGoal) {
        const user = await db.user.findOne({
            where: { id: userId, isDelete: 0 }
        });

        if (!user) {
            throw new NotFoundException('用户不存在');
        }

        // 验证学习目标值
        if (studyGoal && (studyGoal < 1 || studyGoal > 100)) {
            throw new BusinessException('学习目标应在1-100之间');
        }

        await user.update({ studyGoal: studyGoal || 20 });

        return {
            userId: user.id,
            studyGoal: user.studyGoal
        };
    }

    /**
     * 获取用户词单列表
     * @param {Number} userId - 用户ID
     * @param {Object} options - 查询选项
     * @returns {Promise<Object>} 词单列表
     */
    static async getUserWordLists(userId, options = {}) {
        const { page = 1, limit = 10, type = 'all' } = options;
        const offset = (page - 1) * limit;

        let whereCondition = { isDelete: 0 };

        // 根据类型筛选
        if (type === 'system') {
            whereCondition.isSystem = 1;
        } else if (type === 'custom') {
            whereCondition.isSystem = 0;
        }

        // 查询用户关联的词单
        const { count, rows: wordLists } = await db.wordList.findAndCountAll({
            include: [{
                model: db.user,
                through: { where: { userId } },
                where: { isDelete: 0 }
            }],
            where: whereCondition,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });

        return {
            wordLists: wordLists.map(wordList => ({
                wordListId: wordList.id,
                wordListName: wordList.wordListName,
                description: wordList.description,
                wordCount: wordList.wordCount,
                isSystem: wordList.isSystem,
                createdAt: wordList.createdAt
            })),
            pagination: {
                current: parseInt(page),
                pageSize: parseInt(limit),
                total: count,
                pages: Math.ceil(count / limit)
            }
        };
    }
}

module.exports = UserService;