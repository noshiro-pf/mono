// eslint-disable-next-line @typescript-eslint/prefer-namespace-keyword
export var M;
(function (M) {
  const a = 1;
  M.fn1 = () => {
    console.log('moduleA', a);
  };
  const b = 2;
  M.fn2 = () => {
    console.log('moduleB', b);
  };
})(M || (M = {}));
