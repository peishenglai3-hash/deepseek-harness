import { afterEach, describe, expect, it } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import Ide from '@deepseek-ai/dsh-ide'
import type { IdeEditorProvider, IdeWindowProvider } from '@deepseek-ai/dsh-ide'

const disposers: Array<() => void> = []

afterEach(() => {
  for (const dispose of disposers.splice(0)) dispose()
})

function mount(): Promise<Ide> {
  const ctx = new Context()
  disposers.push(() => { void ctx.fiber.dispose() })
  // The vitest invariant host gates plugin start on invariant readiness, so
  // the service is available only after the fiber settles.
  return ctx.plugin(Ide).await().then(() => ctx.ide)
}

const windowProvider: IdeWindowProvider = {
  openPath: async () => ({ ok: true }),
  windowFacts: async () => ({ platform: 'desktop', title: 'DSH IDE', version: '0.0.1' }),
}

describe('Ide surface seam', () => {
  it('settles every operation to its neutral result with no provider registered', async () => {
    const ide = await mount()
    expect(await ide.openPath('C:\\x')).toEqual({ ok: false, reason: 'unavailable' })
    expect(await ide.windowFacts()).toBeUndefined()
    expect(await ide.openAt({ path: 'C:\\x' })).toEqual({ ok: false, reason: 'unavailable' })
  })

  it('routes window operations to the registered window provider and unwinds on dispose', async () => {
    const ide = await mount()
    const dispose = ide.registerWindowProvider(windowProvider)
    expect(await ide.openPath('C:\\x')).toEqual({ ok: true })
    expect(await ide.windowFacts()).toEqual({ platform: 'desktop', title: 'DSH IDE', version: '0.0.1' })
    dispose()
    expect(await ide.openPath('C:\\x')).toEqual({ ok: false, reason: 'unavailable' })
    expect(await ide.windowFacts()).toBeUndefined()
  })

  it('routes editor navigation to the registered editor provider and unwinds on dispose', async () => {
    const ide = await mount()
    const received: Array<{ path: string; line: number | undefined }> = []
    const editorProvider: IdeEditorProvider = {
      openAt: async (path, line) => {
        received.push({ path, line })
        return { ok: true }
      },
    }
    const dispose = ide.registerEditorProvider(editorProvider)
    expect(await ide.openAt({ path: 'C:\\a.ts', line: 12 })).toEqual({ ok: true })
    expect(received).toEqual([{ path: 'C:\\a.ts', line: 12 }])
    dispose()
    expect(await ide.openAt({ path: 'C:\\a.ts' })).toEqual({ ok: false, reason: 'unavailable' })
  })

  it('rejects a second provider for the same role and keeps the first registration intact', async () => {
    const ide = await mount()
    ide.registerWindowProvider(windowProvider)
    expect(() => ide.registerWindowProvider(windowProvider)).toThrow('already registered')
    // The first registration still serves the operation.
    expect(await ide.openPath('C:\\x')).toEqual({ ok: true })
  })

  it('reports provider failures without masking them as availability', async () => {
    const ide = await mount()
    ide.registerWindowProvider({
      openPath: async () => ({ ok: false, reason: 'provider-error', message: 'boom' }),
      windowFacts: async () => undefined,
    })
    expect(await ide.openPath('C:\\x')).toEqual({ ok: false, reason: 'provider-error', message: 'boom' })
  })
})
