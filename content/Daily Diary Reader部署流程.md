---
title: Daily Diary Reader 部署流程
---

# Daily Diary Reader 部署流程 🐳

## 📋 项目概述

Daily Diary Reader 是一个用于浏览 OpenClaw 每日系统状态总结的前端应用。

- **位置**：`~/.openclaw/workspace/daily-diary-reader/`
- **功能**：按日期浏览日记、搜索日志内容、Markdown 渲染
- **技术栈**：Node.js + Express + 原生前端

---

## 🚀 部署方式

### 方式 1：本地运行（开发调试）⭐

**适用场景**：本地开发、测试功能

```bash
# 1. 进入项目目录
cd ~/.openclaw/workspace/daily-diary-reader

# 2. 安装依赖（首次运行）
npm install

# 3. 启动服务
node server.js
```

**访问地址**：http://localhost:3000

**停止服务**：按 `Ctrl+C` 或运行：
```bash
pkill -f "node server.js"
```

---

### 方式 2：Docker 部署（推荐）🐳

**适用场景**：生产环境、稳定运行、隔离环境

#### 步骤 1：构建 Docker 镜像

```bash
cd ~/.openclaw/workspace/daily-diary-reader
docker build -t daily-diary .
```

#### 步骤 2：运行 Docker 容器

```bash
# 运行容器（前台，用于测试）
docker run -d \
  --name daily-diary \
  -p 3000:3000 \
  -v /home/wonder/.openclaw/workspace/daily-diary:/app/data \
  daily-diary
```

#### 步骤 3：验证服务运行

```bash
# 查看容器日志
docker logs -f daily-diary

# 检查服务状态
curl http://localhost:3000/api/diaries
```

#### 步骤 4：管理容器

```bash
# 停止容器
docker stop daily-diary

# 删除容器
docker rm daily-diary

# 重启容器
docker restart daily-diary

# 查看容器状态
docker ps -a | grep daily-diary
```

---

### 方式 3：Docker Compose 部署（推荐用于生产）

**适用场景**：多服务部署、使用 compose 管理依赖

#### 步骤 1：使用 Docker Compose 启动

```bash
cd ~/.openclaw/workspace/daily-diary-reader

# 启动服务（后台运行）
docker-compose up -d

# 查看日志
docker-compose logs -f daily-diary

# 停止服务
docker-compose down

# 查看服务状态
docker-compose ps
```

#### 步骤 2：使用启动脚本（推荐）⭐

```bash
cd ~/.openclaw/workspace/daily-diary-reader

# 使用启动脚本（自动选择运行方式）
./start.sh
```

启动脚本会提供三个选项：
1. Docker（推荐）
2. Docker Compose
3. 直接运行

---

### 方式 4：后台服务（Systemd）🔧

**适用场景**：服务器部署、开机自启动

#### 创建 Systemd 服务文件

```bash
sudo nano /etc/systemd/system/daily-diary.service
```

#### 服务文件内容

```ini
[Unit]
Description=Daily Diary Reader
After=network.target

[Service]
Type=simple
WorkingDirectory=/home/wonder/.openclaw/workspace/daily-diary-reader
ExecStart=/usr/bin/node /home/wonder/.openclaw/workspace/daily-diary-reader/server.js
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

#### 管理 Systemd 服务

```bash
# 重载服务配置
sudo systemctl daemon-reload

# 启动服务
sudo systemctl start daily-diary

# 停止服务
sudo systemctl stop daily-diary

# 重启服务
sudo systemctl restart daily-diary

# 设置开机自启动
sudo systemctl enable daily-diary

# 查看服务状态
sudo systemctl status daily-diary

# 查看服务日志
sudo journalctl -u daily-diary -f
```

---

## 🎯 推荐部署方案

### 开发环境

**方案**：直接运行（无需容器）

**优点**：
- 简单直接，适合快速开发
- 调试方便，可实时查看代码
- 资源占用低

**命令**：
```bash
cd ~/.openclaw/workspace/daily-diary-reader
node server.js
```

---

### 测试环境

**方案**：Docker 部署

**优点**：
- 环境隔离，不会影响主机
- 易于迁移和备份
- 版本管理简单

**命令**：
```bash
cd ~/.openclaw/workspace/daily-diary-reader
./start.sh
```

---

### 生产环境

**方案**：Docker Compose + Systemd

**优点**：
- 服务稳定，异常自动重启
- 开机自启动
- 日志统一管理
- 支持多服务编排

**部署步骤**：
1. 使用 Docker Compose 部署
2. 配置 Systemd 服务
3. 启动并设置开机自启

**命令**：
```bash
cd ~/.openclaw/workspace/daily-diary-reader
docker-compose up -d
sudo systemctl enable daily-diary
sudo systemctl start daily-diary
```

---

## 🔧 配置说明

### 修改日志目录

#### Docker 部署

```bash
# 修改容器卷挂载路径
docker run -d \
  -v /your/custom/path:/app/data \
  -p 3000:3000 \
  daily-diary
```

#### Docker Compose

```bash
# 编辑 docker-compose.yml
volumes:
  - /your/custom/path:/app/data
