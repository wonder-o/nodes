FROM node:18-alpine

WORKDIR /app

# 使用国内 npm 镜像
RUN npm config set registry https://registry.npmmirror.com

# 安装依赖
COPY package*.json ./
RUN npm install --omit=dev

# 复制应用文件
COPY src ./src
COPY server.js .

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["node", "server.js"]
