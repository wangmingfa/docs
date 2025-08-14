#!/bin/bash

SERVICE_NAME="docs"
PORT=9999

IP=$(ifconfig 2>/dev/null | awk '/wlan0/{getline; print}' | awk '{print $2}')
LOCAL_URL="http://localhost:$PORT"
URL="http://$IP:$PORT"

# 检查服务是否可访问
CHECK_CMD="curl -s -o /dev/null -w \"%{http_code}\" \"$LOCAL_URL\""
# 获取 HTTP 状态码
STATUS_CODE=$(eval $CHECK_CMD)

# 获取当前脚本的目录路径
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
START_CMD="pm2 start \"docsify serve $SCRIPT_DIR -p $PORT\" --name \"$SERVICE_NAME\""
# 如果状态码是200，则服务启动成功
if [[ "$STATUS_CODE" -ne 200 ]]; then
  # 检查服务是否在 pm2 list 中且状态为 online
  if pm2 list | grep "$SERVICE_NAME" | grep "online" >/dev/null; then
    echo "docs service $SERVICE_NAME is running, restart service"
    # 停止服务
    pm2 stop "$SERVICE_NAME"
    # 从pm2 list中删除服务，防止pm2 list中有多个重名的服务
    pm2 delete "$SERVICE_NAME"
  else
    echo "docs service $SERVICE_NAME is not running, starting..."
    # 使用pm2启动docsify
  fi
  eval $START_CMD
  # 等待2秒，等pm2启动完
  sleep 2
fi

# 再检查一次
STATUS_CODE=$(eval $CHECK_CMD)
if [[ "$STATUS_CODE" -eq 200 ]]; then
  echo "docs serve at $URL"
else
  echo "docs start failed."
fi
