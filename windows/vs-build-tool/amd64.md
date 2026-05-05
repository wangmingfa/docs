# 默认以`64`位启动，修改开始位置

> 修改快捷方式的目标：`右键`->`属性`->`目标`

```
C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe -noe -c "&{Set-Location 'D:\'; Import-Module 'D:\Program Files (x86)\Microsoft Visual Studio\18\BuildTools\Common7\Tools\Microsoft.VisualStudio.DevShell.dll'; Enter-VsDevShell 8a789088 -Arch amd64}"
```

* 解释
    * `Set-Location`开始位置
    * `-Arch amd64`以64位启动