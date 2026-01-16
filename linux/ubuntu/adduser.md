# 创建用户

## 更新系统并安装`sudo`

```bash
apt update && apt install sudo -y
```

## 创建新用户

```bash
adduser <username>
```

## 将用户加入`sudo`用户组

```bash
usermod -aG sudo <username>
```

## 切换到新用户

```bash
su - <username>
```