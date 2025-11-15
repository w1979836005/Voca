# Voca 背单词应用 API 接口需求文档

## 项目概述

Voca 是一款专注于词汇学习的应用，提供词单管理、单词学习、学习进度跟踪、翻译等功能。本文档基于前端页面分析和数据库设计，定义了应用所需的全部 API 接口。

## 数据库设计参考

- **用户表 (user)**: 存储用户基本信息和设置
- **词单表 (wordList)**: 存储词单信息
- **单词总表 (word)**: 存储所有单词信息
- **词单单词关联表 (word_list_word)**: 管理词单与单词的关联关系

## 接口设计原则

- 统一的响应格式
- 合理的HTTP状态码使用
- 完善的错误处理
- RESTful API 设计风格
- JWT 认证机制

## 通用响应格式

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {},
  "timestamp": "2025-01-15T10:30:00Z"
}
```

## 认证授权

除注册和登录接口外，所有接口都需要在请求头中携带 JWT Token：

```
Authorization: Bearer <token>
```

---

## 1. 用户认证模块

### 1.1 用户注册

**接口地址：** `POST /api/auth/register`

**请求参数：**
```json
{
  "username": "string",      // 用户名（可选）
  "email": "string",         // 邮箱（必填，唯一）
  "password": "string",      // 密码（必填，至少6位）
  "code": "string"          // 邮箱验证码（必填）
}
```

**响应示例：**
```json
{
  "code": 200,
  "message": "注册成功",
  "data": {
    "userId": 1,
    "username": "testuser",
    "email": "test@example.com",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 1.2 发送邮箱验证码

**接口地址：** `POST /api/auth/send-code`

**请求参数：**
```json
{
  "email": "string"          // 邮箱地址
}
```

**响应示例：**
```json
{
  "code": 200,
  "message": "验证码发送成功"
}
```

### 1.3 用户登录

**接口地址：** `POST /api/auth/login`

**请求参数：**
```json
{
  "email": "string",         // 邮箱
  "password": "string"      // 密码
}
```

**响应示例：**
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "userId": 1,
    "username": "testuser",
    "email": "test@example.com",
    "userAvatar": "string",
    "studyGoal": 20,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 1.4 忘记密码

**接口地址：** `POST /api/auth/forgot-password`

**请求参数：**
```json
{
  "email": "string",         // 邮箱
  "code": "string",         // 验证码
  "newPassword": "string"   // 新密码
}
```

**响应示例：**
```json
{
  "code": 200,
  "message": "密码重置成功"
}
```

### 1.5 退出登录

**接口地址：** `POST /api/auth/logout`

**请求头：** `Authorization: Bearer <token>`

**响应示例：**
```json
{
  "code": 200,
  "message": "退出登录成功"
}
```

---

## 2. 用户信息模块

### 2.1 获取用户信息

**接口地址：** `GET /api/user/profile`

**请求头：** `Authorization: Bearer <token>`

**响应示例：**
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "userAvatar": "string",
    "userProfile": "string",
    "studyGoal": 20,
    "role": "user",
    "currentWordListId": 1,
    "createTime": "2024-01-15T10:30:00Z",
    "updateTime": "2024-01-15T10:30:00Z"
  }
}
```

### 2.2 更新用户信息

**接口地址：** `PUT /api/user/profile`

**请求头：** `Authorization: Bearer <token>`

**请求参数：**
```json
{
  "username": "string",      // 用户名（可选）
  "userAvatar": "string",    // 头像URL（可选）
  "userProfile": "string",   // 个人简介（可选）
  "studyGoal": "number"      // 每日学习目标（可选）
}
```

**响应示例：**
```json
{
  "code": 200,
  "message": "更新成功",
  "data": {
    "id": 1,
    "username": "newusername",
    "userAvatar": "string",
    "userProfile": "string",
    "studyGoal": 30
  }
}
```

### 2.3 修改密码

**接口地址：** `PUT /api/user/password`

**请求头：** `Authorization: Bearer <token>`

**请求参数：**
```json
{
  "oldPassword": "string",   // 原密码
  "newPassword": "string"    // 新密码
}
```

**响应示例：**
```json
{
  "code": 200,
  "message": "密码修改成功"
}
```

---

## 3. 词单管理模块

### 3.1 获取词单列表

**接口地址：** `GET /api/wordlist/list`

**请求头：** `Authorization: Bearer <token>`

**查询参数：**
- `page`: 页码（默认1）
- `size`: 每页数量（默认10）
- `search`: 搜索关键词（可选）
- `category`: 词单分类（可选）

**响应示例：**
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "total": 100,
    "page": 1,
    "size": 10,
    "list": [
      {
        "id": 1,
        "wordListName": "CET-4核心词汇",
        "categories": "cet4",
        "description": "大学英语四级考试核心词汇",
        "isSystemBuiltIn": true,
        "wordCount": 4500,
        "learnedCount": 1200,
        "progress": 27,
        "isInMyList": true,
        "createTime": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

### 3.2 获取词单详情

**接口地址：** `GET /api/wordlist/{id}`

**请求头：** `Authorization: Bearer <token>`

**路径参数：**
- `id`: 词单ID

**响应示例：**
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "id": 1,
    "wordListName": "CET-4核心词汇",
    "categories": "cet4",
    "description": "大学英语四级考试核心词汇",
    "isSystemBuiltIn": true,
    "wordCount": 4500,
    "learnedCount": 1200,
    "progress": 27,
    "isInMyList": true,
    "words": [
      {
        "id": 1,
        "word": "abandon",
        "phonetic": "/əˈbændən/",
        "definition": "放弃；抛弃；遗弃",
        "translation": "放弃，抛弃",
        "exampleSentence": "They had to abandon their car in the snow.",
        "exampleSentenceTranslation": "他们不得不把车遗弃在雪地里。",
        "difficulty": 3,
        "isLearned": false,
        "lastReviewTime": null
      }
    ]
  }
}
```

