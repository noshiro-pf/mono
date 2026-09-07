import * as fs from 'node:fs';
import { createRequire } from 'node:module';
import * as path from 'node:path';

const libDir = `${path.dirname(
  createRequire(import.meta.url).resolve('typescript/package.json'),
)}/lib` as const;

/**
 * The names TypeScript's standard library declares in the type space
 * (`interface` / `type` / `class` / `enum` / `namespace`) for the given
 * `lib` entries, following `/// <reference lib="..." />` transitively — the
 * same closure `compilerOptions.lib` produces. Read once per process.
 */
export const globalTypeNames = (
  libs: readonly string[],
): ReadonlySet<string> => {
  const key = libs
    .map((lib) => lib.toLowerCase())
    .toSorted()
    .join(',');

  const cached = mut_cache.get(key);

  if (cached !== undefined) return cached;

  const mut_names = new Set<string>();

  const mut_visited = new Set<string>();

  const mut_pending = libs.map((lib) => lib.toLowerCase());

  for (
    let mut_lib = mut_pending.pop();
    mut_lib !== undefined;
    mut_lib = mut_pending.pop()
  ) {
    if (mut_visited.has(mut_lib)) continue;

    mut_visited.add(mut_lib);

    const file = path.join(libDir, `lib.${mut_lib}.d.ts`);

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    if (!fs.existsSync(file)) continue;

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const text = fs.readFileSync(file, 'utf8');

    for (const match of text.matchAll(referenceLibRegex)) {
      const referenced = match[1];

      if (referenced !== undefined) mut_pending.push(referenced.toLowerCase());
    }

    for (const match of text.matchAll(typeDeclarationRegex)) {
      const name = match[1];

      if (name !== undefined) mut_names.add(name);
    }
  }

  mut_cache.set(key, mut_names);

  return mut_names;
};

const mut_cache = new Map<string, ReadonlySet<string>>();

const referenceLibRegex = /^\/\/\/\s*<reference\s+lib="([^"]+)"\s*\/>/gmu;

// The lib files are machine-formatted with single spaces, so the pattern
// needs no variable-length whitespace (and stays linear-time).
const typeDeclarationRegex =
  /^(?:declare )?(?:interface|type|class|enum|namespace) ([A-Za-z_$][\w$]*)/gmu;
