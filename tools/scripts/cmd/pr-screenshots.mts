import {
  Arr,
  hasKey,
  isRecord,
  isString,
  Num,
  Result,
  unknownToString,
} from 'ts-data-forge';
import { isDirectlyExecuted } from 'ts-repo-utils';

/**
 * Prints the before / after table of one pull request's screenshots in
 * `noshiro-pf/mono-screenshots`, for its description (`docs/pr-screenshots.md`).
 *
 * Every image is shown in the description and links to the viewer that
 * repository serves on GitHub Pages, opened at that image, with a link to the
 * whole set above the table. Writing those by hand meant the same commit,
 * number and path twice per image, and a wrapper that was easy to forget.
 *
 * Usage: `pnpm run pr-screenshots -- <number> [<commit>]`. Without a commit it
 * takes the newest on `main` that touched `<number>/`, so after pushing a
 * retake, rerunning it gives the table to put back in the description. Set
 * `GH_TOKEN` to avoid the unauthenticated rate limit.
 */
export const formatScreenshotTable = ({
  pr,
  sha,
  paths,
}: Readonly<{
  pr: number;
  sha: string;
  paths: readonly string[];
}>): Result<string, string> => {
  const { rows, others } = pairScreenshots(paths);

  const listed = [...rows.flatMap(sidesOf), ...others] as const;

  const unsafe = listed.filter((path) => !SAFE_PATH.test(path));

  if (Arr.isNonEmpty(unsafe)) {
    return Result.err(
      Arr.toUnshifted(
        'These names need encoding in the viewer link; rename them with letters, digits, `-`, `_` and `.` only:',
      )(unsafe.map((path) => `  ${path}`)).join('\n'),
    );
  }

  // A Set, not `includes`: under the strict standard library `includes` is a
  // type predicate, and its false branch would narrow `path` to `never`.
  const listedSet = new Set(listed);

  const dropped = paths.filter(
    (path) => IMAGE.test(path) && !listedSet.has(path),
  );

  if (Arr.isNonEmpty(dropped)) {
    return Result.err(
      Arr.toUnshifted(
        'These share a side and a name with another image (only the extension differs); keep one:',
      )(dropped.map((path) => `  ${path}`)).join('\n'),
    );
  }

  if (!Arr.isNonEmpty(rows) && !Arr.isNonEmpty(others)) {
    return Result.err(`No images for #${pr} at ${sha}.`);
  }

  const viewer = `${VIEWER_URL}?pr=${pr}&sha=${sha}` as const;

  const image = (path: string, alt: string): string =>
    `<a href="${viewer}#${path}"><img src="${RAW_URL}/${sha}/${pr}/${path}" alt="${alt}" width="420"></a>` as const;

  const cell = (side: Side, row: Row): string => {
    const path = row[side];

    return path === undefined ? '' : image(path, `${side}: ${row.name}`);
  };

  return Result.ok(
    [
      `[Open them in the viewer](${viewer})`,
      ...(Arr.isNonEmpty(rows)
        ? [
            '',
            '|  | Before | After |',
            '| :-- | :-- | :-- |',
            ...rows.map(
              (row) =>
                `| \`${row.name}\` | ${cell('before', row)} | ${cell('after', row)} |`,
            ),
          ]
        : []),
      ...(Arr.isNonEmpty(others)
        ? Arr.toUnshifted('')(others.map((path) => image(path, path)))
        : []),
      '',
    ].join('\n'),
  );
};

/**
 * The images under a pull request's directory, `before-<name>` and
 * `after-<name>` paired by name (directory included) in natural order — the
 * order the viewer shows them in — and those with neither prefix set aside.
 */
export const pairScreenshots = (
  paths: readonly string[],
): Readonly<{ rows: readonly Row[]; others: readonly string[] }> => {
  const images = paths.filter((path) => IMAGE.test(path));

  const sides = Arr.generate(function* () {
    for (const path of images) {
      const slash = path.lastIndexOf('/');

      const match = SIDE.exec(path.slice(slash + 1).replace(IMAGE, ''));

      if (match?.[1] === 'before' || match?.[1] === 'after') {
        yield {
          name: `${path.slice(0, slash + 1)}${match[2] ?? ''}`,
          side: match[1],
          path,
        } as const;
      }
    }
  });

  const pathOf = (name: string, side: Side): string | undefined =>
    sides.find((s) => s.name === name && s.side === side)?.path;

  return {
    rows: Arr.uniq(sides.map(({ name }) => name))
      .toSorted((a, b) => a.localeCompare(b, 'en', { numeric: true }))
      .map((name) => ({
        name,
        before: pathOf(name, 'before'),
        after: pathOf(name, 'after'),
      })),
    others: images.filter((path) => sides.every((s) => s.path !== path)),
  };
};

