module.exports = (sequelize, DataTypes) => {
    const WordListWord = sequelize.define("word_list_word", {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true,
            comment: '主键'
        },
        wordListId: {
            type: DataTypes.BIGINT,
            allowNull: false,
            comment: '词单ID',
            references: {
                model: 'wordlist',
                key: 'id'
            }
        },
        wordId: {
            type: DataTypes.BIGINT,
            allowNull: false,
            comment: '单词ID',
            references: {
                model: 'word',
                key: 'id'
            }
        }
    }, {
        // 启用时间戳
        timestamps: true,
        // 配置字段映射
        createdAt: 'createTime',
        updatedAt: 'updateTime',
        // 配置表名
        tableName: 'word_list_word',
        // 配置模型名称
        modelName: 'WordListWord',
        // 设置复合唯一键
        indexes: [
            {
                unique: true,
                fields: ['wordListId', 'wordId'],
                name: 'uk_wordlist_word'
            }
        ]
    });

    // 定义类方法
    WordListWord.associate = function(models) {
        // 关联词单
        WordListWord.belongsTo(models.wordlist, {
            foreignKey: 'wordListId',
            as: 'wordlist'
        });

        // 关联单词
        WordListWord.belongsTo(models.word, {
            foreignKey: 'wordId',
            as: 'word'
        });
    };

    return WordListWord;
};