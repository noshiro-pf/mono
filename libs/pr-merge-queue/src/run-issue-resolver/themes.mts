/**
 * Which part of the repository an issue is about, so that `/resolve-issues` can
 * take related issues together: one session then sees each piece while it
 * writes the next, and puts them in one serial stack whose layers do not
 * conflict with each other. Across sessions, a theme another session is on is
 * left to it, which is what keeps two runs from conflicting.
 *
 * A replay of the pull requests merged from #3023 to #3575 found 34 of 42
 * conflicts between different sessions, and 30 of the 32 hand-written ones
 * between pull requests changing the same package; the two titles named the
 * same scope in only 13 of 24 pairs. So a theme is read from the title's scope
 * and from the packages the body names by path, together.
 */

import { Arr } from 'ts-data-forge';

/**
 * The themes an issue titled `title` with `body` is about, sorted: the scope
 * its title starts with (`<scope>:`, `type(<scope>):`, `[<scope>]`), and the
 * packages its body names by path (`libs/<x>`, `apps/<x>`,
 * `languages/<language>/`, `strict-lib/`, `repo-settings/`).
 *
 * The tooling scopes (`tools`, `tools/…`, `check:…`) are one theme, `tooling`,
 * and a `ci` type or scope is `ci`. Neither is read from a path:
 * nearly every issue cites a guard or a workflow somewhere, and reading those
 * would put most of them in one theme.
 */
export const issueThemes = (title: string, body: string): readonly string[] => {
  const fromBody = [
    ...Array.from(
      body.matchAll(PACKAGE_PATH),
      (match) => match.groups?.['name'],
    )
      .filter((name) => name !== undefined)
      .filter((name) => !FILE_NAME.test(name)),
    ...Array.from(
      body.matchAll(LANGUAGE_PATH),
      (match) => match.groups?.['name'],
    ).filter((name) => name !== undefined),
    ...ROOT_THEMES.filter(({ path }) => path.test(body)).map(
      ({ theme }) => theme,
    ),
  ] as const;

  return Arr.uniq([...titleThemes(title), ...fromBody.map(normalize)])
    .filter((theme) => theme !== '')
    .toSorted((a, b) => a.localeCompare(b));
};

/**
 * The themes an issue mainly is about: its title's scope, with the package each
 * scope lives in when the body's paths show one (`unblock-prs:` and
 * `libs/pr-merge-queue/src/unblock-prs/…` give `unblock-prs` and
 * `pr-merge-queue`), or, when its title has no scope, every theme
 * {@link issueThemes} reads. What a started issue holds back is these: a body
 * names in passing the packages it reads or compares with, and holding all of
 * them would leave half the issues to nobody.
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

  return Arr.uniq([...fromTitle, ...homes])
    .filter((theme) => theme !== '')
    .toSorted((a, b) => a.localeCompare(b));
};

/**
 * Whether an issue about `themes` is in the theme `name` names: that theme, or
 * one of its family (`synstate` takes `synstate-dom` and
 * `synstate-router-react`, not `eslint-plugin-synstate`).
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

/**
 * The order to take `issues` in, given in today's order (by tier, the lowest
 * number first within each).
 *
 * With no `theme`, every `S` comes first, whatever its themes. Then the first
 * remaining issue is a seed, and the rest of its theme follows it, whatever
 * their tier: the issues touching one of the seed's {@link ThemedIssue.primary}
 * themes (not a chain of them), a `D` only when the seed is `D`. Then the next
 * seed. Since the seeds follow the tiers, the highest-tier issue left always
 * starts the next theme. An issue below `S` whose primary themes include one in
 * `held` — one another session is on — is not taken but returned in `heldBack`,
 * with the themes that hold it.
 *
 * With a `theme` named, only the issues in it are taken, in today's order, so
 * its own `S` come first and another theme's `S` are not taken: the person
 * splits the work between sessions by theme, and "every `S` first" would undo
 * that. `held` holds nothing back then, since the person chose the theme; the
 * caller says whether another session is on it.
 */
