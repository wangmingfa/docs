# termux中的ubuntu开启sshd

1. 关闭termux中的sshd（重要，否则无法启动ubuntu的sshd服务）
2. 安装openssh-server（apt update && apt install openssh-server）
3. 设置密码（可选，passwd）
4. 配置sshd（vim /etc/ssh/sshd_config）：

```bash
# 端口
Port 8022
# 允许root登录
PermitRootLogin yes
# 公钥认证
PubkeyAuthentication yes
# 允许密码登录
PasswordAuthentication yes
```

5. 将公钥放到ubuntu的~/.ssh/authorized_keys中（可选）
6. 启动sshd服务（service ssh start）
7. 登录命令（ssh root@ip -p 8022）


# 显示当前IP
```bash
ifconfig 2>/dev/null | awk '/wlan0/{getline; print}' | awk '{print $2}'
```