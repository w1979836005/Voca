module.exports = (sequelize, DataTypes) => {
    const WordList = sequelize.define("wordlist", {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true,
            comment: '主键',
            field: 'id'
        },
        wordListName: {
            type: DataTypes.STRING(100),
            allowNull: false,
            comment: '词单名',
            field: 'wordListName'
        },
        categories: {
            type: DataTypes.STRING(50),
            allowNull: false,
            comment: '词单分类 (如: cet4, toefl)',
            field: 'categories'
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: '词单描述',
            field: 'description'
        },
        isSystemBuiltIn: {
            type: DataTypes.TINYINT,
            allowNull: true,
            defaultValue: 1,
            comment: '是否系统内置 1-是 0-否',
            field: 'isSystemBuiltIn'
        },
        isDelete: {
            type: DataTypes.TINYINT,
            allowNull: true,
            defaultValue: 0,
            comment: '逻辑删除 0-未删除 1-删除',
            field: 'isDelete'
        }
    }, {
        // 启用时间戳
        timestamps: true,
        // 配置字段映射
        createdAt: 'createTime',
        updatedAt: 'updateTime',
        // 配置表名
        tableName: 'wordList',
        // 配置模型名称
        modelName: 'WordList',
        // 不自动转换为下划线命名（因为我们使用了 field 配置）
        underscored: false
    });

    // 定义类方法
    WordList.associate = function(models) {
        // 词单与单词的关联关系（多对多）
        WordList.belongsToMany(models.word, {
            through: 'word_list_word',
            foreignKey: 'wordListId',
            otherKey: 'wordId'
        });

        // 词单与用户的关联关系（多对多）
        WordList.belongsToMany(models.user, {
            through: 'user_wordlist',
            foreignKey: 'wordlistId',
            otherKey: 'userId'
        });
    };

    // 定义实例方法
    WordList.prototype.toJSON = function() {
        const values = Object.assign({}, this.get());
        return values;
    };

    // 定义作用域
    WordList.addScope('active', {
        where: {
            isDelete: 0
        }
    });

    WordList.addScope('builtin', {
        where: {
            isSystemBuiltIn: 1
        }
    });

    WordList.addScope('custom', {
        where: {
            isSystemBuiltIn: 0
        }
    });

    return WordList;
};