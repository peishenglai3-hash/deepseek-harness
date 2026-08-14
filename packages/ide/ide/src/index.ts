/**
 * IDE surface seam. One service, two provider roles, each with a neutral
 * no-provider state so the browser surface and headless boots degrade
 * gracefully: window operations and editor navigation resolve to
 * `{ ok: false, reason: 'unavailable' }` (or `undefined` facts) until the
 * desktop shell registers a provider. The M0 surface owns no model-facing
 * tools and no transport; the editor channel (`/api/editor.mux`) and the
 * terminal UI stream land in later notes.
 * @module @deepseek-ai/dsh-ide
 */

import { Service } from '@deepseek-ai/cordis'
import type { Context } from '@deepseek-ai/cordis'
import type {
  IdeEditorProvider,
  IdeOpenAtRequest,
  IdeResult,
  IdeWindowFacts,
  IdeWindowProvider,
} from './types.ts'

export type {
  IdeEditorProvider,
  IdeOpenAtRequest,
  IdeResult,
  IdeWindowFacts,
  IdeWindowProvider,
} from './types.ts'

declare module '@deepseek-ai/cordis' {
  interface Context {
    ide: Ide
  }
}

/** Neutral result for a role with no registered provider. */
const UNAVAILABLE: IdeResult = { ok: false, reason: 'unavailable' }

/**
 * The IDE surface seam: window and editor provider registries plus the
 * service methods consumers call. Providers are the desktop shell's native
 * capabilities; every method settles to its neutral result when the matching
 * provider is absent.
 */
export class Ide extends Service {
  private windowProvider: IdeWindowProvider | undefined
  private editorProvider: IdeEditorProvider | undefined

  constructor(ctx: Context) {
    super(ctx, 'ide')
  }

  /**
   * Register the window provider (the desktop shell). One provider per role.
   * @param provider - the shell's native window capability.
   * @returns a disposer that removes this exact registration.
   */
  registerWindowProvider(provider: IdeWindowProvider): () => void {
    if (this.windowProvider !== undefined) {
      throw new Error('ide: a window provider is already registered')
    }
    this.windowProvider = provider
    return () => {
      if (this.windowProvider === provider) this.windowProvider = undefined
    }
  }

  /**
   * Register the editor provider (the desktop shell or a future editor host).
   * One provider per role.
   * @param provider - the native editor-navigation capability.
   * @returns a disposer that removes this exact registration.
   */
  registerEditorProvider(provider: IdeEditorProvider): () => void {
    if (this.editorProvider !== undefined) {
      throw new Error('ide: an editor provider is already registered')
    }
    this.editorProvider = provider
    return () => {
      if (this.editorProvider === provider) this.editorProvider = undefined
    }
  }

  /**
   * Open a path outside the surface (an external application). Neutral when
   * no window provider is registered.
   * @param path - the absolute path to open.
   * @returns the provider outcome, or `unavailable`.
   */
  async openPath(path: string): Promise<IdeResult> {
    if (this.windowProvider === undefined) return UNAVAILABLE
    return this.windowProvider.openPath(path)
  }

  /**
   * Snapshot the shell's window facts. `undefined` when no window provider
   * is registered.
   * @returns the shell-reported facts, or `undefined`.
   */
  async windowFacts(): Promise<IdeWindowFacts | undefined> {
    if (this.windowProvider === undefined) return undefined
    return this.windowProvider.windowFacts()
  }

  /**
   * Ask the editor to open a file at a line. Neutral when no editor provider
   * is registered.
   * @param request - the file path and optional line.
   * @returns the provider outcome, or `unavailable`.
   */
  async openAt(request: IdeOpenAtRequest): Promise<IdeResult> {
    if (this.editorProvider === undefined) return UNAVAILABLE
    return this.editorProvider.openAt(request.path, request.line)
  }
}

export default Ide
