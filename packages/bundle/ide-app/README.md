# `@deepseek-ai/dsh-ide-app`

English | [中文](README.zh.md)

The dsh ide-surface bundle. [`cordis.patch.yml`](cordis.patch.yml) rides over [`dsh-base`](../base/README.md) + [`dsh-web-app`](../web-app/README.md): it inserts the [`dsh-ide`](../../ide/ide/README.md) seam row and the IDE client-roster row without replacing any web row, and mounts this package's `ide-app` glue plugin (config `{surfaceContext}`). That plugin registers the `app:ide-surface` prompt section (order −97) so the model understands it is driving a desktop IDE workbench surface whose sessions, approvals, tools, and files are shared with the web and terminal surfaces. The `ide` profile template (`@deepseek-ai/dsh-base` + `@deepseek-ai/dsh-web-app` + `@deepseek-ai/dsh-ide-app`) is auto-initialized by [`dsh-app-boot`](../../boot/app-boot/README.md); the desktop shell repository (out of tree) embeds the built web client and registers the `IdeWindowProvider`/`IdeEditorProvider` roles on `ctx.ide`.

## Model Experience

### IDE-surface context

#### What the model sees

When `surfaceContext` is true, the `app:ide-surface` global section (order −97) orients the model to the IDE: the surface identity, the shared-runtime statement (sessions, approvals, tools, and files are shared across web, terminal, and IDE), and the instruction not to start replacement servers. When it is false, no section is registered.

#### Token effect

One prompt paragraph per session; constant per process.

#### KV Cache effect

The section is stable for the life of the process and sits near the system prompt's head, so it does not invalidate the cache across turns.

## Known Limitations and Deferred Work

- **The client workbench is a skeleton** — `@deepseek-ai/dsh-client-ide-layout` ships the layout container and an empty editor group; the Monaco kernel and LSP client land in M1 with their own notes.
- **The editor channel is not wired yet** — the `/api/editor.mux` stream and `editor.*` unary methods are proposed in the [IDE third-surface note](../../../.agents/notes/proposed/architecture/2026-08-14-dsh-ide-third-surface.md) and land with the client/host editor packages.
- **The shell is out of tree** — without the desktop shell repository, `ctx.ide` operations settle to their neutral results; nothing in this bundle depends on the shell.
