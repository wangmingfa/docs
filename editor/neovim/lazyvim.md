# 开始
[https://www.lazyvim.org/](https://www.lazyvim.org/)

# 安装
[https://www.lazyvim.org/installation](https://www.lazyvim.org/installation)

# 自定义配置
> 在<span class="strong">nvim/lua/config</span>中，新建<span class="strong">custom.lua</span>文件，填入以下内容。然后在<span class="strong">nvim/init.lua</span>中添加<span class="strong">require("config.custom")</span>
```lua
-- 当前光标位置的变量背景色
vim.api.nvim_set_hl(0, "LspReferenceRead", { bg = "#1b5e20", bold = true })
vim.api.nvim_set_hl(0, "LspReferenceWrite", { bg = "lightyellow", bold = true })
vim.api.nvim_set_hl(0, "LspReferenceText", { bg = "gray", bold = true })

-- 目录树的连接线颜色
vim.api.nvim_set_hl(0, "LineNr", { fg = "gray", bold = true })

-- 行号颜色
vim.api.nvim_set_hl(0, "LineNrAbove", { fg = "#51B3EC", bold = false })
vim.api.nvim_set_hl(0, "LineNrBelow", { fg = "#FF9999", bold = false })
vim.api.nvim_set_hl(0, "CursorLineNr", { fg = "yellow", bold = true })

-- 设置窗口标题为当前文件夹名称
vim.opt.title = true
vim.opt.titlestring = vim.fn.fnamemodify(vim.fn.getcwd(), ":t")

-- 假设你已经配置了 telescope
vim.keymap.set("n", "<leader>fp", function()
  require("telescope.builtin").find_files({
    find_command = { "rg", "--files", "--hidden", "--no-ignore" },
    cwd = vim.fn.expand("~"),
  })
end, { desc = "Find files in home directory" })

vim.api.nvim_set_hl(0, "DiagnosticUnnecessary", {
  fg = "#FF5555", -- 前景色，例如亮红色
  bg = nil, -- 背景色（可选，设为 nil 保持透明）
  italic = true, -- 可选，斜体
})
```

# 自定义按键映射
> 在<span class="strong">nvim/lua/config/keymaps.lua</span>中，填入以下内容

```lua
-- Home 跳转到第一个非空白字符
vim.keymap.set({ "n", "i" }, "<Home>", "_", { noremap = true, silent = true })
-- End 跳转到最后一个非空白字符
vim.keymap.set({ "n", "i" }, "<End>", "g_", { noremap = true, silent = true })

-- 显示 package.json 脚本
local function fzf_npm_scripts()
  local scripts = {}
  local ok, data = pcall(vim.fn.json_decode, vim.fn.readfile("package.json"))
  if not ok then
    print("Error: Invalid or missing package.json")
    return
  end
  scripts = data.scripts or {}

  local script_list = {}
  local max_name_length = 0
  for name, _ in pairs(scripts) do
    max_name_length = math.max(max_name_length, #name)
  end
  for name, cmd in pairs(scripts) do
    local padded_name = name .. string.rep(" ", max_name_length - #name)
    table.insert(script_list, "npm run " .. padded_name .. ": " .. cmd)
  end

  # 请确保安装了fzf
  require("fzf-lua").fzf_exec(script_list, {
    prompt = "请选择要运行的npm脚本: ",
    actions = {
      ["default"] = function(selected)
        local script = selected[1]:match("^npm run ([^:]+)")
        -- 查找现有终端 buffer
        local term_buf = nil
        for _, buf in ipairs(vim.api.nvim_list_bufs()) do
          if vim.api.nvim_buf_is_valid(buf) and vim.bo[buf].buftype == "terminal" then
            term_buf = buf
            break
          end
        end

        if term_buf then
          -- 在现有终端 buffer 中运行命令
          local chan = vim.api.nvim_buf_get_option(term_buf, "channel")
          if vim.api.nvim_get_chan_info(chan).mode == "terminal" then
            vim.api.nvim_chan_send(chan, "npm run " .. script .. "\n")
            -- 切换到终端 buffer
            vim.api.nvim_set_current_buf(term_buf)
          end
        else
          -- 如果没有终端 buffer，打开新的内置终端
          vim.cmd("terminal")
          vim.api.nvim_chan_send(vim.b.terminal_job_id, "npm run " .. script .. "\n")
        end
      end,
    },
  })
end

vim.keymap.set("n", "<leader>r", fzf_npm_scripts, { desc = "运行npm脚本" })
```

# 安装LazyGit插件

1. 先安装LazyGit
[https://github.com/jesseduffield/lazygit?tab=readme-ov-file#installation](https://github.com/jesseduffield/lazygit?tab=readme-ov-file#installation)

2. 在<span class="strong">nvim/lua/plugins</span>中新建lazygit.lua，填入一下内容

```lua
return {
  "kdheepak/lazygit.nvim",
  cmd = {
    "LazyGit",
    "LazyGitConfig",
    "LazyGitCurrentFile",
    "LazyGitFilter",
    "LazyGitFilterCurrentFile",
  },
  -- optional for floating window border decoration
  dependencies = {
    "nvim-lua/plenary.nvim",
  },
  -- setting the keybinding for LazyGit with 'keys' is recommended in
  -- order to load the plugin when the command is run for the first time
  keys = {
    { "<leader>lg", "<cmd>LazyGit<cr>", desc = "Open lazy git" },
  },
}
```
