import type { Locator } from '@playwright/test';
import type { DeepReadonly } from 'ts-type-forge';

// Where an element is drawn, for the specs that compare positions.

/** The x of the left edge of what `locator` finds. */
export const leftOf = async (
  locator: DeepReadonly<Locator>,
): Promise<number> => {
  const box = await locator.boundingBox();

  return box === null ? Number.NaN : box.x;
};

/** The x of the right edge of what `locator` finds. */
export const rightOf = async (
  locator: DeepReadonly<Locator>,
): Promise<number> => {
  const box = await locator.boundingBox();

  return box === null ? Number.NaN : box.x + box.width;
};
