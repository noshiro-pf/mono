import dedent from 'dedent';
import { toMermaid } from 'ts-fsm-forge';
import { fetchMachine } from './00-fetch-machine.mjs';

if (import.meta.vitest !== undefined) {
  test('toMermaid', () => {
    // embed-sample-code-ignore-above
    assert.strictEqual(
      toMermaid(fetchMachine.graph, { initial: 'idle' }),
      dedent`
        stateDiagram-v2
          state "idle" as s0
          state "loading" as s1
          state "success" as s2
          state "failure" as s3
          [*] --> s0
          s0 --> s1: fetch
          s1 --> s2: resolve
          s1 --> s3: reject
          s1 --> s0: reset
          s2 --> s1: fetch
          s2 --> s0: reset
          s3 --> s1: fetch
          s3 --> s0: reset
      `,
    );
    // embed-sample-code-ignore-below
  });
}
