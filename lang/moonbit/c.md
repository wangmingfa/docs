# 调用c语言

## 1. 书写c语言代码（.h和.c文件）

* `process.h`（理论上不需要.h文件）

```c
#ifndef PROCESS
#define PROCESS

/**
 * 执行终端命令并返回打印的内容
 * 注意：调用者负责释放返回的字符串内存
 */
char* execute_command(const char* cmd);

#endif
```

* `process.c`

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "process.h"

/**
 * 执行终端命令并返回打印的内容
 * 注意：调用者负责释放返回的字符串内存
 */
char* execute_command(const char* cmd) {
    FILE* fp;
    char buffer[1024];
    char* result = NULL;
    size_t result_len = 0;

    // 使用 popen 执行命令并打开读取流
    // "r" 表示读取模式
    fp = popen(cmd, "r");
    if (fp == NULL) {
        perror("popen 失败");
        return NULL;
    }

    // 循环读取命令输出
    while (fgets(buffer, sizeof(buffer), fp) != NULL) {
        size_t buffer_len = strlen(buffer);
        // 动态扩大内存以容纳新读取的内容
        char* temp = realloc(result, result_len + buffer_len + 1);
        if (temp == NULL) {
            perror("内存分配失败");
            free(result);
            pclose(fp);
            return NULL;
        }
        result = temp;
        strcpy(result + result_len, buffer);
        result_len += buffer_len;
    }

    // 关闭管道并获取退出状态
    int status = pclose(fp);
    if (status == -1) {
        perror("pclose 失败");
    }

    return result;
}
```

## 2. 配置c代码依赖

假设以上代码位于项目下的`cmd/main/c/`目录中。

在`cmd/main/moon.pkg.json`中添加`native-stub`，值为相对于moon.pkg.json的c文件目录：`c/process.c`，如下所示：

```json
{
  "is-main": true,
  "import": [
    {
      "path": "username/moon_project",
      "alias": "lib"
    },
    "illusory0x0/native"
  ],
  "native-stub": [
    "c/process.c"
  ]
}
```

## 3. 安装`illusory0x0/native`依赖

这个库封装了调用c语言的一些FFI工具

在项目根目录下执行：

```bash
moon add illusory0x0/native
```

同时在`cmd/main/moon.pkg.json`中的`import`中添加`illusory0x0/native`，如下所示：

```json
{
  "is-main": true,
  "import": [
    {
      "path": "username/moon_project",
      "alias": "lib"
    },
    "illusory0x0/native"
  ],
  "native-stub": [
    "c/process.c"
  ]
}
```

## 4. 在main.mbt文件中申明c调用

此处以`main.mbt`文件进行演示，在文件中增加以下代码：

```moonbit
#borrow(cmd)
extern "c" fn exec_command(cmd: Bytes) -> @native.CStr = "execute_command";
```

## 5. 封装moonbit函数，调用c函数

```moonbit
fn exec(cmd: String) -> String {
  let result = exec_command(@encoding/utf8.encode(cmd))
  from_cstr(result)
}
```

## 6. 大功告成

以下是完整的`main.mbt`代码

```moonbit
#borrow(cmd)
extern "c" fn exec_command(cmd: Bytes) -> @native.CStr = "execute_command";

fn main {
  let result = exec("uname -a")
  println("Command output: \{result.trim()}")
}

fn exec(cmd: String) -> String {
  let result = exec_command(@encoding/utf8.encode(cmd))
  from_cstr(result)
}

fn from_cstr(cstr : @native.CStr) -> String {
  let bytes = cstr.to_bytes()[:-1]
  let utf8 = @encoding/utf8.decode(bytes) catch { _ => panic() }
  utf8
}

```