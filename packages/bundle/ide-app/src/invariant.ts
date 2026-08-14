/**
 * Package-owned invariant companion for `@deepseek-ai/dsh-ide-app`.
 * @module @deepseek-ai/dsh-ide-app/invariant
 */

import type { Context } from '@deepseek-ai/cordis'
import type { InvariantInstaller } from '@deepseek-ai/dsh-invariants'

const PACKAGE_NAME = '@deepseek-ai/dsh-ide-app'

/** Cordis companion plugin name. */
export const name = 'ide-app-invariant'
/** Service required before the companion can reserve package ownership. */
export const inject = ['invariants']

/**
 * No runtime invariant: the bundle is a static patch-list carrier plus one
 * prompt-section registration; the seam it mounts owns its own invariant
 * companion, and the composition contract (ide profile boots with the web
 * client, seam neutral without a shell) is covered by the ide-app tests and
 * the CLI boot smokes.
 */
const install: InvariantInstaller = () => {}

/**
 * Register this package's invariant companion.
 * @param ctx - Cordis context carrying the invariant service.
 * @returns the installed registration's disposer after setup succeeds.
 */
export const apply = (ctx: Context): Promise<() => void> =>
  Promise.resolve(ctx.invariants.register(PACKAGE_NAME, install))
