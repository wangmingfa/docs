# 开启ssh服务
> 在termux中开启ssh服务（不是termux中的linux发行版）
```bash
# 1、更新仓库
pkg update && pkg upgrade -y
# 2、安装OpenSSH
pkg install openssh
# 3、设置密码，用于登录ssh
passwd
# 4、启动sshd
sshd
# 5、查看当前用户名
whoami
# 6、查看IP
ipconfig
# 7、连接（默认为8022端口）
ssh <username>@<ip> -p8022
```

# sshd开启自启
```bash
# 1、编写自启脚本。termux启动时，会自动运行termux-login.sh
cd /data/data/com.termux/files/usr/etc/
touch termux-login.sh
chmod +x termux-login.sh
# 2、修改termux-login.sh内容
vim termux-login.sh
```
> termux-login.sh
```bash
#!/bin/bash
echo "用户："$(whoami)
ifconfig | grep -E "(inet addr:|inet )([0-9]+\.[0-9]+\.[0-9]+\.[0-9]+)"
if pgrep -x "sshd" >/dev/null
  then
    echo "sshd运行中..."
  else
    sshd
    echo "自动启动sshd"
fi
```
