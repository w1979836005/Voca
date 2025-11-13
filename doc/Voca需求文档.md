好的，这是为您整合和更新后的完整项目文档。
---
# Voca - 背单词 App 项目文档
## 1. 项目概述
### 1.1 项目简介
**Voca** 是一款专为个人学习者设计的背单词移动应用。它旨在通过科学的方法（如间隔重复算法）和简洁的界面，帮助用户高效地记忆和巩固英语单词。
### 1.2 技术栈
- **前端**: uniapp (基于 Vue 3)
- **后端**: Node.js + Express.js
- **数据库**: MySQL 8.0
- **服务器**: 腾讯云服务器
- **部署**: Nginx (反向代理) + PM2 (Node 进程管理)
### 1.3 目标用户
- 需要背诵英语单词的学生。
- 希望通过个人项目实践全栈开发的开发者。
## 2. 功能需求
### 2.1 核心功能
| 功能模块     | 功能描述                                                   | 优先级 |
| ------------ | ---------------------------------------------------------- | ------ |
| **用户认证** | 用户注册、登录、登出。                                     | 高     |
| **词库管理** | 浏览系统内置词库（如四六级、考研），支持按字母或难度筛选。 | 高     |
| **当前词库** | 用户可以选择并切换一个当前学习的词库，学习进度与词库绑定。 | 高     |
| **单词学习** | 以“闪卡”形式展示单词（正面单词，背面释义和例句）。         | 高     |
| **学习模式** | 提供“认识”/“不认识”的按钮，记录学习情况。                  | 高     |
| **复习系统** | 基于艾宾浩斯遗忘曲线的间隔重复算法，智能安排复习计划。     | 高     |
| **个人进度** | 查看已掌握、正在学习、新单词的数量统计。                   | 中     |
| **每日目标** | 设置并追踪每日学习新单词的数量目标。                       | 中     |
### 2.2 扩展功能 (V2.0)
| 功能模块     | 功能描述                                                 | 优先级 |
| ------------ | -------------------------------------------------------- | ------ |
| **单词本**   | 用户可以创建自定义单词本，并添加单词。                   | 低     |
| **错题集**   | 自动收集用户标记为“不认识”的单词，方便集中复习。         | 低     |
| **主题切换** | 支持亮色/暗色主题。                                      | 低     |
| **数据统计** | 可视化展示学习数据，如学习天数、连续打卡天数、正确率等。 | 低     |
## 3. 页面设计
### 3.1 页面结构
| 页面路径                   | 页面名称 | 功能描述                                                     |
| -------------------------- | -------- | ------------------------------------------------------------ |
| `pages/index/index`        | **首页** | **展示当前词库、今日学习进度、每日目标。提供“切换词库”、“开始学习”、“复习”等核心入口。** |
| `pages/user/login`         | 登录页   | 用户输入账号密码进行登录。                                   |
| `pages/user/register`      | 注册页   | 新用户创建账号。                                             |
| `pages/word/wordbook-list` | 词库列表 | 展示所有可用的词库（如CET4, CET6, TOEFL），用户选择要学习的词库。 |
| `pages/study/flashcard`    | 学习页   | 核心学习页面，以闪卡形式展示单词，用户进行“认识/不认识”操作。 |
| `pages/study/review`       | 复习页   | 展示今日需要复习的单词列表。                                 |
| `pages/user/profile`       | 个人中心 | 显示用户信息、学习统计、设置（退出登录、主题切换等）。       |
### 3.2 页面交互流程
1.  **首次使用流程**:
    `启动App` -> `登录/注册` -> `跳转至词库列表页进行选择` -> `返回首页` -> `开始学习`
2.  **日常学习流程**:
    `启动App` -> `首页` -> **(可选) 点击“切换词库”跳转至词库列表页，选择后返回首页** -> `点击“开始学习”` -> `进入学习页` -> `完成今日新词` -> `进入复习页（如有）`
3.  **查看进度流程**:
    `首页` -> `个人中心` -> `查看学习统计`
