import { Arr, Num, Result } from 'ts-data-forge';

/**
 * The `run:` scripts of a composite action's `runs.steps`, each with its
 * `shell:` and where in `action.yml` it starts; the names of its `inputs`
 * and the `id`s of its steps, which a script's expressions may reference;
 * and what could not be read.
 *
 * A line scanner rather than a YAML parser, as the workflow guards here read
 * workflows: the shape is one sequence of steps whose `shell:` and `run:` sit
 * at the step's own indentation, and a parser would be a dependency for one
 * level of nesting. **What it does not read is reported, never skipped**: a
 * step with no `shell:` (GitHub refuses it anyway), a folded `>` scalar, a
 * double-quoted one with an escape, a one-line scalar continued on the next
 * line, `runs:` or `steps:` written in flow style (`{ … }`, `[ … ]`), and —
 * the net under all of them — any `run:` key under `runs:`, quoted, as an
 * explicit `? run` or in a flow-mapping step, that is not one of the steps it
 * read. Only a script it read, and a key deeper than any step's own
 * (`env: { run: … }`), is left out of that count.
 */
export const extractRunScripts = (
  text: string,
): Readonly<{
  scripts: readonly RunScript[];
  inputs: readonly string[];
  stepIds: readonly string[];
  problems: readonly string[];
}> => {
  // CRLF line endings read as LF, as YAML reads them.
  const lines = text.replaceAll('\r\n', '\n').split('\n');

  const steps = readSteps(lines);

  const consumed = new Set(steps.flatMap(({ body }) => body));

  const deepest = steps.reduce(
    (deepestSoFar, { keyIndent }) => Math.max(deepestSoFar, keyIndent),
    Arr.isEmpty(steps) ? Number.POSITIVE_INFINITY : 0,
  );

  const { runsLine, runsEnd } = findRuns(lines);

  // Only what is under `runs:` can be a step, and a comment or a script it
  // read is not a key.
  const runKeys = lines.filter(
    (line, index) =>
      runsLine < index &&
      index < runsEnd &&
      !consumed.has(index) &&
      isContent(line) &&
      indentOf(line) <= deepest &&
      isRunKey(line),
  ).length;

  const read = steps.filter(({ hasRun }) => hasRun).length;

  const scripts = Arr.generate(function* () {
    for (const { script } of steps) {
      if (script !== undefined) {
        yield script;
      }
    }
  });

  const problems = [
    ...findFlowStyle(lines, runsLine, runsEnd, consumed),
    ...Arr.generate(function* () {
      for (const { problem } of steps) {
        if (problem !== undefined) {
          yield problem;
        }
      }
    }),
  ] as const;

  return {
    scripts,
    inputs: readInputNames(lines),
    stepIds: Arr.generate(function* () {
      for (const { id } of steps) {
        if (id !== undefined) {
          yield id;
        }
      }
    }),
    problems:
      runKeys === read
        ? problems
        : Arr.toPushed(
            problems,
            `${Math.max(runsLine, 0) + 1}: ${runKeys - read} \`run:\` key(s) outside the \`runs.steps\` this reads; write them as \`- shell: …\` / \`run: |\` steps under \`runs:\``,
          ),
  };
};

export type RunScript = Readonly<{
  /** The 1-based line of `action.yml` the script's first line is on. */
  line: number;
  /** How many columns of that line, and the lines after it, come first. */
  column: number;
  /** The program as written, without its arguments: `bash` for `bash -e {0}`. */
  shell: string;
  script: string;
}>;

type Step = Readonly<{
  /** Where this step's keys start. */
  keyIndent: number;
  id: string | undefined;
  hasRun: boolean;
  /** The line indices a block scalar's script took. */
  body: readonly number[];
  script: RunScript | undefined;
  problem: string | undefined;
}>;

/**
 * A one-line scalar's value: single-quoted with `''` for a quote,
 * double-quoted without escapes, or plain up to a comment. `undefined` for a
 * double-quoted one with an escape, which reading by hand would get wrong.
 */
