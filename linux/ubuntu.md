# 启用sshd

## 更新软件包索引信息
```bash
sudo apt update && sudo apt upgrade -y
```

## 安装openssh-server
```bash
sudo apt install openssh-server
```

## 修改sshd配置，建议修改的配置：
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
