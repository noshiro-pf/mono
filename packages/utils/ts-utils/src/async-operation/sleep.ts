export const sleep = (sec: number): Promise<unknown> =>
  new Promise((resolve) => {
    setTimeout(resolve, sec * 1000);
  });
