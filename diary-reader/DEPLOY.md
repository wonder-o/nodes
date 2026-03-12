# Daily Diary Reader - 快速部署指南

## 📋 项目文件

```
daily-diary-reader/
├── README.md              # 项目说明
├── package.json           # 依赖管理
├── server.js              # 后端服务器（Express）
├── Dockerfile             # Docker 配置
├── docker-compose.yml     # Docker Compose 配置
├── start.sh               # 启动脚本（推荐使用）
├── .gitignore           # Git 忽略文件
└── src/                  # 前端源码
    ├── index.html        # 首页
    ├── app.js            # 应用逻辑
    └── styles.css        # 样式文件
```

---

## 🚀 快速启动

### 方式 1：使用启动脚本（推荐）

```bash
cd ~/.openclaw/workspace/daily-diary-reader
./start.sh
```

### 方式 2：Docker

```bash
cd ~/.openclaw/workspace/daily-diary-reader

# 构建并运行
docker build -t daily-diary .
docker run -d \
  --name daily-diary \
  -p 3000:3000 \
  -v /home/wonder/.openclaw/workspace/daily-diary:/app/data \
  --restart unless-stopped \
  daily-diary
```

### 方式 3：Docker Compose

```bash
cd ~/.openclaw/workspace/daily-diary-reader

# 启动
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止
docker-compose down
```

### 方式 4：直接运行（需先安装依赖）

```bash
cd ~/.openclaw/workspace/daily-diary-reader

# 安装依赖
npm install

# 启动
npm start
```

---

## 🌐 访问地址

启动后访问：**http://localhost:3000**

---

## 📝 功能说明

### 1. 浏览日志
- 按日期分组显示
- 点击日记查看详情
- 支持浅色/深色主题切换

### 2. 搜索功能
- 在搜索框输入关键词
- 实时搜索日志内容
- 高亮显示搜索结果

### 3. Markdown 渲染
- 基础的 Markdown 格式支持
- 代码高亮
- 标题层级显示

---

## 🔧 配置说明

### 修改日志目录

**Docker:**
```bash
docker run -d \
  -v /your/custom/path:/app/data \
  daily-diary
```

**Docker Compose:**
```yaml
volumes:
  - /your/custom/path:/app/data
```

### 修改端口

**server.js:**
```javascript
const PORT = 3000; // 修改为你想要的端口
```

**Docker:**
```bash
docker run -d -p 8080:3000 daily-diary
```

---

## 🛑 停止服务

```bash
# Docker 方式
docker stop daily-diary
docker rm daily-diary

# Docker Compose 方式
docker-compose down

# 直接运行
# 按 Ctrl+C
```

---

## 📊 日记数据格式

脚本每天自动生成 Markdown 格式的日记，包含：

- 📦 已安装 Skills
- 🧩 已加载 Plugins
- ⏰ 定时任务列表
- 📝 前一天活动总结
- 📋 重要日志
- 💻 系统资源
- 📦 版本信息

---

## 🌟 高级功能

### 后续可添加：

- [ ] 支持编辑日记
- [ ] 导出为 PDF
- [ ] 数据统计图表
- [ ] 支持标签分类
- [ ] 添加 RSS 订阅
- [ ] 支持全文搜索
- [ ] 添加数据可视化

---

## 🐛 常见问题

### Q: 访问 404？

A: 检查日志目录是否正确挂载：
```bash
docker inspect daily-diary | grep -A 10 Mounts
```

### Q: 日记列表为空？

A: 确保 `daily-diary` 目录存在且有文件：
```bash
ls -la ~/.openclaw/workspace/daily-diary
```

### Q: 无法搜索？

A: 确认后端 API 正常：
```bash
curl http://localhost:3000/api/search?q=技能
```

---

## 📚 参考

- [Express.js 文档](https://expressjs.com/)
- [Docker 文档](https://docs.docker.com/)
- [Markdown 语法](https://www.markdownguide.org/)
