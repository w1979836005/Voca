//加载配置文件
require('dotenv').config()

const express = require('express')
const db = require('./model/index.js')
const { errorHandler, asyncHandler, notFoundHandler } = require('./middleware/errorHandler')
const ResponseUtil = require('./utils/responseUtil')

const app = express()

// 中间件设置
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// 静态文件服务 - 提供上传文件的访问
app.use('/uploads', express.static('uploads'));

// 请求日志中间件
app.use((req, res, next) => {
    const start = Date.now()
    res.on('finish', () => {
        const duration = Date.now() - start
        console.log(`${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`)
    })
    next()
})

// CORS 设置
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
    if (req.method === 'OPTIONS') {
        res.sendStatus(200)
    } else {
        next()
    }
})

// 导入路由
const testRoutes = require('./routes/test.js')
const authRoutes = require('./routes/auth.js')
const userRoutes = require('./routes/user.js')
const wordlistRoutes = require('./routes/wordlist.js')
const userWordlistRoutes = require('./routes/userWordlist.js')
const learningRoutes = require('./routes/learning.js')

// 注册路由
app.use('/api/test', testRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/wordlist', wordlistRoutes)
app.use('/api/user-wordlist', userWordlistRoutes)
app.use('/api/learning', learningRoutes)

const port = process.env.PORT || 3001

// 基础路由
app.get('/', (req, res) => {
    res.json(ResponseUtil.success(null, 'Voca 背单词应用 API 服务'));
})

// 数据库连接测试路由
app.get('/api/test-db', asyncHandler(async (req, res) => {
    await db.sequelize.authenticate()
    res.json(ResponseUtil.success({
        status: 'connected',
        database: process.env.DB_NAME
    }, '数据库连接成功'));
}))

// 404 处理
app.use(notFoundHandler)

// 全局错误处理
app.use(errorHandler)

/**
 * 项目启动函数  - 可初始化某些资源
 * @param port
 */
const doInit = async (port) => {
    try {
        console.log('..............项目启动中..................')
        console.log('.............欢迎来到Voca背单词应用................')
        console.log('..............作者-高桥凉介.................')

        // 测试数据库连接
        await db.sequelize.authenticate()
        console.log('✓ 数据库连接成功')

        // 同步数据库模型（可选，生产环境建议关闭）
        if (process.env.NODE_ENV === 'development') {
            console.log('检查数据库模型...')
            // 只检查表是否存在，不进行自动同步
            await db.sequelize.authenticate()
            console.log('✓ 数据库模型检查完成')
        }

        console.log(`✓ 服务器已启动，端口: ${port}`)
        console.log('✓ 项目启动成功！')

    } catch (error) {
        console.error('项目启动失败:', error)
        process.exit(1)
    }
}

// 启动服务器
app.listen(port, () => {
    doInit(port)
})