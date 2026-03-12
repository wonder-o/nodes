---
title: Daily Diary Reader 完整操作流程
---

# Daily Diary Reader 完整操作流程 📝

## 📋 项目概览

本文档记录了从零开始搭建 Daily Diary Reader 到部署的完整流程，包括：
- 项目初始化
- 代码编写
- 本地调试
- 网络配置
- 服务器部署
- 故障排查

---

## 🚀 快速开始

### 步骤 1：拉取最新代码

```bash
cd ~/.openclaw/workspace/nodes
git pull origin main
```

### 步骤 2：检查项目状态

```bash
# 查看分支
git branch

# 查看提交历史
git log --oneline -10
```

### 步骤 3：启动本地服务

```bash
cd ~/.openclaw/workspace/daily-diary-reader
node server.js
```

### 步骤 4：本地测试

```bash
# 测试 API
curl http://localhost:3000/api/diaries

# 测试首页
curl http://localhost:3000/

# 查看服务状态
ps aux | grep "node server.js"
```

---

## 🔧 代码修改流程

### 修改 server.js

```bash
# 进入项目目录
cd ~/.openclaw/workspace/daily-diary-reader

# 编辑代码
vim server.js

# 或使用其他编辑器
code server.js
```

### 重启服务

```bash
# 停止旧进程
pkill -f "node server.js"

# 启动新服务
cd ~/.openclaw/workspace/daily-diary-reader
node server.js > /tmp/diary-server.log 2>&1 &

# 等待启动
sleep 3

# 检查服务状态
ps aux | grep "node server.js"
```

### 查看日志

```bash
# 实时查看日志
tail -f /tmp/diary-server.log

# 或查看最近的日志
tail -50 /tmp/diary-server.log
```

---

## 📝 Git 操作流程

### 提交修改

```bash
# 进入 nodes 仓库
cd ~/.openclaw/workspace/nodes

# 复制 daily-diary-reader 到 nodes（如果需要）
cp -r ~/.openclaw/workspace/daily-diary-reader ~/.openclaw/workspace/nodes/

# 添加到 git
git add .

# 查看暂存
git status

# 提交修改
git commit -m "更新 Daily Diary Reader"
```

### 推送到远程仓库

```bash
# 推送到 GitHub
git push origin main

# 查看推送状态
git status
```

### 撤销提交（如果需要）

```bash
# 撤销上一次提交
git reset HEAD~1

# 查看当前状态
git log --oneline -3
```

---

## 🌐 网络访问方案

### 本机访问

```bash
# 直接访问
http://localhost:3000

# 或在浏览器中打开
# Mac
open http://localhost:3000
# Linux
xdg-open http://localhost:3000
```

### 局域网访问

```bash
# 访问本机 IP
http://192.168.3.57:3000

# 查看 IP 地址
hostname -I
```

### 公网访问

#### 方式 1：Tailscale（推荐）

```bash
# 安装并配置 Tailscale
# 1. 在 home-pi 上安装 Tailscale
# 2. 配置 Exit Node + Magicsocks（获得固定 IP）
# 3. 配置端口转发：3000 -> Tailscale 节点端口

# 访问
http://<tailscale-分配的IP>:3000
```

#### 方式 2：Cloudflare Tunnel（更稳定）

```bash
# 在 home-pi 上安装 Cloudflare Tunnel
cloudflared tunnel login
cloudflared tunnel create --url http://localhost:3000

# 使用隧道 URL
https://<your-subdomain>.trycloudflare.com
```

#### 方式 3：ngrok（最简单）

```bash
# 安装 ngrok
npm install -g ngrok

# 启动隧道
ngrok http 3000

# 使用分配的 URL
https://abc123.ngrok-free.app
```

---

## 🔍 故障排查

### 问题 1：端口被占用

**症状：** `EADDRINUSE: address already in use :3000`

**解决：**
```bash
# 查看占用端口的进程
lsof -i :3000

# 杀掉占用进程
kill -9 <PID>

# 重新启动服务
node server.js
```

### 问题 2：服务无法启动

**症状：** 服务启动后立即退出

**检查：**
```bash
# 查看错误日志
tail -50 /tmp/diary-server.log

# 检查端口是否被占用
lsof -i :3000

# 检查依赖是否安装
npm list
```