```

---

### 修改端口

#### 修改 server.js

```javascript
const PORT = process.env.PORT || 3000;  // 修改为你想要的端口
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
```

#### 修改端口（Docker）

```bash
# 修改容器端口映射
docker run -d -p 8080:3000 daily-diary

# 或修改 docker-compose.yml
ports:
  - "8080:3000"
```

---

### 反向代理配置（Nginx）

#### Nginx 配置文件

```nginx
server {
    listen 80;
    server_name diary.example.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_cache_bypass $http_upgrade;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # 静态资源缓存
    location /static/ {
        alias /home/wonder/.openclaw/workspace/daily-diary-reader/src/;
        expires 30d;
    }
}
```

**重载 Nginx**：
```bash
sudo nginx -t && sudo nginx -s reload
```

---

## 📊 日记数据格式

### 文件命名规则

```
daily-diary/
└── YYYY/
    └── MM/
        └── YYYY-MM-DD.md
```

**示例**：`2026-03-12.md`

### 日记内容结构

```
# 系统状态总结 - YYYY-MM-DD

**时间：** HH:MM:SS

---

## 📦 已安装 Skills

- skill-name (描述)
- skill-name2 (描述)
...

## 🧩 已加载 Plugins

- plugin-name (描述)
- plugin-name2 (描述)
...

## ⏰ 定时任务列表

- 时间 任务说明
- 时间 任务说明
...

## 📝 前一天活动总结

### Git 提交（OpenClaw Workspace）
- commit message

### Git 提交（Scripts）
- commit message

### 重要日志（最近 20 行）

#### 🌤 天气推送日志
日志内容...

#### 📰 新闻推送日志
日志内容...

## 💻 系统资源

### 磁盘使用
...

### 内存使用
...

### OpenClaw 版本
...

### Node 版本
...

---

**记录完成时间：** HH:MM:SS
```

---

## 🔍 故障排查

### 问题 1：无法访问服务

**检查**：
```bash
# 检查服务是否运行
ps aux | grep "node server.js"

# 检查端口是否监听
netstat -tlnp | grep 3000

# 检查容器日志
docker logs daily-diary
```

**可能原因**：
- 服务未启动
- 端口被占用
- 防火墙阻止

**解决方法**：
```bash
# 重启服务
docker restart daily-diary

# 检查防火墙
sudo ufw status
sudo ufw allow 3000/tcp

# 检查日志
docker logs -f daily-diary
```

### 问题 2：日记列表为空

**检查**：
```bash
# 检查日志目录
ls -la ~/.openclaw/workspace/daily-diary/

# 检查容器内目录
docker exec daily-diary ls -la /app/data
```

**可能原因**：
- 目录未挂载
- 权限问题
- 自动生成脚本未运行

**解决方法**：
```bash
# 手动生成测试日记
cd ~/.openclaw/workspace/scripts
./daily-summary.sh

# 检查脚本日志
tail -50 /tmp/daily-summary.log

# 重新挂载目录
docker stop daily-diary
docker rm daily-diary
docker run -d -v ~/.openclaw/workspace/daily-diary:/app/data -p 3000:3000 daily-diary
```

### 问题 3：Docker 构建失败

**检查**：
```bash
# 清理旧镜像
docker system prune -a

# 重新构建
docker build -t daily-diary .

# 检查构建日志
docker build --no-cache -t daily-diary .
```

---

## 📚 相关文档

### 项目文件说明

- **README.md** - 项目总体介绍
- **DEPLOY.md** - 部署指南
- **server.js** - 后端服务器
- **src/index.html** - 前端页面
- **src/app.js** - 前端逻辑
- **src/styles.css** - 样式文件
- **Dockerfile** - Docker 配置
- **docker-compose.yml** - Docker Compose 配置
- **start.sh** - 启动脚本

### 外部依赖

- **Express.js** - 后端框架
- **Node.js** - 运行环境
- **Docker** - 容器化部署

---

## 🚀 快速开始

### 开发环境（最简单）

```bash
cd ~/.openclaw/workspace/daily-diary-reader
npm install
node server.js
```

访问：http://localhost:3000

### Docker 部署（推荐）

```bash
cd ~/.openclaw/workspace/daily-diary-reader
./start.sh
```

选择 `1. Docker` 即可！

---

## 💡 最佳实践

1. **使用环境变量**管理配置，避免硬编码
2. **日志管理**：定期清理日志，避免磁盘满
3. **监控服务**：使用 `docker stats` 查看资源使用
4. **定期备份**：日志目录使用 Git 版本控制
5. **安全加固**：生产环境使用 HTTPS、配置防火墙
6. **性能优化**：使用缓存、CDN 加速静态资源

---

## 📞 联系支持

如遇到问题，请检查：
1. 日志文件：`/tmp/daily-summary.log`、`/tmp/iary-server.log`
2. 容器日志：`docker logs daily-diary`
3. 服务状态：`systemctl status daily-diary`

---

**部署完成后，就可以在浏览器中方便地查看所有系统状态总结了！** 📝✨
