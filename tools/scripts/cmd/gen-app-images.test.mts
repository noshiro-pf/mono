import { Result } from 'ts-data-forge';
import { squareCorners } from './gen-app-images.mjs';

describe('squareCorners', () => {
  test('takes the radius off the background square', () => {
    const result = squareCorners(
      '<svg><rect width="32" height="32" rx="7" fill="#215db0" /><rect width="9" height="8" rx="2" /></svg>',
    );

    assert.isTrue(Result.isOk(result));

    assert.strictEqual(
      Result.unwrapOkOr(result, ''),
      '<svg><rect width="32" height="32" fill="#215db0" /><rect width="9" height="8" rx="2" /></svg>',
    );
  });

  test('refuses a drawing with no full-size background', () => {
    assert.isTrue(
      Result.isErr(squareCorners('<svg><circle r="16" fill="#000" /></svg>')),
    );
  });
});
