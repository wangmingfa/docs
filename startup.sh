#!/bin/bash

SERVICE_NAME="docs"

# 检查服务是否在 pm2 list 中且状态为 online
if pm2 list | grep "$SERVICE_NAME" | grep "online" > /dev/null; then
  echo "pm2 service $SERVICE_NAME is running"
else
  echo "pm2 service $SERVICE_NAME is not running, starting..."
  # 使用pm2启动docsify
  pm2 start "docsify serve ." --name "$SERVICE_NAME" 
fi
