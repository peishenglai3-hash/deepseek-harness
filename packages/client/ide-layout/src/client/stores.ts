/**
 * The ide workbench root entry's transient layout store: panel geometry as
 * plain widths in px (0 = closed) plus the editor-group and bottom-panel
 * open flags. Module level exports the factory only — a module-level handle
 * would pin the store's identity in the module cache (a de-facto singleton
 * surviving plugin reloads). register() receives the factory (exclusive use:
 * the framework instantiates per entry), IdeWorkbench derives its PropsStore
 * share from the return type, and the ctx.layout service face receives the
 * bound actions through the registration's inject hook.
 */
import { defineStore, type EngineStoreHandle } from '@deepseek-ai/dsh-client-runtime/client'

/** Default sidebar width in px. */
const SIDEBAR_DEFAULT = 260
/** Default details width in px. */
const DETAILS_DEFAULT = 340
/** Contract range of the sidebar width in px. */
const SIDEBAR_MIN = 220
const SIDEBAR_MAX = 500
/** Contract range of the details width in px. */
const DETAILS_MIN = 340
const DETAILS_MAX = 1200

/** Clamp a drag width into a panel's contract range. */
function clampWidth(px: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, px))
}

/**
 * Layout store state: panel width preferences in px (0 = closed), the
 * editor-group and bottom-panel open flags, and the narrow-viewport pair
 * (`narrow` mirrors the frame's breakpoint reading so toggleSidebar can pick
 * semantics; `narrowExpanded` is the manual override that re-expands the
 * auto-collapsed sidebar without rewriting the width preference).
 */
type IdeLayoutState = {
  sidebar: number
  details: number
  editorOpen: boolean
  bottomOpen: boolean
  narrow: boolean
  narrowExpanded: boolean
}

/** Annotation twin of the actions literal below (the export needs a declared return type). */
type IdeLayoutActions = {
  setSidebar: (draft: IdeLayoutState, px: number) => void
  setDetails: (draft: IdeLayoutState, px: number) => void
  toggleSidebar: (draft: IdeLayoutState) => void
  setNarrow: (draft: IdeLayoutState, narrow: boolean) => void
  openDetails: (draft: IdeLayoutState) => void
  closeDetails: (draft: IdeLayoutState) => void
  toggleEditor: (draft: IdeLayoutState) => void
  toggleBottom: (draft: IdeLayoutState) => void
}

/**
 * Create the ide workbench layout store handle. Actions are the complete
 * write set: drag writes clamp into the panel's contract range and never
 * cross the open/closed line; open/close transitions write 0 / the default
 * explicitly; the editor-group and bottom-panel flags flip directly.
 * @returns the store handle (spec + type + identity + factory in one).
 */
export function createIdeLayoutStore(): EngineStoreHandle<IdeLayoutState, IdeLayoutActions> {
  const handle = defineStore({
    init: (): IdeLayoutState => ({
      sidebar: SIDEBAR_DEFAULT,
      details: 0,
      editorOpen: true,
      bottomOpen: true,
      narrow: false,
      narrowExpanded: false,
    }),
    actions: {
      setSidebar: (d, px: number) => { d.sidebar = clampWidth(px, SIDEBAR_MIN, SIDEBAR_MAX) },
      setDetails: (d, px: number) => { d.details = clampWidth(px, DETAILS_MIN, DETAILS_MAX) },
      toggleSidebar: (d) => {
        if (d.narrow) d.narrowExpanded = !d.narrowExpanded
        else d.sidebar = d.sidebar === 0 ? SIDEBAR_DEFAULT : 0
      },
      setNarrow: (d, narrow: boolean) => {
        if (d.narrow === narrow) return
        d.narrow = narrow
        d.narrowExpanded = false
      },
      openDetails: (d) => { if (d.details === 0) d.details = DETAILS_DEFAULT },
      closeDetails: (d) => { d.details = 0 },
      toggleEditor: (d) => { d.editorOpen = !d.editorOpen },
      toggleBottom: (d) => { d.bottomOpen = !d.bottomOpen },
    },
  })
  return handle
}
