require('dotenv').config();

module.exports = {
    HOST: process.env.DB_HOST || 'localhost',
    USER: process.env.DB_USER || 'root',
    PASSWORD: process.env.DB_PASSWORD || '',
    DB: process.env.DB_NAME || 'voca',
    dialect: "mysql", // 指定数据库类型
    timezone: '+08:00', // 设置时区
    define: {
        timestamps: true, // 自动添加 createdAt 和 updatedAt
        underscored: true, // 使用下划线命名 createdAt => create_time
        freezeTableName: true // 强制表名等于模型名
    },
    pool: {
        max: 5, // 连接池中最大连接数量
        min: 0, // 连接池中最小连接数量
        acquire: 30000, // 连接获取超时时间
        idle: 10000 // 连接空闲时间
    },
    logging: process.env.NODE_ENV === 'development' ? console.log : false, // 是否显示SQL语句
    dialectOptions: {
        // MySQL 数据库特殊配置
        charset: 'utf8mb4',
        collate: 'utf8mb4_unicode_ci'
    }
}