### 3.3 添加词单到我的列表

**接口地址：** `POST /api/user/wordlist/{id}`

**请求头：** `Authorization: Bearer <token>`

**路径参数：**
- `id`: 词单ID

**响应示例：**
```json
{
  "code": 200,
  "message": "添加成功"
}
```

### 3.4 从我的列表移除词单

**接口地址：** `DELETE /api/user/wordlist/{id}`

**请求头：** `Authorization: Bearer <token>`

**路径参数：**
- `id`: 词单ID

**响应示例：**
```json
{
  "code": 200,
  "message": "移除成功"
}
```

### 3.5 获取我的词单列表

**接口地址：** `GET /api/user/wordlist`

**请求头：** `Authorization: Bearer <token>`

**查询参数：**
- `page`: 页码（默认1）
- `size`: 每页数量（默认10）
- `search`: 搜索关键词（可选）

**响应示例：**
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "total": 5,
    "page": 1,
    "size": 10,
    "list": [
      {
        "id": 1,
        "wordListName": "CET-4核心词汇",
        "categories": "cet4",
        "wordCount": 4500,
        "learnedCount": 1200,
        "progress": 27,
        "isCurrent": true
      }
    ]
  }
}
```

### 3.6 设置当前词单

**接口地址：** `PUT /api/user/current-wordlist`

**请求头：** `Authorization: Bearer <token>`

**请求参数：**
```json
{
  "wordListId": 1
}
```

**响应示例：**
```json
{
  "code": 200,
  "message": "设置成功"
}
```

---

## 4. 学习模块

### 4.1 获取今日学习进度

**接口地址：** `GET /api/learning/progress`

**请求头：** `Authorization: Bearer <token>`

**响应示例：**
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "todayNewWords": {
      "count": 15,
      "total": 30,
      "percentage": 50
    },
    "todayReviewWords": {
      "count": 25,
      "total": 50,
      "percentage": 50
    },
    "dailyGoal": 50,
    "currentWordList": {
      "id": 1,
      "name": "CET-4核心词汇"
    }
  }
}
```

### 4.2 获取学习单词列表

**接口地址：** `GET /api/learning/words`

**请求头：** `Authorization: Bearer <token>`

**查询参数：**
- `type`: 学习类型（new/review）
- `wordListId`: 词单ID（可选，默认使用当前词单）
- `groupId`: 单词分组ID（可选）
- `page`: 页码（默认1）
- `size`: 每页数量（默认20）