## 4. 数据库设计
### 4.1 ER 图概览
```
[Users] 1--< [UserWords] >--1 [Words]
[Users] 1--N [Wordbooks]
[Wordbooks] N--M [Words] (through [WordbookWords])
```
### 4.2 表结构
#### 表 1: `users` (用户表)
| 字段名                | 类型         | 约束                                                  | 描述                 |
| --------------------- | ------------ | ----------------------------------------------------- | -------------------- |
| `id`                  | INT          | PRIMARY KEY, AUTO_INCREMENT                           | 用户唯一ID           |
| `username`            | VARCHAR(50)  | UNIQUE, NOT NULL                                      | 用户名               |
| `password_hash`       | VARCHAR(255) | NOT NULL                                              | 加密后的密码         |
| `email`               | VARCHAR(100) | UNIQUE, NOT NULL                                      | 邮箱                 |
| `daily_goal`          | INT          | DEFAULT 20                                            | 每日新词目标         |
| `current_wordbook_id` | INT          | FOREIGN KEY (`wordbooks.id`), NULL                    | **当前选择的词库ID** |
| `created_at`          | TIMESTAMP    | DEFAULT CURRENT_TIMESTAMP                             | 创建时间             |
| `updated_at`          | TIMESTAMP    | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间             |
#### 表 2: `words` (单词总表)
| 字段名             | 类型                           | 约束                        | 描述       |
| ------------------ | ------------------------------ | --------------------------- | ---------- |
| `id`               | INT                            | PRIMARY KEY, AUTO_INCREMENT | 单词唯一ID |
| `word`             | VARCHAR(100)                   | UNIQUE, NOT NULL            | 单词       |
| `pronunciation`    | VARCHAR(255)                   | NULL                        | 音标       |
| `definition`       | TEXT                           | NOT NULL                    | 中文释义   |
| `example_sentence` | TEXT                           | NULL                        | 例句       |
| `difficulty`       | ENUM('easy', 'medium', 'hard') | DEFAULT 'medium'            | 难度等级   |
| `wordbook_id`      | INT                            | NOT NULL                    | 所属词库ID |
#### 表 3: `wordbooks` (词库表)
| 字段名        | 类型         | 约束                        | 描述                  |
| ------------- | ------------ | --------------------------- | --------------------- |
| `id`          | INT          | PRIMARY KEY, AUTO_INCREMENT | 词库唯一ID            |
| `name`        | VARCHAR(100) | NOT NULL                    | 词库名称 (如 "CET-4") |
| `description` | TEXT         | NULL                        | 词库描述              |
| `is_system`   | BOOLEAN      | DEFAULT TRUE                | 是否为系统词库        |
#### 表 4: `user_words` (用户学习记录表 - 核心表)
| 字段名             | 类型                                             | 约束                        | 描述                        |
| ------------------ | ------------------------------------------------ | --------------------------- | --------------------------- |
| `id`               | INT                                              | PRIMARY KEY, AUTO_INCREMENT | 记录唯一ID                  |
| `user_id`          | INT                                              | FOREIGN KEY (`users.id`)    | 用户ID                      |
| `word_id`          | INT                                              | FOREIGN KEY (`words.id`)    | 单词ID                      |
| `status`           | ENUM('new', 'learning', 'reviewing', 'mastered') | DEFAULT 'new'               | 学习状态                    |
| `review_count`     | INT                                              | DEFAULT 0                   | 复习次数                    |
| `last_reviewed_at` | DATETIME                                         | NULL                        | 上次复习时间                |
| `next_review_at`   | DATETIME                                         | NULL                        | 下次复习时间 (用于间隔重复) |
| `created_at`       | TIMESTAMP                                        | DEFAULT CURRENT_TIMESTAMP   | 首次学习时间                |
## 5. API 接口设计
**Base URL**: `https://your-server.com/api`
### 5.1 认证模块
| 接口     | 方法 | 路径             | 请求体                        | 成功响应                                                |
| -------- | ---- | ---------------- | ----------------------------- | ------------------------------------------------------- |
| 用户注册 | POST | `/auth/register` | `{username, password, email}` | `{code: 200, message: "注册成功", data: {token, user}}` |
| 用户登录 | POST | `/auth/login`    | `{username, password}`        | `{code: 200, message: "登录成功", data: {token, user}}` |
### 5.2 词库模块
| 接口             | 方法     | 路径                        | 请求体              | 成功响应                                       |
| ---------------- | -------- | --------------------------- | ------------------- | ---------------------------------------------- |
| 获取词库列表     | GET      | `/wordbooks`                | -                   | `{code: 200, data: [{id, name, description}]}` |
| **切换当前词库** | **POST** | **`/user/switch-wordbook`** | **`{wordbook_id}`** | **`{code: 200, message: "词库切换成功"}`**     |
### 5.3 学习模块
| 接口               | 方法    | 路径                | 请求体                                 | 成功响应                                          |
| ------------------ | ------- | ------------------- | -------------------------------------- | ------------------------------------------------- |
| **获取今日新词**   | **GET** | **`/study/new`**    | **-**                                  | **`{code: 200, data: [{id, word, definition}]}`** |
| **获取今日复习词** | **GET** | **`/study/review`** | **-**                                  | **`{code: 200, data: [{id, word, definition}]}`** |
| 提交学习结果       | POST    | `/study/progress`   | `{word_id, status: 'known'/'unknown'}` | `{code: 200, message: "更新成功"}`                |
> **说明**: 获取今日新词和复习词的接口不再需要前端传递 `wordbook_id`，后端会根据用户的 `current_wordbook_id` 自动获取相应词库的单词。
### 5.4 用户模块
| 接口             | 方法    | 路径                | 请求体 | 成功响应                                                     |
| ---------------- | ------- | ------------------- | ------ | ------------------------------------------------------------ |
| **获取用户信息** | **GET** | **`/user/profile`** | **-**  | **`{code: 200, data: {username, daily_goal, current_wordbook_id, current_wordbook_name}}`** |
| 获取学习统计     | GET     | `/user/stats`       | -      | `{code: 200, data: {new_count, learning_count, mastered_count}}` |
> **说明**: 获取用户信息的接口，现在会返回当前词库的ID和名称，方便前端在首页展示。
### 5.5 响应格式规范
- **成功响应**:
  ```json
  {
    "code": 200,
    "message": "Success",
    "data": { ... }
  }
  ```
