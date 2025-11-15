module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define("user", {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true,
            comment: '主键',
            field: 'id'
        },
        username: {
            type: DataTypes.STRING(50),
            allowNull: false,
            comment: '用户名',
            field: 'username'
        },
        userAccount: {
            type: DataTypes.STRING(100),
            allowNull: true,
            comment: '用户账户',
            field: 'userAccount'
        },
        password: {
            type: DataTypes.STRING(255),
            allowNull: true,
            comment: '密码',
            field: 'password'
        },
        userAvatar: {
            type: DataTypes.STRING(255),
            allowNull: true,
            comment: '用户头像URL',
            field: 'userAvatar'
        },
        userProfile: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: '个人简介',
            field: 'userProfile'
        },
        studyGoal: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 20,
            comment: '每日学习新词数量目标',
            field: 'studyGoal'
        },
        email: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
            comment: '邮箱',
            field: 'email',
            validate: {
                isEmail: true
            }
        },
        isBan: {
            type: DataTypes.TINYINT,
            allowNull: true,
            defaultValue: 0,
            comment: '是否禁用 0-否 1-是',
            field: 'isBan'
        },
        role: {
            type: DataTypes.STRING(20),
            allowNull: true,
            defaultValue: 'user',
            comment: '用户角色 admin/user',
            field: 'role',
            validate: {
                isIn: [['admin', 'user']]
            }
        },
        currentWordListId: {
            type: DataTypes.BIGINT,
            allowNull: true,
            comment: '当前选择的词库ID',
            field: 'currentWordListId'
        },
        isDelete: {
            type: DataTypes.TINYINT,
            allowNull: true,
            defaultValue: 0,
            comment: '逻辑删除 0-未删除 1-删除',
            field: 'isDelete'
        }
    }, {
        // 启用时间戳，Sequelize 会自动管理 createdAt 和 updatedAt
        timestamps: true,
        // 配置字段映射
        createdAt: 'createTime',
        updatedAt: 'updateTime',
        // 不自动添加 deletedAt 字段（因为我们使用的是逻辑删除字段 isDelete）
        paranoid: false,
        // 配置表名
        tableName: 'user',
        // 配置模型名称
        modelName: 'User',
        // 不自动转换为下划线命名
        underscored: false
    });

    // 定义类方法
    User.associate = function(models) {
        // 用户与词单的关联关系（通过 user_wordlist 中间表）
        User.belongsToMany(models.wordlist, {
            through: 'user_wordlist',
            foreignKey: 'userId',
            otherKey: 'wordlistId'
        });
    };

    // 定义实例方法
    User.prototype.toJSON = function() {
        const values = Object.assign({}, this.get());
        // 删除敏感信息
        delete values.password;
        return values;
    };

    return User;
};