**响应示例：**
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "total": 30,
    "page": 1,
    "size": 20,
    "wordGroups": [
      {
        "id": 1,
        "name": "第1组",
        "wordRange": "1-10",
        "wordCount": 10,
        "completedCount": 5,
        "progress": 50
      }
    ],
    "words": [
      {
        "id": 1,
        "word": "abandon",
        "phonetic": "/əˈbændən/",
        "definition": "放弃；抛弃；遗弃",
        "translation": "放弃，抛弃",
        "exampleSentence": "They had to abandon their car in the snow.",
        "exampleSentenceTranslation": "他们不得不把车遗弃在雪地里。",
        "audioUrl": "string",
        "difficulty": 3,
        "breakdown": ["a", "ban", "don"],
        "meanings": [
          {
            "part": "v.",
            "definition": "放弃；抛弃；遗弃"
          },
          {
            "part": "n.",
            "definition": "放任；放纵"
          }
        ]
      }
    ]
  }
}
```

### 4.3 标记单词学习状态

**接口地址：** `POST /api/learning/word/{id}/progress`

**请求头：** `Authorization: Bearer <token>`

**路径参数：**
- `id`: 单词ID

**请求参数：**
```json
{
  "status": "learned",        // 学习状态：learned, reviewing, mastered
  "correct": true,           // 是否答对
  "reviewTime": 86400       // 下次复习时间（秒数）
}
```

**响应示例：**
```json
{
  "code": 200,
  "message": "学习记录已保存"
}
```

### 4.4 完成今日学习

**接口地址：** `POST /api/learning/complete`

**请求头：** `Authorization: Bearer <token>`

**请求参数：**
```json
{
  "newWordsCount": 30,
  "reviewWordsCount": 25,
  "studyTime": 1800          // 学习时长（秒）
}
```

**响应示例：**
```json
{
  "code": 200,
  "message": "今日学习完成",
  "data": {
    "streak": 15,            // 连续学习天数
    "totalWords": 6845,      // 总学习词数
    "achievements": [         // 新获得成就
      {
        "id": 5,
        "name": "坚持者",
        "description": "连续学习7天"
      }
    ]
  }
}
```

---

## 5. 学习统计模块

### 5.1 获取学习统计数据

**接口地址：** `GET /api/statistics/overview`

**请求头：** `Authorization: Bearer <token>`

**查询参数：**
- `period`: 统计周期（week/month/year）

**响应示例：**
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "totalWords": 6845,
    "todayLearned": 25,
    "totalDays": 127,
    "continuousDays": 15,
    "dailyGoal": 50,
    "weekData": [
      { "day": "周一", "count": 30, "goal": 50 },
      { "day": "周二", "count": 45, "goal": 50 },
      { "day": "周三", "count": 20, "goal": 50 },
      { "day": "周四", "count": 50, "goal": 50 },
      { "day": "周五", "count": 35, "goal": 50 },
      { "day": "周六", "count": 50, "goal": 50 },
      { "day": "周日", "count": 25, "goal": 50 }
    ],
    "achievements": [
      {
        "id": 1,
        "name": "初学者",
        "description": "开始学习之旅",
        "icon": "🌱",
        "unlocked": true,
        "progress": 100
      }
    ]
  }
}
```

### 5.2 获取详细学习记录

**接口地址：** `GET /api/statistics/learning-history`

**请求头：** `Authorization: Bearer <token>`

**查询参数：**
- `startDate`: 开始日期
- `endDate`: 结束日期
- `page`: 页码（默认1）
- `size`: 每页数量（默认20）

