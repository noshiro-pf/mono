export const sleep = (milliSec: number): Promise<unknown> =>
  new Promise((resolve) => {
    setTimeout(resolve, milliSec);
  });
