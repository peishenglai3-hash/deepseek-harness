/**
 * Package-owned invariant companion for `@deepseek-ai/dsh-client-ide-layout`.
 * @module @deepseek-ai/dsh-client-ide-layout/invariant
 */

import type { Context } from '@deepseek-ai/cordis'
import type { InvariantInstaller } from '@deepseek-ai/dsh-invariants'

const PACKAGE_NAME = '@deepseek-ai/dsh-client-ide-layout'

/** Cordis companion plugin name. */
export const name = 'ide-layout-invariant'
/** Service required before the companion can reserve package ownership. */
export const inject = ['invariants']

/**
 * No runtime invariant: the workbench registers the root frame and its
 * child seats plus a transient panel store; the observable contract (root
 * entry exists with the ide children, layout face wired to the store) is
 * covered by the client apply tests, and the browser half owns no
 * independent lifecycle stream to audit.
 */
const install: InvariantInstaller = () => {}

/**
 * Register this package's invariant companion.
 * @param ctx - Cordis context carrying the invariant service.
 * @returns the installed registration's disposer after setup succeeds.
 */
export const apply = (ctx: Context): Promise<() => void> =>
  Promise.resolve(ctx.invariants.register(PACKAGE_NAME, install))
