# 应用程序入口

## 创建应用程序入口

创建文件<span class="strong code">create-desktop-entry.sh</code>

```bash
#!/bin/bash

# 创建桌面应用程序启动器的通用脚本
# 用法: ./create-desktop-entry.sh [选项]

set -e  # 遇到错误时退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的信息
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 显示使用说明
show_usage() {
    cat << EOF
用法: $0 [选项]

选项:
  -n, --name NAME         应用程序名称（必需）
  -e, --exec EXECUTABLE   可执行文件路径（必需）
  -i, --icon ICON         图标文件路径（可选）
  -c, --comment COMMENT   应用程序描述（可选）
  -p, --path PATH         工作目录路径（可选，默认同可执行文件目录）
  -t, --terminal          是否在终端中运行（可选）
  --categories CATEGORIES 应用程序分类（可选，默认: Utility）
  --type TYPE             应用程序类型（可选，默认: Application）
  --desktop-only          仅创建桌面快捷方式，不创建菜单项
  --menu-only             仅创建菜单项，不创建桌面快捷方式
  --help                  显示此帮助信息

示例:
  $0 -n "MyApp" -e "/opt/myapp/app.sh" -i "/opt/myapp/icon.png"
  $0 --name "MyApp" --exec "/home/user/apps/myapp" --comment "我的应用程序"

可用分类:
  Development, Education, Game, Graphics, Network, Office, Utility, Video, Audio, System
EOF
    exit 0
}

# 检查必需的工具
check_dependencies() {
    local missing_deps=()
    
    for cmd in desktop-file-validate desktop-file-install; do
        if ! command -v "$cmd" &> /dev/null; then
            missing_deps+=("$cmd")
        fi
    done
    
    if [ ${#missing_deps[@]} -gt 0 ]; then
        print_warning "缺少以下工具: ${missing_deps[*]}"
        print_info "正在尝试安装 desktop-file-utils..."
        
        if command -v pacman &> /dev/null; then
            sudo pacman -S --noconfirm desktop-file-utils
        elif command -v apt &> /dev/null; then
            sudo apt update && sudo apt install -y desktop-file-utils
        elif command -v dnf &> /dev/null; then
            sudo dnf install -y desktop-file-utils
        elif command -v yum &> /dev/null; then
            sudo yum install -y desktop-file-utils
        else
            print_error "无法自动安装依赖，请手动安装 desktop-file-utils 包"
            exit 1
        fi
    fi
}

# 创建桌面条目
create_desktop_entry() {
    local desktop_file="/tmp/$APP_NAME.desktop"
    
    # 确保图标文件存在
    if [ -n "$APP_ICON" ] && [ ! -f "$APP_ICON" ]; then
        print_warning "图标文件不存在: $APP_ICON"
        print_info "将使用默认图标"
        APP_ICON=""
    fi
    
    # 确保可执行文件存在且有执行权限
    if [ ! -f "$APP_EXEC" ]; then
        print_error "可执行文件不存在: $APP_EXEC"
        exit 1
    fi
    
    if [ ! -x "$APP_EXEC" ]; then
        print_info "为可执行文件添加执行权限..."
        chmod +x "$APP_EXEC"
    fi
    
    # 设置工作目录
    if [ -z "$WORK_PATH" ]; then
        WORK_PATH=$(dirname "$APP_EXEC")
    fi
    
    # 创建桌面文件内容
    cat > "$desktop_file" << EOF
[Desktop Entry]
Version=1.0
Type=$APP_TYPE
Name=$APP_NAME
Comment=${APP_COMMENT:-$APP_NAME}
Exec="$APP_EXEC" %U
Path=$WORK_PATH
Icon=${APP_ICON:-applications-other}
Terminal=$TERMINAL
Categories=$APP_CATEGORIES
EOF
    
    # 验证桌面文件
    if desktop-file-validate "$desktop_file"; then
        print_success "桌面文件验证通过"
    else
        print_error "桌面文件验证失败"
        exit 1
    fi
    
    # 安装到系统菜单
    if [ "$MENU_ONLY" != "true" ]; then
        print_info "安装到系统应用程序菜单..."
        if sudo desktop-file-install --dir=/usr/share/applications "$desktop_file"; then
            print_success "已添加到系统应用程序菜单"
        else
            print_warning "无法安装到系统目录，尝试用户目录..."
            if desktop-file-install --dir="$HOME/.local/share/applications" "$desktop_file"; then
                print_success "已添加到用户应用程序菜单 (~/.local/share/applications/)"
            else
                print_error "无法安装到应用程序菜单"
            fi
        fi
    fi
    
    # 创建桌面快捷方式
    if [ "$DESKTOP_ONLY" != "true" ]; then
        if [ -w "$HOME/Desktop" ]; then
            print_info "创建桌面快捷方式..."
            cp "$desktop_file" "$HOME/Desktop/"
            chmod +x "$HOME/Desktop/$APP_NAME.desktop"
            print_success "桌面快捷方式已创建: $HOME/Desktop/$APP_NAME.desktop"
        elif [ -w "$HOME/桌面" ]; then
            print_info "创建桌面快捷方式..."
            cp "$desktop_file" "$HOME/桌面/"
            chmod +x "$HOME/桌面/$APP_NAME.desktop"
            print_success "桌面快捷方式已创建: $HOME/桌面/$APP_NAME.desktop"
        else
            print_warning "未找到可写的桌面目录"
        fi
    fi
    
    # 更新桌面数据库
    print_info "更新桌面数据库..."
    update-desktop-database "$HOME/.local/share/applications" 2>/dev/null || true
    if [ -d /usr/share/applications ]; then
        sudo update-desktop-database /usr/share/applications 2>/dev/null || true
    fi
    
    print_success "应用程序启动器创建完成！"
    print_info "您可以在应用程序菜单中找到 '$APP_NAME'"
    
    # 清理临时文件
    rm -f "$desktop_file"
}

# 默认值
APP_TYPE="Application"
APP_CATEGORIES="Utility"
TERMINAL="false"
DESKTOP_ONLY="false"
MENU_ONLY="false"

# 解析命令行参数
while [[ $# -gt 0 ]]; do
    case $1 in
        -n|--name)
            APP_NAME="$2"
            shift 2
            ;;
        -e|--exec)
            APP_EXEC="$2"
            shift 2
            ;;
        -i|--icon)
            APP_ICON="$2"
            shift 2
            ;;
        -c|--comment)
            APP_COMMENT="$2"
            shift 2
            ;;
        -p|--path)
            WORK_PATH="$2"
            shift 2
            ;;
        -t|--terminal)
            TERMINAL="true"
            shift
            ;;
        --categories)
            APP_CATEGORIES="$2"
            shift 2
            ;;
        --type)
            APP_TYPE="$2"
            shift 2
            ;;
        --desktop-only)
            DESKTOP_ONLY="true"
            shift
            ;;
        --menu-only)
            MENU_ONLY="true"
            shift
            ;;
        --help)
            show_usage
            ;;
        *)
            print_error "未知选项: $1"
            show_usage
            ;;
    esac
done

# 检查必需参数
if [ -z "$APP_NAME" ] || [ -z "$APP_EXEC" ]; then
    print_error "错误: 必须提供应用程序名称和可执行文件路径"
    echo ""
    show_usage
fi

# 检查依赖
check_dependencies

# 创建桌面条目
create_desktop_entry
```

