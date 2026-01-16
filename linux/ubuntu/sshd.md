# sshd

## 更新软件包索引信息

```bash
sudo apt update && sudo apt upgrade -y
```

## 安装openssh-server

```bash
sudo apt install openssh-server
```

## 修改sshd配置，建议修改的配置
>
> Port（端口）、PubkeyAuthentication（是否开启公钥登录）、PasswordAuthentication（是否开启密码登录）

```bash
sudo vim /etc/ssh/sshd_config
```

## 启动ssh服务

```bash
sudo systemctl start ssh
```

```bash
# 或者
sudo service ssh start
```

## 将公钥放到ubuntu的~/.ssh/authorized_keys中

```bash
vim ~/.ssh/authorized_keys
```

<mark>如果发现加了公钥，也需要密码，有可能是某些目录、文件的权限不对，执行一下命令：</mark>

```bash
# 确保家目录权限正确（不能有组写入权限）
chmod 700 ~

# 确保 .ssh 目录权限为 700
chmod 700 ~/.ssh

# 确保 authorized_keys 文件权限为 600
chmod 600 ~/.ssh/authorized_keys
```

## ssh开启自启
>
> 编辑<span class="strong code">~/start-sshd.sh</span>

```bash
#!/bin/bash

PROCESS_NAME="sshd"

if pgrep -x "$PROCESS_NAME" > /dev/null
then
    echo "Process $PROCESS_NAME is running."
else
    sudo service ssh start
fi
```
