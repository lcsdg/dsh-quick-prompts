# dsh-quick-prompts

快捷指令面板 —— DSH Web GUI 输入区上方的一排指令胶囊。点击胶囊预览并编辑指令（支持 `{{占位符}}`），同步到输入框或直接发送。指令存储在官方 settings 文档（`ctx.settingsScope`），**清除浏览器缓存不会丢失**。

A row of user-defined prompt chips above the composer. Click a chip to preview/edit its template (with `{{placeholder}}` fields), then sync it into the input or send directly. Prompts live in the official settings document — browser cache clears never touch them.

## 功能 / Features

- **点击胶囊** → 预览弹窗：可编辑指令全文（本次点击内的临时草稿，**不修改已保存的指令**），填写 `{{占位符}}` 参数，然后：
  - **同步到输入框**：填入输入框末尾（可勾选改为覆盖输入框已有内容），发送前仍可再改
  - **直接发送**：跳过输入框，立即作为用户消息发送
- **胶囊右侧纸飞机（悬停浮现）** → 一键直接发送；若指令含占位符则自动转入预览弹窗填写
- **⚙️ 管理**：增、删、改、排序、**导入/导出 JSON**（方便分享给他人）
- 内置 4 个示例指令（审查改动 / 路径分析 / 写注释 / 生成测试），可随意删改

## 安装 / Install

```bash
git clone --depth 1 --branch dev https://github.com/zhu1090093659/dsh-web.git
cd dsh-web
pnpm install
pnpm --filter dsh-quick-prompts build
dsh plugin --profile web add link:$(pwd)/packages/dsh-quick-prompts
```

安装后**刷新 Web GUI 页面**即可看到输入区上方的指令行（无需重启 dsh）。

## 配置说明 / Configuration

指令列表保存在 settings namespace `quick-prompts`（schema 驱动，官方设置页同样可见）。结构：

```json
{
  "prompts": [
    { "id": "review-changes", "label": "审查当前改动", "text": "审查当前 git 改动…" }
  ]
}
```

`text` 中的 `{{任意名字}}` 会成为预览弹窗里的填写字段，同步/发送时替换为填写值；未填写的占位符原样保留。

## 开发 / Development

```bash
pnpm --filter dsh-quick-prompts watch   # 增量构建 lib/client.js
pnpm --filter dsh-quick-prompts typecheck
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
