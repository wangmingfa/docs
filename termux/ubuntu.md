# 初始化
```bash
#!/bin/bash
# 脚本需要以root账户运行
set -e

echo "===> 配置 apt 为清华源"
sed -i 's|http://ports.ubuntu.com|https://mirrors.tuna.tsinghua.edu.cn/ubuntu-ports|g' /etc/apt/sources.list

echo "===> 更新系统"
apt update && apt upgrade -y

echo "===> 安装常用工具"
apt install git sudo curl wget vim neovim fzf ripgrep fd-find htop -y   # 安装常用工具

# 如果是ubuntu25一下的系统，则使用https://github.com/jesseduffield/lazygit/releases/download/v0.61.0/lazygit_0.61.0_linux_arm64.tar.gz安装，否则使用apt install lazygit
if [ $(lsb_release -rs) \< "25" ]; then
    echo "===> 安装 lazygit"
    curl -L https://github.com/jesseduffield/lazygit/releases/download/v0.61.0/lazygit_0.61.0_linux_arm64.tar.gz | tar -xzf - -C /usr/local/bin lazygit
else
    echo "===> 安装 lazygit"
    apt install lazygit -y
fi

echo "===> 安装 openssh-server"
apt install -y openssh-server net-tools

echo "===> 配置 sshd_config"

SSHD_CONFIG="/etc/ssh/sshd_config"

# 修改端口
sed -i 's/^#\?Port .*/Port 8022/' $SSHD_CONFIG

# 开启密码登录
sed -i 's/^#\?PasswordAuthentication .*/PasswordAuthentication yes/' $SSHD_CONFIG

# 开启公钥登录
sed -i 's/^#\?PubkeyAuthentication .*/PubkeyAuthentication yes/' $SSHD_CONFIG

# 允许 root 登录
sed -i 's/^#\?PermitRootLogin .*/PermitRootLogin yes/' $SSHD_CONFIG

echo "===> 创建 sshd 运行目录"
mkdir -p /var/run/sshd

echo "===> 启动 ssh 服务"
service ssh restart

# =========================
# 创建 start-sshd.sh
# =========================
echo "===> 创建 ~/start-sshd.sh"

cat > ~/start-sshd.sh << 'EOF'
#!/bin/bash

PROCESS_NAME="sshd"

if pgrep -x "$PROCESS_NAME" > /dev/null
then
    echo "Process $PROCESS_NAME is running."
else
    service ssh start
fi
EOF

chmod +x ~/start-sshd.sh

# =========================
# 创建 IP 显示脚本
# =========================
echo "===> 创建 ~/show-ip.sh"

cat > ~/show-ip.sh << 'EOF'
#!/bin/bash

ip=$(
  ifconfig 2>/dev/null |
  awk '/wlan[01]/{getline; print $2; exit}'
)

echo -e "当前IP：\033[32m$ip\033[0m"

port=$(awk '
    /^[[:space:]]*Port[[:space:]]+/ && $1=="Port" {
        print $2
        exit
    }
' /etc/ssh/sshd_config)

echo -e "ssh端口：\033[32m$port\033[0m"

export MY_IP=$ip
EOF

chmod +x ~/show-ip.sh

# =========================
# 写入 .bashrc（防重复）
# =========================
echo "===> 配置 ~/.bashrc"

if ! grep -q "start-sshd.sh" ~/.bashrc; then
    echo "~/start-sshd.sh" >> ~/.bashrc
fi

if ! grep -q "show-ip.sh" ~/.bashrc; then
    echo "source ~/show-ip.sh" >> ~/.bashrc
fi

echo "===> 完成 ✅"
echo "重新进入环境即可自动启动 SSH 并显示 IP"
echo "连接方式：ssh -p 8022 用户名@IP"

```

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