## 删除应用程序入口

创建文件<span class="strong code">remove-desktop-entry.sh</span>

```bash
#!/bin/bash

# remove-desktop-entry.sh - 安全删除桌面入口文件

set -e  # 遇到错误时退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 显示帮助信息
show_help() {
    cat << EOF
用法: $0 [选项] <应用名称或桌面文件>

选项:
  -l, --list               列出所有可用的桌面入口文件
  -s, --search PATTERN     搜索包含指定模式的桌面文件
  -f, --force              不询问确认，直接删除
  -h, --help               显示此帮助信息
  -p, --purge              同时删除相关的图标和缓存

示例:
  $0 firefox               删除 Firefox 桌面入口
  $0 --search "chrome"     搜索包含 "chrome" 的入口文件
  $0 --list                列出所有桌面入口文件
  $0 -f gimp              强制删除 GIMP 桌面入口
  $0 --purge vlc           删除 VLC 入口及相关文件

注意：需要提供完整的应用名称或桌面文件名（带或不带 .desktop 扩展名）
EOF
}

# 列出所有桌面入口文件
list_desktop_files() {
    echo -e "${BLUE}可用的桌面入口文件：${NC}"
    echo -e "${YELLOW}用户级 (~/.local/share/applications/)：${NC}"
    find "$HOME/.local/share/applications" -name "*.desktop" 2>/dev/null | \
        sed 's|.*/||' | sort | column -c 80
    
    echo -e "\n${YELLOW}系统级 (/usr/share/applications/)：${NC}"
    find /usr/share/applications /usr/local/share/applications -name "*.desktop" 2>/dev/null | \
        sed 's|.*/||' | sort | column -c 80 2>/dev/null || true
    
    echo -e "\n${YELLOW}Flatpak 应用：${NC}"
    find ~/.local/share/flatpak/exports/share/applications \
         /var/lib/flatpak/exports/share/applications \
         -name "*.desktop" 2>/dev/null 2>/dev/null | \
        sed 's|.*/||' | sort | column -c 80 2>/dev/null || true
}

# 搜索桌面文件
search_desktop_files() {
    local pattern="$1"
    echo -e "${BLUE}搜索包含 '${pattern}' 的桌面文件：${NC}"
    
    local found=0
    
    # 搜索所有可能的目录
    for dir in \
        "$HOME/.local/share/applications" \
        /usr/share/applications \
        /usr/local/share/applications \
        ~/.local/share/flatpak/exports/share/applications \
        /var/lib/flatpak/exports/share/applications
    do
        if [ -d "$dir" ]; then
            local results=$(find "$dir" -name "*.desktop" -iname "*${pattern}*" 2>/dev/null)
            if [ -n "$results" ]; then
                echo -e "${YELLOW}在 ${dir}：${NC}"
                echo "$results" | sed 's|.*/||' | while read -r file; do
                    echo "  $file"
                    found=1
                done
            fi
        fi
    done
    
    if [ $found -eq 0 ]; then
        echo -e "${RED}未找到包含 '${pattern}' 的桌面文件${NC}"
    fi
}

# 查找桌面文件位置
find_desktop_file() {
    local target="$1"
    local found_files=()
    
    # 确保目标有 .desktop 扩展名
    if [[ ! "$target" =~ \.desktop$ ]]; then
        target="${target}.desktop"
    fi
    
    # 在可能的目录中查找
    for dir in \
        "$HOME/.local/share/applications" \
        /usr/share/applications \
        /usr/local/share/applications \
        ~/.local/share/flatpak/exports/share/applications \
        /var/lib/flatpak/exports/share/applications
    do
        local file="$dir/$target"
        if [ -f "$file" ]; then
            found_files+=("$file")
        fi
    done
    
    echo "${found_files[@]}"
}

# 获取应用名称（从桌面文件中读取）
get_app_name() {
    local desktop_file="$1"
    local name=$(grep -E "^Name=" "$desktop_file" | head -1 | cut -d'=' -f2)
    echo "${name:-$(basename "$desktop_file")}"
}

# 清理相关文件
cleanup_related_files() {
    local desktop_file="$1"
    local app_name=$(get_app_name "$desktop_file")
    
    echo -e "${YELLOW}清理相关文件...${NC}"
    
    # 清理图标文件（基于 Icon 字段）
    local icon_name=$(grep -E "^Icon=" "$desktop_file" | head -1 | cut -d'=' -f2)
    if [ -n "$icon_name" ]; then
        # 删除用户级图标
        local user_icons_dir="$HOME/.local/share/icons"
        if [ -d "$user_icons_dir" ]; then
            find "$user_icons_dir" -name "*${icon_name}*" -type f 2>/dev/null | while read -r icon; do
                echo "  删除图标: $icon"
                rm -f "$icon"
            done
        fi
    fi
    
    # 清理 Fuzzel 缓存
    local fuzzel_cache="$HOME/.cache/fuzzel"
    if [ -d "$fuzzel_cache" ]; then
        echo "  清理 Fuzzel 缓存"
        rm -rf "$fuzzel_cache"
    fi
    
    # 清理桌面数据库（可选）
    if command -v update-desktop-database &>/dev/null; then
        echo "  更新桌面数据库"
        update-desktop-database "$HOME/.local/share/applications" 2>/dev/null || true
    fi
}

# 删除桌面文件
remove_desktop_file() {
    local desktop_file="$1"
    local force="$2"
    local purge="$3"
    
    local app_name=$(get_app_name "$desktop_file")
    
    echo -e "\n${BLUE}找到应用：${GREEN}$app_name${NC}"
    echo -e "${BLUE}桌面文件：${YELLOW}$desktop_file${NC}"
    
    # 显示文件内容预览
    echo -e "\n${YELLOW}文件内容：${NC}"
    head -20 "$desktop_file" | grep -E "^(Name|Comment|Exec|Icon|Categories)=" | \
        sed 's/^/  /'
    
    # 检查是否为系统文件
    if [[ "$desktop_file" == /usr/* ]] && [[ ! "$desktop_file" == /usr/local/* ]]; then
        echo -e "\n${RED}警告：这是一个系统级桌面文件！${NC}"
        echo -e "${YELLOW}需要管理员权限才能删除。${NC}"
        
        if [ "$force" != "1" ]; then
            read -p "继续删除？(y/N): " confirm
            if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
                echo "取消删除"
                exit 0
            fi
        fi
    fi
    
    # 确认删除
    if [ "$force" != "1" ]; then
        echo -e "\n${RED}确认删除此桌面入口？${NC}"
        read -p "输入 'yes' 确认删除: " confirm
        if [ "$confirm" != "yes" ]; then
            echo "取消删除"
            exit 0
        fi
    fi
    
    # 执行删除
    echo -e "\n${RED}删除：${desktop_file}${NC}"
    if [[ "$desktop_file" == /usr/* ]] && [[ ! "$desktop_file" == /usr/local/* ]]; then
        sudo rm -v "$desktop_file"
    else
        rm -v "$desktop_file"
    fi
    
    # 如果需要，清理相关文件
    if [ "$purge" = "1" ]; then
        cleanup_related_files "$desktop_file"
    fi
    
    echo -e "\n${GREEN}✓ 成功删除桌面入口：$app_name${NC}"
    echo -e "${YELLOW}提示：你可能需要重启 Fuzzel 或重新登录才能看到变化${NC}"
}

# 主函数
main() {
    local target=""
    local list_mode=0
    local search_pattern=""
    local force_mode=0
    local purge_mode=0
    
    # 解析参数
    while [[ $# -gt 0 ]]; do
        case $1 in
            -l|--list)
                list_mode=1
                shift
                ;;
            -s|--search)
                search_pattern="$2"
                shift 2
                ;;
            -f|--force)
                force_mode=1
                shift
                ;;
            -p|--purge)
                purge_mode=1
                shift
                ;;
            -h|--help)
                show_help
                exit 0
                ;;
            -*)
                echo -e "${RED}错误：未知选项 $1${NC}"
                show_help
                exit 1
                ;;
            *)
                target="$1"
                shift
                ;;
        esac
    done
    
    # 执行相应操作
    if [ $list_mode -eq 1 ]; then
        list_desktop_files
        exit 0
    fi
    
    if [ -n "$search_pattern" ]; then
        search_desktop_files "$search_pattern"
        exit 0
    fi
    
    if [ -z "$target" ]; then
        echo -e "${RED}错误：请指定要删除的应用名称${NC}"
        show_help
        exit 1
    fi
    
    # 查找桌面文件
    IFS=$'\n' read -r -d '' -a found_files < <(find_desktop_file "$target" && printf '\0')
    
    if [ ${#found_files[@]} -eq 0 ]; then
        echo -e "${RED}错误：未找到名为 '$target' 的桌面入口${NC}"
        echo -e "${YELLOW}尝试使用 --search 选项查找相似的应用${NC}"
        exit 1
    fi
    
    if [ ${#found_files[@]} -gt 1 ]; then
        echo -e "${YELLOW}找到多个匹配的桌面文件：${NC}"
        for i in "${!found_files[@]}"; do
            echo "  $((i+1)). ${found_files[$i]}"
        done
        
        if [ "$force_mode" != "1" ]; then
            read -p "请输入要删除的文件编号 (或输入 'a' 删除所有): " choice
            if [ "$choice" = "a" ]; then
                for file in "${found_files[@]}"; do
                    remove_desktop_file "$file" "$force_mode" "$purge_mode"
                done
            elif [[ "$choice" =~ ^[0-9]+$ ]] && [ "$choice" -ge 1 ] && [ "$choice" -le ${#found_files[@]} ]; then
                remove_desktop_file "${found_files[$((choice-1))]}" "$force_mode" "$purge_mode"
            else
                echo "取消删除"
                exit 0
            fi
        fi
    else
        remove_desktop_file "${found_files[0]}" "$force_mode" "$purge_mode"
    fi
}

# 运行主函数
main "$@"
```

