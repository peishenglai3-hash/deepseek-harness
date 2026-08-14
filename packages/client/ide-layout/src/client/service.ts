/**
 * IdeLayoutController: the cross-plugin panel-action face behind ctx.layout
 * in the ide profile. The web profile's ui-layout owns that service; in the
 * ide profile ui-layout is disabled and this controller provides the same
 * contract (ILayout), so plugins that depend on ctx.layout (ui-sidebar's
 * toggle) keep working. Panel geometry lives in the root entry's layout
 * store; the controller forwards to the bound actions delivered by the
 * registration's inject hook.
 */
import type { BoundActions } from '@deepseek-ai/dsh-client-ui-slots'
import type { ILayout } from '@deepseek-ai/dsh-client-ui-layout/client'
import type { createIdeLayoutStore } from './stores.ts'

/** The ide layout store's bound action set (framework-baked, draft params peeled). */
export type IdePanelActions = BoundActions<ReturnType<typeof createIdeLayoutStore>>

/**
 * The ide profile's ctx.layout face: the panel transitions other plugins may
 * trigger, forwarded to the workbench entry's bound store actions.
 */
export class IdeLayoutController implements ILayout {
  #panels: IdePanelActions | undefined

  /**
   * Adopt the root entry's bound store actions. Called from the root
   * registration's inject hook (a sanctioned assembly side effect), so the
   * face is live from the entry's first render.
   * @param actions - bound actions of the entry's layout store instance.
   */
  attachPanels(actions: IdePanelActions): void {
    this.#panels = actions
  }

  /** Toggle the sidebar panel (closed ⟷ contract default width). */
  toggleSidebar(): void {
    this.#require().toggleSidebar()
  }

  /** Open the details panel (no-op when already open). */
  openDetails(): void {
    this.#require().openDetails()
  }

  /** Close the details panel. */
  closeDetails(): void {
    this.#require().closeDetails()
  }

  #require(): IdePanelActions {
    // Callers are UI gestures, which cannot fire before the root entry
    // rendered (the inject hook runs in its first render) — reaching this
    // unwired is a boot-order bug, not a race to tolerate.
    if (this.#panels === undefined) throw new Error('layout: panel actions not wired (root entry not mounted)')
    return this.#panels
  }
}
