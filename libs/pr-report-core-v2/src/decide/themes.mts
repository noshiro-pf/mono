/**
 * Which part of the repository an issue is about (`spec/decisions.md`, "Issue
 * themes"), so that one session takes related issues together and two keep
 * apart. Read from the title's scope and the packages the body names by path,
 * together: conflicting pull requests mostly change one package, and their
 * titles name one scope only about half the time.
 */

import { Arr } from 'ts-data-forge';

/**
 * Every theme of an issue titled `title` with `body`, sorted: its title's
 * scopes, `ci` for a `ci` type, and the packages, languages, `strict-lib` and
 * `repo-settings` its body names by path. `tooling` and `ci` are never read
 * from a path: nearly every issue cites a guard or a workflow.
 */
export const issueThemes = (title: string, body: string): readonly string[] =>
  sortedThemes([
    ...titleThemes(title),
    ...Array.from(
      body.matchAll(PACKAGE_PATH),
      (match) => match.groups?.['name'],
    )
      .filter((name) => name !== undefined)
      .filter((name) => !FILE_NAME.test(name))
      .map(normalize),
    ...Array.from(
      body.matchAll(LANGUAGE_PATH),
      (match) => match.groups?.['name'],
    )
      .filter((name) => name !== undefined)
      .map(normalize),
    ...ROOT_THEMES.filter(({ path }) => path.test(body)).map(
      ({ theme }) => theme,
    ),
  ]);

/**
 * The themes an issue is mainly about: its title's scopes with the package each
 * lives in, where a body path shows one (`unblock-prs:` with
 * `libs/pr-merge-queue/src/unblock-prs/…` adds `pr-merge-queue`); with no scope
 * in the title, all of {@link issueThemes}. What a started issue holds back.
 */
export const primaryThemes = (
  title: string,
  body: string,
): readonly string[] => {
  const fromTitle = titleThemes(title);

  if (!Arr.isNonEmpty(fromTitle)) {
    return issueThemes(title, body);
  }

  const homes = Array.from(
    body.matchAll(PACKAGE_FILE_PATH),
    (match) => match.groups,
  )
    .filter((groups) => groups !== undefined)
    .filter(({ rest = '' }) =>
      rest
        .split('/')
        .map((segment) => segment.replace(/\.[^.]*$/u, '').toLowerCase())
        .some((segment) => fromTitle.includes(segment)),
    )
    .map(({ name = '' }) => normalize(name));

  return sortedThemes([...fromTitle, ...homes]);
};

/**
 * Whether an issue about `themes` is in the theme `name` names: that theme or
 * its family (`synstate` takes `synstate-dom`, not `eslint-plugin-synstate`).
 */
export const themeMatches = (
  themes: readonly string[],
  name: string,
): boolean => {
  const wanted = normalize(name);

  return themes.some(
    (theme) => theme === wanted || theme.startsWith(`${wanted}-`),
  );
};

/** Each theme of `issues`, with the issues about it, lowest number first. */
export const issuesByTheme = (
  issues: readonly Readonly<{ number: number; themes: readonly string[] }>[],
): ReadonlyMap<string, readonly number[]> => {
  const mut_byTheme = new Map<string, readonly number[]>();

  for (const { number, themes } of issues) {
    for (const theme of themes) {
      mut_byTheme.set(
        theme,
        Arr.toSorted(Arr.toPushed(mut_byTheme.get(theme) ?? [], number)),
      );
    }
  }

  return mut_byTheme;
};

/**
 * The order to take `issues` in, given in tier order. With no `theme`: every
 * `S` first; of the rest, one whose primary theme is `held` is held back, and
 * the others go theme by theme, each seed followed by the issues touching one
 * of its primary themes (a `D` only after a `D` seed). With a `theme`: that
 * theme's issues alone, in the order given, and nothing held back, since the
 * person chose it.
 */
export const orderByTheme = <I extends ThemedIssue>(
  issues: readonly I[],
  options: Readonly<{
    held: ReadonlyMap<string, readonly number[]>;
    theme: string | undefined;
  }>,
): ThemeOrder<I> => {
  const { held, theme } = options;

  if (theme !== undefined) {
    return {
      taken: issues.filter((issue) => themeMatches(issue.themes, theme)),
      heldBack: [],
    };
  }

  const { taken, heldBack } = withoutHeldThemes(issues, held);

  return {
    taken: [
      ...taken.filter((issue) => issue.tier === 'S'),
      ...byTheme(taken.filter((issue) => issue.tier !== 'S')),
    ],
    heldBack,
  };
};

/**
 * `issues`, in the order given, less the ones held back: an issue below `S`
 * with a primary theme in `held`, returned with the themes that hold it.
 */
export const withoutHeldThemes = <I extends ThemedIssue>(
  issues: readonly I[],
  held: ReadonlyMap<string, readonly number[]>,
): ThemeOrder<I> => {
  const holding = (issue: I): readonly string[] =>
    issue.tier === 'S'
      ? ([] as const)
      : issue.primary.filter((each) => held.has(each));

  return {
    taken: issues.filter((issue) => !Arr.isNonEmpty(holding(issue))),
    heldBack: issues
      .map((issue) => ({ number: issue.number, themes: holding(issue) }))
      .filter(({ themes }) => Arr.isNonEmpty(themes)),
  };
};

/**
 * Whether `next` may be started beside `taken` in the same pick: an `S` always,
 * any other only when no primary theme of it is one of theirs.
 */
export const apartFrom = (
  taken: readonly ThemedIssue[],
  next: ThemedIssue,
): boolean =>
  next.tier === 'S' ||
  next.primary.every((theme) =>
    taken.every((issue) => !issue.primary.includes(theme)),
  );

