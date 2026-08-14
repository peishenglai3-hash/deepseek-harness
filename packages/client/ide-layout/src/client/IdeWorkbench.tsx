/**
 * IDE workbench frame, registered into the built-in 'root' slot in the ide
 * profile (the ide-app bundle disables the browser ui-layout row first, so
 * this frame is the sole root owner). Grid tracks: sidebar | conversation |
 * editor group + bottom panel. The editor group is an M0 placeholder — the
 * Monaco kernel and LSP client land in M1 with their own packages. Pure
 * component: everything arrives through the framework shares; zero cordis
 * or framework imports, zero self-made hooks.
 */
import type { PropsRenderSlots, PropsRuntime, PropsStore } from '@deepseek-ai/dsh-client-ui-slots'
import type { createIdeLayoutStore } from './stores.ts'
import css from './IdeWorkbench.module.css'

/** Full composed props: runtime share + child-slot render share + store share. */
export type IdeWorkbenchProps =
  & PropsRuntime<'root'>
  & PropsRenderSlots<'sidebar' | 'conversation' | 'details' | 'shell.overlay' | 'ide.editor' | 'ide.bottom'>
  & PropsStore<ReturnType<typeof createIdeLayoutStore>>

/**
 * The IDE workbench frame (see module doc). The `details` seat is declared
 * for compatibility with the web surface's occupants but is not rendered in
 * M0; the editor group and bottom panel render their own slots.
 * @param props - the four framework shares.
 */
export function IdeWorkbench({
  useStore,
  renderSlot,
}: IdeWorkbenchProps) {
  const panels = useStore(s => s)
  return (
    <div className={css.frame}>
      <div className={css.sidebarCol}>
        {renderSlot('sidebar', { collapsed: panels.sidebar === 0, width: panels.sidebar })}
      </div>
      <div className={css.centerCol}>{renderSlot('conversation', {})}</div>
      <div className={css.editorCol}>
        <div className={css.editorGroup}>
          {panels.editorOpen
            ? renderSlot('ide.editor', {})
            : <div className={css.editorPlaceholder}>编辑器内核将在 M1 接入（Monaco + LSP）</div>}
        </div>
        <div className={css.bottomPanel}>
          {panels.bottomOpen ? renderSlot('ide.bottom', {}) : null}
        </div>
      </div>
      <div className={css.overlayLayer}>{renderSlot('shell.overlay', {})}</div>
    </div>
  )
}
