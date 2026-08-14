/**
 * IDE workbench plugin, browser half: one register() call contributes
 * IdeWorkbench into the runtime's built-in 'root' slot (the ide profile
 * disables the browser ui-layout row) and, in the same breath, declares the
 * six child slots: the four web-surface seats (kept so existing web plugins
 * keep working) plus the `ide.editor` editor-group and `ide.bottom` panel
 * seats. The same effect seats the panel store and wires the layout service
 * face (`ctx.layout`), so plugins that depend on the web layout contract
 * (ui-sidebar's toggle) keep working in the IDE.
 */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type { BoundActions } from '@deepseek-ai/dsh-client-ui-slots'
// Type-only: pulls ui-layout's SlotMap entries for the web-surface seats and
// the exported LayoutController for the ctx.layout face.
import type {} from '@deepseek-ai/dsh-client-ui-layout/client'
import { LayoutController } from '@deepseek-ai/dsh-client-ui-layout/client'
import { IdeWorkbench } from './IdeWorkbench.tsx'
import { createIdeLayoutStore } from './stores.ts'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface SlotMap {
    /**
     * The editor group column of the IDE workbench. M0 placeholder only: the
     * Monaco kernel and LSP client land in M1 with their own packages.
     */
    'ide.editor': { kind: 'single'; scope: 'root' }
    /**
     * The bottom panel of the IDE workbench (terminal/SCM/console seats,
     * M1+). Unoccupied in M0.
     */
    'ide.bottom': { kind: 'single'; scope: 'root' }
  }
}

/** Services required by the ide workbench plugin. */
export const inject = ['slots']

/**
 * Client plugin body: one register() call — IdeWorkbench into 'root' with
 * the six child-slot declarations, the panel store seat, and the inject hook
 * that hands the store's bound actions to the ctx.layout service face.
 * @param ctx - client root context.
 */
export function apply(ctx: ClientContext): void {
  const layout = new LayoutController()
  ctx.effect(() => {
    const disposeService = ctx.reflect.provide('layout', layout)
    const disposeRegistration = ctx.slots.register({
      name: 'root',
      children: {
        'sidebar': { kind: 'single', scope: 'root' },
        'conversation': { kind: 'single', scope: 'session-maybe' },
        'details': { kind: 'single', scope: 'session' },
        'shell.overlay': { kind: 'list', scope: 'root' },
        'ide.editor': { kind: 'single', scope: 'root' },
        'ide.bottom': { kind: 'single', scope: 'root' },
      },
      // Exclusive store: the factory itself — the framework instantiates per
      // entry and delivers useStore/actions to IdeWorkbench as standard props.
      store: createIdeLayoutStore,
      inject: (actions: BoundActions<ReturnType<typeof createIdeLayoutStore>>) => {
        layout.attachPanels(actions)
        return {}
      },
    }, IdeWorkbench)
    return () => {
      disposeRegistration()
      // provide()'s disposer settles asynchronously; teardown is synchronous fire-and-forget.
      void disposeService()
    }
  }, 'ide-layout: root registration')
}
