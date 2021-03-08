import * as np from '../../../../mylib/numts/num';
import { im2col } from '../functions/im2col';
import { Layer } from './layer';

export class Pooling implements Layer {
  pool_h: number;
  pool_w: number;
  stride: number;
  padding: number;
  x: np.TNdNum | undefined;
  // argMax: number|undefined;

  constructor(
    pool_h: number,
    pool_w: number,
    stride: number = 1,
    padding: number = 0
  ) {
    this.pool_h = pool_h;
    this.pool_w = pool_w;
    this.stride = stride;
    this.padding = padding;
    this.x = undefined;
    // this.argMax = undefined;
  }

  forward = (x: np.TNdNum): np.TNdNum => {
    const [N, C, H, W] = np.shapeOf(x);
    const out_h = Math.floor(1 + (H - this.pool_h) / this.stride);
    const out_w = Math.floor(1 + (W - this.pool_w) / this.stride);
    let col = im2col(
      x as number[][][][],
      this.pool_h,
      this.pool_w,
      this.stride,
      this.padding
    );

    col = np.reshape(col, [-1, this.pool_h * this.pool_w]) as number[][];
    // this.argMax = np.argmax(col, 1);
    let out = np.max(col, 1);
    out = np.reshape(out, [N, out_h, out_w, C]);
    out = np.transpose(out, [0, 3, 1, 2]);
    this.x = x;
    return out;
  };

  backward = (dout: np.TNdNum): np.TNdNum => {
    return dout;
  };
}