### 问题 3：API 返回 404

**症状：** 访问 http://localhost:3000/api/diaries 返回 404

**解决：**
```bash
# 检查日志路径
# server.js 中的 DATA_DIR 是否正确

# 测试 API
curl -v http://localhost:3000/api/diaries

# 检查路由配置
cat server.js | grep -E "(app.get|app.post)"
```

### 问题 4：网络无法访问

**症状：** 外网无法访问服务

**排查步骤：**
```bash
# 1. 检查防火墙
sudo ufw status
sudo ufw allow 3000/tcp

# 2. 检查云服务器防火墙
# 如果使用云服务器，在控制台开放 3000 端口

# 3. 检查服务是否正常运行
ps aux | grep "node server.js"

# 4. 测试本地访问
curl http://localhost:3000/

# 5. 检查监听地址
netstat -tlnp | grep :3000
```

---

## 📝 最佳实践

### 1. 版本控制

```bash
# 使用 Git 管理代码版本
git tag v1.0.0
git log --oneline --graph --all

# 回滚到稳定版本
git reset --hard v1.0.0
```

### 2. 备份策略

```bash
# 备份配置文件
cp ~/.openclaw/workspace/daily-diary-reader/server.js ~/.openclaw/workspace/daily-diary-reader/server.js.backup

# 定期备份到云
rsync -av ~/.openclaw/workspace/daily-diary-reader user@backup-server:/backups/
```

### 3. 日志管理

```bash
# 日志轮转
logrotate -f /tmp/diary-server.log

# 手动清理日志
rm -f /tmp/diary-server.log.*.old

# 压缩日志
gzip /tmp/diary-server.log
```

### 4. 监控和告警

```bash
# 添加监控脚本
while true; do
    if ! ps aux | grep "node server.js" > /dev/null; then
        echo "服务已停止！"
        # 发送告警（邮件、飞书、Telegram）
        sleep 10
    fi
    sleep 60
done
```

---

## 🎯 开发工作流

### 典型开发流程

```bash
# 1. 修改代码
vim server.js

# 2. 提交到 Git
cd ~/.openclaw/workspace/nodes
git add daily-diary-reader/
git commit -m "更新: 添加新功能"

# 3. 本地测试
cd ~/.openclaw/workspace/daily-diary-reader
node server.js

# 4. 测试 API
curl http://localhost:3000/api/diaries | jq '.'

# 5. 推送到远程
git push origin main
```

### 分支策略

```bash
# 开发分支
git checkout -b feature/new-feature

# 稳定开发完成后
git checkout main

# 合并分支
git merge feature/new-feature

# 删除分支
git branch -d feature/new-feature
```

---

## 📋 快速参考卡片

### 常用命令

| 操作 | 命令 |
|------|------|
| 拉取最新 | `git pull` |
| 查看状态 | `git status` |
| 提交 | `git add . && git commit -m "message"` |
| 推送 | `git push` |
| 查看日志 | `tail -f /tmp/diary-server.log` |
| 重启服务 | `pkill -f "node server.js" && node server.js` |

### 常用路径

| 文件 | 路径 |
|------|------|
| server.js | `~/.openclaw/workspace/daily-diary-reader/server.js` |
| 日志文件 | `/tmp/diary-server.log` |
| Git 仓库 | `~/.openclaw/workspace/nodes` |

---

## 🎯 下一步

1. **完善前端功能**
   - [ ] 添加日记编辑功能
   - [ ] 添加搜索高亮
   - [ ] 添加导出 PDF 功能
   - [ ] 添加标签分类

2. **优化后端性能**
   - [ ] 添加数据缓存
   - [ ] 实现分页加载
   - [ ] 优化搜索性能

3. **部署到生产环境**
   - [ ] 配置 HTTPS
   - [ ] 设置域名
   - [ ] 配置 CDN
   - [ ] 配置监控告警

4. **编写自动化脚本**
   - [ ] 自动备份脚本
   - [ ] 自动部署脚本
   - [ ] 健康检查脚本

---

**根据本文档的流程，你可以轻松地管理 Daily Diary Reader 项目的开发、测试和部署！** ✨