**响应示例：**
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "total": 100,
    "page": 1,
    "size": 20,
    "records": [
      {
        "date": "2024-01-15",
        "newWordsCount": 30,
        "reviewWordsCount": 25,
        "studyTime": 1800,
        "accuracy": 0.85
      }
    ]
  }
}
```

---

## 6. 翻译模块

### 6.1 文本翻译

**接口地址：** `POST /api/translate/text`

**请求头：** `Authorization: Bearer <token>`

**请求参数：**
```json
{
  "text": "Hello, world",
  "sourceLanguage": "en",   // 源语言代码
  "targetLanguage": "zh"    // 目标语言代码
}
```

**响应示例：**
```json
{
  "code": 200,
  "message": "翻译成功",
  "data": {
    "originalText": "Hello, world",
    "translatedText": "你好，世界",
    "sourceLanguage": "en",
    "targetLanguage": "zh"
  }
}
```

### 6.2 获取语言列表

**接口地址：** `GET /api/translate/languages`

**响应示例：**
```json
{
  "code": 200,
  "message": "获取成功",
  "data": [
    {
      "code": "zh",
      "name": "中文"
    },
    {
      "code": "en",
      "name": "英语"
    },
    {
      "code": "ja",
      "name": "日语"
    }
  ]
}
```

### 6.3 保存翻译历史

**接口地址：** `POST /api/translate/history`

**请求头：** `Authorization: Bearer <token>`

**请求参数：**
```json
{
  "sourceText": "Hello, world",
  "translatedText": "你好，世界",
  "sourceLanguage": "en",
  "targetLanguage": "zh"
}
```

**响应示例：**
```json
{
  "code": 200,
  "message": "保存成功"
}
```

### 6.4 获取翻译历史

**接口地址：** `GET /api/translate/history`

**请求头：** `Authorization: Bearer <token>`

**查询参数：**
- `page`: 页码（默认1）
- `size`: 每页数量（默认10）

**响应示例：**
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "total": 50,
    "page": 1,
    "size": 10,
    "list": [
      {
        "id": 1,
        "sourceText": "Hello, world",
        "translatedText": "你好，世界",
        "sourceLanguage": "en",
        "targetLanguage": "zh",
        "createTime": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

---

## 7. 文件上传模块

### 7.1 上传头像

**接口地址：** `POST /api/upload/avatar`

**请求头：** `Authorization: Bearer <token>`

**请求参数：** `multipart/form-data`
- `file`: 图片文件

**响应示例：**
```json
{
  "code": 200,
  "message": "上传成功",
  "data": {
    "url": "https://example.com/uploads/avatars/user_1_avatar.jpg"
  }
}
```

---

## 8. 系统配置模块

### 8.1 获取应用配置

**接口地址：** `GET /api/system/config`

**响应示例：**
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "appVersion": "1.0.0",
    "dailyGoalDefault": 20,
    "maxWordsPerGroup": 10,
    "reviewIntervals": [1, 3, 7, 14, 30],
    "supportedLanguages": [
      { "code": "zh", "name": "中文" },
      { "code": "en", "name": "英语" }
    ]
  }
}
```

### 8.2 获取系统公告

**接口地址：** `GET /api/system/announcements`

**响应示例：**
```json
{
  "code": 200,
  "message": "获取成功",
  "data": [
    {
      "id": 1,
      "title": "系统维护通知",
      "content": "系统将于今晚进行维护",
      "type": "maintenance",
      "createTime": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

## 9. 错误码定义

| 错误码 | 说明 |
|-------|------|
| 200 | 操作成功 |
| 400 | 请求参数错误 |
| 401 | 未授权/Token无效 |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 409 | 资源冲突（如邮箱已存在） |
| 422 | 数据验证失败 |
| 429 | 请求过于频繁 |
| 500 | 服务器内部错误 |

---

## 10. 接口调用示例

### JavaScript (uni-app) 示例

```javascript
// 登录示例
const login = async (email, password) => {
  try {
    const response = await uni.request({
      url: 'https://api.voca.com/api/auth/login',
      method: 'POST',
      data: {
        email,
        password
      }
    })

    if (response.data.code === 200) {
      const { token, userId } = response.data.data
      // 保存token到本地存储
      uni.setStorageSync('token', token)
      uni.setStorageSync('userId', userId)
      return response.data
    } else {
      throw new Error(response.data.message)
    }
  } catch (error) {
    console.error('登录失败:', error)
    throw error
  }
}

// 获取学习进度示例
const getLearningProgress = async () => {
  try {
    const token = uni.getStorageSync('token')
    const response = await uni.request({
      url: 'https://api.voca.com/api/learning/progress',
      method: 'GET',
      header: {
        'Authorization': `Bearer ${token}`
      }
    })

    return response.data
  } catch (error) {
    console.error('获取学习进度失败:', error)
    throw error
  }
}
```

---

## 11. 开发建议

1. **接口优先级建议：**
   - 第一阶段：用户认证、用户信息、词单管理
   - 第二阶段：学习模块、进度统计
   - 第三阶段：翻译模块、文件上传

2. **性能优化：**
   - 实现接口缓存机制
   - 使用分页减少数据传输量
   - 图片资源使用CDN加速

3. **安全考虑：**
   - 实现请求频率限制
   - 敏感操作需要二次验证
   - 定期更新JWT密钥

4. **扩展性：**
   - 预留版本控制接口
   - 设计可扩展的数据结构
   - 考虑多语言支持

---

*本文档基于 Voca 应用前端页面分析和数据库设计生成，涵盖了应用所需的主要 API 接口。在实际开发过程中，可根据具体需求进行调整和扩展。*