(function () {
    window.copyCode = function (element, self = false) {
        const text = self
            ? element.innerText
            : element.parentNode.querySelector("code").innerText;
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
        if (!self) {
            // 改变按钮文字，提示复制成功
            element.innerText = "复制成功";
            element.setAttribute("disabled", true);
            setTimeout(() => {
                element.innerText = "复制代码";
                element.removeAttribute("disabled");
            }, 2000);
        } else {
            // 改变按钮文字，提示复制成功
            const span = document.createElement("span");
            span.classList.add("copy-code-success");
            span.style.position = "absolute";
            span.style.top = "0";
            span.style.left = "0";
            span.style.display = "flex";
            span.style.justifyContent = "center";
            span.style.alignItems = "center";
            span.style.width = "100%";
            span.style.height = "100%";
            span.style.color = "#666";
            span.style.fontSize = "80%";
            span.style.background = getComputedStyle(element).background;
            span.style.borderRadius = getComputedStyle(element).borderRadius;
            span.style.cursor = "not-allowed";
            span.textContent = "复制成功";
            element.appendChild(span);
            setTimeout(() => {
                element.removeChild(span);
            }, 2000);
        }
    };
    const plugin = function (hook, vm) {
        hook.afterEach((html, next) => {
            // 给代码块左上角加上复制按钮
            const dom = new DOMParser().parseFromString(html, "text/html");
            // 处理代码块
            const pres = dom.querySelectorAll("pre[v-pre][data-lang]");
            pres.forEach((pre) => {
                pre.style.position = "relative";
                pre.innerHTML +=
                    '<button class="copy-btn" onclick="copyCode(this)">复制代码</button>';
            });
            // 处理.strong.code
            const strongs = dom.querySelectorAll(".strong.code");
            strongs.forEach((strong) => {
                strong.style.position = "relative";
                strong.setAttribute("onclick", "copyCode(this, true)");
            });
            next(dom.body.outerHTML);
        });
    };
    window.$docsify.plugins = [].concat(plugin, window.$docsify.plugins);
})();
