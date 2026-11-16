// cspell:ignore FFFC
import dedent from 'dedent';
import { proseBlocks } from './prose-blocks.mjs';

/** Each block as `line text`, a `|` where a later line begins. */
const shown = (markdown: string): readonly string[] =>
  proseBlocks(markdown).map(
    ({ text, lines }) =>
      `${lines[0] ?? '-'} ${text
        .split('')
        .map(
          (char, i) =>
            `${i > 0 && lines[i] !== lines[i - 1] ? '|' : ''}${char}`,
        )
        .join('')}`,
  );

describe(proseBlocks, () => {
  test.each([
    // Code: fenced, indented, and a span, which leaves U+FFFC.
    ['```\nFixes #1\n```\nFixes #2', ['3 Fixes #2']],
    ['    Fixes #1', []],
    ['pre`x`fixes #1', ['0 pre\u{FFFC}fixes #1']],
    // A run of backticks nothing closes is text.
    [
      'Open a fence with ``` and fixes #1 then `x`.',
      ['0 Open a fence with ``` and fixes #1 then \u{FFFC}.'],
    ],
    // An escaped backtick opens nothing.
    ['a \\` b Fixes #1', ['0 a ` b Fixes #1']],
    // A line break, a lone carriage return among them, is a space.
    ['Closes\n#1', ['0 Closes |#1']],
    ['a\rFixes #1', ['0 a |Fixes #1']],
    ['~~~\rcode\r~~~\rFixes #1', ['3 Fixes #1']],
    // A code span over a line break keeps the lines.
    ['Use `a\nb` and\nFixes #1', ['0 Use \u{FFFC}| and |Fixes #1']],
    // HTML comments, as blocks and within a line, closed or not.
    ['<!-- a\nFixes #1\n-->\nCloses #2', ['3 Closes #2']],
    ['<!-->\nFixes #1', ['1 Fixes #1']],
    ['a\n<!-- b\nFixes #1', ['0 a']],
    [
      'Text <!-- a\n\nFixes #1\n\n-->',
      ['0 Text <!-- a', '2 Fixes #1', '4 -->'],
    ],
    ['Fixes #1 <!--\nb\n-->\nc', ['0 Fixes #1 | |c']],
    // A comment shows nothing, and the text around it joins, as GitHub's does.
    ['pre<!-- -->fixes #1', ['0 prefixes #1']],
    ['Fix<!-- -->es #9', ['0 Fixes #9']],
    // So do a processing instruction, a declaration and CDATA.
    ['a <?x Fixes #5 ?> b', ['0 a  b']],
    ['a <![CDATA[ Fixes #6 ]]> b', ['0 a  b']],
    ['a <!X Fixes #7> b', ['0 a  b']],
    ['`<!--` and fixes #1; `-->`', ['0 \u{FFFC} and fixes #1; \u{FFFC}']],
    ['<!--\n```\n-->\nFixes #1', ['3 Fixes #1']],
    // Lines are counted by UTF-16 unit, as a match's index is.
    ['🎉 a\nFixes #1', ['0 🎉 a |Fixes #1']],
    ['<div>\n&#x1F389;&amp;\nFixes #1\n</div>', ['0 \n |🎉& |Fixes #1 |\n']],
    // Emphasis, a tag and a link leave their text; a breaking tag, a space.
    ['**Fixes:** #1', ['0 Fixes: #1']],
    ['Fix<em>es</em> #1', ['0 Fixes #1']],
    ['Done.<br>Fixes #1', ['0 Done. Fixes #1']],
    ['[Fixes #1](https://example.com)', ['0 Fixes #1']],
    // A list item's continuation is the item's, not code.
    ['- a\n\n    Fixes #1', ['0 a', '2 Fixes #1']],
    ['> a\n> Fixes #1', ['0 a |Fixes #1']],
    // A table cell is a block: GitHub renders each apart.
    [
      '| a | b |\n| - | - |\n| x | Fixes #1 |',
      ['0 a', '0 b', '2 x', '2 Fixes #1'],
    ],
    // A literal autolink keeps its line.
    [
      "x\n\nSee 'www.a.com'.\nCloses #4",
      ['0 x', "2 See 'www.a.com'. |Closes #4"],
    ],
    // A reference to a line feed is a space on its own line; an image's alt
    // keeps its lines.
    ['a &#10; b\nFixes #1', ['0 a   b |Fixes #1']],
    ['![a\nb](x.png)\nFixes #1', ['0 \u{FFFC}| |Fixes #1']],
    ['Shot<img src="x.png">Fixes #1', ['0 Shot\u{FFFC}Fixes #1']],
    // Nesting is read up to 32 markers on a line, and as written past them.
    [`${'>'.repeat(32)} Fixes #1`, ['0 Fixes #1']],
    [`${'> '.repeat(16)}${'- '.repeat(16)}Fixes #1`, ['0 Fixes #1']],
    [`${'>'.repeat(33)} Fixes #1`, [`0 ${' '.repeat(33)} Fixes #1`]],
    // A tag over a line break joins the words around it all the same.
    ['Fix<span\nclass="x">es</span> #1', ['0 Fix|es #1']],
    [
      '<div>\nFix<span\nclass="x">es</span> #1\n</div>',
      ['0 \n |Fix|es #1 |\n'],
    ],
    // A `>` in a quoted attribute value does not end the tag.
    ['<div>\n<img alt="a -> Fixes #1">\n</div>', ['0 \n |\u{FFFC} |\n']],
    ["<div>\n<img alt = 'a -> Fixes #1'>\n</div>", ['0 \n |\u{FFFC} |\n']],
    // A quote opens a value only after its `=`; elsewhere it is a character.
    [
      "<div>\n<span title=it's>x</span> Fixes #1 isn't > y\n</div>",
      ["0 \n |x Fixes #1 isn't > y |\n"],
    ],
    [
      '<div>\n<span a"b>x</span> Fixes #1 ">\n</div>',
      ['0 \n |x Fixes #1 "> |\n'],
    ],
    // `--!>` ends a comment in HTML, though not in CommonMark.
    ['<!-- a --!>\nFixes #1', ['0  |Fixes #1']],
    ['Note <!-- x --!> Fixes #1 -->', ['0 Note  Fixes #1 -->']],
    // A tag's name is ASCII: U+212A KELVIN SIGN begins none.
    ['<div>\n<\u{212A} Fixes #1>\n</div>', ['0 \n |<\u{212A} Fixes #1> |\n']],
    ['<DIV>a</DIV>b', ['0 \na\nb']],
    // A block tag is a line break, which no keyword is read across.
    [
      '<ul>\n<li>Bug fix</li>\n<li>#12</li>\n</ul>',
      ['0 \n |\nBug fix\n |\n#12\n |\n'],
    ],
    [
      '<details>\n<summary>Fixed</summary>\n#16 was a dup\n</details>',
      ['0 \n |\nFixed\n |#16 was a dup |\n'],
    ],
    // A `<script>` element's content shows: GitHub's tag filter leaves it text.
    [
      '<script>\n// Fixes #1\n</script>\n\nCloses #2',
      ['0  |// Fixes #1 ', '4 Closes #2'],
    ],
    // A tag's name ends at a space, a `/` or a `>`: these are other elements.
    ['<div>\n<script-x>Fixes #1</script-x>\n</div>', ['0 \n |Fixes #1 |\n']],
    ['<div>\nFix<li-x>es #1\n</div>', ['0 \n |Fixes #1 |\n']],
    ['<div>\n<script>x</script/>\nFixes #1\n</div>', ['0 \n |x |Fixes #1 |\n']],
    // A control is no character.
    ['<div>&#1;</div>', [`0 \n${String.fromCodePoint(0xff_fd)}\n`]],
    // A task list item's text keeps its lines.
    ['- [x]\n  Fixes #7', ['1 Fixes #7']],
    // A surrogate is no character.
    [
      '<div>&#xD800;Fixes #1</div>',
      [`0 \n${String.fromCodePoint(0xff_fd)}Fixes #1\n`],
    ],
    // An entity's line break, in HTML too, is a space; an escape there is text.
    ['<div>&#10;Fixes #1</div>', ['0 \n Fixes #1\n']],
    // An escaped `#` is shown as U+FF03 FULLWIDTH NUMBER SIGN, which no
    // reference begins with; an escaped backslash leaves a `#` as it is.
    [String.raw`Fixes \#1`, ['0 Fixes \u{FF03}1']],
    [String.raw`Fixes \\#1`, [String.raw`0 Fixes \#1`]],
    [String.raw`Fixes \\\#1`, ['0 Fixes \\\u{FF03}1']],
    [
      ['<div>', String.raw`Fixes \#1`, '</div>'].join('\n'),
      ['0 \n |Fixes \\#1 |\n'],
    ],
    // An HTML block shows its text, a comment in it nothing.
    ['<div>\nDone.<!-- a -->Fixes #1\n</div>', ['0 \n |Done.Fixes #1 |\n']],
    // Its tags show as an inline tag does, and its entities are decoded.
    ['<p>Fixes <b>#1</b>&nbsp;x</p>', ['0 \nFixes #1\u{A0}x\n']],
    ['<td>Fixes</td><td>#1</td>', ['0 \nFixes\n\n#1\n']],
    ['| Fixes | #1 |\n| - | - |', ['0 Fixes', '0 #1']],
  ])('reads %j', (markdown, expected) => {
    assert.deepStrictEqual(shown(markdown), expected);
  });
});

