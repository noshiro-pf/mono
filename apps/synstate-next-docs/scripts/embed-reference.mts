import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Arr, Result } from 'ts-data-forge';
import { isDirectlyExecuted } from 'ts-repo-utils';
// eslint-disable-next-line import-x/no-relative-packages -- tools/ is not a package; this is how apps reach its shared scripts
import * as markers from '../../../tools/scripts/lib/embed-markers.mjs';
import {
  groupTitles,
  referencePages,
  type ReferencePage,
} from './reference-pages.mjs';
import {
  describeEnglish,
  extractJsdoc,
  readDescription,
  textVersion,
} from './reference-text.mjs';
import { workspaceRootPath } from './workspace-root-path.mjs';

/**
 * Fills the reference pages from synstate-next's sources: the English page's
 * JSDoc block and, on a page of one export, its `description` (a page of
 * several describes them by hand), and on both pages the sentence that says
 * what `pipe` makes of an operator's result. Fails on a public export no page
 * lists, on a page that lists something not exported, on a missing page, JSDoc
 * or marker, on JSDoc it cannot carry into MDX, and on a Japanese page whose
 * `translated-from` marker names another version of the English text (the
 * JSDoc, and on a page of several exports the description too): the Japanese
 * text is translated by hand, so the marker is what says it is current.
 */
export const embedReference = async (): Promise<Result<undefined, string>> => {
  const mut_errors: string[] = [];

  const exported = await publicExports();

  const listed = new Set(
    referencePages.flatMap((p) => p.exports.map(([name]) => name)),
  );

  for (const name of exported) {
    if (!listed.has(name)) {
      mut_errors.push(
        `${name} is exported by synstate-next but has no reference page: add it to scripts/reference-pages.mts.`,
      );
    }
  }

  for (const name of listed) {
    if (!exported.has(name)) {
      mut_errors.push(
        `${name} is listed in scripts/reference-pages.mts but synstate-next does not export it.`,
      );
    }
  }

  for (const refPage of referencePages) {
    const result = await fillPage(refPage);

    if (Result.isErr(result)) {
      mut_errors.push(...result.value);
    }
  }

  if (Arr.isEmpty(mut_errors)) {
    for (const lang of ['en', 'ja'] as const) {
      const result = await fillIndex(lang);

      if (Result.isErr(result)) {
        mut_errors.push(result.value);
      }
    }
  }

  return Arr.isEmpty(mut_errors)
    ? Result.ok(undefined)
    : Result.err(mut_errors.join('\n'));
};

const srcDir = path.resolve(workspaceRootPath, '../../libs/synstate-next/src');

const docsDir = path.resolve(workspaceRootPath, 'src/content/docs');

type OperatorKind = 'Drop' | 'Keep' | 'Provide';

const operatorKindLink = {
  en: '/mono/synstate-next/guides/deriving-values/',
  ja: '/mono/synstate-next/ja/guides/deriving-values/',
} as const;

const operatorKindSentences = {
  en: {
    Keep: `Its result holds a value whenever the source does: on an \`InitializedObservable\`, \`pipe\` gives one ([\`KeepInitialValueOperator\`](${operatorKindLink.en}#pipe)).`,
    Drop: `Its result may hold no value even when the source holds one: \`pipe\` gives an \`Observable\` ([\`DropInitialValueOperator\`](${operatorKindLink.en}#pipe)).`,
    Provide: `Its result always holds a value: \`pipe\` gives an \`InitializedObservable\` ([\`ProvideInitialValueOperator\`](${operatorKindLink.en}#pipe)).`,
  },
  ja: {
    Keep: `ソースが値を持てば、結果も値を持ちます。\`pipe\` は \`InitializedObservable\` をそのまま保ちます（[\`KeepInitialValueOperator\`](${operatorKindLink.ja}#pipe)）。`,
    Drop: `ソースが値を持っていても、結果は値を持たないことがあります。\`pipe\` の結果は \`Observable\` です（[\`DropInitialValueOperator\`](${operatorKindLink.ja}#pipe)）。`,
    Provide: `結果は常に値を持ちます。\`pipe\` の結果は \`InitializedObservable\` です（[\`ProvideInitialValueOperator\`](${operatorKindLink.ja}#pipe)）。`,
  },
} as const;

