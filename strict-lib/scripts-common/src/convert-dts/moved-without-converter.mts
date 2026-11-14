import { isStubFile } from './stub-file.mjs';

/**
 * The lib files of one TypeScript version that look like the new home of a file
 * a converter is registered for: the registered name is absent from this
 * version, and a file of the same feature under another edition has no
 * converter of its own.
 *
 * TypeScript renames a lib file when its proposal graduates
 * (`lib.esnext.float16.d.ts` became `lib.es2025.float16.d.ts` in 6.0), and the
 * converter, chosen by exact file name, then stops running on that version
 * without a word. A pair reported here is either such a move, to be routed to
 * the same converter, or a file that is fine as it is, to be registered with no
 * conversion so that the choice is written down.
 *
 * A registered name kept as a stub ({@link isStubFile}) counts as absent. A
 * brand-new lib file whose feature never had a converter is not reported.
 */
export const movedWithoutConverter = (
  registered: readonly string[],
  libFiles: readonly Readonly<{ filename: string; content: string }>[],
): readonly Readonly<{ registered: string; present: string }>[] => {
  const registeredSet = new Set(registered);

  const present = libFiles
    .filter(({ content }) => !isStubFile(content))
    .map(({ filename }) => filename);

  const presentSet = new Set(present);

  return registered
    .filter((name) => !presentSet.has(name))
    .flatMap((name) => {
      const movedFeature = featureOf(name);

      return movedFeature === undefined
        ? []
        : present
            .filter(
              (file) =>
                !registeredSet.has(file) && featureOf(file) === movedFeature,
            )
            .map((file) => ({ registered: name, present: file }));
    });
};

/**
 * `lib.es2025.float16.d.ts` -> `float16`. `undefined` for a name with no
 * edition (`lib.dom.d.ts`) or nothing after it (`lib.es5.d.ts`,
 * `lib.es2015.d.ts`, which are editions rather than features).
 */
const featureOf = (filename: string): string | undefined =>
  /^lib\.(?:es\d+|esnext)\.(?<feature>.+)\.d\.ts$/u.exec(filename)?.groups?.[
    'feature'
  ];
