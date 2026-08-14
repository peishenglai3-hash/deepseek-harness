# Agent Note: IDE 作为第三产品表面

Status: proposed

[English](2026-08-14-dsh-ide-third-surface.md) | 中文

## 问题

DSH 目前发布两种交互表面：`web`（浏览器）与 `headless`（一次性执行），外加 ACP 与 stdio JSON-RPC 两种自动化入口。官方全屏 TUI 已删除（[2026-08-04 删除笔记](../../implemented/simplification/2026-08-04-remove-tui-package.md)），因此偏好终端的用户依赖 `dsh-cc-tui` 这类树外社区 profile。

Web 客户端没有代码编辑器内核、没有面向编辑器的 LSP 客户端、没有终端面板，也没有桌面壳。社区插件以面板级能力填补这些空白（`dsh-web-ui` 的文件树/预览/SCM 面板、`dsh-better-sidebar` 的 CodeMirror/xterm 编辑），这证明了需求存在，却无法交付整体 IDE 表面：没有工作台布局，没有基于工具改动的 diff 审批流，没有权限模态体验，也没有编辑器专用传输。

扩展地图已经给出正确机制——「添加 UI 或编辑器集成 → 驱动 `ctx.agents` 并从 `session/event` 渲染」——但对应的 host seam、编辑器传输与表面入口并不存在，导致每个面向编辑器的集成都各自另造通道。

## 提案

引入 **`ide` 作为第三交互表面**：`dsh ide` 成为 `--profile ide` 的别名，由同一个 Web 客户端经同一个四象限 RPC 提供服务，并新增编辑器通道与一个轻量 `ctx.ide` seam。桌面壳（Tauri/Electron）刻意放在树外：本仓库持有表面入口、profile bundle、Service Definition、编辑器传输协议与客户端工作台包；独立壳仓库嵌入构建后的 Web 客户端并提供原生窗口 provider。壳缺失时，绝不能让 `web` 或 `ide` 在浏览器中受损。

### `dsh ide` 入口与 profile

- `apps/cli` 将 `ide` 路由到 `--profile ide`，与 `web` 完全一致（`src/bin.ts` 中的 mode 路由），`ide` 与 `web`/`headless` 并列为出厂 profile 模板。
- 新增 `packages/bundle/ide-app`，叠加 `@deepseek-ai/dsh-base` + `@deepseek-ai/dsh-web-app` + ide 宿主包，组合方式对齐 `dsh-web-app`。ide profile 不替换任何 base 能力，只增加表面。

### `ctx.ide` Service Definition（`packages/ide/ide`）

一个 seam，三个 provider 角色，各自具备中性的无 provider 状态，使浏览器表面优雅降级：

- **`IdeWindow`** —— 壳上报的窗口事实与命令：外部打开路径、窗口聚焦、更新可用性、菜单命令。Provider：外部桌面壳。中性状态：每个操作都收敛到文档化的 `unavailable` 结果，绝不产生启动错误。
- **`IdeEditor`** —— 编辑器专用双向传输：服务器→客户端帧（open@line 导航、工具 diff 应用请求、LSP 挂载通知）走 `/api/editor.mux` 新命名流，与 `/api/events.mux`、`/api/events.host` 并列；客户端→服务器一元方法（`POST /api/editor.*`）注册进同一个 `RpcMethodMap`，与其他 API Proxy 方法在同一线缆边界校验。
- **`IdeTerminal`** —— M0 仅保留定义；基于 PTY 的 UI 流随 M1 的终端笔记落地。复用 `ctx.terminals` 使 PTY 留在 harness 内，沙箱与审批依旧适用。

模型可见输入仍走 session 事件：当模型请求在编辑器中打开文件时，该请求成为持久 session 事件加键控 UI 渲染器，绝不成为工具与 UI 之间的私有侧信道。

### 客户端工作台（`packages/client/ide-layout`）

在现有 `ui-slots` 组合之上搭工作台骨架：活动栏、侧栏、编辑器组、底部面板与布局状态。M0 交付容器与空编辑器组占位。Monaco 内核与 LSP 客户端属 M1 范围，另有专属笔记；M0 不得引入 Monaco 依赖。

### 编辑器通道生命周期

`/api/editor.mux` 惰性开启：仅在 ide 表面激活时建立，保证纯 `web` 表面保持现有两条下行流。该流使用与 `events.mux` 相同的信封（幂等回放帧），一元编辑器方法沿用既有特权环回规则。

## 备选方案

**桌面壳随本仓库发布（`apps/ide`）。** 壳的发布节奏——安装器、代码签名、更新端点——独立于 harness 发布，而 Rust 工具链要求会让所有贡献者与壳耦合。仓库持有 seam；壳仓库持有原生宿主。

**把 VS Code 扩展作为第一表面。** 复用 VS Code 扩展宿主最快上市，但其扩展 API 约束 diff 审批与多智能体面板体验。推迟到后续笔记，作为同一 RPC 之上的并行前端。

**复用 stdio JSON-RPC SDK 作为 IDE 传输。** 它缺少增量流式、取消与双向请求；四象限 RPC 已承载 Web 客户端，再引入第二协议会使客户端分叉。

**为编辑器扩展 `ctx.lsp` 的闭合导航联合。** 编辑器需要完整的双向 LSP 客户端（didOpen、诊断、补全、符号）。拓宽模型的窄 seam 会污染它；独立的 `ide-lsp-client` 笔记在 M1 负责该项。

**终端 PTY 跑在桌面壳里。** 那会把受沙箱约束的能力移出 harness 并绕过审批模型。PTY 留在 `ctx.terminals`；跨编辑器通道的只有 UI 流。

## 验收标准

- `dsh ide` 启动 ide-profile Cordis 树，提供与 `web` 相同的 Web 客户端；在浏览器中（无壳 provider）每个 `IdeWindow`/`IdeEditor` 操作都收敛到文档化的中性结果。
- `ctx.ide` Service Definition 附带 Provider 与 Consumer 角色；provider 缺失是经过测试的中性状态，不是启动错误。
- `/api/editor.mux` 与 `editor.*` 一元方法通过线缆边界校验、遵守特权环回规则，并出现在生成的目录中。
- `packages/client/ide-layout` 在现有客户端中渲染工作台骨架，且不引入 Monaco 依赖。
- 聚焦单元与快照覆盖随代码落地；`typecheck`、`lint` 与 `doc-sync` 通过。
- 本笔记仅在 M0 代码一并落地时转为 `implemented`，不会提前。

## 风险

上游预览期变更可能重命名本笔记所扩展的 RPC 载体。编辑器通道以公开 `/api` 约定为定义基础；载体重命名作为事实更新落入本笔记与 [GUI RPC 协议笔记](../../implemented/architecture/2026-07-19-gui-layering-and-rpc-protocol.md)——本笔记扩展而非取代后者。

命名编辑器流会给每个客户端增加第三条 WebSocket 下行流。其惰性生命周期是验收标准之一，正是为了避免纯 `web` 表面的浏览器负载翻倍。

壳仓库在树外，因此 seam 不得依赖壳的存在；测试在无 provider 注册时运行。

M0 内编辑器内核、LSP 客户端或终端流的范围蔓延会使本变更无法审阅；它们以独立的 M1 笔记落地。
