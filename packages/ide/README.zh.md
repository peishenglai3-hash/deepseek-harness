# IDE 组

[English](README.md) | 中文

承载 DSH 在现有 web 客户端之上获得 IDE 表面的 host 侧包。本组拥有 `ctx.ide` seam，以及挂载它的 bundle 与客户端工作台；桌面壳仓库（树外）嵌入构建后的 web 客户端并注册原生 provider 角色。

| 包 | 角色 |
|---|---|
| [`ide/`](ide/README.zh.md) | `@deepseek-ai/dsh-ide` — `ctx.ide` Service Definition：`IdeWindowProvider` 与 `IdeEditorProvider` 角色，均带无 provider 的中性结果 |

设计：[IDE 第三表面笔记](../.agents/notes/proposed/architecture/2026-08-14-dsh-ide-third-surface.zh.md)。
