export const sleep = (sec: number): Promise<any> =>
  new Promise((resolve) => setTimeout(resolve, sec * 1000));
