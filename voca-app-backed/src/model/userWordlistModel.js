module.exports = (sequelize, DataTypes) => {
    const UserWordlist = sequelize.define("user_wordlist", {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true,
            comment: '主键'
        },
        userId: {
            type: DataTypes.BIGINT,
            allowNull: false,
            comment: '用户ID',
            references: {
                model: 'user',
                key: 'id'
            }
        },
        wordlistId: {
            type: DataTypes.BIGINT,
            allowNull: false,
            comment: '词单ID',
            references: {
                model: 'wordlist',
                key: 'id'
            }
        },
        progress: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: '学习进度（百分比）'
        },
        learnedCount: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: '已学习单词数量'
        },
        isCurrent: {
            type: DataTypes.TINYINT,
            allowNull: true,
            defaultValue: 0,
            comment: '是否为当前词单 0-否 1-是'
        },
        startTime: {
            type: DataTypes.DATE,
            allowNull: true,
            comment: '开始学习时间'
        },
        lastStudyTime: {
            type: DataTypes.DATE,
            allowNull: true,
            comment: '最后学习时间'
        }
    }, {
        // 启用时间戳
        timestamps: true,
        // 配置字段映射
        createdAt: 'createTime',
        updatedAt: 'updateTime',
        // 配置表名
        tableName: 'user_wordlist',
        // 配置模型名称
        modelName: 'UserWordlist',
        // 设置复合唯一键
        indexes: [
            {
                unique: true,
                fields: ['userId', 'wordlistId'],
                name: 'uk_user_wordlist'
            }
        ]
    });

    // 定义类方法
    UserWordlist.associate = function(models) {
        // 关联用户
        UserWordlist.belongsTo(models.user, {
            foreignKey: 'userId',
            as: 'user'
        });

        // 关联词单
        UserWordlist.belongsTo(models.wordlist, {
            foreignKey: 'wordlistId',
            as: 'wordlist'
        });
    };

    // 定义实例方法
    UserWordlist.prototype.toJSON = function() {
        const values = Object.assign({}, this.get());
        return values;
    };

    return UserWordlist;
};