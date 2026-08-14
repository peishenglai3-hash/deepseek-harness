# `@deepseek-ai/dsh-client-ide-layout`

English | [中文](README.zh.md)

The IDE workbench frame, browser half. In the `ide` profile (the [`dsh-ide-app`](../../bundle/ide-app/README.md) bundle disables the browser [`ui-layout`](../ui-layout/README.md) row), this plugin registers `IdeWorkbench` into the built-in `root` slot and declares the six child seats: the four web-surface seats (`sidebar`, `conversation`, `details`, `shell.overlay` — re-declared so existing web plugins keep working) plus `ide.editor` (editor group) and `ide.bottom` (bottom panel). The same effect seats the panel store (`createIdeLayoutStore`: sidebar/details widths, editor/bottom open flags) and provides the `ctx.layout` service face (the web layout contract), so `ui-sidebar`'s toggle keeps working in the IDE.

The editor group is an M0 placeholder (Chinese copy「编辑器内核将在 M1 接入」): the Monaco kernel and LSP client land in M1 with their own packages and register into `ide.editor`. The `details` seat is declared but not rendered in M0.

## Model Experience

### No model-facing surface

#### What the model sees

Nothing: the workbench is a pure presentation plugin — no prompt sections, no tools, no shell variables.

#### Token effect

None.

#### KV Cache effect

None.

## Known Limitations and Deferred Work

- **M0 editor placeholder** — `ide.editor` has no occupant until the M1 editor kernel (Monaco + monaco-languageclient) registers; the frame shows the placeholder copy when the group is open.
- **`details` declared, not rendered** — the web surface's tool-details panel does not appear in the IDE workbench in M0; a later note decides its seat (right column or bottom).
- **No drag handles yet** — the frame is a fixed grid; panel resize joins the M1 editor work with the geometry store.
