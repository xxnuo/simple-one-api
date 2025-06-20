#!/bin/bash

# 安装依赖
echo "Installing dependencies..."
pnpm install

# 构建前端
echo "Building frontend..."
pnpm build

echo "Frontend build completed!" 