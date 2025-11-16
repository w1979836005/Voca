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
        const { Op } = db.Sequelize;

        try {
            // 构建查询条件
            const whereCondition = {
                isDelete: 0  // 只查询未删除的词单
            };

            // 根据类型筛选
            if (type === 'system') {
                whereCondition.isSystemBuiltIn = 1;
            } else if (type === 'custom') {
                whereCondition.isSystemBuiltIn = 0;
            }

            // 添加搜索条件
            if (search) {
                whereCondition[Op.or] = [
                    {
                        wordListName: {
                            [Op.like]: `%${search}%`
                        }
                    },
                    {
                        description: {
                            [Op.like]: `%${search}%`
                        }
                    },
                    {
                        categories: {
                            [Op.like]: `%${search}%`
                        }
                    }
                ];
            }

            // 计算分页偏移量
            const offset = (page - 1) * limit;

            // 查询词单列表
            const { count, rows: wordlists } = await db.wordlist.findAndCountAll({
                where: whereCondition,
                limit: parseInt(limit),
                offset: offset,
                order: [
                    ['isSystemBuiltIn', 'DESC'],  // 系统词单排在前面
                    ['createTime', 'DESC']      // 最新创建的排在前面
                ],
                attributes: [
                    'id',
                    'wordListName',
                    'categories',
                    'description',
                    'isSystemBuiltIn',
                    'createTime',
                    'updateTime'
                ]
            });

            // 格式化返回数据
            const formattedWordLists = wordlists.map(wordlist => {
                // 计算词单中的单词数量（这里先返回0，实际项目中可以通过关联查询获得）
                const wordCount = 0; // TODO: 后续实现关联查询获取真实单词数量

                return {
                    wordListId: wordlist.id,
                    wordListName: wordlist.wordListName,
                    description: wordlist.description,
                    wordCount: wordCount,
                    isSystem: wordlist.isSystemBuiltIn === 1,
                    creator: null, // TODO: 后续实现关联查询获取创建者信息
                    createdAt: wordlist.createTime.toISOString(),
                    updatedAt: wordlist.updateTime.toISOString()
                };
            });

            // 返回分页结果
            return {
                wordLists: formattedWordLists,
                pagination: {
                    current: parseInt(page),
                    pageSize: parseInt(limit),
                    total: count,
                    pages: Math.ceil(count / limit)
                }
            };

        } catch (error) {
            console.error('获取词单列表失败:', error);
            throw new BusinessException('获取词单列表失败: ' + error.message);
        }
    }

    /**
     * 获取词单详情
     * @param {Number} wordListId - 词单ID
     * @returns {Promise<Object>} 词单详情
     */
    static async getWordListDetail(wordListId) {
        try {
            // 查询词单详情
            const wordlist = await db.wordlist.findOne({
                where: {
                    id: wordListId,
                    isDelete: 0
                },
                attributes: [
                    'id',
                    'wordListName',
                    'categories',
                    'description',
                    'isSystemBuiltIn',
                    'createTime',
                    'updateTime'
                ]
            });

            if (!wordlist) {
                throw new NotFoundException('词单不存在');
            }

            // 格式化返回数据
            return {
                wordListId: wordlist.id,
                wordListName: wordlist.wordListName,
                description: wordlist.description,
                wordCount: 0, // TODO: 后续实现关联查询获取真实单词数量
                isSystem: wordlist.isSystemBuiltIn === 1,
                creator: null, // TODO: 后续实现关联查询获取创建者信息
                createdAt: wordlist.createTime.toISOString(),
                updatedAt: wordlist.updateTime.toISOString()
            };

        } catch (error) {
            console.error('获取词单详情失败:', error);
            throw new BusinessException('获取词单详情失败: ' + error.message);
        }
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