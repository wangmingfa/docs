# 挂载windows硬盘

某些情况下，在linux上的文件管理器访问windows硬盘可能会报错：`not authorized to perform operation`，可通过以下脚本解决：

创建脚本<span class="strong code">fix-mount-permission.sh</span>

请注意，执行完脚本之后，<mark>请重启电脑</mark>

```bash
#!/bin/bash

# fix-mount-permission.sh
# 修复文件管理器无法挂载硬盘的问题

set -e

echo "=== 修复硬盘挂载权限 ==="

# 1. 添加用户到必要组
echo "1. 添加用户到必要组..."
sudo usermod -aG storage $(whoami)
sudo usermod -aG disk $(whoami)

# 2. 创建 Polkit 规则
echo "2. 创建 Polkit 规则..."
cat << 'EOF' | sudo tee /etc/polkit-1/rules.d/80-udisks2-mount.rules > /dev/null
polkit.addRule(function(action, subject) {
    if (action.id.indexOf("org.freedesktop.udisks2") == 0) {
        if (subject.isInGroup("storage")) {
            return polkit.Result.YES;
        }
    }
});
EOF

# 3. 创建挂载点并设置权限
echo "3. 设置挂载点权限..."
sudo mkdir -p /media/$USER
sudo chown $USER:$(id -gn) /media/$USER
sudo chmod 755 /media/$USER

# 4. 查看 NTFS 分区
echo "4. 检测到的 NTFS 分区:"
lsblk -o NAME,FSTYPE,LABEL,SIZE,MOUNTPOINT | grep -i ntfs || true

# 5. 重启相关服务
echo "5. 重启服务..."
sudo systemctl restart udisks2
if systemctl is-active --user gvfs-daemon.service >/dev/null 2>&1; then
    systemctl restart --user gvfs-daemon.service
fi

echo ""
echo "修复完成！请尝试以下操作："
echo "1. 重新登录或重启电脑"
echo "2. 在文件管理器中点击硬盘图标"
echo "3. 如果仍有问题，使用命令行测试："
echo "   lsblk -o NAME,FSTYPE,LABEL,SIZE"
echo "   sudo mount -o uid=\$(id -u),gid=\$(id -g) /dev/sdXY /mnt/test"
```