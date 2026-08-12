import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

// The space this check is allowed to resolve within, set by the runner.
const spaceRoot = process.env['VERIFY_SPACE_ROOT'];

export const resolve = async (specifier, context, nextResolve) => {
  const result = await nextResolve(specifier, context);

  if (spaceRoot === undefined || !result.url.startsWith('file:')) {
    return result;
  }

  const resolved = fileURLToPath(result.url);

  if (!resolved.startsWith(`${path.resolve(spaceRoot)}${path.sep}`)) {
    throw new Error(
      [
        `"${specifier}" resolved outside the check space.`,
        `  resolved to: ${resolved}`,
        `  imported by: ${context.parentURL ?? '(entry)'}`,
        '',
        'That means it was found in the monorepo rather than in what the',
        'package publishes — which is how a missing dependency passes this',
        'check unnoticed. Declare it, or stop importing it.',
      ].join('\n'),
    );
  }

  return result;
};
