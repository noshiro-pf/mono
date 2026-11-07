import { Result } from 'ts-data-forge';
import { checkSynstateDomPlacement } from './check-synstate-dom-placement.mjs';

describe(checkSynstateDomPlacement, () => {
  test('finds every page of the committed tree current', async () => {
    const result = await checkSynstateDomPlacement();

    assert.deepStrictEqual(result, Result.ok(8));
  });
});
