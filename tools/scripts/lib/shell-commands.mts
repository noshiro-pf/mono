import type { FixedLengthTuple } from 'ts-type-forge';
// cspell:ignore esac nohup
import { Arr, hasKey } from 'ts-data-forge';

/**
 * The simple commands of a shell script, each as the words the shell would hand
 * it, quotes taken off: what a workflow's `run:` step or a manifest script runs.
 *
 * The guards that ask which scripts CI runs (`check-ci-commands.mts`,
 * `check-ci-job-shape.mts`) read the same scripts, and reading them line by
 * line got each of these wrong at some point: a quoted `#` or separator, an
 * apostrophe inside double quotes, a backslash continuing a line, a quoted
 * string spanning lines, a `pnpm` inside `$(…)` or backticks, a trailing
 * comment, a heredoc's body. This reads them as `bash` does, as far as a guard
 * needs: the separators (`;`, `&&`, `||`, `|`, `&`, a newline), quoting and
 * escapes, comments, line continuations, command and process substitutions
 * (whose commands are commands too), arithmetic, parameter and GitHub
 * expressions (`${{ … }}`, which Actions replaces before the shell runs),
 * redirections, heredocs and here-strings, leading assignments, and the
 * reserved words of `if`, `while` and `{ … }`. Expansion is not performed: a
 * word holds `$NAME` as written, and a substitution reads `$(…)`.
 *
 * **What it cannot read is reported, never read past**: an unterminated quote,
 * substitution or heredoc, and a heredoc that would run a substitution in its
 * body. A loop's head (`for x in …`, `case …`) is no command; what runs inside
 * it is.
 */
export const readShellCommands = (script: string): ShellReading => {
  const chars = Array.from(script.replaceAll('\r\n', '\n'));

  const { commands, assignments, problems } = readList(chars, 0, undefined);

  return { commands, assignments, problems };
};

export type ShellReading = Readonly<{
  commands: readonly (readonly string[])[];
  /**
   * What a command of assignments alone sets (`f="$DIR/x"`, `then f=x`,
   * `export F=x`), name and value as written, in order. One inside a
   * substitution or subshell sets nothing outside it and is left out, as is one
   * before a command (`FOO=1 node x`), which only that command sees.
   */
  assignments: readonly (readonly [name: string, value: string])[];
  problems: readonly string[];
}>;

type ListReading = ShellReading & Readonly<{ end: number }>;

type Heredoc = Readonly<{
  delimiter: string;
  /** `<<-`: leading tabs are taken off the body and the delimiter line. */
  stripTabs: boolean;
  /** A quoted delimiter leaves the body unexpanded. */
  quoted: boolean;
}>;

/** The index past a wrapper's options from `from`, each value taken along. */
const pastOptions = (
  words: readonly string[],
  from: number,
  valueOptions: ReadonlySet<string>,
): number => {
  const mut_cursor = { at: from };

  while ((words[mut_cursor.at] ?? '').startsWith('-')) {
    mut_cursor.at += valueOptions.has(words[mut_cursor.at] ?? '') ? 2 : 1;
  }

  return mut_cursor.at;
};

/**
 * Where the command proper starts among a command's words: past the reserved
 * words and assignments before it, and past a wrapper that runs it
 * (`env FOO=1`, `timeout 600`, `xvfb-run -a`) with the wrapper's options.
 */
const commandStart = (words: readonly string[]): number => {
  const mut_cursor = { at: 0 };

  while (mut_cursor.at < words.length) {
    const word = words[mut_cursor.at] ?? '';

    if (LEADING_RESERVED.has(word) || ASSIGNMENT.test(word)) {
      mut_cursor.at += 1;

      continue;
    }

    // `command -v` / `-V` look a name up and run nothing.
    if (
      word === 'command' &&
      LOOKUP_OPTIONS.has(words[mut_cursor.at + 1] ?? '')
    ) {
      return words.length;
    }

    const valueOptions = WRAPPERS.get(word);

    if (valueOptions === undefined) {
      return mut_cursor.at;
    }

    mut_cursor.at += 1;

    mut_cursor.at = pastOptions(words, mut_cursor.at, valueOptions);

    // `timeout` takes its duration before the command.
    mut_cursor.at += word === 'timeout' ? 1 : 0;
  }

  return mut_cursor.at;
};