export const orderByTheme = <I extends ThemedIssue>(
  issues: readonly I[],
  {
    held,
    theme,
  }: Readonly<{
    held: ReadonlyMap<string, readonly number[]>;
    theme: string | undefined;
  }>,
): ThemeOrder<I> => {
  if (theme !== undefined) {
    return {
      taken: issues.filter((issue) => themeMatches(issue.themes, theme)),
      heldBack: [],
    };
  }

  const heldBy = (issue: I): readonly string[] =>
    issue.primary.filter((each) => held.has(each));

  const rest = issues.filter((issue) => issue.tier !== 'S');

  return {
    taken: [
      ...issues.filter((issue) => issue.tier === 'S'),
      ...byTheme(rest.filter((issue) => !Arr.isNonEmpty(heldBy(issue)))),
    ],
    heldBack: rest
      .filter((issue) => Arr.isNonEmpty(heldBy(issue)))
      .map((issue) => ({ number: issue.number, themes: heldBy(issue) })),
  };
};

/**
 * The issues `run-issue-resolver` may start (#3598), in today's order: every
 * `S`, whatever its themes, then an issue only when none of its primary themes
 * is one a started issue is on (`held`). The rest are returned in `heldBack`,
 * with the themes that hold them. Within one pick, {@link apartFrom} keeps two
 * sessions started together off one theme.
 */
export const withoutHeldThemes = <I extends ThemedIssue>(
  issues: readonly I[],
  held: ReadonlyMap<string, readonly number[]>,
): ThemeOrder<I> => {
  const blocking = (issue: I): readonly string[] =>
    issue.tier === 'S'
      ? ([] as const)
      : issue.primary.filter((theme) => held.has(theme));

  return {
    taken: issues.filter((issue) => !Arr.isNonEmpty(blocking(issue))),
    heldBack: issues
      .filter((issue) => Arr.isNonEmpty(blocking(issue)))
      .map((issue) => ({ number: issue.number, themes: blocking(issue) })),
  };
};

/**
 * Whether `next` may be started beside the issues `taken` in the same pick: an
 * `S` always, any other only when none of its primary themes is one of theirs.
 */
export const apartFrom = (
  taken: readonly ThemedIssue[],
  next: ThemedIssue,
): boolean =>
  next.tier === 'S' ||
  next.primary.every((theme) =>
    taken.every((issue) => !issue.primary.includes(theme)),
  );

/** What {@link orderByTheme} reads of an issue. */
export type ThemedIssue = Readonly<{
  number: number;
  /** `S` and `D` are read apart; every other tier, or none, is `other`. */
  tier: 'D' | 'other' | 'S';
  /** Every theme {@link issueThemes} reads. */
  themes: readonly string[];
  /**
   * The themes it mainly is about ({@link primaryThemes}): what holds it back,
   * and what it gathers as a seed. A package its body names in passing does
   * neither.
   */
  primary: readonly string[];
}>;

export type ThemeOrder<I extends ThemedIssue> = Readonly<{
  /** The issues to take, in order. */
  taken: readonly I[];
  /** Not taken: each touches a theme another session is on. */
  heldBack: readonly Readonly<{
    number: number;
    themes: readonly string[];
  }>[];
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

const normalize = (raw: string): string => {
  const scope = raw
    .trim()
    .toLowerCase()
    .replace(/^(?:apps|libs)\//u, '')
    .replace(/\/+$/u, '');

  return scope === 'tools' ||
    scope === TOOLING_THEME ||
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

  if (type !== undefined) {
    return type === CI_THEME || CONVENTIONAL_TYPES.has(type)
      ? [
          ...(type === CI_THEME ? [CI_THEME] : []),
          ...scopes(scoped?.['scope'] ?? ''),
        ]
      : [];
  }

  return SCOPE_NAME.test(head) ? scopes(head) : [];
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
