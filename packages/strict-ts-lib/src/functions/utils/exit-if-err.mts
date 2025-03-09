import 'zx/globals';

export const exitIfErr = (res: 'ok' | 'err'): void => {
  if (res === 'err') {
    // eslint-disable-next-line unicorn/no-process-exit
    process.exit(1);
  }
};