test('reads a deeply nested body without running out of stack', () => {
  for (const markdown of [
    `${'>'.repeat(2000)} Fixes #1`,
    `${'- '.repeat(2000)}Fixes #1`,
    `${'!['.repeat(2000)}Fixes #1`,
    `${'['.repeat(5000)}Fixes #1`,
  ]) {
    assert.isTrue(
      proseBlocks(markdown).some((block) => block.text.includes('Fixes #1')),
    );
  }
});

// The parser takes time quadratic in a list's depth: minutes for this body
// unless it is read without the parser, which the default timeout holds it to.
test('reads a body nested past the parser without it, in time', () => {
  const nested = `${'- '.repeat(30_000)}Fixes #1` as const;

  assert.deepStrictEqual(
    proseBlocks(`A.\n\n${nested}\n\n\`Fixes #2\``).map(({ text }) => text),
    ['A.', nested, '\u{FFFC}'],
  );
});

test('reads a body of many nested list items without the parser, in time', () => {
  const item = `${'- '.repeat(4)}x` as const;

  const texts = proseBlocks(`${`${item}\n`.repeat(6000)}Fixes #1`).map(
    ({ text }) => text,
  );

  assert.strictEqual(texts.length, 6000);

  assert.strictEqual(texts.filter((text) => text === item).length, 5999);

  assert.include(texts, `${item} Fixes #1`);
});

