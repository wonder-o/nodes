---
title: API Gateway 搭建指南
---

# API Gateway 搭建指南 🌉

搭建一个类似 Maton API Gateway 的服务，实现多平台 API 统一管理和 OAuth 托管。

---

## 🏗️ 核心架构

```
┌─────────────────────────────────────────────────────────────┐
│                    API Gateway 服务                      │
├─────────────────────────────────────────────────────────────┤
│                                                       │
│  ┌─────────────┐  ┌─────────────┐  ┌────────────┐ │
│  │ OAuth 服务   │  │ API 代理   │  │ 配置管理 │ │
│  │ (Token 存储)│  │ (请求转发) │  │          │ │
│  └──────┬──────┘  └──────┬──────┘  └───────────┘ │
│         │                 │                          │
└─────────┼─────────────────┼──────────────────────────┘
          │                 │
    ┌─────▼──────┐  ┌────▼────────┐
    │ Redis/数据库 │  │ 第三方 APIs  │
    │ 存储 Token  │  │ (Google, MS, │
    └────────────┘  │ GitHub...)    │
                   └───────────────┘
```

---

## 🛠️ 技术栈推荐

### 后端框架

| 选项 | 优点 | 难度 |
|------|------|--------|
| **Node.js + Express/Fastify** | JavaScript 全栈，生态丰富 | ⭐⭐ |
| **Go + Gin/Echo** | 高性能，并发好 | ⭐⭐⭐ |
| **Python + FastAPI** | 开发快，文档自动生成 | ⭐ |

### OAuth 服务

```json
{
  "providers": {
    "google": "OAuth 2.0",
    "microsoft": "OAuth 2.0",
    "github": "OAuth App",
    "notion": "OAuth 2.0",
    "slack": "OAuth 2.0"
  }
}
```

### Token 存储

- **Redis**（生产环境，高性能）
- **PostgreSQL**（持久化，支持事务）
- **MongoDB**（灵活，易扩展）

---

## 📝 核心功能模块

### 1. OAuth 认证管理

```javascript
// 用户授权流程
POST /api/oauth/{provider}/authorize  → 重定向到第三方
GET  /api/oauth/{provider}/callback   → 获取授权码
POST /api/oauth/{provider}/token     → 换取 Access Token
```

### 2. API 代理转发

```javascript
POST /api/proxy/{provider}/{endpoint}
Headers: {
  "Authorization": "Bearer {user_token}"
}
Body: { ... }
```

### 3. Token 自动刷新

```javascript
// 检查 Token 是否过期
if (token.expires_at < now) {
  new_token = await refreshAccessToken(token.refresh_token);
  updateDatabase(new_token);
}
```

### 4. 限流和缓存

```javascript
// 请求限流
if (requestsPerMinute > 100) {
  return 429; // Too Many Requests
}

// API 响应缓存
if (cache.get(endpoint, params)) {
  return cache.get(endpoint, params);
}
```

---

## 🚀 实现步骤

### 步骤 1：注册各平台 OAuth 应用

需要去每个平台创建应用：

| 平台 | 注册地址 | 说明 |
|------|---------|------|
| Google | console.cloud.google.com | 配置 OAuth 2.0 |
| Microsoft | portal.azure.com | Azure AD 应用 |
| GitHub | github.com/settings/developers | GitHub OAuth App |
| Notion | notion.so/my-integrations | Notion Integration |
| Slack | api.slack.com/apps | Slack App |

**关键配置：**
- Redirect URI: `https://your-gateway.com/api/oauth/{provider}/callback`
- Scopes: 选择需要的权限范围

### 步骤 2：搭建基础服务

#### Node.js + Express 示例

