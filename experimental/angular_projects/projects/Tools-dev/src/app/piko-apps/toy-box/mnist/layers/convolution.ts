import * as np from '../../../../mylib/numts/num';
import { utils } from '../../../../mylib/utilities';
import { im2col } from '../functions/im2col';
import { Layer } from './layer';

export class Convolution implements Layer {
  W: np.TNdNum;
  b: np.TNdNum;
  stride: number;
  pad: number;

  x: np.TNdNum | undefined;
  col: number[][] | undefined;
  col_W: np.TNdNum | undefined;

  // dW: any;
  // db: any;

  constructor(W: np.TNdNum, b: np.TNdNum, stride = 1, pad = 0) {
    this.W = W;
    this.b = b;
    this.stride = stride;
    this.pad = pad;

    // 中間データ（backward時に使用）
    this.x = undefined;
    this.col = undefined;
    this.col_W = undefined;

    // 重み・バイアスパラメータの勾配
    // this.dW = undefined;
    // this.db = undefined;
  }

  forward = (x: np.TNdNum): np.TNdNum => {
    const [FN, C, FH, FW] = np.shapeOf(this.W);
    const [N, C_, H, W] = np.shapeOf(x);
    const out_h = 1 + utils.number.divint(H + 2 * this.pad - FH, this.stride);
    const out_w = 1 + utils.number.divint(W + 2 * this.pad - FW, this.stride);
    const col = im2col(x as number[][][][], FH, FW, this.stride, this.pad);
    const col_W = np.transpose(np.reshape(this.W, [FN, -1]), [1, 0]);

    const dot = np.dot(col, col_W); // shape: [121, 30]
    let out = np.add(dot, np.newArray(np.shapeOf(dot)[0], this.b));
    out = np.reshape(out, [N, out_h, out_w, -1]);
    out = np.transpose(out, [0, 3, 1, 2]);
    this.x = x;
    this.col = col;
    this.col_W = col_W;
    return out;
  };

  backward = (dout: np.TNdNum): np.TNdNum => {
    return dout;
  };
}
