const db = require('./model/index.js');

/**
 * 初始化数据库表结构
 */
async function initDatabase() {
    try {
        console.log('开始初始化数据库...');

        // 测试数据库连接
        await db.sequelize.authenticate();
        console.log('✓ 数据库连接成功');

        // 强制同步数据库结构（会删除现有表并重新创建）
        // 生产环境请使用 { force: false } 或 { alter: true }
        const syncOptions = {
            force: false,  // 是否强制重建表（生产环境建议 false）
            alter: true    // 是否自动修改表结构（生产环境建议 false）
        };

        // 同步所有模型到数据库
        await db.sequelize.sync(syncOptions);
        console.log('✓ 数据库表结构同步完成');

        // 创建一些基础数据
        await createBasicData();
        console.log('✓ 基础数据创建完成');

        console.log('数据库初始化完成！');
        process.exit(0);

    } catch (error) {
        console.error('数据库初始化失败:', error);
        process.exit(1);
    }
}

/**
 * 创建基础数据
 */
async function createBasicData() {
    try {
        // 检查是否已有词单数据
        const wordlistCount = await db.wordlist.count();

        if (wordlistCount === 0) {
            console.log('创建基础词单数据...');

            // 创建一些基础词单
            const basicWordlists = [
                {
                    wordListName: 'CET-4核心词汇',
                    categories: 'cet4',
                    description: '大学英语四级考试核心词汇，涵盖最常考的高频词汇',
                    isSystemBuiltIn: 1
                },
                {
                    wordListName: 'CET-6核心词汇',
                    categories: 'cet6',
                    description: '大学英语六级考试必备词汇，包含学术和商务用语',
                    isSystemBuiltIn: 1
                },
                {
                    wordListName: '雅思核心词汇',
                    categories: 'ielts',
                    description: 'IELTS考试高频词汇，适合出国留学准备',
                    isSystemBuiltIn: 1
                },
                {
                    wordListName: '托福核心词汇',
                    categories: 'toefl',
                    description: 'TOEFL考试必备词汇，涵盖学术和日常生活用语',
                    isSystemBuiltIn: 1
                },
                {
                    wordListName: '商务英语词汇',
                    categories: 'business',
                    description: '商务场景常用词汇，包含会议、谈判、邮件等',
                    isSystemBuiltIn: 1
                },
                {
                    wordListName: '日常口语词汇',
                    categories: 'daily',
                    description: '日常生活中最常用的口语词汇，适合日常交流',
                    isSystemBuiltIn: 1
                }
            ];

            await db.wordlist.bulkCreate(basicWordlists);
            console.log(`✓ 创建了 ${basicWordlists.length} 个基础词单`);
        }

        // 检查是否已有用户数据
        const userCount = await db.user.count();

        if (userCount === 0) {
            console.log('创建测试用户...');

            const CryptoUtil = require('./utils/cryptoUtil');

            // 创建测试用户
            const testUsers = [
                {
                    username: 'testuser',
                    email: 'test@example.com',
                    password: CryptoUtil.hashPassword('123456'),
                    role: 'user',
                    isBan: 0,
                    isDelete: 0,
                    studyGoal: 20
                },
                {
                    username: 'admin',
                    email: 'admin@example.com',
                    password: CryptoUtil.hashPassword('123456'),
                    role: 'admin',
                    isBan: 0,
                    isDelete: 0,
                    studyGoal: 50
                }
            ];

            await db.user.bulkCreate(testUsers);
            console.log(`✓ 创建了 ${testUsers.length} 个测试用户`);
        }

        // 检查是否已有单词数据
        const wordCount = await db.word.count();

        if (wordCount === 0) {
            console.log('创建基础单词数据...');

            // 创建一些基础单词示例
            const basicWords = [
                {
                    word: 'abandon',
                    phonetic: '/əˈbændən/',
                    definition: '放弃；抛弃；遗弃',
                    affixes: 'ab- + andon',
                    exampleSentence: 'They had to abandon their car in the snow.',
                    difficulty: 3
                },
                {
                    word: 'ability',
                    phonetic: '/əˈbɪlɪti/',
                    definition: '能力；才能；本领',
                    affixes: 'abil + -ity',
                    exampleSentence: 'She has the ability to solve complex problems.',
                    difficulty: 2
                },
                {
                    word: 'absent',
                    phonetic: '/ˈæbsənt/',
                    definition: '缺席的；不在的',
                    affixes: 'ab- + sent',
                    exampleSentence: 'He was absent from the meeting.',
                    difficulty: 2
                },
                {
                    word: 'absolute',
                    phonetic: '/ˈæbsəluːt/',
                    definition: '绝对的；完全的；无条件的',
                    affixes: 'ab- + solute',
                    exampleSentence: 'I have absolute confidence in you.',
                    difficulty: 3
                },
                {
                    word: 'absorb',
                    phonetic: '/əbˈzɔːrb/',
                    definition: '吸收；吸引；使专心',
                    affixes: 'ab- + sorb',
                    exampleSentence: 'Plants absorb water through their roots.',
                    difficulty: 3
                }
            ];

            await db.word.bulkCreate(basicWords);
            console.log(`✓ 创建了 ${basicWords.length} 个基础单词`);

            // 为CET-4词单添加这些单词
            const cet4Wordlist = await db.wordlist.findOne({
                where: { wordListName: 'CET-4核心词汇' }
            });

            if (cet4Wordlist) {
                const createdWords = await db.word.findAll({
                    where: { word: basicWords.map(w => w.word) }
                });

                // 创建词单与单词的关联
                const wordListWordAssociations = createdWords.map(word => ({
                    wordListId: cet4Wordlist.id,
                    wordId: word.id
                }');

                await db.word_list_word.bulkCreate(wordListWordAssociations);
                console.log(`✓ 为CET-4词单添加了 ${wordListWordAssociations.length} 个单词`);
            }
        }

    } catch (error) {
        console.error('创建基础数据失败:', error);
        throw error;
    }
}

// 如果直接运行此文件，则执行初始化
if (require.main === module) {
    initDatabase();
}

module.exports = {
    initDatabase,
    createBasicData
};