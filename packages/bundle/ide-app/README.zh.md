# `@deepseek-ai/dsh-ide-app`

[English](README.md) | 中文

dsh IDE 表面 bundle。[`cordis.patch.yml`](cordis.patch.yml) 叠加于 [`dsh-base`](../base/README.zh.md) + [`dsh-web-app`](../web-app/README.zh.md) 之上：插入 [`dsh-ide`](../../ide/ide/README.zh.md) seam 行与 IDE 客户端名册行，不替换任何 web 行，并挂载本包的 `ide-app` 胶水插件（config `{surfaceContext}`）。该插件注册 `app:ide-surface` 提示词区块（顺序 −97），让模型理解自己在驱动一个桌面 IDE 工作台表面，其会话、审批、工具与文件与 web、终端表面共享。`ide` profile 模板（`@deepseek-ai/dsh-base` + `@deepseek-ai/dsh-web-app` + `@deepseek-ai/dsh-ide-app`）由 [`dsh-app-boot`](../../boot/app-boot/README.zh.md) 首次使用时自动初始化；桌面壳仓库（树外）嵌入构建后的 web 客户端，并在 `ctx.ide` 上注册 `IdeWindowProvider`/`IdeEditorProvider` 角色。

## Model Experience

### IDE 表面上下文

#### 模型看到什么

当 `surfaceContext` 为 true 时，`app:ide-surface` 全局区块（顺序 −97）向模型说明 IDE：表面身份、共享运行时声明（会话、审批、工具与文件在 web、终端、IDE 间共享），以及不要启动替代服务器。为 false 时不注册任何区块。

#### Token 影响

每会话一段提示词；每进程恒定。

#### KV Cache 影响

区块在进程生命周期内稳定且位于系统提示词头部附近，跨轮次不会使缓存失效。

## 已知局限与后续工作

- **客户端工作台是骨架** — `@deepseek-ai/dsh-client-ide-layout` 提供布局容器与空编辑器组；Monaco 内核与 LSP 客户端随 M1 及其笔记落地。
- **编辑器通道尚未接线** — `/api/editor.mux` 流与 `editor.*` 一元方法在 [IDE 第三表面笔记](../../../.agents/notes/proposed/architecture/2026-08-14-dsh-ide-third-surface.zh.md) 中提案，随 client/host 编辑器包落地。
- **壳在树外** — 没有桌面壳仓库时，`ctx.ide` 操作收敛到中性结果；本 bundle 不依赖壳。
