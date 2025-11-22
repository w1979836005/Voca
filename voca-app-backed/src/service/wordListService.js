const db = require('../model/index.js');
const { NotFoundException, BusinessException, ConflictException } = require('../exceptions/customException');

/**
 * 词单服务类
 */
class WordListService {
    /**
     * 获取词单列表
     * @param {Object} options - 查询选项
     * @param {Number} options.userId - 用户ID（可选，用于判断是否已加入）
     * @returns {Promise<Object>} 词单列表
     */
    static async getWordLists(options = {}) {
        const { page = 1, limit = 10, type = 'all', search = '', userId = null } = options;
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

            // 如果提供了用户ID，查询用户已加入的词单
            let joinedWordListIds = new Set();
            if (userId) {
                const userWordLists = await db.sequelize.query(
                    'SELECT wordlistId FROM user_wordlist WHERE userId = ?',
                    {
                        replacements: [userId],
                        type: db.Sequelize.QueryTypes.SELECT
                    }
                );
                joinedWordListIds = new Set(userWordLists.map(uw => uw.wordlistId));
            }

            // 获取每个词单的真实单词数量
            const wordListIds = wordlists.map(w => w.id);
            const wordCountsMap = new Map();

            // 批量查询每个词单的单词数量
            for (const wordListId of wordListIds) {
                const [countResult] = await db.sequelize.query(
                    'SELECT COUNT(*) as count FROM word_list_word WHERE word_list_id = ?',
                    {
                        replacements: [wordListId],
                        type: db.Sequelize.QueryTypes.SELECT
                    }
                );
                wordCountsMap.set(wordListId, countResult.count);
            }

            // 格式化返回数据
            const formattedWordLists = wordlists.map(wordlist => {
                return {
                    wordListId: wordlist.id,
                    wordListName: wordlist.wordListName,
                    description: wordlist.description,
                    wordCount: wordCountsMap.get(wordlist.id) || 0, // 使用真实单词数量
                    isSystem: wordlist.isSystemBuiltIn === 1,
                    creator: null, // TODO: 后续实现关联查询获取创建者信息
                    createdAt: wordlist.createTime.toISOString(),
                    updatedAt: wordlist.updateTime.toISOString(),
                    joined: userId ? joinedWordListIds.has(wordlist.id) : false  // 添加 joined 字段
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
     * @param {Number} userId - 用户ID（可选，用于判断是否已加入）
     * @returns {Promise<Object>} 词单详情
     */
    static async getWordListDetail(wordListId, userId = null) {
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

            // 如果提供了用户ID，查询用户是否已加入该词单
            let joined = false;
            if (userId) {
                const [userWordList] = await db.sequelize.query(
                    'SELECT id FROM user_wordlist WHERE userId = ? AND wordlistId = ?',
                    {
                        replacements: [userId, wordListId],
                        type: db.Sequelize.QueryTypes.SELECT
                    }
                );
                joined = !!userWordList;
            }

            // 查询词单的单词数量
            const [countResult] = await db.sequelize.query(
                'SELECT COUNT(*) as count FROM word_list_word WHERE word_list_id = ?',
                {
                    replacements: [wordListId],
                    type: db.Sequelize.QueryTypes.SELECT
                }
            );

            // 格式化返回数据
            return {
                wordListId: wordlist.id,
                wordListName: wordlist.wordListName,
                description: wordlist.description,
                wordCount: countResult.count || 0, // 使用真实单词数量
                isSystem: wordlist.isSystemBuiltIn === 1,
                creator: null, // TODO: 后续实现关联查询获取创建者信息
                createdAt: wordlist.createTime.toISOString(),
                updatedAt: wordlist.updateTime.toISOString(),
                joined: joined  // 添加 joined 字段
            };

        } catch (error) {
            console.error('获取词单详情失败:', error);
            throw new BusinessException('获取词单详情失败: ' + error.message);
        }
    }

    /**
     * 获取用户的词单列表（包含用户是否已添加的状态）
     * @param {Number} userId - 用户ID
     * @param {Object} options - 查询选项
     * @returns {Promise<Object>} 用户词单列表
     */
    static async getUserWordLists(userId, options = {}) {
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

            // 查询用户已加入的词单ID集合
            const userWordLists = await db.sequelize.query(
                'SELECT wordlistId FROM user_wordlist WHERE userId = ?',
                {
                    replacements: [userId],
                    type: db.Sequelize.QueryTypes.SELECT
                }
            );
            const joinedWordListIds = new Set(userWordLists.map(uw => uw.wordlistId));

            // 获取每个词单的真实单词数量
            const wordListIds = wordlists.map(w => w.id);
            const wordCountsMap = new Map();

            // 批量查询每个词单的单词数量
            for (const wordListId of wordListIds) {
                const [countResult] = await db.sequelize.query(
                    'SELECT COUNT(*) as count FROM word_list_word WHERE word_list_id = ?',
                    {
                        replacements: [wordListId],
                        type: db.Sequelize.QueryTypes.SELECT
                    }
                );
                wordCountsMap.set(wordListId, countResult.count);
            }

            // 格式化返回数据
            const formattedWordLists = wordlists.map(wordlist => {
                return {
                    wordListId: wordlist.id,
                    wordListName: wordlist.wordListName,
                    description: wordlist.description,
                    wordCount: wordCountsMap.get(wordlist.id) || 0, // 使用真实单词数量
                    isSystem: wordlist.isSystemBuiltIn === 1,
                    creator: null, // TODO: 后续实现关联查询获取创建者信息
                    createdAt: wordlist.createTime.toISOString(),
                    updatedAt: wordlist.updateTime.toISOString(),
                    joined: joinedWordListIds.has(wordlist.id)  // 对于已认证用户，所有查询的词单都标记 joined=true
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
            console.error('获取用户词单列表失败:', error);
            throw new BusinessException('获取用户词单列表失败: ' + error.message);
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
        const existingWordList = await db.wordlist.findOne({
            where: {
                wordListName,
                isDelete: 0,
                creatorId: userId
            }
        });

        if (existingWordList) {
            throw new ConflictException('词单名称已存在');
        }

        const wordList = await db.wordlist.create({
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
        const wordList = await db.wordlist.findOne({
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
            const existingWordList = await db.wordlist.findOne({
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
        const wordList = await db.wordlist.findOne({
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
        const wordList = await db.wordlist.findOne({
            where: { id: wordListId, isDelete: 0 }
        });

        if (!wordList) {
            throw new NotFoundException('词单不存在');
        }

        // 使用原生SQL查询，这是最可靠的方式
        console.log('使用原生SQL查询词单单词...');

        // 查询总数
        const countQuery = `
            SELECT COUNT(*) as total
            FROM word w
            INNER JOIN word_list_word wlw ON w.id = wlw.word_id
            WHERE wlw.word_list_id = ? AND w.is_delete = 0
        `;

        // 查询单词列表
        const wordsQuery = `
            SELECT
                w.id,
                w.word,
                w.phonetic,
                w.definition,
                w.example_sentence,
                w.affixes,
                w.difficulty,
                w.audio_url,
                w.create_time,
                w.update_time
            FROM word w
            INNER JOIN word_list_word wlw ON w.id = wlw.word_id
            WHERE wlw.word_list_id = ? AND w.is_delete = 0
            ORDER BY w.id ASC
            LIMIT ? OFFSET ?
        `;

        try {
            // 执行查询
            const [countResult] = await db.sequelize.query(countQuery, {
                replacements: [wordListId],
                type: db.Sequelize.QueryTypes.SELECT
            });

            const words = await db.sequelize.query(wordsQuery, {
                replacements: [wordListId, parseInt(limit), parseInt(offset)],
                type: db.Sequelize.QueryTypes.SELECT
            });

            console.log(`查询结果: 共${countResult.total}个单词，返回${words.length}个`);

            return {
                wordListId: wordListId,
                wordListName: wordList.wordListName,
                words: words.map(word => ({
                    wordId: word.id,
                    word: word.word,
                    pronunciation: word.phonetic,
                    definition: word.definition,
                    example: word.example_sentence,  // 修复列名映射
                    affixes: word.affixes,
                    difficulty: word.difficulty,
                    audioUrl: word.audio_url  // 添加音频URL
                })),
                pagination: {
                    current: parseInt(page),
                    pageSize: parseInt(limit),
                    total: countResult.total,
                    pages: Math.ceil(countResult.total / limit)
                }
            };

        } catch (error) {
            console.error('SQL查询失败:', error);
            throw new BusinessException('获取词单单词失败: ' + error.message);
        }
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
        const wordList = await db.wordlist.findOne({
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
        await db.word_list_word.bulkCreate(associations, {
            ignoreDuplicates: true
        });

        // 更新词单单词数量
        const newWordCount = await db.word_list_word.count({
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
        const wordList = await db.wordlist.findOne({
            where: { id: wordListId, isDelete: 0 }
        });

        if (!wordList) {
            throw new NotFoundException('词单不存在');
        }

        if (wordList.isSystem || wordList.creatorId !== userId) {
            throw new BusinessException('无权限修改此词单');
        }

        // 删除关联
        const deleted = await db.word_list_word.destroy({
            where: { wordListId, wordId }
        });

        if (deleted === 0) {
            throw new BusinessException('单词不在该词单中');
        }

        // 更新词单单词数量
        const newWordCount = await db.word_list_word.count({
            where: { wordListId }
        });

        await wordList.update({ wordCount: newWordCount });

        return {
            message: '单词移除成功',
            wordCount: newWordCount
        };
    }

    /**
     * 添加词单到用户词单列表
     * @param {Number} wordListId - 词单ID
     * @param {Number} userId - 用户ID
     * @returns {Promise<Object>} 添加结果
     */
    static async addUserWordList(wordListId, userId) {
        // 检查词单是否存在
        const wordList = await db.wordlist.findOne({
            where: { id: wordListId, isDelete: 0 }
        });

        if (!wordList) {
            throw new NotFoundException('词单不存在');
        }

        // 检查是否已添加
        const [existing] = await db.sequelize.query(
            'SELECT id FROM user_wordlist WHERE userId = ? AND wordlistId = ?',
            {
                replacements: [userId, wordListId],
                type: db.Sequelize.QueryTypes.SELECT
            }
        );

        if (existing) {
            throw new ConflictException('已添加过该词单');
        }

        // 添加到用户词单列表
        await db.sequelize.query(
            'INSERT INTO user_wordlist (userId, wordlistId, createTime, updateTime) VALUES (?, ?, NOW(), NOW())',
            {
                replacements: [userId, wordListId],
                type: db.Sequelize.QueryTypes.INSERT
            }
        );

        return {
            message: '添加词单成功',
            wordListId: wordListId,
            userId: userId
        };
    }

    /**
     * 从用户词单列表移除词单
     * @param {Number} wordListId - 词单ID
     * @param {Number} userId - 用户ID
     * @returns {Promise<Object>} 移除结果
     */
    static async removeUserWordList(wordListId, userId) {
        // 检查是否已添加
        const [existing] = await db.sequelize.query(
            'SELECT id FROM user_wordlist WHERE userId = ? AND wordlistId = ?',
            {
                replacements: [userId, wordListId],
                type: db.Sequelize.QueryTypes.SELECT
            }
        );

        if (!existing) {
            throw new BusinessException('未添加过该词单');
        }

        // 从用户词单列表移除
        await db.sequelize.query(
            'DELETE FROM user_wordlist WHERE userId = ? AND wordlistId = ?',
            {
                replacements: [userId, wordListId],
                type: db.Sequelize.QueryTypes.DELETE
            }
        );

        return {
            message: '移除词单成功',
            wordListId: wordListId,
            userId: userId
        };
    }

    /**
     * 获取用户已添加的词单列表（仅返回已添加的词单）
     * @param {Number} userId - 用户ID
     * @param {Object} options - 查询选项
     * @returns {Promise<Object>} 用户已添加的词单列表
     */
    static async getMyWordLists(userId, options = {}) {
        const { page = 1, limit = 50, search = '' } = options;
        const { Op } = db.Sequelize;

        try {
            // 构建搜索条件
            let searchCondition = '';
            let replacements = [userId, (page - 1) * limit, parseInt(limit)];

            if (search) {
                searchCondition = 'AND (w.wordListName LIKE ? OR w.description LIKE ?)';
                replacements.splice(2, 0, `%${search}%`, `%${search}%`);
            }

            // 查询用户已添加的词单
            const query = `
                SELECT
                    w.id as wordListId,
                    w.wordListName,
                    w.description,
                    w.isSystemBuiltIn as isSystem,
                    w.createTime as createdAt,
                    w.updateTime as updatedAt,
                    u.progress,
                    u.learnedCount,
                    u.isCurrent,
                    u.startTime,
                    u.lastStudyTime
                FROM wordlist w
                INNER JOIN user_wordlist u ON w.id = u.wordlistId
                WHERE u.userId = ? AND w.isDelete = 0 ${searchCondition}
                ORDER BY u.isCurrent DESC, w.isSystemBuiltIn DESC, u.lastStudyTime DESC
                LIMIT ?, ?
            `;

            const wordLists = await db.sequelize.query(query, {
                replacements: replacements,
                type: db.Sequelize.QueryTypes.SELECT
            });

            // 查询总数
            const countQuery = `
                SELECT COUNT(*) as total
                FROM wordlist w
                INNER JOIN user_wordlist u ON w.id = u.wordlistId
                WHERE u.userId = ? AND w.isDelete = 0 ${searchCondition}
            `;

            const countReplacements = search ? [userId, `%${search}%`, `%${search}%`] : [userId];
            const [countResult] = await db.sequelize.query(countQuery, {
                replacements: countReplacements,
                type: db.Sequelize.QueryTypes.SELECT
            });

            // 获取每个词单的真实单词数量
            const wordListIds = wordLists.map(w => w.wordListId);
            const wordCountsMap = new Map();

            // 批量查询每个词单的单词数量
            for (const wordListId of wordListIds) {
                const [countResult] = await db.sequelize.query(
                    'SELECT COUNT(*) as count FROM word_list_word WHERE word_list_id = ?',
                    {
                        replacements: [wordListId],
                        type: db.Sequelize.QueryTypes.SELECT
                    }
                );
                wordCountsMap.set(wordListId, countResult.count);
            }

            // 格式化返回数据
            const formattedWordLists = wordLists.map(wordlist => ({
                wordListId: wordlist.wordListId,
                wordListName: wordlist.wordListName,
                description: wordlist.description,
                wordCount: wordCountsMap.get(wordlist.wordListId) || 0, // 使用真实单词数量
                isSystem: wordlist.isSystem === 1,
                progress: wordlist.progress || 0,
                learnedCount: wordlist.learnedCount || 0,
                isCurrent: wordlist.isCurrent === 1,
                startTime: wordlist.startTime,
                lastStudyTime: wordlist.lastStudyTime,
                createdAt: wordlist.createdAt,
                updatedAt: wordlist.updatedAt
            }));

            // 返回分页结果
            return {
                wordLists: formattedWordLists,
                pagination: {
                    current: parseInt(page),
                    pageSize: parseInt(limit),
                    total: countResult.total,
                    pages: Math.ceil(countResult.total / limit)
                }
            };

        } catch (error) {
            console.error('获取用户词单列表失败:', error);
            throw new BusinessException('获取用户词单列表失败: ' + error.message);
        }
    }
}

module.exports = WordListService;