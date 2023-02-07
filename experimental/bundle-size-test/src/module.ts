// eslint-disable-next-line @typescript-eslint/prefer-namespace-keyword
export module M {
  const a = 1;

  export const fn1 = (): void => {
    console.log('moduleA', a);
  };

  const b = 2;

  export const fn2 = (): void => {
    console.log('moduleB', b);
  };
}