type Side = 'before' | 'after';

type Row = Readonly<{
  name: string;
  before: string | undefined;
  after: string | undefined;
}>;

const REPOSITORY = 'noshiro-pf/mono-screenshots';

const VIEWER_URL = 'https://noshiro-pf.github.io/mono-screenshots/';

const RAW_URL = `https://raw.githubusercontent.com/${REPOSITORY}` as const;

// What the viewer lists: `IMAGE` in `index.html` of noshiro-pf/mono-screenshots.
// Keep the two in step.
const IMAGE = /\.(?:png|jpe?g|gif|webp|avif|svg)$/iu;

const SIDE = /^(before|after)-(.+)$/u;

// Written into an href and a src unencoded, and into a Markdown table cell.
const SAFE_PATH = /^[\w./-]+$/u;

const sidesOf = (row: Row): readonly string[] =>
  [row.before, row.after].filter(isString);

const fetchGitHub = async (route: string): Promise<unknown> => {
  const token = process.env['GH_TOKEN'] ?? process.env['GITHUB_TOKEN'];

  const response = await fetch(
    `https://api.github.com/repos/${REPOSITORY}${route}`,
    {
      headers: {
        Accept: 'application/vnd.github+json',
        ...(token === undefined ? {} : { Authorization: `Bearer ${token}` }),
      },
    },
  );

  if (response.status === 404) {
    throw new Error(`${REPOSITORY} has nothing at ${route}.`);
  }

  if (!response.ok) {
    throw new Error(
      `GitHub answered ${response.status} to ${route}: ${await response.text()}`,
    );
  }

  return response.json();
};

const latestCommit = async (pr: number): Promise<string> => {
  const commits = await fetchGitHub(`/commits?sha=main&path=${pr}&per_page=1`);

  const first: unknown = Arr.isArray(commits) ? commits[0] : undefined;

  if (isRecord(first) && hasKey(first, 'sha') && isString(first.sha)) {
    return first.sha;
  }

  throw new Error(`Nothing on main of ${REPOSITORY} is under ${pr}/.`);
};

const listFiles = async (
  pr: number,
  sha: string,
): Promise<readonly string[]> => {
  const tree = await fetchGitHub(`/git/trees/${sha}:${pr}?recursive=1`);

  if (!isRecord(tree) || !hasKey(tree, 'tree') || !Arr.isArray(tree.tree)) {
    throw new Error(`Unexpected tree for ${pr}/ at ${sha}.`);
  }

  if (hasKey(tree, 'truncated') && tree.truncated === true) {
    throw new Error(`The tree of ${pr}/ at ${sha} is too large to list.`);
  }

  const entries: readonly unknown[] = tree.tree;

  return Arr.generate(function* () {
    for (const entry of entries) {
      if (
        isRecord(entry) &&
        hasKey(entry, 'type') &&
        entry.type === 'blob' &&
        hasKey(entry, 'path') &&
        isString(entry.path)
      ) {
        yield entry.path;
      }
    }
  });
};

if (isDirectlyExecuted(import.meta.url)) {
  const [prArg, shaArg] = Arr.skip(process.argv, 2).filter(
    (arg) => arg !== '--',
  );

  if (
    prArg === undefined ||
    !/^\d+$/u.test(prArg) ||
    (shaArg !== undefined && !/^[0-9a-f]{40}$/u.test(shaArg))
  ) {
    console.error(
      'Usage: pnpm run pr-screenshots -- <pull request number> [<40-hex commit of mono-screenshots>]',
    );

    process.exit(1);
  }

  const pr = Result.unwrapOkOr(Num.safeParseFloat(prArg), Number.NaN);

  const result = await (async () => {
    const sha = shaArg ?? (await latestCommit(pr));

    return formatScreenshotTable({ pr, sha, paths: await listFiles(pr, sha) });
  })().catch((error: unknown) => Result.err(unknownToString(error)));

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }

  process.stdout.write(result.value);
}
