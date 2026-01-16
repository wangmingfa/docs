# visudo

```bash
# 编辑文件
EDITOR=vim visudo
```

## 以sudo运行某些命令不需要输入密码

添加以下内容到文件中
```
wmf     ALL=(ALL) NOPASSWD: /usr/sbin/service
```