---
title: Quartz 搭建教程
---

# Quartz 搭建教程 🪩

本文记录了如何从零搭建 Obsidian + Quartz 的自动部署知识库网站。

## 最终效果

- 网站：https://wonder-o.github.io/nodes
- 支持 Obsidian 双链 `[[note]]`
- Graph View 知识图谱
- 全文搜索
- 自动部署（推送代码即更新）

## 一、准备工作

### 环境要求

```bash
# 检查 Git
git --version

# 检查 Node.js
node -v
npm -v

# 检查 GitHub SSH
ssh -T git@github.com
```

### 安装 Node.js

如果未安装 Node.js：
```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
```

---

## 二、创建 Quartz 项目

### 克隆 Quartz 仓库

```bash
cd ~/.openclaw/workspace
git clone https://github.com/jackyzha0/quartz.git notes
cd notes
```

### 安装依赖

```bash
npm install
```

### 项目结构

```
notes/
├── content/          # 笔记内容（相当于 Obsidian Vault）
│   └── index.md      # 首页
├── quartz/           # Quartz 核心代码
├── public/           # 构建输出
├── docs/             # 文档
└── package.json      # 依赖配置
```

---

## 三、创建初始笔记

### 首页（content/index.md）

```markdown
---
title: 欢迎
---

# 欢迎来到我的数字花园 🌱

这是用 [[Obsidian]] + [[Quartz]] 搭建的个人知识库。
```

### 示例笔记

在 `content/` 目录下创建任意 Markdown 文件，支持：

- **双链**：`[[其他笔记]]`
- **标签**：`#tag`
- **Frontmatter**：文件顶部的元数据

---

## 四、本地预览

### 启动开发服务器

```bash
cd ~/.openclaw/workspace/notes
npm run docs
```

### 访问网站

浏览器打开：http://localhost:8080

### 停止服务器

在终端按 `Ctrl + C`

---

## 五、推送到 GitHub

### 初始化仓库

```bash
cd ~/.openclaw/workspace/notes
git init
git add .
git commit -m "init"
```

### 连接远程仓库

```bash
# 替换为你的仓库地址
git remote add origin git@github.com:wonder-o/nodes.git
git branch -M v4
git push -u origin v4
```

---

## 六、开启 GitHub Pages

### 1. 进入仓库设置

访问：https://github.com/wonder-o/nodes/settings/pages

### 2. 配置 Source

- **Source**: 选择 **GitHub Actions**
- 保存后，Quartz 会自动配置部署

### 3. 等待部署

几分钟后访问：https://wonder-o.github.io/nodes

---

## 七、日常更新流程

### 在 Obsidian 中写笔记

1. 打开 Obsidian
2. 设置 Vault 路径：`~/.openclaw/workspace/notes/content`
3. 正常写笔记，使用 `[[双链]]` 语法

### 推送更新

```bash
cd ~/.openclaw/workspace/notes
git add content/
git commit -m "更新笔记"
git push
```

网站会自动更新！🚀

---

## 八、推荐 Obsidian 插件

### 1. Git

自动备份到 GitHub，无需手动推送。

### 2. Templater

强大的模板功能，自动插入日期、标签等。

### 3. Tag Wrangler

标签管理工具，重命名、批量编辑。

---

## 九、进阶配置

### 自定义主题

编辑 `quartz.config.ts`：

```typescript
const cfg = quartzConfig
theme: {
  typography: {
    headerFont: "sans-serif",
    bodyFont: "sans-serif",
  },
  colors: {
    lightMode: {
      light: "#faf8f8",
      dark: "#2b2b2b",
    }
  }
}
```

### 修改首页布局

编辑 `quartz.layout.ts` 自定义页面结构。

### 添加自定义 CSS

在 `quartz/styles/custom.scss` 添加样式。

---

## 十、常见问题

### Q: 部署失败怎么办？

检查 GitHub Actions 日志：
https://github.com/wonder-o/nodes/actions

### Q: 笔记没有更新？

- 检查是否推送到正确的分支
- 等待 GitHub Actions 完成部署（约 2-3 分钟）

### Q: Graph View 不显示？

确保笔记之间有 `[[双链]]` 连接，至少 3 个笔记。

---

## 十一、参考资源

- [Quartz 官方文档](https://quartz.jzhao.xyz/)
- [Obsidian 官方网站](https://obsidian.md/)
- [GitHub Pages 文档](https://docs.github.com/pages)

---

**开始你的数字花园之旅吧！** 🌱

> 写笔记 → 推送 → 自动更新 → 分享知识