/**
 * A command's words less what is not the command: the assignments and reserved
 * words before it (`if ! FOO=1 pnpm run x`), and nothing at all for a loop's
 * head or a reserved word alone (`fi`, `done`).
 */
const commandWords = (
  words: readonly string[],
): readonly string[] | undefined => {
  const command = words.slice(commandStart(words));

  if (Arr.isEmpty(command)) {
    return undefined;
  }

  return LOOP_HEADS.has(command[0] ?? '') ||
    command.every((word) => CLOSING_RESERVED.has(word))
    ? undefined
    : command;
};

/**
 * The variables a command sets when it is assignments alone, after any reserved
 * word (`then f=x`), or through a declaration builtin (`export F=x`); nothing
 * for any other command.
 */
const assignmentsOf = (
  words: readonly string[],
): readonly FixedLengthTuple<2, string>[] => {
  const afterReserved = words.slice(
    Math.max(
      0,
      words.findIndex((word) => !LEADING_RESERVED.has(word)),
    ),
  );

  // A declaration builtin's other words (`export NAME`, `-x`) set no value.
  const assigned = DECLARATION_BUILTINS.has(afterReserved[0] ?? '')
    ? Arr.tail(afterReserved).filter((word) => ASSIGNMENT.test(word))
    : afterReserved.every((word) => ASSIGNMENT.test(word))
      ? afterReserved
      : ([] as const);

  return assigned.map((word): FixedLengthTuple<2, string> => {
    const at = word.indexOf('=');

    return [word.slice(0, at), word.slice(at + 1)];
  });
};

const lineOf = (chars: readonly string[], at: number): number =>
  chars.slice(0, at).filter((character) => character === '\n').length + 1;

const indicesFrom = function* (
  chars: readonly string[],
  from: number,
): Generator<number> {
  const mut_cursor = { at: from };

  while (mut_cursor.at < chars.length) {
    yield mut_cursor.at;

    mut_cursor.at += 1;
  }
};

const indexOfFrom = (
  chars: readonly string[],
  target: string,
  from: number,
): number => {
  for (const index of indicesFrom(chars, from)) {
    if (chars[index] === target) {
      return index;
    }
  }

  return -1;
};

/**
 * The index of the `close` that balances the text from `from` on, each `open`
 * in it counted against one.
 */
const balancedClose = (
  chars: readonly string[],
  from: number,
  open: string,
  close: string,
): number | undefined => {
  const mut_state = { depth: 0 };

  for (const index of indicesFrom(chars, from)) {
    const character = chars[index];

    if (character === close && mut_state.depth === 0) {
      return index;
    }

    mut_state.depth += character === open ? 1 : character === close ? -1 : 0;
  }

  return undefined;
};

/** The index after the `))` closing an arithmetic expansion. */
const arithmeticEnd = (
  chars: readonly string[],
  from: number,
): number | undefined => {
  const close = balancedClose(chars, from, '(', ')');

  return close !== undefined && chars[close + 1] === ')'
    ? close + 2
    : undefined;
};

/**
 * The index of the `)` that ends a `case` clause's patterns: outside quotes,
 * not escaped, and not closing a group of the pattern's own (`@(a|b)`).
 */
const patternsEnd = (
  chars: readonly string[],
  from: number,
): number | undefined => {
  const mut_state = { quote: '', depth: 0, escaped: false };

  for (const index of indicesFrom(chars, from)) {
    if (mut_state.escaped) {
      mut_state.escaped = false;

      continue;
    }

    const character = chars[index] ?? '';

    if (mut_state.quote !== '') {
      mut_state.quote = character === mut_state.quote ? '' : mut_state.quote;

      continue;
    }

    if (character === ')' && mut_state.depth === 0) {
      return index;
    }

    mut_state.escaped = character === '\\';

    mut_state.quote = character === "'" || character === '"' ? character : '';

    mut_state.depth += character === '(' ? 1 : character === ')' ? -1 : 0;
  }

  return undefined;
};

