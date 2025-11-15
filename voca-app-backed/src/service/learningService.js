const db = require('../model/index.js');
const { NotFoundException, BusinessException } = require('../exceptions/CustomException');

/**
 * 学习服务类
 */
class LearningService {
    /**
     * 获取学习模式
     * @param {Number} userId - 用户ID
     * @returns {Promise<Object>} 学习模式列表
     */
    static async getLearningModes(userId) {
        // TODO: 实际实现应该查询数据库，这里返回模拟数据
        return {
            modes: [
                {
                    modeId: 'word_meaning',
                    modeName: '单词释义',
                    description: '显示单词，选择正确的释义',
                    icon: 'book-open'
                },
                {
                    modeId: 'meaning_word',
                    modeName: '释义选词',
                    description: '显示释义，选择对应的单词',
                    icon: 'target'
                },
                {
                    modeId: 'spelling',
                    modeName: '拼写练习',
                    description: '听发音或看释义，拼写单词',
                    icon: 'edit-3'
                },
                {
                    modeId: 'listening',
                    modeName: '听力练习',
                    description: '听发音选择正确的单词或释义',
                    icon: 'headphones'
                }
            ],
            currentMode: 'word_meaning' // 用户当前选择的学习模式
        };
    }

    /**
     * 开始学习会话
     * @param {Number} userId - 用户ID
     * @param {Object} sessionData - 会话数据
     * @returns {Promise<Object>} 学习会话信息
     */
    static async startLearningSession(userId, sessionData) {
        const { wordListId, mode = 'word_meaning', wordCount = 20 } = sessionData;

        // TODO: 实际实现应该：
        // 1. 验证词单是否存在且用户有权限访问
        // 2. 获取词单中的单词
        // 3. 根据算法选择要学习的单词（考虑学习记录、难度分布等）
        // 4. 创建学习会话记录

        // 模拟实现
        const sessionId = `session_${Date.now()}_${userId}`;
        const mockWords = [
            {
                wordId: 1,
                word: 'abandon',
                pronunciation: '/əˈbændən/',
                definition: 'v. 放弃，抛弃',
                translation: '放弃，抛弃',
                example: 'We had to abandon the car and walk.',
                difficulty: 3
            },
            {
                wordId: 2,
                word: 'ability',
                pronunciation: '/əˈbɪləti/',
                definition: 'n. 能力，才能',
                translation: '能力，才能',
                example: 'She has the ability to solve complex problems.',
                difficulty: 2
            },
            {
                wordId: 3,
                word: 'absent',
                pronunciation: '/ˈæbsənt/',
                definition: 'adj. 缺席的，不在的',
                translation: '缺席的，不在的',
                example: 'He was absent from school yesterday.',
                difficulty: 1
            }
        ];

        return {
            sessionId,
            mode,
            wordListId,
            totalWords: mockWords.length,
            currentIndex: 0,
            words: mockWords,
            startTime: new Date().toISOString()
        };
    }

    /**
     * 获取下一个单词
     * @param {String} sessionId - 会话ID
     * @param {Number} userId - 用户ID
     * @returns {Promise<Object>} 下一个单词信息
     */
    static async getNextWord(sessionId, userId) {
        // TODO: 实际实现应该从会话中获取下一个单词
        // 这里返回模拟数据

        const mockWords = [
            {
                wordId: 1,
                word: 'abandon',
                pronunciation: '/əˈbændən/',
                definition: 'v. 放弃，抛弃',
                translation: '放弃，抛弃',
                example: 'We had to abandon the car and walk.',
                difficulty: 3,
                options: [
                    { id: 'a', text: '放弃，抛弃' },
                    { id: 'b', text: '接受，同意' },
                    { id: 'c', text: '保护，保存' },
                    { id: 'd', text: '发现，找到' }
                ]
            }
        ];

        return {
            word: mockWords[0],
            currentIndex: 1,
            totalWords: 3,
            isLast: false
        };
    }

    /**
     * 提交答案
     * @param {String} sessionId - 会话ID
     * @param {Number} userId - 用户ID
     * @param {Object} answerData - 答案数据
     * @returns {Promise<Object>} 答案结果
     */
    static async submitAnswer(sessionId, userId, answerData) {
        const { wordId, answer, timeSpent = 0 } = answerData;

        // TODO: 实际实现应该：
        // 1. 验证答案是否正确
        // 2. 记录学习记录
        // 3. 更新学习进度
        // 4. 根据答案调整算法参数

        // 模拟实现
        const isCorrect = Math.random() > 0.3; // 70% 正确率模拟

        return {
            isCorrect,
            correctAnswer: '放弃，抛弃',
            explanation: isCorrect ? '回答正确！' : '正确答案是"放弃，抛弃"。abandon的意思是放弃、抛弃。',
            nextWordAvailable: true,
            progress: {
                correct: isCorrect ? 1 : 0,
                incorrect: isCorrect ? 0 : 1,
                total: 1
            }
        };
    }

    /**
     * 结束学习会话
     * @param {String} sessionId - 会话ID
     * @param {Number} userId - 用户ID
     * @returns {Promise<Object>} 学习会话结果
     */
    static async completeLearningSession(sessionId, userId) {
        // TODO: 实际实现应该：
        // 1. 更新会话状态为完成
        // 2. 计算学习统计
        // 3. 更新用户学习记录
        // 4. 返回详细的学习报告

        // 模拟实现
        return {
            sessionId,
            completedAt: new Date().toISOString(),
            statistics: {
                totalWords: 20,
                correctAnswers: 15,
                incorrectAnswers: 5,
                accuracy: 0.75,
                totalTime: 1200, // 秒
                averageTimePerWord: 60,
                difficultyDistribution: {
                    easy: 8,
                    medium: 10,
                    hard: 2
                }
            },
            wordsToReview: [1, 3, 7, 12, 18], // 需要复习的单词ID
            improvement: {
                accuracy: '+5%',
                speed: '+10%',
                mastery: '+3 words'
            }
        };
    }

