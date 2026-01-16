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
proot-distro login ubuntu --user myuser
# 卸载发行版
proot-distro remove <distro_name>
```

# 配置DNS
> 由于安装的linux发行版的DNS一般只有8.8.8.8，在国内的网络下，无法访问，这里推荐阿里的DNS
```bash
echo "nameserver 223.5.5.5" > /etc/resolv.conf
echo "nameserver 223.6.6.6" >> /etc/resolv.conf
```
