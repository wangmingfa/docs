# 系统安装

## 1. 制作启动盘（略）

## 2. 选择U盘启动（略）

## 3. 开始安装

* Arch的安装程序自动开启了sshd，可以先使用passwd命令设置root密码，然后使用ssh命令连接到安装程序。

* Arch自带的终端文字特别小，建议使用ssh连接到安装程序。

* 使用`archinstall`命令进行安装

## 4. 中文支持

* 安装中文字体：

```bash
sudo pacman -S noto-fonts-cjk
```

```bash
# 安装字体配置工具
sudo pacman -S fontconfig

# 生成字体缓存
fc-cache -fv
```

* 修改系统语言：

```bash
sudo vim /etc/locale.gen
```

取消注释以下行：

```
en_US.UTF-8 UTF-8
zh_CN.UTF-8 UTF-8
zh_CN.GBK GBK
zh_CN.GB2312 GB2312
zh_HK.UTF-8 UTF-8
zh_TW.UTF-8 UTF-8
```

* 生成 locale：

```bash
sudo locale-gen
```

* 设置系统默认语言：

```bash
sudo vim /etc/locale.conf
```

添加以下内容（按优先级选择）：

```ini
# 简体中文界面，英文应用
LANG=en_US.UTF-8
LANGUAGE="en_US:zh_CN:en"
LC_CTYPE=zh_CN.UTF-8
LC_TIME=en_US.UTF-8
LC_NUMERIC=en_US.UTF-8
LC_MONETARY=en_US.UTF-8
LC_MESSAGES=en_US.UTF-8
LC_NAME=en_US.UTF-8
LC_ADDRESS=en_US.UTF-8
LC_TELEPHONE=en_US.UTF-8
LC_MEASUREMENT=en_US.UTF-8
LC_IDENTIFICATION=en_US.UTF-8

# 或者完全使用中文
# LANG=zh_CN.UTF-8
# LANGUAGE=zh_CN:en_US:en
```