- **错误响应**:
  
  ```json
  {
    "code": 400, // 400: 客户端错误, 401: 未授权, 500: 服务器错误
    "message": "Error message"
  }
  ```
## 6. 实现细节与建议
### 6.1 后端
- **密码加密**: 使用 `bcrypt` 对用户密码进行哈希处理。
- **身份验证**: 使用 `jsonwebtoken` (JWT) 进行用户认证，前端在请求头中携带 `Authorization: Bearer <token>`。
- **间隔重复算法**: 在 `user_words` 表中，根据 `status` 和 `review_count` 计算 `next_review_at`。
  - 例如：`new` -> `learning` (1天后复习)
  - `learning` -> `reviewing` (3天后复习)
  - `reviewing` -> `mastered` (7天后复习)
  - 具体间隔可根据算法优化。
### 6.2 前端
- **状态管理**: 使用 Pinia 管理用户登录状态、当前词库、学习进度等全局数据。
- **UI 组件库**: 推荐使用 `wot ui`，它为 uniapp 提供了丰富的组件。
- **本地存储**: 使用 `uni.setStorageSync` 存储用户的 token 和当前词库信息，实现快速启动和离线状态展示。
- **网络请求**: 封装 `uni.request`，统一处理请求头（携带token）、错误拦截和响应拦截。
### 6.3 部署
- **后端**: 在服务器上使用 `PM2` 启动 Node.js 应用，确保进程稳定运行。
- **Nginx**: 配置 Nginx 作为反向代理，监听 80/443 端口，将请求转发给 Node.js 应用（如运行在 3000 端口），并配置 SSL 证书开启 HTTPS。
- **数据库**: 安装 MySQL 服务，创建数据库和表，并做好定期备份。
- **词库数据**: 可以通过编写脚本或手动导入的方式，将单词数据批量插入到 `words` 和 `wordbooks` 表中。
---
这份文档为你提供了从零到一构建 Voca App 的完整蓝图。祝你开发顺利！

