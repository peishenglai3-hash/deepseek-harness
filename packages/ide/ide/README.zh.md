# `@deepseek-ai/dsh-ide`

[English](README.md) | 中文

IDE 表面 seam。一个 `ctx.ide` 服务、两个 provider 角色，各自带无 provider 的中性状态：

- **`IdeWindowProvider`** — 桌面壳的原生窗口能力（`openPath`、`windowFacts`）。在 provider 注册前，`openPath` 收敛到 `{ ok: false, reason: 'unavailable' }`，`windowFacts` 收敛到 `undefined`，因此浏览器 `web` 表面与 headless 启动都能优雅降级、绝不影响启动。
- **`IdeEditorProvider`** — 原生编辑器导航（`openAt(path, line?)`）。无 provider 时同中性契约。

provider 通过 `ctx.ide.registerWindowProvider(...)` / `ctx.ide.registerEditorProvider(...)` 注册，各自返回 disposer。每角色仅一个 provider，重复注册会抛错。

`ide` profile 模板（`@deepseek-ai/dsh-ide-app` bundle）挂载本 seam；桌面壳仓库在树外提供 provider。

## Model Experience

### 无模型可见表面

#### 模型看到什么

M0 中什么都没有：seam 不暴露任何模型工具、提示词区块或 shell 变量。它只是面向 UI 集成的 host 侧扩展点。

#### Token 影响

无。

#### KV Cache 影响

无。

## 已知局限与后续工作

- **尚无编辑器传输** — 编辑器专用 `/api/editor.mux` 流与 `editor.*` 一元方法在 [IDE 第三表面笔记](../../../.agents/notes/proposed/architecture/2026-08-14-dsh-ide-third-surface.zh.md) 中提案，随各自的 client/host 包落地，不在此处。
- **`IdeTerminal` 角色仅预留** — 基于 PTY 的 UI 流复用 `ctx.terminals`，随终端笔记落地；本包不拥有终端表面。
- **两个角色之外没有窗口命令** — 菜单/状态栏贡献随壳 provider 与客户端工作台包落地。