## 刷新应用程序入口

创建文件<span class="strong code">refresh-desktop-entries.sh</span>

```bash
#!/bin/bash

# 刷新桌面启动器数据库
# 用法: ./refresh-desktop-entries.sh [选项]

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 目录定义
USER_APPS_DIR="$HOME/.local/share/applications"
USER_DESKTOP_DIRS=("$HOME/Desktop" "$HOME/桌面")
SYSTEM_APPS_DIR="/usr/share/applications"
FLATPAK_APPS_DIR="$HOME/.local/share/flatpak/exports/share/applications"
SNAP_APPS_DIR="/var/lib/snapd/desktop/applications"

# 打印带颜色的信息
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 显示使用说明
show_usage() {
    cat << EOF
用法: $0 [选项]

选项:
  -a, --all          刷新所有桌面数据库（包括系统）
  -u, --user         只刷新用户数据库（默认）
  -s, --system       刷新系统数据库
  -c, --clean        清理无效的桌面启动器
  -v, --verify       验证桌面启动器文件
  -r, --reload       重新加载桌面环境
  -l, --list         列出所有桌面启动器
  -t, --test         测试桌面启动器
  --help             显示此帮助信息

示例:
  $0                  # 刷新用户数据库
  $0 -a              # 刷新所有数据库
  $0 -c              # 清理无效启动器
  $0 -v              # 验证启动器文件
  $0 -r              # 重新加载桌面环境
  $0 -t "Firefox"    # 测试特定启动器

注意:
  - 刷新数据库可以解决应用程序图标不显示的问题
  - 清理无效启动器可以移除损坏的快捷方式
  - 验证功能可以检查启动器文件的正确性
EOF
    exit 0
}

# 刷新桌面数据库
refresh_desktop_databases() {
    local refresh_user="${1:-true}"
    local refresh_system="${2:-false}"
    
    print_info "正在刷新桌面数据库..."
    
    # 刷新用户数据库
    if [ "$refresh_user" = "true" ]; then
        if [ -d "$USER_APPS_DIR" ]; then
            print_info "刷新用户数据库: $USER_APPS_DIR"
            if update-desktop-database "$USER_APPS_DIR" 2>/dev/null; then
                print_success "用户数据库刷新完成"
            else
                print_warning "用户数据库刷新失败"
            fi
        fi
        
        # 刷新 Flatpak
        if [ -d "$FLATPAK_APPS_DIR" ]; then
            print_info "刷新 Flatpak 数据库"
            update-desktop-database "$FLATPAK_APPS_DIR" 2>/dev/null && print_success "Flatpak 数据库已刷新"
        fi
    fi
    
    # 刷新系统数据库
    if [ "$refresh_system" = "true" ]; then
        if [ -d "$SYSTEM_APPS_DIR" ]; then
            print_info "刷新系统数据库: $SYSTEM_APPS_DIR"
            if sudo update-desktop-database "$SYSTEM_APPS_DIR" 2>/dev/null; then
                print_success "系统数据库刷新完成"
            else
                print_warning "系统数据库刷新失败"
            fi
        fi
        
        # 刷新 Snap
        if [ -d "$SNAP_APPS_DIR" ]; then
            print_info "刷新 Snap 数据库"
            sudo update-desktop-database "$SNAP_APPS_DIR" 2>/dev/null && print_success "Snap 数据库已刷新"
        fi
    fi
}

# 清理无效的桌面启动器
clean_invalid_entries() {
    print_info "正在清理无效的桌面启动器..."
    
    local cleaned_count=0
    local dirs=("$USER_APPS_DIR" "${USER_DESKTOP_DIRS[@]}")
    
    for dir in "${dirs[@]}"; do
        [ -d "$dir" ] || continue
        
        print_info "检查目录: $dir"
        local count_in_dir=0
        
        for file in "$dir"/*.desktop; do
            [ -f "$file" ] || continue
            
            # 检查文件是否可执行
            if [ ! -x "$file" ]; then
                print_warning "文件不可执行: $file"
                chmod +x "$file" 2>/dev/null && print_info "已添加执行权限"
            fi
            
            # 检查 Exec 字段是否存在
            if ! grep -q "^Exec=" "$file" 2>/dev/null; then
                print_warning "缺少 Exec 字段: $file"
                rm -f "$file" && {
                    print_success "已删除无效文件: $file"
                    cleaned_count=$((cleaned_count + 1))
                    count_in_dir=$((count_in_dir + 1))
                }
                continue
            fi
            
            # 检查 Exec 命令是否存在
            local exec_cmd=$(grep -m1 "^Exec=" "$file" 2>/dev/null | cut -d'=' -f2 | cut -d' ' -f1)
            if [ -n "$exec_cmd" ] && [ ! -x "$exec_cmd" ]; then
                # 尝试在 PATH 中查找
                if ! command -v "$exec_cmd" &> /dev/null; then
                    print_warning "命令不存在: $exec_cmd (来自 $file)"
                    read -p "是否删除此启动器? [y/N]: " confirm
                    if [[ "$confirm" =~ ^[Yy]$ ]]; then
                        rm -f "$file" && {
                            print_success "已删除: $file"
                            cleaned_count=$((cleaned_count + 1))
                            count_in_dir=$((count_in_dir + 1))
                        }
                    fi
                fi
            fi
        done
        
        [ $count_in_dir -gt 0 ] && print_info "在 $dir 中清理了 $count_in_dir 个文件"
    done
    
    [ $cleaned_count -gt 0 ] && print_success "总共清理了 $cleaned_count 个无效启动器"
}

# 验证桌面启动器文件
verify_desktop_files() {
    print_info "正在验证桌面启动器文件..."
    
    if ! command -v desktop-file-validate &> /dev/null; then
        print_warning "未找到 desktop-file-validate 工具"
        print_info "正在安装 desktop-file-utils..."
        
        if command -v pacman &> /dev/null; then
            sudo pacman -S --noconfirm desktop-file-utils
        elif command -v apt &> /dev/null; then
            sudo apt update && sudo apt install -y desktop-file-utils
        else
            print_error "无法自动安装验证工具"
            return 1
        fi
    fi
    
    local invalid_count=0
    local total_count=0
    
    for dir in "$USER_APPS_DIR" "$SYSTEM_APPS_DIR"; do
        [ -d "$dir" ] || continue
        
        print_info "验证目录: $dir"
        
        for file in "$dir"/*.desktop; do
            [ -f "$file" ] || continue
            total_count=$((total_count + 1))
            
            if ! desktop-file-validate "$file" 2>/dev/null; then
                print_warning "验证失败: $file"
                invalid_count=$((invalid_count + 1))
                
                # 显示具体错误
                desktop-file-validate "$file" 2>&1 | while read -r line; do
                    echo "  $line"
                done
                echo ""
            fi
        done
    done
    
    if [ $invalid_count -eq 0 ]; then
        print_success "所有 $total_count 个启动器文件验证通过"
    else
        print_warning "发现 $invalid_count/$total_count 个文件验证失败"
    fi
}

# 重新加载桌面环境
reload_desktop_environment() {
    print_info "重新加载桌面环境..."
    
    # 检测桌面环境
    local desktop_env="${XDG_CURRENT_DESKTOP:-$DESKTOP_SESSION}"
    print_info "当前桌面环境: $desktop_env"
    
    case "$desktop_env" in
        *[Kk][Dd][Ee]*|*Plasma*)
            print_info "重新启动 Plasma 面板..."
            kquitapp5 plasmashell 2>/dev/null || kquitapp6 plasmashell 2>/dev/null
            sleep 1
            plasmashell 2>/dev/null &
            print_success "Plasma 已重新加载"
            ;;
        *[Gg][Nn][Oo][Mm][Ee]*)
            print_info "重新加载 GNOME Shell..."
            if command -v gnome-shell &> /dev/null; then
                gnome-shell --replace 2>/dev/null &
                print_success "GNOME Shell 已重新加载"
            fi
            ;;
        *[Xx][Ff][Cc][Ee]*)
            print_info "重新启动 xfce4-panel..."
            xfce4-panel --restart 2>/dev/null &
            print_success "Xfce 面板已重新启动"
            ;;
        *[Cc][Ii][Nn][Nn][Aa][Mm][Oo][Nn]*)
            print_info "重新启动 Cinnamon..."
            cinnamon --replace 2>/dev/null &
            print_success "Cinnamon 已重新加载"
            ;;
        *[Mm][Aa][Tt][Ee]*)
            print_info "重新启动 mate-panel..."
            mate-panel --replace 2>/dev/null &
            print_success "MATE 面板已重新启动"
            ;;
        *)
            print_warning "未知的桌面环境，尝试通用方法..."
            
            # 尝试重启面板
            pkill -f "plasma-desktop" 2>/dev/null || true
            pkill -f "xfce4-panel" 2>/dev/null || true
            pkill -f "gnome-panel" 2>/dev/null || true
            
            # 发送通知
            if command -v notify-send &> /dev/null; then
                notify-send "桌面刷新" "桌面启动器数据库已刷新，可能需要重新启动面板"
            fi
            
            print_info "建议: 重新登录或重启桌面环境以生效"
            ;;
    esac
    
    # 刷新图标缓存
    refresh_icon_cache
}

# 刷新图标缓存
refresh_icon_cache() {
    print_info "刷新图标缓存..."
    
    if command -v gtk-update-icon-cache &> /dev/null; then
        local icon_dirs=(
            "$HOME/.local/share/icons"
            "$HOME/.icons"
            "/usr/share/icons"
        )
        
        for dir in "${icon_dirs[@]}"; do
            [ -d "$dir" ] || continue
            
            for theme_dir in "$dir"/*; do
                [ -d "$theme_dir" ] || continue
                [ -f "$theme_dir/index.theme" ] || continue
                
                print_info "更新图标主题: $(basename "$theme_dir")"
                gtk-update-icon-cache -f -t "$theme_dir" 2>/dev/null && \
                    print_success "  ✓ 已更新" || \
                    print_warning "  ✗ 更新失败"
            done
        done
    else
        print_warning "未找到 gtk-update-icon-cache"
    fi
}

# 测试桌面启动器
test_desktop_entry() {
    local app_name="$1"
    
    if [ -z "$app_name" ]; then
        print_error "需要指定应用程序名称"
        return 1
    fi
    
    print_info "测试应用程序: $app_name"
    
    # 查找启动器文件
    local launcher_files=()
    for dir in "$USER_APPS_DIR" "$SYSTEM_APPS_DIR"; do
        [ -d "$dir" ] || continue
        for file in "$dir"/*.desktop; do
            [ -f "$file" ] || continue
            if grep -q -i "$app_name" "$file" 2>/dev/null; then
                launcher_files+=("$file")
            fi
        done
    done
    
    if [ ${#launcher_files[@]} -eq 0 ]; then
        print_error "未找到匹配的启动器"
        return 1
    fi
    
    # 显示找到的启动器
    echo -e "\n${GREEN}找到以下启动器:${NC}"
    for ((i=0; i<${#launcher_files[@]}; i++)); do
        echo "  $((i+1)). ${launcher_files[$i]}"
        
        local name=$(grep -m1 "^Name=" "${launcher_files[$i]}" 2>/dev/null | cut -d'=' -f2)
        local exec_cmd=$(grep -m1 "^Exec=" "${launcher_files[$i]}" 2>/dev/null | cut -d'=' -f2)
        local icon=$(grep -m1 "^Icon=" "${launcher_files[$i]}" 2>/dev/null | cut -d'=' -f2)
        
        echo "      名称: ${name:-<未设置>}"
        echo "      命令: ${exec_cmd:0:60}"
        echo "      图标: ${icon:-<未设置>}"
        echo ""
    done
    
    # 测试启动
    if [ ${#launcher_files[@]} -eq 1 ]; then
        read -p "测试启动此应用程序? [Y/n]: " confirm
        if [[ ! "$confirm" =~ ^[Nn]$ ]]; then
            test_single_launcher "${launcher_files[0]}"
        fi
    else
        read -p "选择要测试的启动器编号 (回车测试所有): " choice
        if [ -z "$choice" ]; then
            for file in "${launcher_files[@]}"; do
                test_single_launcher "$file"
            done
        elif [[ "$choice" =~ ^[0-9]+$ ]] && [ "$choice" -ge 1 ] && [ "$choice" -le ${#launcher_files[@]} ]; then
            idx=$((choice - 1))
            test_single_launcher "${launcher_files[$idx]}"
        fi
    fi
}

# 测试单个启动器
test_single_launcher() {
    local file="$1"
    
    print_info "测试启动器: $file"
    
    # 验证文件
    if command -v desktop-file-validate &> /dev/null; then
        echo -n "  验证: "
        if desktop-file-validate "$file" 2>/dev/null; then
            echo -e "${GREEN}通过${NC}"
        else
            echo -e "${RED}失败${NC}"
        fi
    fi
    
    # 检查 Exec 命令
    local exec_cmd=$(grep -m1 "^Exec=" "$file" 2>/dev/null | cut -d'=' -f2)
    local exec_cmd_clean=$(echo "$exec_cmd" | sed 's/ %[a-zA-Z]*//g' | cut -d' ' -f1)
    
    echo "  命令: $exec_cmd"
    
    if [ -n "$exec_cmd_clean" ]; then
        echo -n "  可执行文件: "
        if [ -x "$exec_cmd_clean" ] || command -v "$exec_cmd_clean" &> /dev/null; then
            echo -e "${GREEN}存在${NC}"
            
            # 尝试启动
            read -p "  是否尝试启动? [Y/n]: " confirm
            if [[ ! "$confirm" =~ ^[Nn]$ ]]; then
                print_info "正在启动应用程序..."
                eval "$exec_cmd" &
                local pid=$!
                sleep 2
                
                if ps -p $pid > /dev/null 2>&1; then
                    print_success "应用程序已启动 (PID: $pid)"
                else
                    print_warning "应用程序可能已退出"
                fi
            fi
        else
            echo -e "${RED}不存在${NC}"
        fi
    fi
    
    echo ""
}

# 列出所有桌面启动器
list_all_entries() {
    echo -e "${GREEN}=== 桌面启动器列表 ===${NC}\n"
    
    local total_count=0
    local dirs=("$USER_APPS_DIR" "$SYSTEM_APPS_DIR" "${USER_DESKTOP_DIRS[@]}")
    
    for dir in "${dirs[@]}"; do
        [ -d "$dir" ] || continue
        
        echo -e "${BLUE}目录: $dir${NC}"
        local count_in_dir=0
        
        for file in "$dir"/*.desktop; do
            [ -f "$file" ] || continue
            count_in_dir=$((count_in_dir + 1))
            total_count=$((total_count + 1))
            
            local name=$(grep -m1 "^Name=" "$file" 2>/dev/null | cut -d'=' -f2)
            local exec_cmd=$(grep -m1 "^Exec=" "$file" 2>/dev/null | cut -d'=' -f2 | head -c 50)
            
            echo "  $total_count. ${name:-$(basename "$file")}"
            echo "      文件: $(basename "$file")"
            echo "      命令: ${exec_cmd:-<未设置>}"
        done
        
        [ $count_in_dir -eq 0 ] && echo "  （无）"
        echo ""
    done
    
    echo -e "${GREEN}总计: $total_count 个启动器${NC}"
}

# 主函数
main() {
    local refresh_user=true
    local refresh_system=false
    local clean=false
    local verify=false
    local reload=false
    local list=false
    local test_app=""
    
    # 解析命令行参数
    while [[ $# -gt 0 ]]; do
        case $1 in
            -a|--all)
                refresh_user=true
                refresh_system=true
                shift
                ;;
            -u|--user)
                refresh_user=true
                refresh_system=false
                shift
                ;;
            -s|--system)
                refresh_user=false
                refresh_system=true
                shift
                ;;
            -c|--clean)
                clean=true
                shift
                ;;
            -v|--verify)
                verify=true
                shift
                ;;
            -r|--reload)
                reload=true
                shift
                ;;
            -l|--list)
                list=true
                shift
                ;;
            -t|--test)
                test_app="$2"
                shift 2
                ;;
            --help)
                show_usage
                ;;
            -*)
                print_error "未知选项: $1"
                show_usage
                ;;
            *)
                # 如果没有指定选项，假设是应用程序名称用于测试
                if [ -z "$test_app" ]; then
                    test_app="$1"
                fi
                shift
                ;;
        esac
    done
    
    # 列出所有
    if [ "$list" = true ]; then
        list_all_entries
        exit 0
    fi
    
    # 测试启动器
    if [ -n "$test_app" ]; then
        test_desktop_entry "$test_app"
        exit 0
    fi
    
    # 清理无效启动器
    if [ "$clean" = true ]; then
        clean_invalid_entries
    fi
    
    # 验证启动器
    if [ "$verify" = true ]; then
        verify_desktop_files
    fi
    
    # 刷新数据库
    refresh_desktop_databases "$refresh_user" "$refresh_system"
    
    # 重新加载桌面环境
    if [ "$reload" = true ]; then
        reload_desktop_environment
    fi
    
    print_success "刷新完成！"
    
    # 如果没有进行任何操作，显示提示
    if [ "$clean" = false ] && [ "$verify" = false ] && [ "$reload" = false ] && \
       [ -z "$test_app" ] && [ "$list" = false ]; then
        echo ""
        print_info "提示: 如果应用程序图标仍未显示，可以尝试:"
        print_info "  1. 使用 -c 选项清理无效启动器"
        print_info "  2. 使用 -r 选项重新加载桌面环境"
        print_info "  3. 使用 -t 选项测试特定应用程序"
        print_info "  4. 重新登录或重启计算机"
    fi
}

# 运行主函数
main "$@"
```