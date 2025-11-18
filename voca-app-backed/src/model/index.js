const { Sequelize } = require('sequelize');
const config = require('../config/dbConfig');

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
db.user = require('./userModel.js')(sequelize, Sequelize.DataTypes);
db.wordlist = require('./wordlistModel.js')(sequelize, Sequelize.DataTypes);
db.word = require('./wordModel.js')(sequelize, Sequelize.DataTypes);
db.word_list_word = require('./wordListWordModel.js')(sequelize, Sequelize.DataTypes);
db.user_wordlist = require('./userWordlistModel.js')(sequelize, Sequelize.DataTypes);

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
