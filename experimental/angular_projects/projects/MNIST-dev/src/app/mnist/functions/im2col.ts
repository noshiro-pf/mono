import * as np from '../../mylib/numts/num';
import { utils } from '../../mylib/utilities';

// MNIST: inputData.shape == (1, 1, 28, 28), filter_hw = 5x5
export const im2col = (
  inputData: number[][][][], // （データ数, チャンネル, 高さ, 幅）
  filter_h: number,
  filter_w: number,
  stride = 1,
  padding = 0
): number[][] => {
  const [N, C, H, W] = np.shapeOf(inputData);

  const out_h = utils.number.divint(H + 2 * padding - filter_h, stride) + 1;
  const out_w = utils.number.divint(W + 2 * padding - filter_w, stride) + 1;

  const img = inputData;
  // const img = np.pad(input_data, [(0,0), (0,0), (pad, pad), (pad, pad)], 'constant')
  let col = np.zeros([
    N,
    C,
    filter_h,
    filter_w,
    out_h,
    out_w,
  ]) as number[][][][][][];

  for (let y = 0; y < filter_h; ++y) {
    const y_max = y + stride * out_h;
    for (let x = 0; x < filter_w; ++x) {
      const x_max = x + stride * out_w;
      // col[:, :, y, x, :, :] = img[:, :, y:y_max:stride, x:x_max:stride]
      for (let j = 0; j < N; ++j) {
        for (let i = 0; i < C; ++i) {
          col[j][i][y][x] = np.slice(img[j][i], [
            { begin: y, end: y_max, stride },
            { begin: x, end: x_max, stride },
          ]) as number[][];
        }
      }
    }
  }

  col = np.transpose(col, [0, 4, 5, 1, 2, 3]) as number[][][][][][];
  const result = np.reshape(col, [N * out_h * out_w, -1]) as number[][];

  return result;
};
