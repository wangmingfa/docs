# syncthing自启

```shell
#!/usr/bin/env bash
# 指定USER_NAME，以具体的用户运行syncthing
USER_NAME="wmf"
LOG_FILE="/home/$USER_NAME/syncthing.log"
GUI_ADDR="0.0.0.0:8384"

# =========================
# 判断 syncthing 是否运行（精准匹配）
# =========================
if ps -ef | grep -E "[/]syncthing" > /dev/null; then
    echo "✅ Syncthing 已在运行"
    exit 0
fi

echo "🚀 Syncthing 未运行，准备启动..."

# =========================
# 启动 syncthing
# =========================
su - "$USER_NAME" -c "
nohup syncthing \
    -no-browser \
    -no-restart \
    -gui-address $GUI_ADDR \
    > $LOG_FILE 2>&1 &
"

# =========================
# 启动后检查
# =========================
sleep 2

if ps -ef | grep -E "[/]syncthing" > /dev/null; then
    echo "✅ Syncthing 启动成功"
    echo "🌐 Web UI: http://localhost:8384"
else
    echo "❌ 启动失败，请检查日志：$LOG_FILE"
    exit 1
fi

```

# .stignore文件
> 在对应目录下新建`.stignore`文件，填写以下内容

```text
# Syncthing ignore（请删除文件名中的“文件”二字）
# =========================
# 📦 Dependencies / Package managers
# =========================
(?d)**/node_modules
(?d)**/.pnpm-store
(?d)**/.npm
(?d)**/.yarn
(?d)**/.yarn-cache
(?d)**/.bun

# =========================
# 🐍 Python
# =========================
(?d)**/__pycache__
(?d)**/.venv
(?d)**/venv
(?d)**/env

# =========================
# 🦀 Rust / 🐹 Go
# =========================
(?d)**/target
(?d)**/vendor

# =========================
# 🏗️ Build outputs
# =========================
**/dist
**/build
**/_build
**/out
**/release
**/debug
**/coverage
**/.next
**/.nuxt
**/.output
**/.svelte-kit
**/.vite
**/.astro
**/.vercel
**/.netlify
**/artifacts

# =========================
# ⚙️ Cache
# =========================
**/.cache
**/.turbo
**/.parcel-cache
**/.eslintcache
**/.stylelintcache
**/.rollup.cache
**/.vite-cache
**/.swc
**/.rpt2_cache
**/.cache/pnpm

# =========================
# 🧠 Local tools / runtime data
# =========================
**/skills
**/.agents
**/.claude
**/.syncthing

# Syncthing internal (建议忽略)
**/.stfolder
**/.stignore
**/.stversions

# =========================
# 📝 Logs
# =========================
**/*.log
**/logs
**/npm-debug.log*
**/yarn-debug.log*
**/yarn-error.log*
**/pnpm-debug.log*

# =========================
# 💻 IDE / Editor
# =========================
**/.idea
**/.vscode
**/.history
**/.fleet
**/*.swp
**/*.swo
**/*.tmp
**/*.temp

# =========================
# 🖥️ OS / System files
# =========================
**/.DS_Store
**/.AppleDouble
**/.LSOverride
**/Thumbs.db
**/ehthumbs.db
**/desktop.ini
**/.Spotlight-V100
**/.Trashes
**/._*

# =========================
# 🔐 Environment / Secrets
# =========================
**/.env
**/.env.*
**/*.local
**/*.pem
**/*.key
**/*.crt
**/secrets

# =========================
# 📦 Archives / binaries
# =========================
**/*.zip
**/*.tar
**/*.tar.gz
**/*.tgz
**/*.7z
**/*.rar

# =========================
# 🧹 Temporary / backup files
# =========================
**/*~
**/*.bak
**/*.old
**/*.orig
**/*.save

# =========================
# 🌱 Git (可选，看你是否需要同步 .git)
# =========================
**/.git
#**/.gitignore
**/.gitmodules
**/.gitattributes
```