/**
 * The kind of operator the declaration of `name` returns, if it does: read from
 * its header, which runs to the first blank line.
 */
const extractOperatorKind = (
  source: string,
  name: string,
): OperatorKind | undefined => {
  // eslint-disable-next-line security/detect-non-literal-regexp
  const declaration = new RegExp(
    String.raw`^export (?:const|function) ${name}\b`,
    'mu',
  );

  const start = declaration.exec(source)?.index;

  if (start === undefined) {
    return undefined;
  }

  const end = source.indexOf('\n\n', start);

  const header = source.slice(start, end === -1 ? undefined : end);

  // The return type: the operator type after the parameter list, not one that
  // types a parameter.
  const kind = /\)\s*:\s*(Keep|Drop|Provide)InitialValueOperator</u.exec(
    header,
  )?.[1];

  return kind === 'Keep' || kind === 'Drop' || kind === 'Provide'
    ? kind
    : undefined;
};

const translatedFromPattern = /\{\/\* translated-from:(\w+) \*\/\}/gu;

const fillPage = async (
  refPage: ReferencePage,
): Promise<Result<undefined, readonly string[]>> => {
  const mut_errors: string[] = [];

  const mut_sections: string[] = [];

  let mut_operatorKind: OperatorKind | undefined;

  const single = Arr.isFixedLengthArray(1, refPage.exports);

  for (const [name, file] of refPage.exports) {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const source = await fs.readFile(path.resolve(srcDir, file), 'utf8');

    const jsdoc = extractJsdoc(source, name);

    if (Result.isErr(jsdoc)) {
      mut_errors.push(`${name} in ${file} ${jsdoc.value}.`);

      continue;
    }

    mut_sections.push(
      single ? jsdoc.value : `### \`${name}\`\n\n${jsdoc.value}`,
    );

    mut_operatorKind ??= extractOperatorKind(source, name);
  }

  if (Arr.isNonEmpty(mut_errors)) {
    return Result.err(mut_errors);
  }

  const jsdocText = mut_sections.join('\n\n');

  const pagePath = (lang: 'en' | 'ja'): string =>
    path.resolve(
      docsDir,
      lang === 'en' ? '' : 'ja',
      'reference',
      refPage.group,
      `${refPage.slug}.mdx`,
    );

  const enRelative = path.relative(workspaceRootPath, pagePath('en'));

  /**
   * What the Japanese page translates: the JSDoc, and on a page of several
   * exports the English description too, which the English pass reads.
   */
  let mut_englishText: string | undefined = single ? jsdocText : undefined;

  for (const lang of ['en', 'ja'] as const) {
    const filePath = pagePath(lang);

    const relative = path.relative(workspaceRootPath, filePath);

    let mut_page: string;

    try {
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      mut_page = await fs.readFile(filePath, 'utf8');
    } catch {
      mut_errors.push(`${relative} is missing.`);

      continue;
    }

    if (lang === 'en') {
      const english = describeEnglish(mut_page, jsdocText, single);

      if (Result.isErr(english)) {
        mut_errors.push(`${relative} ${english.value}.`);

        continue;
      }

      mut_page = english.value.page;

      mut_englishText = english.value.text;
    } else {
      if (mut_englishText === undefined) {
        // The English page's error says what to fix first.
        continue;
      }

      const version = textVersion(mut_englishText);

      const marked = Array.from(
        mut_page.matchAll(translatedFromPattern),
        (match) => match[1],
      );

      const what = single ? 'the JSDoc' : 'the description and JSDoc';

      if (!Arr.isFixedLengthArray(1, marked) || marked[0] !== version) {
        mut_errors.push(
          Arr.isEmpty(marked)
            ? `${relative} has no {/* translated-from:<version> */}: once it translates ${what} on ${enRelative}, add {/* translated-from:${version} */}.`
            : marked.length > 1
              ? `${relative} has more than one {/* translated-from:<version> */}: once it translates ${what} on ${enRelative}, leave only {/* translated-from:${version} */}.`
              : `${relative} was translated from another version of ${what} on ${enRelative}: bring the translation up to date, then leave one {/* translated-from:${version} */}.`,
        );

        continue;
      }
    }

    const values = {
      ...(lang === 'en' ? { jsdoc: { text: jsdocText, block: true } } : {}),
      ...(mut_operatorKind === undefined
        ? {}
        : {
            'operator-kind': {
              text: operatorKindSentences[lang][mut_operatorKind],
              block: true,
            },
          }),
    } as const;

    const embedded = markers.embedInto(mut_page, 'reference', values);

    if (Result.isErr(embedded)) {
      mut_errors.push(`${relative}: ${embedded.value}.`);

      continue;
    }

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    await fs.writeFile(filePath, embedded.value);
  }

  return Arr.isEmpty(mut_errors)
    ? Result.ok(undefined)
    : Result.err(mut_errors);
};

