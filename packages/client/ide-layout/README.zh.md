# `@deepseek-ai/dsh-client-ide-layout`

[English](README.md) | 中文

IDE 工作台框架（浏览器半边）。在 `ide` profile 中（[`dsh-ide-app`](../../bundle/ide-app/README.zh.md) bundle 先禁用浏览器 [`ui-layout`](../ui-layout/README.zh.md) 行），本插件把 `IdeWorkbench` 注册进内置 `root` 槽并声明六个子槽位：四个 web 表面槽位（`sidebar`、`conversation`、`details`、`shell.overlay`——重新声明以便现有 web 插件继续工作）加 `ide.editor`（编辑器组）与 `ide.bottom`（底部面板）。同一 effect 就位面板 store（`createIdeLayoutStore`：侧栏/详情宽度、编辑器/底部开关）并提供 `ctx.layout` 服务面（web 布局约定），因此 `ui-sidebar` 的切换在 IDE 中继续可用。

编辑器组是 M0 占位（中文文案「编辑器内核将在 M1 接入」）：Monaco 内核与 LSP 客户端随 M1 及其专属包落地并注册进 `ide.editor`。`details` 槽位在 M0 声明但不渲染。

## Model Experience

### 无模型可见表面

#### 模型看到什么

没有：工作台是纯展示插件——无提示词区块、无工具、无 shell 变量。

#### Token 影响

无。

#### KV Cache 影响

无。

## 已知局限与后续工作

- **M0 编辑器占位** — 在 M1 编辑器内核（Monaco + monaco-languageclient）注册前，`ide.editor` 没有占据者；组打开时框架显示占位文案。
- **`details` 声明但不渲染** — web 表面的工具详情面板在 M0 的 IDE 工作台中不显示；由后续笔记决定其槽位（右列或底部）。
- **尚无拖拽手柄** — 框架是固定网格；面板缩放随 M1 编辑器工作与几何 store 一起落地。
