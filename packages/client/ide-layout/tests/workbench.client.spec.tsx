// @vitest-environment jsdom
/** IdeWorkbench frame behavior: seat rendering decisions and the M0 editor placeholder. */
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { ReactNode } from 'react'
import { IdeWorkbench, type IdeWorkbenchProps } from '../src/client/IdeWorkbench.tsx'
import { createIdeLayoutStore } from '../src/client/stores.ts'

interface StatePatch { editorOpen?: boolean; bottomOpen?: boolean; sidebar?: number }

/** Render the frame with a driven store instance and slot spies. */
function renderWorkbench(patch: StatePatch = {}) {
  const handle = createIdeLayoutStore()
  const instance = handle.create()
  instance.store.update((d: { editorOpen: boolean; bottomOpen: boolean; sidebar: number }) => {
    d.editorOpen = patch.editorOpen ?? true
    d.bottomOpen = patch.bottomOpen ?? true
    d.sidebar = patch.sidebar ?? 260
  })
  const renderSlot = (name: string, _owner?: unknown): ReactNode => <div data-slot={name} />
  const props = {
    useStore: ((selector: (state: ReturnType<typeof instance.getSnapshot>) => unknown) =>
      selector(instance.getSnapshot())) as IdeWorkbenchProps['useStore'],
    actions: instance.actions as IdeWorkbenchProps['actions'],
    renderSlot: renderSlot as IdeWorkbenchProps['renderSlot'],
  } as IdeWorkbenchProps
  return render(<IdeWorkbench {...props} />)
}

describe('IdeWorkbench', () => {
  it('renders the web-surface seats and the editor group with an open editor', () => {
    const view = renderWorkbench()
    expect(view.container.querySelector('[data-slot="sidebar"]')).not.toBeNull()
    expect(view.container.querySelector('[data-slot="conversation"]')).not.toBeNull()
    expect(view.container.querySelector('[data-slot="shell.overlay"]')).not.toBeNull()
    expect(view.container.querySelector('[data-slot="ide.editor"]')).not.toBeNull()
    expect(view.container.querySelector('[data-slot="ide.bottom"]')).not.toBeNull()
    expect(screen.queryByText('编辑器内核将在 M1 接入（Monaco + LSP）')).toBeNull()
  })

  it('shows the M0 placeholder and hides the editor slot when the editor is closed', () => {
    const view = renderWorkbench({ editorOpen: false })
    expect(screen.getByText('编辑器内核将在 M1 接入（Monaco + LSP）')).toBeDefined()
    expect(view.container.querySelector('[data-slot="ide.editor"]')).toBeNull()
  })

  it('hides the bottom panel when closed and keeps the sidebar seat mounted', () => {
    const view = renderWorkbench({ bottomOpen: false })
    expect(view.container.querySelector('[data-slot="ide.bottom"]')).toBeNull()
    expect(view.container.querySelector('[data-slot="sidebar"]')).not.toBeNull()
  })
})