/** What the order reads of an issue. */
export type ThemedIssue = Readonly<{
  number: number;
  /** `S` and `D` are read apart; every other tier, or none, is `other`. */
  tier: 'D' | 'other' | 'S';
  /** {@link issueThemes}. */
  themes: readonly string[];
  /** {@link primaryThemes}: what holds it back, and what it gathers as a seed. */
  primary: readonly string[];
}>;

export type ThemeOrder<I extends ThemedIssue> = Readonly<{
  /** The issues to take, in order. */
  taken: readonly I[];
  /** Not taken: each has a primary theme another session is on. */
  heldBack: readonly Readonly<{ number: number; themes: readonly string[] }>[];
}>;

const CI_THEME = 'ci';

const TOOLING_THEME = 'tooling';

/** The Conventional Commits types that name no theme of their own. */
const CONVENTIONAL_TYPES: ReadonlySet<string> = new Set<string>([
  'build',
  'chore',
  'docs',
  'feat',
  'fix',
  'perf',
  'refactor',
  'revert',
  'style',
  'test',
]);

const BRACKET_SCOPE = /^\[(?<scope>[^\]]+)\]/u;

/** `fix(scope)` or `fix(scope)!`, before the `: `. */
const SCOPED_TYPE = /^(?<type>[a-z]+)\((?<scope>[^)]+)\)!?$/u;

/** `fix` or `fix!`, before the `: `. */
const BARE_TYPE = /^(?<type>[a-z]+)!?$/u;

/** `unblock-prs`, `tools/scripts` or `check:published-deps`, before the `: `. */
const SCOPE_NAME = /^[\w@./:-]+$/u;

/** Not preceded by a name character, so `foo-libs/bar` is not read. */
const PACKAGE_PATH = /(?<![\w.-])(?:apps|libs)\/(?<name>[a-z0-9][\w.-]*)/giu;

/** A path inside a package: the package, then the rest of the path. */
const PACKAGE_FILE_PATH =
  /(?<![\w.-])(?:apps|libs)\/(?<name>[a-z0-9][\w.-]*)\/(?<rest>[\w./-]*)/giu;

const LANGUAGE_PATH = /(?<![\w.-])languages\/(?<name>[a-z0-9][\w-]*)\//giu;

/** `libs/first-release.md` is a file under `libs/`, not a package. */
const FILE_NAME = /\.(?:json|jsonc|md|mjs|mts|ts|ya?ml)$/iu;

const ROOT_THEMES = [
  { path: /(?<![\w.-])strict-lib\//u, theme: 'strict-lib' },
  { path: /(?<![\w.-])repo-settings\//u, theme: 'repo-settings' },
] as const;

const sortedThemes = (themes: readonly string[]): readonly string[] =>
  Arr.uniq(themes)
    .filter((theme) => theme !== '')
    .toSorted((a, b) => a.localeCompare(b));

/** Lower case, no `libs/` or `apps/`, and the tooling scopes as `tooling`. */
const normalize = (raw: string): string => {
  const scope = raw
    .trim()
    .toLowerCase()
    .replace(/^(?:apps|libs)\//u, '')
    .replace(/\/+$/u, '');

  return scope === 'tools' ||
    scope.startsWith('tools/') ||
    scope.startsWith('check:')
    ? TOOLING_THEME
    : scope;
};

const scopes = (list: string): readonly string[] =>
  list
    .split(',')
    .map(normalize)
    .filter((scope) => scope !== '');

// The title grammar is v1's as it stands, quirks included: the type patterns
// are lower case, so `Fix:` and `Bug:` are scopes and `Feat(Synstate):` names
// nothing; a lower-case one-word head that is no type (`bug:`, `tools:`,
// `check:`) names no theme, and any other head of `SCOPE_NAME` characters is a
// scope; only `tools`, `tools/…` and `check:…` scopes are `tooling`, not
// `check`. Each refinement tried moved some issue's themes for another;
// changing it is a decision of its own, and the test "keeps v1's quirks" pins
// it.
const titleThemes = (title: string): readonly string[] => {
  const trimmed = title.trim();

  const bracket = BRACKET_SCOPE.exec(trimmed)?.groups?.['scope'];

  if (bracket !== undefined) {
    return scopes(bracket);
  }

  const colon = trimmed.indexOf(': ');

  if (colon === -1) {
    return [];
  }

  // What comes before the first `: `, read by plain patterns rather than one
  // with nested quantifiers.
  const head = trimmed.slice(0, colon);

  const scoped = SCOPED_TYPE.exec(head)?.groups;

  const type = scoped?.['type'] ?? BARE_TYPE.exec(head)?.groups?.['type'];

  if (type === undefined) {
    return SCOPE_NAME.test(head) ? scopes(head) : [];
  }

  return type === CI_THEME || CONVENTIONAL_TYPES.has(type)
    ? [
        ...(type === CI_THEME ? [CI_THEME] : []),
        ...scopes(scoped?.['scope'] ?? ''),
      ]
    : [];
};

/** `left` theme by theme: the first a seed, then the rest of its theme. */
const byTheme = <I extends ThemedIssue>(left: readonly I[]): readonly I[] => {
  if (!Arr.isNonEmpty(left)) {
    return [];
  }

  const seed = left[0];

  const group = left.filter(
    (issue) =>
      issue === seed ||
      ((issue.tier !== 'D' || seed.tier === 'D') &&
        issue.themes.some((each) => seed.primary.includes(each))),
  );

  return [...group, ...byTheme(left.filter((issue) => !group.includes(issue)))];
};
