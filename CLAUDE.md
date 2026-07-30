# CLAUDE.md — Claude Code adapter

@AGENTS.md

## Claude Code skill mapping

- `code-review` skill → `/code-review`
- `simplify` skill → `/simplify`
- `note` skill → `/note`
- `vocab` skill → `/vocab`
- `export-pdf` skill → `/export-pdf`

## Skill 內容的單一來源

`note`／`export-pdf`／`vocab` 的**完整流程只有一份**，在 `.agents/skills/<name>/SKILL.md`。
`.claude/skills/<name>/SKILL.md` 只是 adapter，會叫你去 Read 那一份。
**要改流程就改 `.agents/` 那份**，不要把內容抄回 `.claude/`。

## 工具對照

`.agents/` 的流程寫成平台中性敘述，在 Claude Code 對應到：

| 流程說的 | Claude Code 用 |
| :--- | :--- |
| 開圖／讀檔／讀 PDF 指定頁 | `Read`（PDF 用 `pages` 參數 render 成圖判讀） |
| 查證網頁 | `WebFetch`／`WebSearch`（deferred，先 `ToolSearch "select:WebFetch,WebSearch"`） |
| 起 dev server（port 4330） | `preview_start` 的 `tcm-dev`；停用 `preview_stop` |
| 瀏覽器驗證 | `read_page`／`javascript_tool`／`computer`／`resize_window` |
| 平行查證／委派 worker | `Agent`（一般用 `general-purpose`；大批唯讀搜尋用 `Explore`） |
| 續問同一個 worker | `SendMessage`（帶 agentId） |
| 呈定稿給 Aira 審 | `EnterPlanMode` → `ExitPlanMode` |

⚠️ 本機 headless 的**截圖常 timeout、互動點擊常失效**（`client:visible` ＋ IntersectionObserver），
那是環境限制不是頁面 bug：改用 SSR 結構檢查＋DOM／console 驗證，並誠實回報未取得截圖。
