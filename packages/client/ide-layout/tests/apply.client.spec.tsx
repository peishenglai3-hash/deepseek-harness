/** Ide workbench root registration and its layout face wiring. */
import { Context } from '@deepseek-ai/cordis'
import { describe, expect, it } from 'vitest'
import { SlotRegistry } from '@deepseek-ai/dsh-client-runtime/client'
import { apply, inject } from '@deepseek-ai/dsh-client-ide-layout/client'

async function bench() {
  const ctx = new Context()
  await ctx.plugin(SlotRegistry).await()
  return { ctx, slots: ctx.get('slots') as SlotRegistry }
}

describe('ide-layout apply', () => {
  it('declares only the services it uses', () => {
    expect(inject).toEqual(['slots'])
  })

  it('registers the workbench into root and declares the six child seats', async () => {
    const b = await bench()
    await b.ctx.plugin({ inject: [...inject], apply }).await()
    expect(b.slots.entries('root')).toHaveLength(1)
    // The web-surface seats are re-declared so existing web plugins keep working.
    expect(b.slots.spec('sidebar')).toEqual({ kind: 'single', scope: 'root' })
    expect(b.slots.spec('conversation')).toEqual({ kind: 'single', scope: 'session-maybe' })
    expect(b.slots.spec('details')).toEqual({ kind: 'single', scope: 'session' })
    expect(b.slots.spec('shell.overlay')).toEqual({ kind: 'list', scope: 'root' })
    // The ide-specific seats.
    expect(b.slots.spec('ide.editor')).toEqual({ kind: 'single', scope: 'root' })
    expect(b.slots.spec('ide.bottom')).toEqual({ kind: 'single', scope: 'root' })
  })

  it('provides the layout service face after registration', async () => {
    const b = await bench()
    await b.ctx.plugin({ inject: [...inject], apply }).await()
    const layout = b.ctx.get('layout')
    expect(layout).toBeDefined()
    // The face exists; action wiring happens at the entry's first render
    // (the inject hook), which needs the render machinery and is covered by
    // the workbench render spec and the web e2e suites.
    expect(typeof layout!.toggleSidebar).toBe('function')
    expect(typeof layout!.openDetails).toBe('function')
    expect(typeof layout!.closeDetails).toBe('function')
  })

  it('removes the entry and child declarations on teardown', async () => {
    const b = await bench()
    const fiber = b.ctx.plugin({ inject: [...inject], apply })
    await fiber.await()
    await fiber.dispose()
    expect(b.slots.entries('root')).toHaveLength(0)
    expect(b.slots.spec('ide.editor')).toBeUndefined()
    expect(b.slots.spec('ide.bottom')).toBeUndefined()
    expect(b.slots.spec('sidebar')).toBeUndefined()
    expect(b.ctx.get('layout')).toBeUndefined()
  })
})
