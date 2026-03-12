---
title: Atlassian MCP 安装指南
---

# Atlassian MCP 安装指南 🔌

通过 mcporter + mcp-remote 连接 Atlassian Cloud（Jira、Confluence、Compass），让 AI 助手直接操作你的 Atlassian 数据。

---

## 📋 前置条件

- Node.js 18+
- mcporter CLI
- Atlassian Cloud 账号（Jira/Confluence）
- 现代浏览器（用于 OAuth 认证）

---

## 🚀 安装步骤

### 1. 安装 mcporter

```bash
npm install -g mcporter
```

### 2. 安装 mcp-remote

mcp-remote 是 Atlassian 官方推荐的本地代理，用于处理 OAuth 认证流程：

```bash
npm install -g mcp-remote
```

### 3. 配置 Atlassian MCP 服务器

```bash
mcporter config add atlassian \
  --command "mcp-remote" \
  --arg "https://mcp.atlassian.com/v1/mcp" \
  --description "Atlassian Rovo MCP Server via mcp-remote" \
  --scope home
```

配置会保存在 `~/.mcporter/mcporter.json`。

### 4. 首次认证

当你第一次调用 Atlassian 工具时，会自动触发 OAuth 流程：

```bash
mcporter list atlassian --schema
```

或者手动触发认证：

```bash
mcp-remote https://mcp.atlassian.com/v1/mcp
```

浏览器会自动打开授权页面，登录你的 Atlassian 账号并授权即可。

### 5. 验证连接

```bash
# 获取可访问的 Atlassian 站点
mcporter call atlassian.getAccessibleAtlassianResources --output json

# 获取当前用户信息
mcporter call atlassian.atlassianUserInfo --output json
```

---

## 📁 配置文件位置

| 文件 | 路径 |
|------|------|
| mcporter 配置 | `~/.mcporter/mcporter.json` |
| OAuth Token 缓存 | `~/.mcp-remote/` |

查看当前配置：

```bash
mcporter config list
mcporter config get atlassian --json
```

---

## 🛠️ 功能范围

### 📘 Confluence（13 个工具）

#### 读取操作

| 工具 | 说明 |
|------|------|
| `getConfluencePage` | 获取页面内容 |
| `searchConfluenceUsingCql` | CQL 搜索内容 |
| `getConfluenceSpaces` | 列出空间 |
| `getPagesInConfluenceSpace` | 列出空间内的页面 |
| `getConfluencePageFooterComments` | 获取页脚评论 |
| `getConfluencePageInlineComments` | 获取行内评论 |
| `getConfluenceCommentChildren` | 获取评论回复 |
| `getConfluencePageDescendants` | 获取子页面 |

#### 写入操作

| 工具 | 说明 |
|------|------|
| `createConfluencePage` | 创建页面 |
| `updateConfluencePage` | 更新页面 |
| `createConfluenceFooterComment` | 添加页脚评论 |
| `createConfluenceInlineComment` | 添加行内评论 |

---

### 📗 Jira（15 个工具）

#### 读取操作

| 工具 | 说明 |
|------|------|
| `getJiraIssue` | 获取 Issue 详情 |
| `searchJiraIssuesUsingJql` | JQL 搜索 Issues |
| `getVisibleJiraProjects` | 列出项目 |
| `getJiraProjectIssueTypesMetadata` | 获取 Issue 类型 |
| `getJiraIssueTypeMetaWithFields` | 获取字段元数据 |
| `getTransitionsForJiraIssue` | 获取可用的状态转换 |
| `getJiraIssueRemoteIssueLinks` | 获取远程链接 |
| `getIssueLinkTypes` | 获取 Issue 链接类型 |
| `lookupJiraAccountId` | 查找用户 ID |

#### 写入操作

| 工具 | 说明 |
|------|------|
| `createJiraIssue` | 创建 Issue |
| `editJiraIssue` | 编辑 Issue |
| `transitionJiraIssue` | 状态转换 |
| `addCommentToJiraIssue` | 添加评论 |
| `addWorklogToJiraIssue` | 添加工时记录 |
| `createIssueLink` | 创建 Issue 链接 |

---

### 🔍 通用工具（3 个）

| 工具 | 说明 |
|------|------|
| `atlassianUserInfo` | 获取当前用户信息 |
| `getAccessibleAtlassianResources` | 获取可访问的站点 |
| `search` | Rovo 搜索（同时搜索 Jira + Confluence）|
| `fetch` | 通过 ARI 获取资源详情 |

---

## 💡 使用示例

### 搜索内容

```bash
# Rovo 搜索（推荐）
mcporter call atlassian.search query="meeting notes"

# Confluence CQL 搜索
mcporter call atlassian.searchConfluenceUsingCql \
  cloudId="your-cloud-id" \
  cql='title ~ "meeting" AND type = page'

# Jira JQL 搜索
mcporter call atlassian.searchJiraIssuesUsingJql \
  cloudId="your-cloud-id" \
  jql='project = PROJ AND status = "In Progress"'
```

### 操作 Confluence

```bash
# 列出空间
mcporter call atlassian.getConfluenceSpaces \
  cloudId="your-cloud-id" \
  --output json

# 获取页面
mcporter call atlassian.getConfluencePage \
  cloudId="your-cloud-id" \
  pageId="123456789" \
  contentFormat="markdown"

# 创建页面
mcporter call atlassian.createConfluencePage \
  cloudId="your-cloud-id" \
  spaceId="space-id" \
  title="My New Page" \
  body="# Hello World\n\nThis is content." \
  contentFormat="markdown"
```

### 操作 Jira

```bash
# 获取 Issue
mcporter call atlassian.getJiraIssue \
  cloudId="your-cloud-id" \
  issueIdOrKey="PROJ-123"

# 创建 Issue
mcporter call atlassian.createJiraIssue \
  cloudId="your-cloud-id" \
  projectKey="PROJ" \
  issueTypeName="Bug" \
  summary="Something is broken" \
  description="Description here"

# 添加评论
mcporter call atlassian.addCommentToJiraIssue \
  cloudId="your-cloud-id" \
  issueIdOrKey="PROJ-123" \
  commentBody="This is a comment"

# 状态转换
mcporter call atlassian.transitionJiraIssue \
  cloudId="your-cloud-id" \
  issueIdOrKey="PROJ-123" \
  transition='{"id": "31"}'
```

---

## ⚠️ 注意事项

1. **OAuth Token 有效期** - Token 会过期，mcp-remote 会自动处理刷新
2. **权限范围** - 只能访问你账号有权限的数据
3. **IP 白名单** - 如果组织启用了 IP 白名单，需要确保你的 IP 在允许列表中
4. **API Token 认证** - 无头模式可以使用 API Token（需要管理员启用）

---

## 🔗 相关链接

- [Atlassian MCP Server GitHub](https://github.com/atlassian/atlassian-mcp-server)
- [mcporter 文档](http://mcporter.dev)
- [mcp-remote npm](https://www.npmjs.com/package/mcp-remote)
- [Atlassian Rovo MCP 官方文档](https://support.atlassian.com/security-and-access-policies/docs/understand-atlassian-rovo-mcp-server/)

---

## 📅 安装信息

- **安装日期**: 2026-03-12
- **mcporter 版本**: latest
- **mcp-remote 版本**: 0.1.38
- **测试站点**: phiz.atlassian.net
