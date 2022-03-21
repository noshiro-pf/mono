/**
 * @description Box-Muller法
 * @param m 平均（デフォルト = 0.0）
 * @param v 標準偏差（デフォルト = 1.0）
 */
export const boxMuller = (m = 0, v = 1): number => {
  const a = 1 - Math.random();
  const b = 1 - Math.random();
  const c = Math.sqrt(-2 * Math.log(a));

  return 0.5 - Math.random() > 0
    ? c * Math.sin(Math.PI * 2 * b) * v + m
    : c * Math.cos(Math.PI * 2 * b) * v + m;
};
