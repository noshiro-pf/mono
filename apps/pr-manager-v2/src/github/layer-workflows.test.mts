import {
  ok,
  readContextOf,
  recordedTransport,
  status,
} from 'pr-report-core-v2';
import { Result } from 'ts-data-forge';
import { layerWorkflowsOf, readLayerWorkflows } from './layer-workflows.mjs';

describe(readLayerWorkflows, () => {
  const PATH = '/repos/o/n/contents/.github/unblock-prs.json';

  const read = async (
    answer: ReturnType<typeof ok>,
  ): ReturnType<typeof readLayerWorkflows> =>
    readLayerWorkflows(
      readContextOf({
        transport: recordedTransport({ [PATH]: answer }).transport,
        owner: 'o',
        name: 'n',
        token: 't',
      }),
    );

  test('reads the speculate workflows of the configuration, given in base64', async () => {
    const text = JSON.stringify({
      regenerate: { command: 'pnpm run gen — ✓' },
      speculate: {
        workflows: ['code-check.yml', 'style-check.yml', 'code-check.yml'],
        depth: 2,
      },
    });

    assert.deepStrictEqual(
      Result.unwrapThrow(
        await read(
          ok({
            content: Buffer.from(text)
              .toString('base64')
              .replaceAll(/.{60}/gu, '$&\n'),
            encoding: 'base64',
          }),
        ),
      ),
      ['code-check.yml', 'style-check.yml'],
    );
  });

  test('reads none where the configuration is not there', async () => {
    assert.deepStrictEqual(
      Result.unwrapThrow(await read(status(404, 'Not Found'))),
      [],
    );
  });

  test('fails on another refusal', async () => {
    assert.isTrue(Result.isErr(await read(status(403, 'Forbidden'))));
  });
});

describe(layerWorkflowsOf, () => {
  test('reads none from a configuration that says nothing of checking ahead', () => {
    assert.deepStrictEqual(Result.unwrapThrow(layerWorkflowsOf('{}')), []);
  });

  test('fails on text that is not the configuration', () => {
    for (const text of ['{', '{"speculate":{"workflows":"code-check.yml"}}']) {
      assert.isTrue(Result.isErr(layerWorkflowsOf(text)));
    }
  });
});
