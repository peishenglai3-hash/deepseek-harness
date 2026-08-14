/**
 * Package-owned invariant companion for `@deepseek-ai/dsh-ide`.
 * @module @deepseek-ai/dsh-ide/invariant
 */

import type { Context } from '@deepseek-ai/cordis'
import type { InvariantInstaller } from '@deepseek-ai/dsh-invariants'

const PACKAGE_NAME = '@deepseek-ai/dsh-ide'

/** Cordis companion plugin name. */
export const name = 'ide-invariant'
/** Service required before the companion can reserve package ownership. */
export const inject = ['invariants']

/**
 * No runtime invariant: the seam keeps two single-slot provider registries,
 * and its observable contract (neutral results without a provider) is
 * covered by the service unit tests; there is no independent event stream or
 * unscoped snapshot to audit inside the tree.
 */
const install: InvariantInstaller = () => {}

/**
 * Register this package's invariant companion.
 * @param ctx - Cordis context carrying the invariant service.
 * @returns the installed registration's disposer after setup succeeds.
 */
export const apply = (ctx: Context): Promise<() => void> =>
  Promise.resolve(ctx.invariants.register(PACKAGE_NAME, install))
