# `@deepseek-ai/dsh-ide`

English | [中文](README.zh.md)

The IDE surface seam. One `ctx.ide` service, two provider roles, each with a neutral no-provider state:

- **`IdeWindowProvider`** — the desktop shell's native window capability (`openPath`, `windowFacts`). Until a provider registers, `openPath` settles to `{ ok: false, reason: 'unavailable' }` and `windowFacts` to `undefined`, so the browser `web` surface and headless boots degrade gracefully and never fail to boot.
- **`IdeEditorProvider`** — native editor navigation (`openAt(path, line?)`). Same neutral contract without a provider.

Providers register through `ctx.ide.registerWindowProvider(...)` / `ctx.ide.registerEditorProvider(...)`; each returns a disposer. One provider per role; a second registration throws.

The `ide` profile template (`@deepseek-ai/dsh-ide-app` bundle) mounts this seam; the desktop shell repository supplies the providers out of tree.

## Model Experience

### No model-facing surface

#### What the model sees

Nothing in M0: the seam exposes no model-facing tools, no prompt sections, and no shell variables. It is a host-side extension point for UI integrations only.

#### Token effect

None.

#### KV Cache effect

None.

## Known Limitations and Deferred Work

- **No editor transport yet** — the editor-dedicated `/api/editor.mux` stream and the `editor.*` unary methods are proposed in the [IDE third-surface note](../../../.agents/notes/proposed/architecture/2026-08-14-dsh-ide-third-surface.md) and land with their own client/host packages, not here.
- **`IdeTerminal` role is reserved only** — the PTY-backed UI stream reuses `ctx.terminals` and ships with the terminal note; this package owns no terminal surface.
- **No window commands beyond the two roles** — menu/status-bar contributions arrive with the shell provider and the client workbench package.
