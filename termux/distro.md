# 安装发行版
```bash
# 更新仓库
pkg update && pkg upgrade -y
# 安装[proot-distro](https://github.com/termux/proot-distro)
pkg install proot-distro
# 查看所有发行版
proot-distro list
# 安装发行版，如proot-distro install debain
proot-distro install <distro_name>
# 启动发行版
proot-distro login <distro_name>
# 指定用户登录
proot-distro login <distro_name> --user <username>
# 卸载发行版
proot-distro remove <distro_name>
```

# 配置DNS
> 由于安装的linux发行版的DNS一般只有8.8.8.8，在国内的网络下，无法访问，这里推荐阿里的DNS
```bash
echo "nameserver 223.5.5.5" > /etc/resolv.conf
echo "nameserver 223.6.6.6" >> /etc/resolv.conf
```

# 安装Ubuntu24
> 由于`proot-distro`只保留最新版镜像，所以需要使用此脚本安装
```bash
#!/bin/bash

# termux安装ubuntu24

pkg update && pkg upgrade -y
pkg install proot-distro -y

# 创建使用快速代理的 Ubuntu 24.04 配置
mkdir -p $PREFIX/etc/proot-distro
cat > $PREFIX/etc/proot-distro/ubuntu24.sh << EOF
DISTRO_NAME="Ubuntu 24.04 LTS (Noble)"
TARBALL_URL['aarch64']="https://cdn.gh-proxy.org/https://github.com/termux/proot-distro/releases/download/v4.18.0/ubuntu-noble-aarch64-pd-v4.18.0.tar.xz"
TARBALL_SHA256['aarch64']="91acaa786b8e2fbba56a9fd0f8a1188cee482b5c7baeed707b29ddaa9a294daa"

# 如果你是 arm 架构（老手机），取消下面注释
# TARBALL_URL['arm']="https://cdn.gh-proxy.org/https://github.com/termux/proot-distro/releases/download/v4.18.0/ubuntu-noble-arm-pd-v4.18.0.tar.xz"
# TARBALL_SHA256['arm']="2afb7e1ff17983fa2cf4c57edeea6be427ffb0359d8628b24a147b4c8aa276d5"
EOF

echo "配置完成！正在安装 Ubuntu 24.04..."
proot-distro install ubuntu24
```