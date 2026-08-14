/** Ide workbench root registration, its layout face wiring, and the face controller. */
import { Context } from '@deepseek-ai/cordis'
import { describe, expect, it, vi } from 'vitest'
import { SlotRegistry } from '@deepseek-ai/dsh-client-runtime/client'
import { apply, inject } from '@deepseek-ai/dsh-client-ide-layout/client'
import { IdeLayoutController } from '../src/client/service.ts'

async function bench() {
  const ctx = new Context()
  await ctx.plugin(SlotRegistry).await()
  return { ctx, slots: ctx.get('slots') as SlotRegistry }
}

describe('IdeLayoutController', () => {
  it('forwards gestures to the attached panel actions and throws unwired', () => {
    const controller = new IdeLayoutController()
    expect(() => controller.toggleSidebar()).toThrow('panel actions not wired')
    const actions = {
      toggleSidebar: vi.fn(),
      openDetails: vi.fn(),
      closeDetails: vi.fn(),
    }
    controller.attachPanels(actions as never)
    controller.toggleSidebar()
    controller.openDetails()
    controller.closeDetails()
    expect(actions.toggleSidebar).toHaveBeenCalledOnce()
    expect(actions.openDetails).toHaveBeenCalledOnce()
    expect(actions.closeDetails).toHaveBeenCalledOnce()
  })
})

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
