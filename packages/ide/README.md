# IDE group

English | [中文](README.zh.md)

Host-side packages that give DSH an IDE surface over the existing web client. The group owns the `ctx.ide` seam and the bundles and client workbench that mount it; the desktop shell repository (out of tree) embeds the built web client and registers the native provider roles.

| Package | Role |
|---|---|
| [`ide/`](ide/README.md) | `@deepseek-ai/dsh-ide` — the `ctx.ide` Service Definition: `IdeWindowProvider` and `IdeEditorProvider` roles with neutral no-provider results |

Design: [IDE third-surface note](../.agents/notes/proposed/architecture/2026-08-14-dsh-ide-third-surface.md).
