/**
 * @deepseek-ai/dsh-ide-app — the ide-surface bundle's runtime glue plugin
 * plus the bundle patch (`cordis.patch.yml`, declared by the
 * `dsh.bundle.patch` manifest field). The plugin owns the ide-surface
 * orientation: it registers the `app:ide-surface` prompt section so the
 * model understands it is driving a desktop IDE surface rather than a
 * browser page. Everything else the ide surface needs (the seam, the
 * client roster) is a patch row in `cordis.patch.yml`.
 * @module @deepseek-ai/dsh-ide-app
 */

import type { Context } from '@deepseek-ai/cordis'
import z from '@deepseek-ai/schemastery'
import type {} from '@deepseek-ai/dsh-system-prompt'

/** Stable Cordis plugin name. */
export const name = 'ide-app'

/** Plugin config: whether the ide-surface orientation section registers. */
export interface Config {
  /**
   * Register the model-visible `app:ide-surface` prompt section. A layer
   * embedding the ide client without a shell can turn it off.
   */
  surfaceContext: boolean
}

export const Config: z<Config> = z.object({
  surfaceContext: z.boolean().default(true),
})

/** Model-visible orientation for sessions created through `dsh ide`. */
function ideSurfacePrompt(): string {
  return 'You are interacting with the user through the DeepSeek Harness IDE, a desktop workbench surface. '
    + 'The IDE embeds the same harness runtime and session store as `dsh web`: sessions, approvals, tools, and files are shared '
    + 'across the web, terminal (TUI), and IDE surfaces. '
    + 'When the user refers to "the IDE", "this app", or "the editor" without naming another target, they mean this surface. '
    + 'The IDE has no implicit DOM, route, or screenshot context; the browser web surface remains available as a fallback. '
    + 'Do not start replacement servers; the harness host serves the surface already running.'
}

/**
 * Mount the ide-surface runtime glue.
 * @param ctx - plugin context carrying the prompt system.
 * @param config - validated {@link Config}.
 */
export function apply(ctx: Context, config: Config): void {
  if (config.surfaceContext) {
    ctx.inject(['systemPrompt'], (promptCtx) => {
      promptCtx.systemPrompt.section({
        name: 'app:ide-surface',
        order: -97,
        text: () => ideSurfacePrompt(),
      })
    })
  }
}
