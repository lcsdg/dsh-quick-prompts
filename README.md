# dsh-quick-prompts

快捷指令面板 —— DSH Web GUI 输入区上方的一排指令胶囊。点击胶囊预览并编辑指令（支持 `{{占位符}}`），同步到输入框或直接发送。指令存储在官方 settings 文档（`ctx.settingsScope`），**清除浏览器缓存不会丢失**。

A row of user-defined prompt chips above the composer. Click a chip to preview/edit its template (with `{{placeholder}}` fields), then sync it into the input or send directly. Prompts live in the official settings document — browser cache clears never touch them.

## 功能 / Features

- **点胶囊** → 预览弹窗：编辑指令全文（本次草稿，不改已保存指令）、填写 `{{占位符}}`、**同步到输入框**或**直接发送**
- **胶囊旁纸飞机** → 一键直接发送；指令含占位符时自动转预览填写
- **⚙️ 管理弹窗**：左侧功能区（增/删/改名/计数），右侧该功能下的指令（新增/编辑/删除/↑↓排序）
- **编辑弹窗**：大文本区 + 占位符**橙色高亮**，改动点保存才生效
- **删除确认**：删功能会连同其下指令一并删除（不会丢到"未分类"）
- **分类记忆**：每个会话独立记住当前选中的功能，切换窗口不丢
- 指令存官方 settings 文档（`ctx.settingsScope`）+ **导入/导出 JSON**，清浏览器缓存不丢失

## 安装 / Install

在已初始化的 DSH profile 中执行（把 `web` 换成你的 profile 名）：

```bash
# 方式一：npm（推荐，一条命令）
dsh plugin --profile web add @max1997/dsh-quick-prompts

# 方式二：Git
dsh plugin --profile web add git@github.com:lcsdg/dsh-quick-prompts.git
```

安装后**刷新 Web GUI 页面**即可看到输入区上方的指令行（host 半区需要重启 dsh 进程才会完整加载）。

## 配置说明 / Configuration

指令列表保存在 settings namespace `quick-prompts`（schema 驱动，官方设置页同样可见）。结构：

```json
{
  "categories": [
    { "id": "review", "name": "代码审查" }
  ],
  "prompts": [
    { "id": "review-changes", "label": "审查当前改动", "text": "审查当前 git 改动…", "categoryId": "review" }
  ]
}
```

`text` 中的 `{{任意名字}}` 会成为预览弹窗里的填写字段（**橙色高亮**），同步/发送时替换为填写值；未填写的占位符原样保留。

## 开发 / Development

```bash
pnpm watch          # 增量构建 lib/client.js
pnpm typecheck
```

结构：

- `src/index.ts` — host 半区：注册 `quick-prompts` settings namespace（schemastery schema + 示例指令作为 base 层）
- `src/client/` — 浏览器半区：`conversation.input.dock` slot（order 100）
  - `QuickPromptsDock.tsx` — dock 行（胶囊 + 悬停发送 + 齿轮）
  - `PreviewModal.tsx` — 预览/编辑弹窗（占位符填写、追加/覆盖、同步/发送）
  - `ManagerModal.tsx` — 管理弹窗（增删改排序、导入导出）
  - `placeholder.ts` — `{{name}}` 解析与替换

## License

MIT