```javascript
// API Gateway 基础示例 (Node.js + Express)

const express = require('express');
const axios = require('axios');
const Redis = require('ioredis');
const crypto = require('crypto');

const app = express();
const redis = new Redis();

// OAuth 配置（从环境变量加载）
const providers = {
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    apiUrl: 'https://www.googleapis.com'
  },
  github: {
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    authUrl: 'https://github.com/login/oauth/authorize',
    tokenUrl: 'https://github.com/login/oauth/access_token',
    apiUrl: 'https://api.github.com'
  }
  // ... 其他平台
};

// 1. 生成授权 URL
app.get('/api/oauth/:provider/authorize', (req, res) => {
  const provider = providers[req.params.provider];
  const state = crypto.randomBytes(16).toString('hex');

  const authUrl = `${provider.authUrl}?` +
    `client_id=${provider.clientId}&` +
    `redirect_uri=${encodeURIComponent('https://your-gateway.com/api/oauth/' + req.params.provider + '/callback')}&` +
    `scope=email profile&` +
    `response_type=code&` +
    `state=${state}`;

  res.redirect(authUrl);
});

// 2. OAuth 回调处理
app.get('/api/oauth/:provider/callback', async (req, res) => {
  const provider = providers[req.params.provider];
  const { code, state } = req.query;

  // 换取 Access Token
  const tokenResponse = await axios.post(provider.tokenUrl, {
    code,
    client_id: provider.clientId,
    client_secret: provider.clientSecret,
    redirect_uri: 'https://your-gateway.com/api/oauth/' + req.params.provider + '/callback',
    grant_type: 'authorization_code'
  });

  const token = tokenResponse.data;

  // 存储到 Redis
  const userId = crypto.randomBytes(16).toString('hex');
  await redis.hset(`tokens:${userId}`, {
    access_token: token.access_token,
    refresh_token: token.refresh_token,
    expires_at: Date.now() + token.expires_in * 1000
  });

  res.json({ userId, message: '授权成功！' });
});

// 3. API 代理
app.all('/api/proxy/:provider/*', async (req, res) => {
  const provider = providers[req.params.provider];
  const userId = req.headers['x-user-id'];

  // 获取 Token
  const tokenData = await redis.hgetall(`tokens:${userId}`);

  // 检查是否过期，自动刷新
  if (tokenData.expires_at < Date.now()) {
    const newToken = await axios.post(provider.tokenUrl, {
      refresh_token: tokenData.refresh_token,
      client_id: provider.clientId,
      client_secret: provider.clientSecret,
      grant_type: 'refresh_token'
    });
    await redis.hset(`tokens:${userId}`, newToken.data);
    tokenData.access_token = newToken.data.access_token;
  }

  // 转发请求到第三方 API
  const endpoint = req.path.replace(`/api/proxy/${req.params.provider}`, '');
  const apiResponse = await axios({
    method: req.method,
    url: provider.apiUrl + endpoint,
    headers: {
      'Authorization': `Bearer ${tokenData.access_token}`,
      ...req.headers
    },
    data: req.body
  });

  res.json(apiResponse.data);
});

// 启动服务
app.listen(3000, () => {
  console.log('API Gateway 运行在 http://localhost:3000');
});
```

### 步骤 3：前端管理界面

为每个平台提供 OAuth 授权页面：

```
https://your-gateway.com/dashboard
  ├── Google (已授权)
  ├── GitHub (未授权) → 点击授权
  ├── Microsoft (已授权)
  └── Token 管理
```

### 步骤 4：部署和运维

#### 部署方案

```yaml
# docker-compose.yml
version: '3.8'
services:
  api-gateway:
    build: .
    ports:
      - "3000:3000"
    environment:
      - REDIS_HOST=redis
    depends_on:
      - redis

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  postgresql:
    image: postgres:15
    environment:
      - POSTGRES_USER=gateway
      - POSTGRES_PASSWORD=your_password
      - POSTGRES_DB=apigateway
    volumes:
      - db_data:/var/lib/postgresql/data

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf

volumes:
  db_data:
```

#### 监控和日志

- **日志**：Winston / Pino
- **监控**：Prometheus + Grafana
- **告警**：Sentry

---

## 🔐 安全要点

### 1. OAuth State 验证

```javascript
// 防止 CSRF 攻击
const state = crypto.randomBytes(16).toString('hex');
await redis.setex(`state:${state}`, 300, 'valid');
```

### 2. Token 加密存储

```javascript
// 敏感信息加密存储
const encryptedToken = crypto.encrypt(token.access_token);
await redis.set(`token:${userId}`, encryptedToken);
```

### 3. API 限流

```javascript
// 防止滥用
const key = `rate:${userId}:${provider}`;
if (await redis.incr(key) > 100) {
  return 429;
}
await redis.expire(key, 60);
```

### 4. HTTPS 强制

```nginx
server {
    listen 443 ssl;
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    add_header Strict-Transport-Security "max-age=31536000";
}
```

---

## 💰 成本和规模

### 云服务成本（月）

| 服务 | 免费层 | 生产环境 |
|------|--------|---------|
| 服务器 (2C4G) | ¥0 | ¥150-200 |
| Redis (托管) | ¥0 | ¥50 |
| PostgreSQL (托管) | ¥0 | ¥80-100 |
| CDN | ¥0 | ¥50-100 |
| 域名 | ¥10 | ¥10 |
| SSL 证书 | ¥0 (Let's Encrypt) | ¥0 |

**预估：¥300-500/月（小规模）**

---

## 📦 开源替代方案

### 1. Nginx API Gateway
- 配置简单，适合代理
- 不支持 OAuth 管理

### 2. Tyk / Kong
- 企业级 API Gateway
- 支持插件扩展
- 学习曲线陡峭

### 3. 自建简化版
参考上面的示例代码，快速搭建 MVP！

---

## 🎯 快速开始（MVP 版本）

**最简方案：1-2 周完成**

1. ✅ 注册 2-3 个平台的 OAuth 应用（Google, GitHub）
2. ✅ 用 Node.js 实现基础 OAuth 流程
3. ✅ 用 Redis 存储 Token
4. ✅ 实现简单的 API 代理
5. ✅ 部署到 Vercel / Railway

---

## 📚 推荐资源

- [[OAuth 2.0 规范]]：oauth.net/2/
- [RESTful API 设计](https://restfulapi.net)
- [各平台 OAuth 文档](https://oauth.net/2/grant-types/authorization-code/)

---

## 🔄 后续优化方向

- 添加更多 API 提供商
- 实现 Webhook 支持
- API 调用分析和统计
- 多租户支持
- API Key 管理

---

> 💡 这是一个可扩展的项目，从 MVP 开始，逐步完善功能！
