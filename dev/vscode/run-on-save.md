# Run on Save

* 安装：[https://marketplace.visualstudio.com/items?itemName=emeraldwalk.RunOnSave](https://marketplace.visualstudio.com/items?itemName=emeraldwalk.RunOnSave)
* 设置：保存文件时执行自定义命令，在`settings.json`中添加对应的配置即可。

## `moonbit`保存文件自动格式化

```json
"emeraldwalk.runonsave": {
    "commands": [
        {
            // 匹配哪些文件触发该命令
            "match": ".*\\.mbt$", 
            // 要执行的自定义命令
            "cmd": "moon fmt ${file}"
        }
    ]
}
```