/** The index after the `}}` closing a GitHub expression. */
const expressionEnd = (
  chars: readonly string[],
  from: number,
): number | undefined => {
  for (const index of indicesFrom(chars, from)) {
    if (chars[index] === '}' && chars[index + 1] === '}') {
      return index + 2;
    }
  }

  return undefined;
};

/** The index after the `}` closing a parameter expansion. */
const braceEnd = (
  chars: readonly string[],
  from: number,
): number | undefined => {
  const close = balancedClose(chars, from, '{', '}');

  return close === undefined ? undefined : close + 1;
};

/**
 * Where a heredoc's body, from `from` on, ends (the start of its delimiter
 * line), and the index after that line; undefined when the delimiter never
 * comes.
 */
const heredocEnd = (
  chars: readonly string[],
  from: number,
  { delimiter, stripTabs }: Heredoc,
): Readonly<{ bodyEnd: number; end: number }> | undefined => {
  const mut_cursor = { at: from };

  while (mut_cursor.at <= chars.length) {
    const lineEnd = indexOfFrom(chars, '\n', mut_cursor.at);

    const line = chars
      .slice(mut_cursor.at, lineEnd === -1 ? chars.length : lineEnd)
      .join('');

    if ((stripTabs ? line.replace(/^\t+/u, '') : line) === delimiter) {
      return {
        bodyEnd: mut_cursor.at,
        end: lineEnd === -1 ? chars.length : lineEnd + 1,
      };
    }

    if (lineEnd === -1) {
      return undefined;
    }

    mut_cursor.at = lineEnd + 1;
  }

  return undefined;
};

/**
 * The commands from `start` on, to the end, or to the `)` that closes the
 * substitution or subshell `opening` (`$(`, `(`) began; `end` is the index
 * after what was read. A problem ends the reading.
 */
