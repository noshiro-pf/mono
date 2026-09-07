export const run = (): number => 1 + 1;

setTimeout(() => {
  run();
}, 1);
