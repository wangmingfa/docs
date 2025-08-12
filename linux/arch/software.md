# Sway
### 自动启动
```bash
if [ -z "$WAYLAND_DISPLAY" ] && [ -n "$XDG_VTNR" ] && [ "$XDG_VTNR" -eq 1 ] ; then
   exec sway
fi
```
# yay
### 安装 git和 base-devel包组​​（用于从 AUR 编译软件）
```bash
sudo pacman -S --needed git base-devel
```
###  克隆 yay 的 AUR 仓库
```bash
git clone https://aur.archlinux.org/yay.git
```
### 编译yay
```bash
cd yay && makepkg -si
```
### 验证安装
```bash
yay --version
```

# nerd fonts
### 搜索可用的 Nerd Font 包（可以将jetbrains改成其它想要安装的字体）
```bash
yay -Ss nerd-fonts | grep jetbrains
# 可能会输出extra/ttf-jetbrains-mono-nerd 3.4.0-1 (10.5 MiB 222.5 MiB) [nerd-fonts]
```
### 安装字体
```bash
yay -S ttf-jetbrains-mono-nerd
```
### 刷新字体缓存
```bash
fc-cache -fv
```

# starship
> 官网：[https://starship.rs/guide/](https://starship.rs/guide/)
### 安装
```bash
pacman -S starship
```
### 验证安装
```bash
starship --version
```
### 为shell配置starship
> 将以下代码放到rc文件中（比如~/.zshrc）。这里以zsh为例，其它方式参考官网[https://starship.rs/guide/#step-2-set-up-your-shell-to-use-starship](https://starship.rs/guide/#step-2-set-up-your-shell-to-use-starship)
```bash
eval "$(starship init zsh)"
```