const readInlineScalar = (value: string): string | undefined => {
  if (value.startsWith("'")) {
    return /^'(?<text>(?:[^']|'')*)'/u
      .exec(value)
      ?.groups?.['text']?.replaceAll("''", "'");
  }

  return value.startsWith('"')
    ? /^"(?<text>[^"\\]*)"/u.exec(value)?.groups?.['text']
    : value.replace(/\s+#.*$/u, '');
};

/**
 * A `shell:` value as GitHub reads it — `bash`, `'bash'`, `bash -e {0}`,
 * `node {0}` — without quotes or a comment, or `undefined` for none. It is
 * handed on whole, since what it means is actionlint's to decide.
 */
const readShell = (value: string | undefined): string | undefined => {
  const shell = readInlineScalar(value ?? '')?.trim();

  return shell === undefined || shell === '' ? undefined : shell;
};

/**
 * The keys of the top-level `inputs:` mapping: the action's input names,
 * which a script may reference as `inputs.<name>`.
 */
const readInputNames = (lines: readonly string[]): readonly string[] => {
  const inputsLine = lines.findIndex(
    (line) => withoutComment(line) === 'inputs:',
  );

  if (inputsLine === -1) {
    return [];
  }

  const end =
    findIndexFrom(
      lines,
      inputsLine + 1,
      (line) => /^\S/u.test(line) && !line.startsWith('#'),
    ) ?? lines.length;

  const section = lines.slice(inputsLine + 1, end).filter(isContent);

  const keyIndent = indentOf(section[0] ?? '');

  return Arr.generate(function* () {
    for (const line of section) {
      const name =
        indentOf(line) === keyIndent
          ? /^ *["']?(?<name>[\w-]+)["']?\s*:/u.exec(line)?.groups?.['name']
          : undefined;

      if (name !== undefined) {
        yield name;
      }
    }
  });
};

const readStep = (
  lines: readonly string[],
  start: number,
  end: number,
): Step => {
  // Each item's keys start where its first one does: `-   shell: bash` puts
  // them two columns further in than `- shell: bash`.
  const keyIndent =
    /^(?<prefix> *- +)/u.exec(lines[start] ?? '')?.groups?.['prefix']?.length ??
    0;

  const keys = Arr.generate(function* () {
    for (const [offset, line] of lines.slice(start, end).entries()) {
      const index = start + offset;

      // The first key shares its line with the dash.
      const text =
        index === start ? ' '.repeat(keyIndent) + line.slice(keyIndent) : line;

      const match = /^(?<indent> *)(?<key>[\w-]+):(?<value>.*)$/u.exec(text);

      if (match?.groups?.['indent']?.length === keyIndent) {
        yield {
          key: match.groups['key'] ?? '',
          value: (match.groups['value'] ?? '').trim(),
          index,
        };
      }
    }
  });

  const idValue = keys.find(({ key }) => key === 'id')?.value;

  const id =
    idValue === undefined ? undefined : readInlineScalar(idValue)?.trim();

  const run = keys.find(({ key }) => key === 'run');

  if (run === undefined) {
    return {
      keyIndent,
      id,
      hasRun: false,
      body: [],
      script: undefined,
      problem: undefined,
    };
  }

  const shell = readShell(keys.find(({ key }) => key === 'shell')?.value);

  const problemAt = (index: number, problem: string): Step =>
    ({
      keyIndent,
      id,
      hasRun: true,
      body: [],
      script: undefined,
      problem: `${index + 1}: ${problem}`,
    }) as const;

  if (shell === undefined) {
    return problemAt(
      start,
      'a `run:` step with no `shell:`, which a composite action requires',
    );
  }

  if (/^[&*]/u.test(run.value)) {
    return problemAt(
      run.index,
      'an anchor or alias on `run:`, which this does not read; write the script out',
    );
  }

  // The lines after the key, up to the step's next key.
  const after = lines.slice(run.index + 1, end);

  const nextKey = after.findIndex(
    (line) => isContent(line) && indentOf(line) <= keyIndent,
  );

  const rest = nextKey === -1 ? after : after.slice(0, nextKey);

  // `|`, `|-`, `|+2`, `|2-` …, a comment after it allowed.
  const headerGroups = /^(?<style>[|>])(?<flags>[+\-0-9]{0,2})$/u.exec(
    withoutComment(run.value),
  )?.groups;

  const header = headerGroups?.['style'];

  if (header === '>') {
    return problemAt(
      run.index,
      'a folded (`>`) `run:` scalar, which this does not read; use `|`',
    );
  }

  if (header === '|') {
    // An indentation indicator fixes the content's indentation relative to
    // the key's; without one it is the first non-blank line's.
    const indicator = /\d/u.exec(headerGroups?.['flags'] ?? '')?.[0];

    const indent =
      indicator === undefined
        ? indentOf(rest.find((line) => line.trim() !== '') ?? '')
        : keyIndent +
          Result.unwrapOkOr(Num.safeParseFloat(indicator), Number.NaN);

    // The scalar ends at the first non-blank line indented less than its
    // content — a trail comment included, which is YAML's and not the
    // script's — and its trailing blank lines are not part of it.
    const stop = rest.findIndex(
      (line) => line.trim() !== '' && indentOf(line) < indent,
    );

    const block = stop === -1 ? rest : rest.slice(0, stop);

    const body = block.slice(
      0,
      block.findLastIndex((line) => line.trim() !== '') + 1,
    );

    return {
      keyIndent,
      id,
      hasRun: true,
      body: body.map((_, offset) => run.index + 1 + offset),
      script: {
        line: run.index + 2,
        column: indent,
        shell,
        script: `${body.map((line) => line.slice(indent)).join('\n')}\n`,
      },
      problem: undefined,
    };
  }

  // A comment under a one-line value is YAML's; anything else continues it.
  if (rest.some(isContent)) {
    return problemAt(
      run.index,
      'a one-line `run:` continued on the next line, which this does not read; use `|`',
    );
  }

  const inline = readInlineScalar(run.value);

  if (inline === undefined) {
    return problemAt(
      run.index,
      'a double-quoted `run:` with an escape, which this does not read; use `|`',
    );
  }

  // The value starts after `run:` and the blanks that follow it.
  const afterKey = (lines[run.index] ?? '').slice(keyIndent + 'run:'.length);

  return {
    keyIndent,
    id,
    hasRun: true,
    body: [],
    script: {
      line: run.index + 1,
      column:
        keyIndent +
        'run:'.length +
        (afterKey.length - afterKey.trimStart().length) +
        (/^['"]/u.test(run.value) ? 1 : 0),
      shell,
      script: `${inline}\n`,
    },
    problem: undefined,
  };
};

/**
 * The `runs:` line, or `-1` when there is none in block style, and the index
 * of the first top-level line after its section (or `lines.length`).
 */
const findRuns = (
  lines: readonly string[],
): Readonly<{ runsLine: number; runsEnd: number }> => {
  const runsLine = lines.findIndex((line) => withoutComment(line) === 'runs:');

  const runsEnd =
    runsLine === -1
      ? lines.length
      : (findIndexFrom(
          lines,
          runsLine + 1,
          (line) => /^\S/u.test(line) && !line.startsWith('#'),
        ) ?? lines.length);

  return { runsLine, runsEnd };
};

const readSteps = (lines: readonly string[]): readonly Step[] => {
  const { runsLine, runsEnd } = findRuns(lines);

  if (runsLine === -1) {
    return [];
  }

  const stepsLine = findIndexFrom(lines, runsLine + 1, (line) =>
    /^ +steps:$/u.test(withoutComment(line)),
  );

  if (stepsLine === undefined || stepsLine > runsEnd) {
    return [];
  }

  const stepsIndent = indentOf(lines[stepsLine] ?? '');

  const firstDash = findIndexFrom(lines, stepsLine + 1, isContent);

  const dash = /^(?<indent> *)(?<marker>- +)/u.exec(
    lines[firstDash ?? lines.length] ?? '',
  )?.groups;

  if (
    firstDash === undefined ||
    dash === undefined ||
    (dash['indent'] ?? '').length < stepsIndent
  ) {
    return [];
  }

  const dashIndent = (dash['indent'] ?? '').length;

  const isDashLine = (line: string): boolean =>
    indentOf(line) === dashIndent && line.slice(dashIndent).startsWith('-');

  const blockEnd =
    findIndexFrom(
      lines,
      firstDash,
      (line) =>
        isContent(line) &&
        (indentOf(line) < dashIndent ||
          (indentOf(line) === dashIndent && !isDashLine(line))),
    ) ?? lines.length;

  const starts = Arr.generate(function* () {
    for (const [offset, line] of lines.slice(firstDash, blockEnd).entries()) {
      if (isDashLine(line)) {
        yield firstDash + offset;
      }
    }
  });

  return starts.map((start, i) =>
    readStep(lines, start, starts[i + 1] ?? blockEnd),
  );
};

/**
 * A `runs:` or `steps:` given a flow value on its own line, or a flow
 * sequence starting the line under `steps:` — the steps this cannot read.
 */
const findFlowStyle = (
  lines: readonly string[],
  runsLine: number,
  runsEnd: number,
  /** The lines of the scripts read, which are not YAML. */
  consumed: ReadonlySet<number>,
): readonly string[] =>
  Arr.generate(function* () {
    // `runs:` itself given a value on its line.
    const flowRuns = lines.findIndex((line) =>
      /^runs:\s*\S/u.test(withoutComment(line)),
    );

    if (flowRuns !== -1) {
      yield problemAtLine(flowRuns);
    }

    // `runs.steps`: the first `steps:` under `runs:`, as `runs:` holds no
    // nested mapping before it. A flow value on its line, or a flow sequence
    // opening the line under it, is the only flow style looked for, so that
    // a `steps:` or `[` deeper in a step is not mistaken for one.
    const stepsLine = findIndexFrom(
      lines,
      runsLine + 1,
      (line, index) =>
        index < runsEnd && /^ +steps:/u.test(withoutComment(line)),
    );

    if (stepsLine === undefined) {
      return;
    }

    if (/^ +steps:\s*\S/u.test(withoutComment(lines[stepsLine] ?? ''))) {
      yield problemAtLine(stepsLine);

      return;
    }

    const next = findIndexFrom(
      lines,
      stepsLine + 1,
      (line, index) => !consumed.has(index) && isContent(line),
    );

    if (next !== undefined && (lines[next] ?? '').trimStart().startsWith('[')) {
      yield problemAtLine(next);
    }
  });

const problemAtLine = (index: number): string =>
  `${index + 1}: \`runs:\` or \`steps:\` in flow style, which this does not read; write them in block style` as const;

/**
 * A line that gives a step its `run:` key in any way YAML allows at a step's
 * own level: plain, quoted, as an explicit `? run` key, or inside a flow
 * mapping that is the step itself (`- { shell: bash, run: … }`).
 */
const isRunKey = (line: string): boolean => {
  const item = line
    .trimStart()
    .replace(/^-\s+/u, '')
    .replace(/^\?\s+/u, '');

  return (
    /^["']?run["']?(?:\s*:|\s*$)/u.test(item) ||
    (item.startsWith('{') && /[{,]\s*["']?run["']?\s*:/u.test(item))
  );
};

/** `line` without a trailing ` # comment` or trailing blanks. */
const withoutComment = (line: string): string =>
  line.replace(/\s#.*$/u, '').trimEnd();

const findIndexFrom = (
  lines: readonly string[],
  from: number,
  predicate: (line: string, index: number) => boolean,
): number | undefined => {
  const offset = lines
    .slice(from)
    .findIndex((line, offset_) => predicate(line, from + offset_));

  return offset === -1 ? undefined : from + offset;
};

const indentOf = (line: string): number =>
  line.length - line.trimStart().length;

const isContent = (line: string): boolean =>
  line.trim() !== '' && !line.trimStart().startsWith('#');
