# Agent Note: IDE as the third product surface

Status: proposed

English | [中文](2026-08-14-dsh-ide-third-surface.zh.md)

## Problem

DSH ships two interactive surfaces today: `web` (browser) and `headless` (one-shot), with ACP and stdio JSON-RPC as automation entries. The official full-screen TUI was removed ([2026-08-04 removal note](../../implemented/simplification/2026-08-04-remove-tui-package.md)), so terminal-first users rely on out-of-tree community profiles such as `dsh-cc-tui`.

The Web client has no code-editor kernel, no editor-facing LSP client, no terminal panel, and no desktop shell. Community plugins fill these at panel level (`dsh-web-ui` file tree/preview/SCM panels, `dsh-better-sidebar` CodeMirror/xterm editing), which proves demand but cannot deliver an integrated IDE surface: there is no workbench layout, no diff-approval flow over tool edits, no permission-modal UX, and no editor-dedicated transport.

The extension map already names the right mechanism — "Add UI or editor integration → drive `ctx.agents` and render from `session/event`" — but the corresponding host seam, editor transport, and surface entry do not exist, so every editor-facing integration reinvents its own channel.

## Proposal

Introduce **`ide` as a third interactive surface**: `dsh ide` becomes an alias of `--profile ide`, served by the same Web client over the same four-quadrant RPC, extended by a new editor channel and a thin `ctx.ide` seam. The desktop shell (Tauri/Electron) is deliberately out of tree: this repository owns the surface entry, the profile bundle, the Service Definition, the editor transport protocol, and the client workbench packages; a separate shell repository embeds the built Web client and supplies the native window provider. The shell's absence must never break `web` or `ide` in a browser.

### `dsh ide` entry and profile

- `apps/cli` routes `ide` to `--profile ide` exactly like `web` (mode routing in `src/bin.ts`), and `ide` joins `web`/`headless` as a shipped profile template.
- New `packages/bundle/ide-app` stacks `@deepseek-ai/dsh-base` + `@deepseek-ai/dsh-web-app` + the ide host packages, mirroring `dsh-web-app` composition. Nothing in the ide profile replaces a base capability; it only adds surfaces.

### `ctx.ide` Service Definition (`packages/ide/ide`)

One seam, three provider roles, each with a neutral no-provider state so the browser surface degrades gracefully:

- **`IdeWindow`** — shell-reported window facts and commands: open path externally, window focus, update availability, menu commands. Provider: the external desktop shell. Neutral state: every operation resolves to a documented `unavailable` result, never a boot error.
- **`IdeEditor`** — editor-dedicated duplex transport: server→client frames (open@line navigation, tool-diff application requests, LSP attach notices) over a new named stream `/api/editor.mux` beside `/api/events.mux` and `/api/events.host`; client→server unary methods (`POST /api/editor.*`) registered in the same `RpcMethodMap` and validated at the same wire boundary as every other API Proxy method.
- **`IdeTerminal`** — reserved definition only in M0; the PTY-backed UI stream lands with the terminal note in M1. Reusing `ctx.terminals` keeps PTY inside the harness where sandbox and approval apply.

Model-visible inputs stay session events: when the model asks to open a file in the editor, the request becomes a durable session event plus a keyed UI renderer, never a private side channel between tool and UI.

### Client workbench (`packages/client/ide-layout`)

A workbench skeleton over the existing `ui-slots` composition: activity bar, side panel, editor group, bottom panel, and layout state. M0 ships the container and an empty editor-group placeholder. The Monaco kernel and the LSP client are M1 scope with their own notes; M0 must not add a Monaco dependency.

### Editor channel lifecycle

`/api/editor.mux` opens lazily: only when an ide surface is active, so the plain `web` surface keeps its two existing downlinks. The stream speaks the same envelope as `events.mux` (idempotent replay frames), and unary editor methods follow the existing privileged-loopback rules unchanged.

## Alternatives considered

**Ship the desktop shell inside this repository (`apps/ide`).** The shell's release cadence — installers, code signing, updater endpoints — is independent of harness releases, and a Rust toolchain requirement would couple every contributor to the shell. The repository owns the seam; the shell repository owns the native host.

**Make a VS Code extension the first surface.** Reusing the VS Code extension host is fastest to market, but its extension API constrains diff-approval and multi-agent panel UX. Deferred to a later note as a parallel front-end over the same RPC.

**Reuse the stdio JSON-RPC SDK as the IDE transport.** It lacks incremental streaming, cancellation, and bidirectional requests; the four-quadrant RPC already carries the Web client, so a second protocol would fork the client.

**Extend `ctx.lsp`'s closed navigation union for the editor.** The editor needs a full bidirectional LSP client (didOpen, diagnostics, completion, symbols). Widening the model's narrow seam would pollute it; a separate `ide-lsp-client` note owns that work in M1.

**Run the terminal PTY in the desktop shell.** That would move a sandboxed capability out of the harness and bypass the approval model. PTY stays on `ctx.terminals`; only the UI stream crosses the editor channel.

## Acceptance criteria

- `dsh ide` boots an ide-profile Cordis tree and serves the same Web client as `web`; in a browser (no shell provider) every `IdeWindow`/`IdeEditor` operation settles to its documented neutral result.
- The `ctx.ide` Service Definition ships with Provider and Consumer roles; provider absence is a tested neutral state, not a boot error.
- `/api/editor.mux` and the `editor.*` unary methods pass the wire-boundary validation, honor privileged-loopback rules, and appear in the generated catalogs.
- `packages/client/ide-layout` renders the workbench skeleton in the existing client without a Monaco dependency.
- Focused unit and snapshot coverage lands with the code; `typecheck`, `lint`, and `doc-sync` pass.
- This note moves to `implemented` only together with the M0 code, not before.

## Risks

Upstream preview churn may rename the RPC carriers this note extends. The editor channel is defined in terms of the public `/api` contract; a carrier rename lands as a factual update to this note and the [GUI RPC protocol note](../../implemented/architecture/2026-07-19-gui-layering-and-rpc-protocol.md), which this note extends rather than supersedes.

A named editor stream adds a third WebSocket downlink per client. Its lazy lifecycle is an acceptance criterion precisely to avoid doubling browser load in the plain `web` surface.

The shell repository is external, so the seam must not depend on shell presence; tests run with no provider registered.

Scope creep toward the editor kernel, LSP client, or terminal stream in M0 would make this change unreviewable; those land as separate M1 notes.
