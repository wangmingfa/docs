(function () {
    window.copyCode = function (element) {
        const text = element.parentNode.querySelector("code").innerText;
        // 如果支持Clipboard
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text);
        } else {
            // 兼容旧版浏览器
            const textarea = document.createElement("textarea");
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand("copy");
            document.body.removeChild(textarea);
        }
        // 改变按钮文字，提示复制成功
        element.innerText = "复制成功";
        element.setAttribute("disabled", true);
        setTimeout(() => {
            element.innerText = "复制代码";
            element.removeAttribute("disabled");
        }, 2000);
    };
    const plugin = function (hook, vm) {
        hook.afterEach((html, next) => {
            // 给代码块左上角加上复制按钮
            const dom = new DOMParser().parseFromString(html, "text/html");
            const pres = dom.querySelectorAll("pre[v-pre][data-lang]");
            pres.forEach((pre) => {
                pre.style.position = "relative";
                pre.innerHTML +=
                    '<button class="copy-btn" onclick="copyCode(this)">复制代码</button>';
            });
            next(dom.body.outerHTML);
        });
    };
    window.$docsify.plugins = [].concat(plugin, window.$docsify.plugins);
})();
