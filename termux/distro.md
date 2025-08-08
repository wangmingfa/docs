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
# 卸载发行版
proot-distro remove <distro_name>
```