// Tag openers ending at a line break in a list item take the parser a quarter
// of a minute at GitHub's largest body.
test('reads a list item of many tag openers without the parser, in time', () => {
  assert.include(
    proseBlocks(`- p\n${'<a\n'.repeat(21_000)}\nFixes #1`).map(
      ({ text }) => text,
    ),
    'Fixes #1',
  );
});

test('counts no rule or dash in a word as a marker', () => {
  assert.deepStrictEqual(shown(`${'-'.repeat(80)}\n\nA - B-C\n\nFixes #1`), [
    '2 A - B-C',
    '4 Fixes #1',
  ]);
});

test('reads no keyword in fenced code, a code span or a comment', () => {
  const markdown = dedent`
    ${'```'}text
    ${'> '.repeat(40)}x
    ${'- x\n'.repeat(4100)}${'```'}

    Write \`Fixes #3\` to close one.
    <!-- Closes #4 -->
  `;

  assert.isFalse(proseBlocks(markdown).some(({ text }) => /#[34]/u.test(text)));
});

test('reads no fenced code, code span or comment without the parser', () => {
  const markdown = dedent`
    ${'- '.repeat(40)}x

    ${'```'}
    Fixes #9
    ${'```'}
    <!-- Fixes #8 --> Write \`Fixes #6\`.
    Fixes #7 <!-- unclosed, so shown
  `;

  const texts = proseBlocks(markdown).map(({ text }) => text);

  assert.isTrue(texts.some((text) => text.includes('Fixes #7')));

  assert.isFalse(texts.some((text) => /#[689]/u.test(text)));
});

// Up to each limit the parser reads the body, which shows a heading's text
// alone; past it, the body is read without the parser, which keeps its marks.
test.each([
  ['markers on a line', 32, (n: number) => `${'> '.repeat(n)}x`],
  ['markers in all', 4096, (n: number) => '- x\n'.repeat(n)],
  ['emphasis delimiters', 4096, (n: number) => '*a'.repeat(n)],
  ['comment openers', 64, (n: number) => 'a <!--'.repeat(n)],
  ['declaration openers', 64, (n: number) => 'a<!X'.repeat(n)],
  ['processing instruction openers', 64, (n: number) => 'a<?\n'.repeat(n)],
  ['tag openers', 1024, (n: number) => 'a\n<b\n'.repeat(n)],
  ['heading underlines', 1024, (n: number) => 'a\n=\n'.repeat(n)],
  ['underlines in a list', 1024, (n: number) => '- =\n'.repeat(n)],
  ['brackets', 4096, (n: number) => '[a]'.repeat(n)],
  ['closing brackets', 8192, (n: number) => ']'.repeat(n)],
  [
    'lengths of backtick runs',
    16,
    (n: number) =>
      Array.from({ length: n }, (_, i) => '`'.repeat(i + 1)).join('a'),
  ],
  ['strikethrough delimiters', 4096, (n: number) => '~a'.repeat(n)],
  // Counted in fenced code and code spans too, which the parser might not read
  // as such: an indented fence, or a backtick escaped.
  [
    'markers in fenced code',
    4096,
    (n: number) => `\`\`\`\n${'- x\n'.repeat(n)}\`\`\``,
  ],
  [
    'delimiters after a backtick',
    4096,
    (n: number) => `\\\`${'*a'.repeat(n)}\``,
  ],
])('reads a body by its %s, up to %i', (_, limit, body) => {
  const texts = (n: number): readonly string[] =>
    proseBlocks(`${body(n)}\n\n## A`).map(({ text }) => text);

  assert.include(texts(limit), 'A');

  assert.include(texts(limit + 1), '## A');
});

describe('reading without the parser', () => {
  const PAST = `${'> '.repeat(40)}x\n\n` as const;

  const texts = (markdown: string): readonly string[] =>
    proseBlocks(`${PAST}${markdown}`).map(({ text }) => text);

  test.each([
    ['**Fixes:** #12', 'Fixes: #12'],
    ['Closes\n#13', 'Closes #13'],
    ['Use `<!--` here.\nFixes #14\nand `-->` closes it.', 'Fixes #14'],
    ['Fixes `x` #15', 'Fixes \u{FFFC} #15'],
    // As the parser shows them: a link's text, an image, a tag, a reference, a
    // hard break, a quote's continuation and a name's `_`.
    ['Fixes [#16](https://github.com/o/r/issues/16)', 'Fixes #16'],
    ['![a](x.png)Fixes #17', '\u{FFFC}Fixes #17'],
    ['Fixes <b>#18</b>', 'Fixes #18'],
    ['Fixes&nbsp;#19', 'Fixes\u{A0}#19'],
    ['Fixes\\\n#20', 'Fixes  #20'],
    ['> Closes\n> #21', 'Closes   #21'],
    ['Fixes my_org/my_repo#22', 'Fixes my_org/my_repo#22'],
    // A number ends where an element begins.
    ['Fixes #4<b>5</b>', 'Fixes #4\u{FFFC}5'],
    ['Fixes #1<!-- -->2', 'Fixes #1\u{FFFC}2'],
    ['Fixes #1<!---->', 'Fixes #1'],
    // An autolink shows its address, and a comment ends where HTML ends it.
    [
      'Fixes <https://github.com/o/r/issues/42>',
      'Fixes https://github.com/o/r/issues/42',
    ],
    ['<!-->\nFixes #24\n-->', 'Fixes #24'],
    ['<!--->\nFixes #25\n-->', 'Fixes #25'],
    ['<!-- a --!>\nFixes #26\n-->', 'Fixes #26'],
    // A comment joins the text around it; a reference link shows its text.
    ['Fix<!-- -->es #27', 'Fixes #27'],
    ['Fixes [#28][r]\n\n[r]: https://example.com', 'Fixes #28'],
    ['Fixes [#29][]', 'Fixes #29'],
    // A `*`, `~` or `_` between two letters or digits stays.
    ['Closes #3~5', 'Closes #3~5'],
    ['Fixes #1*Fixes #2', 'Fixes #1*Fixes #2'],
    ['Fixes #1**2**', 'Fixes #1**2'],
    ['Fixes my__repo', 'Fixes my__repo'],
    ['Write ``Closes #30`` here', 'Write \u{FFFC} here'],
    // No keyword is read across a block's tag.
    ['<ul><li>Bug fix</li><li>#12</li></ul>', 'fix\u{FFFC}\u{FFFC}#12'],
    // A backtick in a comment opens no code span, and a `<!--` in one no comment.
    ['<!-- use ` here --> Fixes #23 `x`', 'Fixes #23 \u{FFFC}'],
  ])('reads %j as %j', (markdown, expected) => {
    assert.isTrue(texts(markdown).some((text) => text.includes(expected)));
  });

  test('reads each list item apart, its marker kept', () => {
    assert.deepStrictEqual(texts('* Fixed\n* #12\n  more\n> a\n> b'), [
      `${' '.repeat(80)}x`,
      '* Fixed',
      '* #12   more',
      '  a   b',
    ]);
  });

  test('reads a heading apart from the lines around it', () => {
    assert.deepStrictEqual(texts('A\n## Fixed\n#12 was a dup'), [
      `${' '.repeat(80)}x`,
      'A',
      '## Fixed',
      '#12 was a dup',
    ]);
  });

  // Each pattern scans a long line once, not once from each of its characters.
  test.each([
    ['an unclosed tag', `<a${'b'.repeat(100_000)}`],
    ['a backtick run', `a${'`'.repeat(100_000)}`],
    ['a run of delimiters', `a${'*'.repeat(100_000)}b`],
  ])('reads %s in time', (_, line) => {
    assert.isTrue(texts(`${line}\n\nFixes #1`).includes('Fixes #1'));
  });

  test('keeps the lines a paragraph is written over', () => {
    const blocks = proseBlocks(`${PAST}A\nB\n\nC`);

    assert.deepStrictEqual(
      blocks.map(({ text, lines }) => [text, lines]),
      [
        [`${' '.repeat(80)}x`, Array.from({ length: 81 }, () => 0)],
        ['A B', [2, 2, 3]],
        ['C', [5]],
      ],
    );
  });
});

test('counts no `_` within a word as a delimiter', () => {
  const markdown = `${'- `a_b_c_d` and e_f_g\n'.repeat(1400)}\n## A` as const;

  assert.include(
    proseBlocks(markdown).map(({ text }) => text),
    'A',
  );
});
