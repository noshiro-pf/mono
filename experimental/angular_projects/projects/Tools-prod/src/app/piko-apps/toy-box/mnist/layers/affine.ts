import * as np from '../../../../mylib/numts/num';
import { Layer } from './layer';

export class Affine implements Layer {
  W: np.TNdNum;
  b: np.TNdNum;
  x: np.TNdNum;
  original_x_shape: number[];

  constructor(W: np.TNdNum, b: np.TNdNum) {
    this.W = W;
    this.b = b;
    this.x = [];
    this.original_x_shape = [];

    // # 重み・バイアスパラメータの微分
    // self.dW = None
    // self.db = None
  }

  forward = (x: np.TNdNum): np.TNdNum => {
    // テンソル対応
    this.original_x_shape = np.shapeOf(x);
    x = np.reshape(x, [np.shapeOf(x)[0], -1]);
    this.x = x;
    const dot = np.dot(this.x, this.W);
    return np.add(dot, np.newArray(np.shapeOf(dot)[0], this.b));
  };

  backward = (dout: np.TNdNum): np.TNdNum => {
    return dout;
  };
}

// def backward(self, dout):
//     dx = np.dot(dout, self.W.T)
//     self.dW = np.dot(self.x.T, dout)
//     self.db = np.sum(dout, axis=0)

//     dx = dx.reshape(*self.original_x_shape)  # 入力データの形状に戻す（テンソル対応）
//     return dx