    /**
     * 获取学习进度
     * @param {Number} userId - 用户ID
     * @returns {Promise<Object>} 学习进度
     */
    static async getLearningProgress(userId) {
        // TODO: 实际实现应该查询学习记录表
        // 这里返回模拟数据
        return {
            today: {
                target: 20,
                completed: 15,
                accuracy: 0.80,
                timeSpent: 900 // 秒
            },
            weekly: {
                target: 140,
                completed: 95,
                accuracy: 0.78,
                timeSpent: 6300,
                dailyProgress: [
                    { date: '2025-11-09', words: 18, accuracy: 0.82 },
                    { date: '2025-11-10', words: 22, accuracy: 0.79 },
                    { date: '2025-11-11', words: 15, accuracy: 0.75 },
                    { date: '2025-11-12', words: 25, accuracy: 0.81 },
                    { date: '2025-11-13', words: 12, accuracy: 0.77 },
                    { date: '2025-11-14', words: 20, accuracy: 0.80 },
                    { date: '2025-11-15', words: 15, accuracy: 0.80 }
                ]
            },
            monthly: {
                target: 600,
                completed: 420,
                accuracy: 0.76,
                streak: 7 // 连续学习天数
            },
            mastery: {
                totalWords: 500,
                masteredWords: 320,
                reviewingWords: 120,
                newWords: 60
            }
        };
    }

    /**
     * 获取学习历史
     * @param {Number} userId - 用户ID
     * @param {Object} options - 查询选项
     * @returns {Promise<Object>} 学习历史
     */
    static async getLearningHistory(userId, options = {}) {
        const { page = 1, limit = 20, startDate, endDate } = options;

        // TODO: 实际实现应该查询学习记录表
        // 这里返回模拟数据
        const mockHistory = [
            {
                sessionId: 'session_1699999200000_2',
                wordListName: 'CET-4 核心词汇',
                mode: 'word_meaning',
                startTime: '2025-11-15T14:00:00Z',
                endTime: '2025-11-15T14:20:00Z',
                duration: 1200,
                wordsStudied: 20,
                accuracy: 0.80,
                newWords: 5,
                reviewWords: 15
            },
            {
                sessionId: 'session_1699912800000_2',
                wordListName: 'CET-6 高频词汇',
                mode: 'meaning_word',
                startTime: '2025-11-14T19:30:00Z',
                endTime: '2025-11-14T19:45:00Z',
                duration: 900,
                wordsStudied: 15,
                accuracy: 0.73,
                newWords: 8,
                reviewWords: 7
            },
            {
                sessionId: 'session_1699826400000_2',
                wordListName: '我的生词本',
                mode: 'spelling',
                startTime: '2025-11-13T20:00:00Z',
                endTime: '2025-11-13T20:18:00Z',
                duration: 1080,
                wordsStudied: 18,
                accuracy: 0.67,
                newWords: 2,
                reviewWords: 16
            }
        ];

        return {
            sessions: mockHistory,
            pagination: {
                current: parseInt(page),
                pageSize: parseInt(limit),
                total: mockHistory.length,
                pages: Math.ceil(mockHistory.length / limit)
            },
            summary: {
                totalSessions: mockHistory.length,
                totalTime: mockHistory.reduce((sum, session) => sum + session.duration, 0),
                totalWords: mockHistory.reduce((sum, session) => sum + session.wordsStudied, 0),
                averageAccuracy: mockHistory.reduce((sum, session) => sum + session.accuracy, 0) / mockHistory.length
            }
        };
    }

    /**
     * 获取学习统计
     * @param {Number} userId - 用户ID
     * @param {String} period - 统计周期 (daily, weekly, monthly)
     * @returns {Promise<Object>} 学习统计
     */
    static async getLearningStats(userId, period = 'weekly') {
        // TODO: 实际实现应该查询学习记录并生成统计
        // 这里返回模拟数据
        const statsByPeriod = {
            daily: {
                date: '2025-11-15',
                wordsStudied: 15,
                timeSpent: 900,
                accuracy: 0.80,
                newWords: 5,
                reviewWords: 10,
                sessions: 1
            },
            weekly: {
                startDate: '2025-11-09',
                endDate: '2025-11-15',
                wordsStudied: 95,
                timeSpent: 6300,
                accuracy: 0.78,
                newWords: 28,
                reviewWords: 67,
                sessions: 7,
                dailyBreakdown: [
                    { date: '2025-11-09', words: 18, accuracy: 0.82 },
                    { date: '2025-11-10', words: 22, accuracy: 0.79 },
                    { date: '2025-11-11', words: 15, accuracy: 0.75 },
                    { date: '2025-11-12', words: 25, accuracy: 0.81 },
                    { date: '2025-11-13', words: 12, accuracy: 0.77 },
                    { date: '2025-11-14', words: 20, accuracy: 0.80 },
                    { date: '2025-11-15', words: 15, accuracy: 0.80 }
                ]
            },
            monthly: {
                month: '2025-11',
                wordsStudied: 420,
                timeSpent: 25200,
                accuracy: 0.76,
                newWords: 120,
                reviewWords: 300,
                sessions: 21,
                weeklyBreakdown: [
                    { week: '2025-11-01', words: 85, accuracy: 0.74 },
                    { week: '2025-11-08', words: 110, accuracy: 0.78 },
                    { week: '2025-11-15', words: 95, accuracy: 0.78 }
                ]
            }
        };

        return statsByPeriod[period] || statsByPeriod.weekly;
    }
}

module.exports = LearningService;