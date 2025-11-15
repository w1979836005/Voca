# Voca 背单词应用 - 后端项目

基于 Node.js + Express + Sequelize + MySQL 构建的背单词应用后端服务。

## 项目结构

```
voca-app-backed/
├── src/
│   ├── app.js              # 应用主入口
│   ├── init-database.js    # 数据库初始化脚本
│   ├── config/
│   │   └── db.config.js   # 数据库配置
│   ├── model/              # 数据模型
│   │   ├── index.js       # 模型汇总
│   │   ├── user.model.js  # 用户模型
│   │   ├── wordlist.model.js # 词单模型
│   │   ├── word.model.js  # 单词模型
│   │   ├── word_list_word.model.js # 词单-单词关联表
│   │   └── user_wordlist.model.js  # 用户-词单关联表
│   └── routes/
│       └── test.js        # 测试路由
├── .env                    # 环境配置文件
├── package.json
└── README.md
```

## 快速开始

### 1. 环境要求

- Node.js >= 14.0.0
- MySQL >= 5.7

### 2. 安装依赖

```bash
npm install
```

### 3. 配置数据库

在 `.env` 文件中配置数据库连接信息：

```env
# 服务器端口
PORT=3000

# 数据库配置
DB_NAME=voca
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
```

### 4. 创建数据库

在 MySQL 中创建数据库：

```sql
CREATE DATABASE voca CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 5. 初始化数据库

运行数据库初始化脚本：

```bash
npm run init-db
```

这个脚本会：
- 创建所有数据表
- 建立表之间的关联关系
- 创建一些基础数据（如默认词单和示例单词）

### 6. 启动应用

开发模式（自动重启）：
```bash
npm run dev
```

生产模式：
```bash
npm start
```

## 数据库设计

### 主要数据表

1. **user** - 用户表
2. **wordlist** - 词单表
3. **word** - 单词表
4. **word_list_word** - 词单与单词关联表
5. **user_wordlist** - 用户与词单关联表

### 模型关联关系

- 用户与词单：多对多关系（通过 user_wordlist 表）
- 词单与单词：多对多关系（通过 word_list_word 表）

## API 接口

### 测试接口

- `GET /` - 服务状态检查
- `GET /api/test-db` - 数据库连接测试
- `GET /api/test/users` - 获取用户列表
- `GET /api/test/wordlists` - 获取词单列表
- `GET /api/test/words` - 获取单词列表
- `GET /api/test/wordlists-with-words` - 获取词单及其单词
- `POST /api/test/create-user` - 创建测试用户

### 完整的 API 文档

请参考 `doc/Voca接口需求文档.md` 文件。

## 开发指南

### 模型使用示例

```javascript
const db = require('./model/index.js');

// 创建用户
const user = await db.user.create({
    username: 'testuser',
    email: 'test@example.com'
});

// 查询词单及包含的单词
const wordlistsWithWords = await db.wordlist.findAll({
    include: [{
        model: db.word,
        as: 'words',
        through: { attributes: [] }
    }]
});

// 使用作用域
const activeWordlists = await db.wordlist.scope('active').findAll();
```

### 添加新的 API 路由

1. 在 `src/routes/` 目录下创建路由文件
2. 在 `app.js` 中注册路由

```javascript
// 新建路由文件 src/routes/example.js
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    res.json({ message: 'Hello World' });
});

module.exports = router;

// 在 app.js 中注册
const exampleRoutes = require('./routes/example.js');
app.use('/api/example', exampleRoutes);
```

## 项目配置

### 环境变量

- `PORT` - 服务器端口（默认：3000）
- `DB_NAME` - 数据库名称
- `DB_HOST` - 数据库主机（默认：localhost）
- `DB_USER` - 数据库用户名
- `DB_PASSWORD` - 数据库密码
- `NODE_ENV` - 运行环境（development/production）

### Sequelize 配置

详细配置见 `src/config/db.config.js`，包括：
- 连接池配置
- 时区设置
- 字段命名规则
- 查询日志控制

## 部署建议

1. **生产环境配置**
   - 设置 `NODE_ENV=production`
   - 使用强密码
   - 配置数据库连接池
   - 启用日志管理

2. **数据库优化**
   - 创建适当的索引
   - 定期备份数据
   - 监控查询性能

## 常见问题

### Q: 如何重新创建数据表？
A: 运行 `npm run init-db` 脚本，或在开发环境下启动应用时会自动同步表结构。

### Q: 如何查看执行的 SQL 语句？
A: 在开发环境下，应用会自动打印 SQL 语句到控制台。

### Q: 如何修改数据库连接配置？
A: 编辑 `.env` 文件或 `src/config/db.config.js` 文件。

## 开发日志

- ✅ 完成 Sequelize 基础配置
- ✅ 创建所有数据模型
- ✅ 建立模型关联关系
- ✅ 实现数据库初始化脚本
- ✅ 添加基础测试接口
- ⏳ 待实现完整的业务 API 接口

## 联系信息

作者：高桥凉介

---

*本项目基于 Voca 背单词应用的需求开发，遵循 RESTful API 设计原则。*