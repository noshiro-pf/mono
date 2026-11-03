import { isDirectlyExecuted } from 'ts-repo-utils';
import { genTypeDefinitions } from '../functions/index.mjs';

/**
 * Rewrites the README's list of type links (`…/<file>.mts#L<line>`).
 *
 * A `gen:` script, after `gen:jsdoc`: the line numbers move whenever a JSDoc
 * comment does, and `check-changed` runs a touched package's `gen`, not its
 * `doc`, so a generator of a committed file in `doc` goes stale unnoticed.
 */
if (isDirectlyExecuted(import.meta.url)) {
  await genTypeDefinitions();
}