const readList = (
  chars: readonly string[],
  start: number,
  opening: string | undefined,
): ListReading => {
  const mut_commands: (readonly string[])[] = [];

  const mut_assignments: FixedLengthTuple<2, string>[] = [];

  const mut_problems: string[] = [];

  let mut_words: string[] = [];

  let mut_word: string[] = [];

  const mut_heredocs: Heredoc[] = [];

  /**
   * The `case` statements open here, innermost last: reading a clause's
   * patterns up to their `)`, or its commands up to `;;`.
   */
  const mut_cases: ('patterns' | 'commands')[] = [];

  const mut_state = {
    at: start,
    inWord: false,
    skipNextWord: false,
    /** A `case <word>` ended its line, its `in` on the next one. */
    caseAwaitsIn: false,
  };

  const stopped = (): ListReading =>
    ({
      commands: mut_commands,
      assignments: mut_assignments,
      problems: mut_problems,
      end: chars.length,
    }) as const;

  const problem = (at: number, what: string): ListReading => {
    mut_problems.push(`line ${lineOf(chars, at)}: ${what}`);

    return stopped();
  };

  const append = (text: string): void => {
    mut_word.push(text);

    mut_state.inWord = true;
  };

  const endWord = (): void => {
    if (!mut_state.inWord) {
      return;
    }

    const text = mut_word.join('');

    mut_word = [];

    mut_state.inWord = false;

    if (mut_state.skipNextWord) {
      mut_state.skipNextWord = false;

      return;
    }

    // `in` on the line after `case <word>` opens it.
    if (mut_state.caseAwaitsIn) {
      mut_state.caseAwaitsIn = false;

      if (text === 'in' && Arr.isEmpty(mut_words)) {
        mut_cases.push('patterns');

        return;
      }
    }

    // `esac` where a command would start closes the innermost `case`.
    if (
      text === 'esac' &&
      Arr.isEmpty(mut_words) &&
      Arr.isNonEmpty(mut_cases)
    ) {
      mut_cases.pop();

      return;
    }

    mut_words.push(text);

    // `case <word> in`, after any reserved word (`then case …`), opens one, its
    // first clause's patterns next.
    if (text !== 'in') {
      return;
    }

    const head = mut_words.slice(commandStart(mut_words));

    if (head[0] !== 'case' || !Arr.isFixedLengthArray(3, head)) {
      return;
    }

    mut_words = [];

    mut_cases.push('patterns');
  };

  const endCommand = (): void => {
    endWord();

    mut_state.skipNextWord = false;

    // A blank or comment line between `case <word>` and its `in` ends no
    // command, and keeps it waiting.
    if (Arr.isNonEmpty(mut_words)) {
      const head = mut_words.slice(commandStart(mut_words));

      mut_state.caseAwaitsIn =
        head[0] === 'case' && Arr.isFixedLengthArray(2, head);
    }

    mut_assignments.push(...assignmentsOf(mut_words));

    const command = commandWords(mut_words);

    mut_words = [];

    if (command !== undefined) {
      mut_commands.push(command);
    }
  };

  /** Reads a nested list up to its `)`; the index after it, or a problem. */
  const nested = (from: number, what: string): number | ListReading => {
    const inner = readList(chars, from, what);

    mut_commands.push(...inner.commands);

    mut_problems.push(...inner.problems);

    return Arr.isNonEmpty(inner.problems) ? stopped() : inner.end;
  };

  /**
   * A `$` expansion at `at`: its text and the index after it, or a problem.
   * Only a command substitution runs anything.
   */
  const readDollar = (
    at: number,
  ): Readonly<{ text: string; end: number }> | ListReading => {
    const next = chars[at + 1];

    if (next === '(' && chars[at + 2] === '(') {
      const end = arithmeticEnd(chars, at + 3);

      return end === undefined
        ? problem(at, 'an unterminated `$((`')
        : { text: chars.slice(at, end).join(''), end };
    }

    if (next === '(') {
      const end = nested(at + 2, '`$(`');

      return typeof end === 'number' ? { text: SUBSTITUTION, end } : end;
    }

    if (next === '{') {
      const end =
        chars[at + 2] === '{'
          ? expressionEnd(chars, at + 3)
          : braceEnd(chars, at + 2);

      if (end === undefined) {
        return problem(at, 'an unterminated `${`');
      }

      const text = chars.slice(at, end).join('');

      // `${X:-$(cmd)}` runs `cmd`, which this does not read out of it; a
      // GitHub expression is no shell.
      return chars[at + 2] !== '{' && RUNS_SUBSTITUTION.test(text)
        ? problem(
            at,
            'a substitution inside a parameter expansion, which this does not read',
          )
        : { text, end };
    }

    return { text: '$', end: at + 1 };
  };

  /** A backtick substitution from after its opening `` ` ``. */
  const readBacktick = (from: number): number | ListReading => {
    const mut_inner: string[] = [];

    const mut_cursor = { at: from };

    while (mut_cursor.at < chars.length) {
      const character = chars[mut_cursor.at] ?? '';

      if (character === '`') {
        const inner = readList(Array.from(mut_inner.join('')), 0, undefined);

        mut_commands.push(...inner.commands);

        mut_problems.push(...inner.problems);

        return Arr.isNonEmpty(inner.problems) ? stopped() : mut_cursor.at + 1;
      }

      const next = chars[mut_cursor.at + 1] ?? '';

      // Inside backticks, a backslash escapes only these three.
      if (character === '\\' && BACKTICK_ESCAPES.has(next)) {
        mut_inner.push(next);

        mut_cursor.at += 2;

        continue;
      }

      mut_inner.push(character);

      mut_cursor.at += 1;
    }

    return problem(from, 'an unterminated `` ` ``');
  };

  /** A double-quoted string from after its opening `"`. */
  const readDoubleQuoted = (from: number): number | ListReading => {
    const mut_cursor = { at: from };

    while (mut_cursor.at < chars.length) {
      const character = chars[mut_cursor.at] ?? '';

      if (character === '"') {
        return mut_cursor.at + 1;
      }

      const next = chars[mut_cursor.at + 1];

      if (character === '\\' && next !== undefined) {
        if (next !== '\n') {
          append(DOUBLE_QUOTE_ESCAPES.has(next) ? next : `\\${next}`);
        }

        mut_cursor.at += 2;

        continue;
      }

      if (character === '$') {
        const expansion = readDollar(mut_cursor.at);

        if (hasKey(expansion, 'commands')) {
          return expansion;
        }

        append(expansion.text);

        mut_cursor.at = expansion.end;

        continue;
      }

      if (character === '`') {
        const end = readBacktick(mut_cursor.at + 1);

        if (typeof end !== 'number') {
          return end;
        }

        append(SUBSTITUTION);

        mut_cursor.at = end;

        continue;
      }

      append(character);

      mut_cursor.at += 1;
    }

    return problem(from, 'an unterminated `"`');
  };

  /** The heredoc bodies after a newline at `from`; the index after them. */
  const skipHeredocs = (from: number): number | ListReading => {
    const mut_cursor = { at: from };

    for (const heredoc of mut_heredocs.splice(0)) {
      const bodyStart = mut_cursor.at;

      const found = heredocEnd(chars, bodyStart, heredoc);

      if (found === undefined) {
        return problem(
          bodyStart,
          `a heredoc whose \`${heredoc.delimiter}\` never comes`,
        );
      }

      const body = chars.slice(bodyStart, found.bodyEnd).join('');

      if (!heredoc.quoted && RUNS_SUBSTITUTION.test(body)) {
        return problem(
          bodyStart,
          'a heredoc whose body runs a substitution; quote its delimiter, or move the command out of it',
        );
      }

      mut_cursor.at = found.end;
    }

    return mut_cursor.at;
  };

  /** A redirection operator at `at`; the index after it. */
  const readRedirection = (at: number): number => {
    // A file descriptor written against the operator (`2>`) is no word.
    if (mut_state.inWord && mut_word.every((part) => DIGIT.test(part))) {
      mut_word = [];

      mut_state.inWord = false;
    } else {
      endWord();
    }

    const mut_cursor = { at: at + 1 };

    while (REDIRECTION_TAIL.has(chars[mut_cursor.at] ?? '')) {
      mut_cursor.at += 1;
    }

    // `2>&1`, `>&-`: the target is a descriptor, not a word.
    if (
      chars[mut_cursor.at - 1] === '&' &&
      DESCRIPTOR.test(chars[mut_cursor.at] ?? '')
    ) {
      while (DESCRIPTOR.test(chars[mut_cursor.at] ?? '')) {
        mut_cursor.at += 1;
      }

      return mut_cursor.at;
    }

    mut_state.skipNextWord = true;

    return mut_cursor.at;
  };

  /** A heredoc's `<<` at `at`; the index after its delimiter. */
  const readHeredocStart = (at: number): number => {
    endWord();

    const stripTabs = chars[at + 2] === '-';

    const mut_cursor = { at: at + (stripTabs ? 3 : 2) };

    while (chars[mut_cursor.at] === ' ' || chars[mut_cursor.at] === '\t') {
      mut_cursor.at += 1;
    }

    const mut_delimiter: string[] = [];

    while (
      mut_cursor.at < chars.length &&
      !WORD_END.has(chars[mut_cursor.at] ?? '')
    ) {
      mut_delimiter.push(chars[mut_cursor.at] ?? '');

      mut_cursor.at += 1;
    }

    const written = mut_delimiter.join('');

    mut_heredocs.push({
      delimiter: written.replaceAll(/["'\\]/gu, ''),
      stripTabs,
      quoted: /["'\\]/u.test(written),
    });

    return mut_cursor.at;
  };

  /**
   * A `case` clause's patterns from `at`, up to and past their `)`, or the
   * `esac` that ends the statement; the index after them.
   */
  const readCasePatterns = (at: number): number | ListReading => {
    const mut_cursor = { at };

    // Blanks, newlines and comments come between the clauses.
    while (
      CASE_SPACE.has(chars[mut_cursor.at] ?? '') ||
      chars[mut_cursor.at] === '#'
    ) {
      if (chars[mut_cursor.at] === '#') {
        const lineEnd = indexOfFrom(chars, '\n', mut_cursor.at);

        mut_cursor.at = lineEnd === -1 ? chars.length : lineEnd;
      } else {
        mut_cursor.at += 1;
      }
    }

    const rest = chars.slice(mut_cursor.at, mut_cursor.at + 5).join('');

    if (rest.startsWith('esac') && !/^esac[\w-]/u.test(rest)) {
      mut_cases.pop();

      return mut_cursor.at + 4;
    }

    // A clause may open its patterns with `(`, as in `(a) …`.
    const end = patternsEnd(
      chars,
      chars[mut_cursor.at] === '(' ? mut_cursor.at + 1 : mut_cursor.at,
    );

    if (end === undefined) {
      return problem(at, 'a `case` clause whose patterns never end in `)`');
    }

    mut_cases[mut_cases.length - 1] = 'commands';

    return end + 1;
  };

  while (mut_state.at < chars.length) {
    const at = mut_state.at;

    const character = chars[at] ?? '';

    if (
      mut_cases.at(-1) === 'patterns' &&
      !mut_state.inWord &&
      Arr.isEmpty(mut_words)
    ) {
      const end = readCasePatterns(at);

      if (typeof end !== 'number') {
        return end;
      }

      mut_state.at = end;

      continue;
    }

    if (opening !== undefined && character === ')') {
      endCommand();

      return {
        commands: mut_commands,
        assignments: mut_assignments,
        problems: mut_problems,
        end: at + 1,
      };
    }

    const next = chars[at + 1];

    if (character === '\\') {
      if (next !== '\n') {
        append(next ?? '\\');
      }

      mut_state.at += next === undefined ? 1 : 2;

      continue;
    }

    if (character === "'") {
      const close = indexOfFrom(chars, "'", at + 1);

      if (close === -1) {
        return problem(at, "an unterminated `'`");
      }

      append(chars.slice(at + 1, close).join(''));

      mut_state.at = close + 1;

      continue;
    }

    if (character === '"') {
      // An empty `""` is still a word.
      append('');

      const end = readDoubleQuoted(at + 1);

      if (typeof end !== 'number') {
        return end;
      }

      mut_state.at = end;

      continue;
    }

    if (character === '`') {
      const end = readBacktick(at + 1);

      if (typeof end !== 'number') {
        return end;
      }

      append(SUBSTITUTION);

      mut_state.at = end;

      continue;
    }

    if (character === '$') {
      const expansion = readDollar(at);

      if (hasKey(expansion, 'commands')) {
        return expansion;
      }

      append(expansion.text);

      mut_state.at = expansion.end;

      continue;
    }

    if (character === '#' && !mut_state.inWord) {
      const lineEnd = indexOfFrom(chars, '\n', at);

      mut_state.at = lineEnd === -1 ? chars.length : lineEnd;

      continue;
    }

    if (character === ' ' || character === '\t') {
      endWord();

      mut_state.at += 1;

      continue;
    }

    if (character === '\n') {
      endCommand();

      const end = skipHeredocs(at + 1);

      if (typeof end !== 'number') {
        return end;
      }

      mut_state.at = end;

      continue;
    }

    if (character === ';') {
      endCommand();

      // `;;`, `;&` and `;;&` end a `case` clause's commands.
      const clauseEnd =
        next === ';' ? (chars[at + 2] === '&' ? 3 : 2) : next === '&' ? 2 : 0;

      if (clauseEnd > 0 && mut_cases.at(-1) === 'commands') {
        mut_cases[mut_cases.length - 1] = 'patterns';
      }

      mut_state.at += Math.max(clauseEnd, 1);

      continue;
    }

    if (character === '&') {
      if (next === '>') {
        mut_state.at = readRedirection(at + 1);

        continue;
      }

      endCommand();

      mut_state.at += next === '&' ? 2 : 1;

      continue;
    }

    if (character === '|') {
      endCommand();

      mut_state.at += next === '|' || next === '&' ? 2 : 1;

      continue;
    }

    if (next === '(' && (character === '<' || character === '>')) {
      const end = nested(at + 2, 'process substitution');

      if (typeof end !== 'number') {
        return end;
      }

      append(SUBSTITUTION);

      mut_state.at = end;

      continue;
    }

    if (character === '<' && next === '<') {
      if (chars[at + 2] === '<') {
        mut_state.at = readRedirection(at + 2);

        continue;
      }

      mut_state.at = readHeredocStart(at);

      continue;
    }

    if (character === '<' || character === '>') {
      mut_state.at = readRedirection(at);

      continue;
    }

    if (character === '(') {
      endCommand();

      const end = nested(at + 1, '`(`');

      if (typeof end !== 'number') {
        return end;
      }

      mut_state.at = end;

      continue;
    }

    if (character === ')') {
      endCommand();

      mut_state.at += 1;

      continue;
    }

    append(character);

    mut_state.at += 1;
  }

  if (opening !== undefined) {
    return problem(start, `an unterminated ${opening}`);
  }

  endCommand();

  return Arr.isNonEmpty(mut_heredocs)
    ? problem(chars.length, 'a heredoc with no body')
    : {
        commands: mut_commands,
        assignments: mut_assignments,
        problems: mut_problems,
        end: chars.length,
      };
};

/** What a substitution's word reads, its commands having been read apart. */
const SUBSTITUTION = '$(…)';

const BACKTICK_ESCAPES: ReadonlySet<string> = new Set<string>(['`', '\\', '$']);

const DOUBLE_QUOTE_ESCAPES: ReadonlySet<string> = new Set<string>([
  '$',
  '`',
  '"',
  '\\',
]);

const REDIRECTION_TAIL: ReadonlySet<string> = new Set<string>(['>', '&', '|']);

const WORD_END: ReadonlySet<string> = new Set<string>([
  ' ',
  '\t',
  '\n',
  ';',
  '&',
  '|',
  '<',
  '>',
  '(',
  ')',
]);

const DIGIT = /^\d$/u;

/** A command substitution, `$(` but not the `$((` of arithmetic, or a backtick. */
const RUNS_SUBSTITUTION = /\$\((?!\()|`/u;

const CASE_SPACE: ReadonlySet<string> = new Set<string>([' ', '\t', '\n']);

const DESCRIPTOR = /^[\d-]$/u;

const ASSIGNMENT = /^[A-Za-z_]\w*=/u;

/** Builtins whose arguments may be assignments that set variables. */
const DECLARATION_BUILTINS: ReadonlySet<string> = new Set<string>([
  'declare',
  'export',
  'local',
  'readonly',
  'typeset',
]);

const LEADING_RESERVED: ReadonlySet<string> = new Set<string>([
  'if',
  'then',
  'else',
  'elif',
  'do',
  'while',
  'until',
  '!',
  '{',
]);

/**
 * The commands that run the command after their own words, each with its
 * options that take the next word as their value.
 */
const WRAPPERS: ReadonlyMap<string, ReadonlySet<string>> = new Map<
  string,
  ReadonlySet<string>
>([
  ['env', new Set<string>(['-u', '--unset', '-C', '--chdir', '-S'])],
  ['timeout', new Set<string>(['-s', '--signal', '-k', '--kill-after'])],
  ['xvfb-run', new Set<string>(['-n', '-w', '-e', '-f', '-p', '-s'])],
  ['nice', new Set<string>(['-n', '--adjustment'])],
  ['time', new Set<string>(['-o', '--output', '-f', '--format'])],
  ['exec', new Set<string>(['-a'])],
  ['nohup', new Set<string>()],
  ['command', new Set<string>()],
]);

const LOOKUP_OPTIONS: ReadonlySet<string> = new Set<string>(['-v', '-V']);

const CLOSING_RESERVED: ReadonlySet<string> = new Set<string>([
  'fi',
  'done',
  'esac',
  '}',
]);

const LOOP_HEADS: ReadonlySet<string> = new Set<string>([
  'for',
  'case',
  'select',
]);
