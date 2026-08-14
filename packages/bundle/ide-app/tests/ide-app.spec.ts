import { describe, expect, it } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import SystemPrompt from '@deepseek-ai/dsh-system-prompt'
import { apply, Config } from '../src/index.ts'

async function mountSurface(surfaceContext: boolean): Promise<{ ctx: Context; sections: () => Promise<string[]> }> {
  const ctx = new Context()
  apply(ctx, new Config({ surfaceContext }))
  await ctx.plugin(SystemPrompt, { persona: '' })
  await new Promise(resolve => setTimeout(resolve, 0))
  return {
    ctx,
    sections: async () => {
      const assembly = await ctx.systemPrompt.assemble()
      return assembly.sections.map(entry => entry.name)
    },
  }
}

describe('ide-app runtime glue', () => {
  it('registers the ide-surface orientation section by default', async () => {
    const { ctx, sections } = await mountSurface(true)
    const names = await sections()
    expect(names).toContain('app:ide-surface')
    const assembly = await ctx.systemPrompt.assemble()
    const section = assembly.sections.find(entry => entry.name === 'app:ide-surface')
    expect(section?.text).toContain('DeepSeek Harness IDE')
    expect(section?.text).toContain('web, terminal (TUI), and IDE surfaces')
    await ctx.fiber.dispose()
  })

  it('skips the ide-surface section when surfaceContext is false', async () => {
    const { ctx, sections } = await mountSurface(false)
    expect(await sections()).not.toContain('app:ide-surface')
    await ctx.fiber.dispose()
  })
})
