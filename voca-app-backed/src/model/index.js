const { Sequelize } = require('sequelize');
const config = require('../config/db.config');

// 创建 Sequelize 实例
const sequelize = new Sequelize(
    config.DB,
    config.USER,
    config.PASSWORD,
    {
        host: config.HOST,
        dialect: config.dialect,
        pool: config.pool,
        timezone: config.timezone,
        define: config.define,
        logging: config.logging,
        dialectOptions: config.dialectOptions
    }
);

const db = {};

// 在这里导入所有模型
db.user = require('./user.model.js')(sequelize, Sequelize.DataTypes);
db.wordlist = require('./wordlist.model.js')(sequelize, Sequelize.DataTypes);
db.word = require('./word.model.js')(sequelize, Sequelize.DataTypes);
db.word_list_word = require('./word_list_word.model.js')(sequelize, Sequelize.DataTypes);
db.user_wordlist = require('./user_wordlist.model.js')(sequelize, Sequelize.DataTypes);

// 建立模型之间的关联关系
Object.keys(db).forEach((modelName) => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

// 导出实例和类
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
