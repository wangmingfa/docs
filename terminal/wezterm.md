# 配置
> 配置文件位于：<span class="strong">~/.wezterm.lua</span>

```lua
local wezterm = require("wezterm")
-- Creates a config object which we will be adding our config to
local config = wezterm.config_builder()

-- 窗口居中
wezterm.on("gui-startup", function(cmd)
	local screen = wezterm.gui.screens().active
	-- ratio控制窗口尺寸占屏幕的百分比
	local ratio = 0.5
	local width, height = screen.width * ratio, screen.height * ratio
	local tab, pane, window = wezterm.mux.spawn_window({
		position = {
			x = (screen.width - width) / 2,
			y = (screen.height - height) / 2,
			origin = "ActiveScreen",
		},
	})
	window:gui_window():set_inner_size(width, height)
end)

-- (This is where our config will go)
config.color_scheme = "Snazzy (Gogh)"
config.font = wezterm.font("JetBrains Mono", { weight = "Bold", italic = false })
config.font_size = 15
config.window_background_opacity = 0.8
config.macos_window_background_blur = 30
config.window_decorations = "RESIZE"
config.window_frame = {
	font = wezterm.font("JetBrains Mono", { weight = "Bold" }),
	font_size = 13,
}

-- key bindings
config.keys = {
	{
		key = "1",
		mods = "ALT",
		action = wezterm.action.SpawnCommandInNewTab({
			domain = { DomainName = "wmf" },
		}),
	},

	-- 窗口
	{ key = "1", mods = "CMD", action = wezterm.action.ActivateTab(0) },
	{ key = "2", mods = "CMD", action = wezterm.action.ActivateTab(1) },
	{ key = "3", mods = "CMD", action = wezterm.action.ActivateTab(2) },
	{ key = "4", mods = "CMD", action = wezterm.action.ActivateTab(3) },
	{ key = "5", mods = "CMD", action = wezterm.action.ActivateTab(4) },
	{ key = "6", mods = "CMD", action = wezterm.action.ActivateTab(5) },
	{ key = "7", mods = "CMD", action = wezterm.action.ActivateTab(6) },
	{ key = "8", mods = "CMD", action = wezterm.action.ActivateTab(7) },
	{ key = "9", mods = "CMD", action = wezterm.action.ActivateTab(-1) },
}

config.ssh_domains = {
	{
		name = "wmf",
		remote_address = "192.168.0.1:22",
		username = "wmf",
		multiplexing = "None", -- 禁用多路复用，使用标准 SSH，无需在目标机器上安装wezterm
	},
}

wezterm.on("update-status", function(window)
	-- Grab the utf8 character for the "powerline" left facing
	-- solid arrow.
	local SOLID_LEFT_ARROW = utf8.char(0xe0b2)

	-- Grab the current window's configuration, and from it the
	-- palette (this is the combination of your chosen colour scheme
	-- including any overrides).
	local color_scheme = window:effective_config().resolved_palette
	local bg = color_scheme.background
	local fg = color_scheme.foreground
	-- 获取本机ip，根据不同操作系统，不同网卡，需要修改命令
	local success, stdout, stderr =
		wezterm.run_child_process({ "sh", "-c", "scutil --nwi | grep address | awk '{print $3}'" })
	-- 替换掉一些不可见字符，否则会导致ip后面拼接的其他字符串不显示
	local local_ip = stdout:gsub("[^%d%.]", "")
	local date = wezterm.strftime("%Y-%m-%d %H:%M:%S")

	if not local_ip then
		local_ip = "N/A"
	end

	window:set_right_status(wezterm.format({
		-- First, we draw the arrow...
		{ Background = { Color = "none" } },
		{ Foreground = { Color = bg } },
		{ Text = SOLID_LEFT_ARROW },
		-- Then we draw our text
		{ Background = { Color = bg } },
		{ Foreground = { Color = fg } },
		{ Text = " " .. wezterm.hostname() .. " | IP: " .. local_ip .. " | " .. date .. " " },
	}))
end)

-- Returns our config to be evaluated. We must always do this at the bottom of this file
return config
```
