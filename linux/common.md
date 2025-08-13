# 修改默认shell
>
> 修改完之后重启终端

```bash
chsh -s $(which zsh)
```

# vim/neovim中文乱码
>
> 执行<span class="strong code">vim ~/.vimrc</span>，填入以下内容

```bash
set termencoding=utf-8
set encoding=utf8
set fileencodings=utf8,ucs-bom,gbk,cp936,gb2312,gb18030
```

# 快速添加路径到PATH
>
> 执行<span class="strong code">vim /usr/local/bin/add_to_path</span>，填入一下内容（记得给此文件添加可执行权限）

```bash
#!/bin/bash

# 检查参数
if [ -z "$1" ]; then
  echo "用法: add_to_path <路径>"
  exit 1
fi

# 获取输入路径并转换为绝对路径
NEW_PATH="$1"
ABS_PATH=$(realpath "$NEW_PATH" 2>/dev/null || readlink -f "$NEW_PATH" 2>/dev/null)
if [ -z "$ABS_PATH" ]; then
  echo "错误: 无法解析路径 $NEW_PATH"
  exit 1
fi

# 确保路径存在
if [ ! -d "$ABS_PATH" ]; then
  echo "错误: 路径 $ABS_PATH 不存在"
  exit 1
fi

# 检测当前 shell 并选择配置文件
if [ -n "$ZSH_VERSION" ]; then
  RC_FILE="$HOME/.zshrc"
elif [ -n "$BASH_VERSION" ]; then
  RC_FILE="$HOME/.bashrc"
else
  echo "不支持的 shell，请手动指定配置文件"
  exit 1
fi

add_content="export PATH=\"\$PATH:$ABS_PATH\""
# 检查路径是否已存在于 RC 文件中
if grep -Fx "$add_content" "$RC_FILE" >/dev/null; then
  echo "路径 $ABS_PATH 已存在于 $RC_FILE"
else
  # 追加绝对路径到配置文件
  echo "$add_content" >> "$RC_FILE"
  echo "已将 $ABS_PATH 添加到 $RC_FILE"
fi

# 应用更改
echo "请执行 source $RC_FILE 重新加载配置"
```

# ls中文名乱码
>
> 执行<span class="strong code">vim ~/.bashrc</span>，填入以下内容

```bash
export LC_ALL=C.UTF-8
```
