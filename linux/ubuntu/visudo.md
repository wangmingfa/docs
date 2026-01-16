# visudo

```bash
# 编辑文件
EDITOR=vim visudo
```

## 以sudo运行某些命令不需要输入密码

添加以下内容到文件最后一行，<mark>请注意，一定要在最后一行</mark>，否则可能不生效。
因为后面的会覆盖前面的。
```
wmf     ALL=(ALL) NOPASSWD: /usr/sbin/service
```