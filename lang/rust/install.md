# 安装Rust

由于国内网络安装rust很慢，因此需要设置国内镜像源

## 设置清华镜像环境变量

```bash
export RUSTUP_DIST_SERVER=https://mirrors.tuna.tsinghua.edu.cn/rustup
export RUSTUP_UPDATE_ROOT=https://mirrors.tuna.tsinghua.edu.cn/rustup/rustup
```

## 安装

```bash
curl -sSf https://sh.rustup.rs | sh
```

## 设置PATH

```bash
. "$HOME/.cargo/env"            # For sh/bash/zsh/ash/dash/pdksh
source "$HOME/.cargo/env.fish"  # For fish
source $"($nu.home-path)/.cargo/env.nu"  # For nushell
```

## 修改cargo源

不同操作系统的配置文件所在目录不一样，此处以linux为例

### 创建cargo配置目录

```bash
mkdir -p ~/.cargo
```

### 编辑 ~/.cargo/config.toml

```bash
vim ~/.cargo/config.toml
```
内容如下：
```toml
[source.crates-io]
replace-with = "ustc"

[source.ustc]
registry = "sparse+https://mirrors.ustc.edu.cn/crates.io-index/"
```
