/** Types for the IDE surface seam. This file contains only types, no runtime code. */

/** Outcome of one IDE surface operation. */
export type IdeResult =
  | { ok: true }
  | { ok: false; reason: 'unavailable' | 'provider-error'; message?: string }

/** Shell-reported window facts. */
export interface IdeWindowFacts {
  /** The surface kind the shell embeds. */
  platform: 'desktop' | 'web'
  /** Shell window title, when the shell names one. */
  title?: string
  /** Shell application version, when the shell reports one. */
  version?: string
}

/** Native window capability the desktop shell registers. */
export interface IdeWindowProvider {
  /** Open a path in an external application. */
  openPath(path: string): Promise<IdeResult>
  /** Report the shell's window facts. */
  windowFacts(): Promise<IdeWindowFacts | undefined>
}

/** Editor-navigation request: open a file, optionally at a line. */
export interface IdeOpenAtRequest {
  /** Absolute path of the file to open. */
  path: string
  /** One-based line to focus, when the caller names one. */
  line?: number
}

/** Native editor-navigation capability the desktop shell registers. */
export interface IdeEditorProvider {
  /** Open a file, optionally at a line, in the IDE editor. */
  openAt(path: string, line?: number): Promise<IdeResult>
}
