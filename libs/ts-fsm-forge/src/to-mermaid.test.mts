import dedent from 'dedent';
import type { ReadonlyRecord } from 'ts-type-forge';
import { toMermaid } from './to-mermaid.mjs';

describe(toMermaid, () => {
  test('draws one transition per target, naming each state once', () => {
    assert.strictEqual(
      toMermaid({
        'toss.selecting': { select: 'toss.confirming' },
        'toss.confirming': {
          select: ['toss.confirming', 'toss.selecting'],
          cancel: 'toss.selecting',
        },
      }),
      dedent`
        stateDiagram-v2
          state "toss.selecting" as s0
          state "toss.confirming" as s1
          s0 --> s1: select
          s1 --> s1: select
          s1 --> s0: select
          s1 --> s0: cancel
      `,
    );
  });

  test('marks the initial state when it is given', () => {
    assert.strictEqual(
      toMermaid({ idle: { close: 'closed' }, closed: {} }, { initial: 'idle' }),
      dedent`
        stateDiagram-v2
          state "idle" as s0
          state "closed" as s1
          [*] --> s0
          s0 --> s1: close
      `,
    );
  });

  test('keeps every label on its line', () => {
    assert.strictEqual(
      toMermaid({ 'a "b"': { 'go\nnow; then': 'c' }, c: {} }),
      dedent`
        stateDiagram-v2
          state "a #quot;b#quot;" as s0
          state "c" as s1
          s0 --> s1: go now#59; then
      `,
    );
  });

  test('declares a target the graph does not list', () => {
    assert.strictEqual(
      toMermaid({ a: { go: 'b' } }),
      dedent`
        stateDiagram-v2
          state "a" as s0
          state "b" as s1
          s0 --> s1: go
      `,
    );
  });

  test('takes a graph assembled at run time', () => {
    const graph: ReadonlyRecord<
      string,
      ReadonlyRecord<string, readonly string[]>
    > = {
      a: { go: ['a', 'b'] },
      b: {},
    } as const;

    assert.strictEqual(
      toMermaid(graph),
      dedent`
        stateDiagram-v2
          state "a" as s0
          state "b" as s1
          s0 --> s0: go
          s0 --> s1: go
      `,
    );
  });

  test('throws for an edge with no target', () => {
    assert.throws(
      () => toMermaid({ a: { go: [] }, b: {} }),
      /the edge a --go--> has no target/u,
    );

    assert.throws(
      () => toMermaid({ a: { go: undefined }, b: {} }),
      /the edge a --go--> has no target/u,
    );
  });

  test('draws a repeated target once', () => {
    assert.strictEqual(
      toMermaid({ a: { go: ['b', 'b'] }, b: {} }),
      dedent`
        stateDiagram-v2
          state "a" as s0
          state "b" as s1
          s0 --> s1: go
      `,
    );
  });

  test('refuses a target of another kind', () => {
    // `as const` is the codemod's (append-as-const); the annotation decides the
    // type either way.
    const graph: ReadonlyRecord<string, ReadonlyRecord<string, unknown>> = {
      a: { go: 5 },
    } as const;

    assert.throws(
      // The cast stands for a graph assembled at run time from untyped data.
      // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      () => toMermaid(graph as never),
      /the edge a --go--> leads to something other than state types/u,
    );

    // A sparse array's hole is not a state type either.
    const sparse: ReadonlyRecord<string, ReadonlyRecord<string, unknown>> = {
      // eslint-disable-next-line no-sparse-arrays
      a: { go: ['b', , 'b'] },
      b: {},
    } as const;

    assert.throws(
      // The cast stands for a graph assembled at run time from untyped data.
      // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      () => toMermaid(sparse as never),
      /the edge a --go--> leads to something other than state types/u,
    );
  });
});
