import * as np from '../../mylib/numts/num';

/* (Python)
def softmax(x):
    if x.ndim == 2:
        x = x.T
        x = x - np.max(x, axis=0)
        y = np.exp(x) / np.sum(np.exp(x), axis=0)
        return y.T

    x = x - np.max(x) # オーバーフロー対策
    return np.exp(x) / np.sum(np.exp(x))
 */

export const softmax = (x: np.TNdNum) => {
  if (np.dim(x) === 2) {
    let x1 = np.transpose(x, [1, 0]);
    x1 = np.sub(x1, np.max(x1, 0));
    const y = np.div(np.exp(x1), np.sum(np.exp(x1), 0));
    return np.transpose(y, [1, 0]);
  }
  if (np.dim(x) !== 1) throw new Error('x must be 1d-array');
  const max = np.max(x, 0) as number;
  np.updateValue(x, (e) => e - max); // オーバーフロー対策
  const sum = np.sum(np.exp(x)) as number;
  return np.map(np.exp(x), (e) => e / sum);
};
