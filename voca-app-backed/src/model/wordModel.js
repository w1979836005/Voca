module.exports = (sequelize, DataTypes) => {
    const Word = sequelize.define("word", {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true,
            comment: '主键'
        },
        word: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
            comment: '单词'
        },
        phonetic: {
            type: DataTypes.STRING(100),
            allowNull: true,
            comment: '音标'
        },
        definition: {
            type: DataTypes.TEXT,
            allowNull: false,
            comment: '释义'
        },
        exampleSentence: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: '例句'
        },
        affixes: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: '词缀拆分信息'
        },
        audioUrl: {
            type: DataTypes.STRING(255),
            allowNull: true,
            comment: '发音音频URL'
        },
        difficulty: {
            type: DataTypes.TINYINT,
            allowNull: true,
            defaultValue: 1,
            comment: '难度等级 1-5',
            validate: {
                min: 1,
                max: 5
            }
        },
        isDelete: {
            type: DataTypes.TINYINT,
            allowNull: true,
            defaultValue: 0,
            comment: '逻辑删除 0-未删除 1-删除'
        }
    }, {
        // 启用时间戳
        timestamps: true,
        // 配置字段映射
        createdAt: 'createTime',
        updatedAt: 'updateTime',
        // 配置表名
        tableName: 'word',
        // 配置模型名称
        modelName: 'Word'
    });

    // 定义类方法
    Word.associate = function(models) {
        // 单词与词单的关联关系（多对多）
        Word.belongsToMany(models.wordlist, {
            through: 'word_list_word',
            foreignKey: 'wordId',
            otherKey: 'wordListId'
        });
    };

    // 定义实例方法
    Word.prototype.toJSON = function() {
        const values = Object.assign({}, this.get());
        return values;
    };

    // 定义作用域
    Word.addScope('active', {
        where: {
            isDelete: 0
        }
    });

    Word.addScope('difficulty', (level) => ({
        where: {
            difficulty: level
        }
    }));

    return Word;
};