/**
 * Lists every reference page on `reference/index.md`, by group, with the
 * `description` of the page (which, on an English page of one export, comes
 * from the JSDoc).
 */
const fillIndex = async (
  lang: 'en' | 'ja',
): Promise<Result<undefined, string>> => {
  const base = lang === 'en' ? '' : 'ja';

  const mut_lines: string[] = [];

  for (const [group, title] of Object.entries(groupTitles[lang])) {
    mut_lines.push(`## ${title}`, '');

    const inGroup = referencePages.filter((p) => p.group === group);

    for (const refPage of inGroup) {
      const pagePath = path.resolve(
        docsDir,
        base,
        'reference',
        group,
        `${refPage.slug}.mdx`,
      );

      // eslint-disable-next-line security/detect-non-literal-fs-filename
      const pageText = await fs.readFile(pagePath, 'utf8');

      const description = readDescription(pageText);

      if (description === undefined) {
        return Result.err(
          `${path.relative(workspaceRootPath, pagePath)} has no one-line \`description:\` for the index.`,
        );
      }

      const names = refPage.exports.map(([name]) => `\`${name}\``).join(', ');

      const href =
        `/mono/synstate-next/${lang === 'en' ? '' : 'ja/'}reference/${group}/${refPage.slug}/` as const;

      mut_lines.push(`- [${names}](${href}): ${description}`);
    }

    mut_lines.push('');
  }

  const indexPath = path.resolve(docsDir, base, 'reference', 'index.md');

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const index = await fs.readFile(indexPath, 'utf8');

  const filled = markers.embedInto(index, 'reference', {
    'api-list': { text: mut_lines.join('\n').trim(), block: true },
  });

  if (Result.isErr(filled)) {
    return Result.err(
      `${path.relative(workspaceRootPath, indexPath)}: ${filled.value}.`,
    );
  }

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  await fs.writeFile(indexPath, filled.value);

  return Result.ok(undefined);
};

/**
 * The names `src/index.mts` exports as values: those it lists from
 * `./core/index.mjs` and those declared in the directories it re-exports.
 */
const publicExports = async (): Promise<ReadonlySet<string>> => {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const index = await fs.readFile(path.resolve(srcDir, 'index.mts'), 'utf8');

  const coreList = /export \{([^}]*)\} from '\.\/core\/index\.mjs';/u.exec(
    index,
  )?.[1];

  const coreNames = (coreList ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s !== '' && !s.startsWith('type '));

  const mut_names = new Set(coreNames);

  for (const match of index.matchAll(
    /export \* from '\.\/(\w+)\/index\.mjs';/gu,
  )) {
    const dir = path.resolve(srcDir, match[1] ?? '');

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const dirIndex = await fs.readFile(path.resolve(dir, 'index.mts'), 'utf8');

    const files = Array.from(
      dirIndex.matchAll(/export \* from '\.\/([\w-]+)\.mjs';/gu),
      (m) => `${m[1] ?? ''}.mts`,
    );

    for (const file of files) {
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      const source = await fs.readFile(path.resolve(dir, file), 'utf8');

      for (const declared of source.matchAll(
        /^export (?:const|function|class) (\w+)/gmu,
      )) {
        mut_names.add(declared[1] ?? '');
      }
    }
  }

  return mut_names;
};

if (isDirectlyExecuted(import.meta.url)) {
  const result = await embedReference();

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }
}
