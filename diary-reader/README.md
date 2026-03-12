# Daily Diary Reader

一个简单的前端项目，用于浏览 OpenClaw 每日系统状态总结。

## 功能特性

- 📅 按日期查看日志
- 📁 按月份浏览
- 🔍 搜索日志内容
- 🌓 支持浅色/深色主题
- 📱 响应式设计（手机友好）
- ⚡ 实时加载（无需刷新）

## 快速开始

### 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问：http://localhost:3000

### Docker 部署

```bash
# 构建镜像
docker build -t daily-diary .

# 运行容器
docker run -p 3000:3000 -v /path/to/daily-diary:/app/data daily-diary
```

访问：http://localhost:3000

### Docker Compose 部署

```bash
# 启动服务
docker-compose up -d

# 停止服务
docker-compose down

# 查看日志
docker-compose logs -f
```

访问：http://localhost:3000

---

## 技术栈

- **前端**：HTML + CSS + JavaScript (原生，无框架）
- **后端**：Node.js (Express)
- **部署**：Docker + Docker Compose
- **开发语言**：TypeScript (可选)

---

## 项目结构

```
daily-diary-reader/
├── src/
│   ├── index.html          # 首页
│   ├── app.js              # 主应用逻辑
│   ├── styles.css          # 样式
│   └── utils.js            # 工具函数
├── server.js               # 后端服务器
├── Dockerfile              # Docker 配置
├── docker-compose.yml      # Docker Compose 配置
├── package.json           # 依赖管理
└── README.md             # 项目说明
```

---

## 使用说明

1. **挂载日志目录**
   - 确保 `daily-diary` 目录可访问
   - 容器内路径：`/app/data`

2. **浏览日志**
   - 点击日期查看当天详情
   - 使用搜索框查找关键字
   - 切换浅色/深色主题

3. **配置选项**
   - 修改 `server.js` 中的 `DATA_DIR` 调整日志路径
   - 修改 `PORT` 调整端口

---

## 部署到服务器

### 方式 1：Docker（推荐）

```bash
# 克隆项目
git clone <repo-url> daily-diary-reader
cd daily-diary-reader

# 构建镜像
docker build -t daily-diary .

# 运行
docker run -d \
  --name daily-diary \
  -p 3000:3000 \
  -v /home/wonder/.openclaw/workspace/daily-diary:/app/data \
  --restart unless-stopped \
  daily-diary
```

### 方式 2：Docker Compose

```bash
# 修改 docker-compose.yml 中的卷挂载路径
volumes:
  - /home/wonder/.openclaw/workspace/daily-diary:/app/data

# 启动
docker-compose up -d
```

### 方式 3：直接运行（无容器）

```bash
# 安装依赖
npm install

# 启动
node server.js

# 访问
open http://localhost:3000
```

---

## 配置反向代理（Nginx）

```nginx
server {
    listen 80;
    server_name diary.example.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 开发路线图

- [ ] 添加 Markdown 渲染
- [ ] 支持导出为 PDF
- [ ] 添加数据统计图表
- [ ] 支持多用户/权限管理
- [ ] 添加 RSS 订阅功能

---

## 许可证

MIT
