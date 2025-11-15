const db = require('../model/index.js');
const { NotFoundException, BusinessException, ConflictException } = require('../exceptions/CustomException');

/**
 * 词单服务类
 */
class WordListService {
    /**
     * 获取词单列表
     * @param {Object} options - 查询选项
     * @returns {Promise<Object>} 词单列表
     */
    static async getWordLists(options = {}) {
        const { page = 1, limit = 10, type = 'all', search = '' } = options;

        // TODO: 实际实现应该查询数据库，这里返回模拟数据
        const mockWordLists = [
            {
                wordListId: 1,
                wordListName: 'CET-4 核心词汇',
                description: '大学英语四级考试核心词汇',
                wordCount: 2000,
                isSystem: true,
                creator: null,
                createdAt: '2025-11-01T10:00:00Z'
            },
            {
                wordListId: 2,
                wordListName: 'CET-6 高频词汇',
                description: '大学英语六级考试高频词汇',
                wordCount: 1500,
                isSystem: true,
                creator: null,
                createdAt: '2025-11-02T10:00:00Z'
            },
            {
                wordListId: 3,
                wordListName: '我的生词本',
                description: '学习过程中遇到的生词',
                wordCount: 120,
                isSystem: false,
                creator: { id: 2, username: 'testuser_updated' },
                createdAt: '2025-11-10T15:30:00Z'
            }
        ];

        // 模拟筛选和分页逻辑
        let filteredWordLists = mockWordLists;

        if (type === 'system') {
            filteredWordLists = mockWordLists.filter(wl => wl.isSystem);
        } else if (type === 'custom') {
            filteredWordLists = mockWordLists.filter(wl => !wl.isSystem);
        }

        if (search) {
            filteredWordLists = filteredWordLists.filter(wl =>
                wl.wordListName.toLowerCase().includes(search.toLowerCase())
            );
        }

        const total = filteredWordLists.length;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + parseInt(limit);
        const paginatedWordLists = filteredWordLists.slice(startIndex, endIndex);

        return {
            wordLists: paginatedWordLists,
            pagination: {
                current: parseInt(page),
                pageSize: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        };
    }

    /**
     * 获取词单详情
     * @param {Number} wordListId - 词单ID
     * @returns {Promise<Object>} 词单详情
     */
    static async getWordListDetail(wordListId) {
        // TODO: 实际实现应该查询数据库，这里返回模拟数据
        const mockWordLists = {
            1: {
                wordListId: 1,
                wordListName: 'CET-4 核心词汇',
                description: '大学英语四级考试核心词汇，包含最常考的2000个单词',
                wordCount: 2000,
                isSystem: true,
                creator: null,
                createdAt: '2025-11-01T10:00:00Z',
                updatedAt: '2025-11-01T10:00:00Z'
            },
            2: {
                wordListId: 2,
                wordListName: 'CET-6 高频词汇',
                description: '大学英语六级考试高频词汇，精选1500个重点单词',
                wordCount: 1500,
                isSystem: true,
                creator: null,
                createdAt: '2025-11-02T10:00:00Z',
                updatedAt: '2025-11-02T10:00:00Z'
            },
            3: {
                wordListId: 3,
                wordListName: '我的生词本',
                description: '学习过程中遇到的生词，需要重点记忆',
                wordCount: 120,
                isSystem: false,
                creator: { id: 2, username: 'testuser_updated' },
                createdAt: '2025-11-10T15:30:00Z',
                updatedAt: '2025-11-14T20:15:00Z'
            }
        };

        const wordList = mockWordLists[wordListId];
        if (!wordList) {
            throw new NotFoundException('词单不存在');
        }

        return wordList;
    }

    /**
     * 创建词单
     * @param {Object} wordListData - 词单数据
     * @param {Number} userId - 创建者ID
     * @returns {Promise<Object>} 创建结果
     */
    static async createWordList(wordListData, userId) {
        const { wordListName, description } = wordListData;

        // 检查词单名称是否重复
        const existingWordList = await db.wordList.findOne({
            where: {
                wordListName,
                isDelete: 0,
                creatorId: userId
            }
        });

        if (existingWordList) {
            throw new ConflictException('词单名称已存在');
        }

        const wordList = await db.wordList.create({
            wordListName,
            description,
            wordCount: 0,
            isSystem: 0,
            creatorId: userId
        });

        return {
            wordListId: wordList.id,
            wordListName: wordList.wordListName,
            description: wordList.description,
            wordCount: wordList.wordCount,
            isSystem: wordList.isSystem,
            createdAt: wordList.createdAt
        };
    }

    /**
     * 更新词单
     * @param {Number} wordListId - 词单ID
     * @param {Object} updateData - 更新数据
     * @param {Number} userId - 操作用户ID
     * @returns {Promise<Object>} 更新结果
     */
    static async updateWordList(wordListId, updateData, userId) {
        const wordList = await db.wordList.findOne({
            where: { id: wordListId, isDelete: 0 }
        });

        if (!wordList) {
            throw new NotFoundException('词单不存在');
        }

        // 检查权限：只有创建者可以更新自定义词单，系统词单不能更新
        if (wordList.isSystem || wordList.creatorId !== userId) {
            throw new BusinessException('无权限修改此词单');
        }

        // 检查词单名称是否重复
        if (updateData.wordListName && updateData.wordListName !== wordList.wordListName) {
            const existingWordList = await db.wordList.findOne({
                where: {
                    wordListName: updateData.wordListName,
                    isDelete: 0,
                    creatorId: userId,
                    id: { [db.Sequelize.Op.ne]: wordListId }
                }
            });

            if (existingWordList) {
                throw new ConflictException('词单名称已存在');
            }
        }

        const allowedFields = ['wordListName', 'description'];
        const filteredData = {};

        for (const field of allowedFields) {
            if (updateData[field] !== undefined) {
                filteredData[field] = updateData[field];
            }
        }

        await wordList.update(filteredData);

        return await this.getWordListDetail(wordListId);
    }

    /**
     * 删除词单
     * @param {Number} wordListId - 词单ID
     * @param {Number} userId - 操作用户ID
     * @returns {Promise<Object>} 删除结果
     */
    static async deleteWordList(wordListId, userId) {
        const wordList = await db.wordList.findOne({
            where: { id: wordListId, isDelete: 0 }
        });

        if (!wordList) {
            throw new NotFoundException('词单不存在');
        }

        // 检查权限：只有创建者可以删除自定义词单，系统词单不能删除
        if (wordList.isSystem || wordList.creatorId !== userId) {
            throw new BusinessException('无权限删除此词单');
        }

        // 软删除
        await wordList.update({ isDelete: 1 });

        return { message: '词单删除成功' };
    }

    /**
     * 获取词单中的单词
     * @param {Number} wordListId - 词单ID
     * @param {Object} options - 查询选项
     * @returns {Promise<Object>} 单词列表
     */
    static async getWordsInWordList(wordListId, options = {}) {
        const { page = 1, limit = 20 } = options;
        const offset = (page - 1) * limit;

        // 检查词单是否存在
        const wordList = await db.wordList.findOne({
            where: { id: wordListId, isDelete: 0 }
        });

        if (!wordList) {
            throw new NotFoundException('词单不存在');
        }

        const { count, rows: words } = await db.word.findAndCountAll({
            include: [{
                model: db.wordList,
                through: { where: { wordListId } },
                where: { isDelete: 0 }
            }],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [[db.wordListWord, 'createdAt', 'ASC']]
        });

        return {
            wordListId: wordListId,
            wordListName: wordList.wordListName,
            words: words.map(word => ({
                wordId: word.id,
                word: word.word,
                pronunciation: word.pronunciation,
                definition: word.definition,
                translation: word.translation,
                example: word.example,
                difficulty: word.difficulty
            })),
            pagination: {
                current: parseInt(page),
                pageSize: parseInt(limit),
                total: count,
                pages: Math.ceil(count / limit)
            }
        };
    }

    /**
     * 添加单词到词单
     * @param {Number} wordListId - 词单ID
     * @param {Array} wordIds - 单词ID数组
     * @param {Number} userId - 操作用户ID
     * @returns {Promise<Object>} 添加结果
     */
    static async addWordsToWordList(wordListId, wordIds, userId) {
        // 检查词单是否存在和权限
        const wordList = await db.wordList.findOne({
            where: { id: wordListId, isDelete: 0 }
        });

        if (!wordList) {
            throw new NotFoundException('词单不存在');
        }

        if (wordList.isSystem || wordList.creatorId !== userId) {
            throw new BusinessException('无权限修改此词单');
        }

        // 验证单词是否存在
        const words = await db.word.findAll({
            where: {
                id: { [db.Sequelize.Op.in]: wordIds },
                isDelete: 0
            }
        });

        if (words.length === 0) {
            throw new BusinessException('没有找到有效的单词');
        }

        const validWordIds = words.map(word => word.id);
        const associations = validWordIds.map(wordId => ({
            wordListId,
            wordId
        }));

        // 批量添加关联
        await db.wordListWord.bulkCreate(associations, {
            ignoreDuplicates: true
        });

        // 更新词单单词数量
        const newWordCount = await db.wordListWord.count({
            where: { wordListId }
        });

        await wordList.update({ wordCount: newWordCount });

        return {
            message: `成功添加 ${validWordIds.length} 个单词到词单`,
            wordCount: newWordCount
        };
    }

    /**
     * 从词单移除单词
     * @param {Number} wordListId - 词单ID
     * @param {Number} wordId - 单词ID
     * @param {Number} userId - 操作用户ID
     * @returns {Promise<Object>} 移除结果
     */
    static async removeWordFromWordList(wordListId, wordId, userId) {
        // 检查词单是否存在和权限
        const wordList = await db.wordList.findOne({
            where: { id: wordListId, isDelete: 0 }
        });

        if (!wordList) {
            throw new NotFoundException('词单不存在');
        }

        if (wordList.isSystem || wordList.creatorId !== userId) {
            throw new BusinessException('无权限修改此词单');
        }

        // 删除关联
        const deleted = await db.wordListWord.destroy({
            where: { wordListId, wordId }
        });

        if (deleted === 0) {
            throw new BusinessException('单词不在该词单中');
        }

        // 更新词单单词数量
        const newWordCount = await db.wordListWord.count({
            where: { wordListId }
        });

        await wordList.update({ wordCount: newWordCount });

        return {
            message: '单词移除成功',
            wordCount: newWordCount
        };
    }
}

module.exports = WordListService;