import * as np from '../../mylib/numts/num';
import { Affine } from '../layers/affine';
import { Convolution } from '../layers/convolution';
import { Layer } from '../layers/layer';
import { Pooling } from '../layers/pooling';
import { Relu } from '../layers/relu';

/**
 * @desc conv - relu - pool - affine - relu - affine - softmax
 * @param inputSize : 入力サイズ（MNISTの場合は784）
 * @param hiddenSize : 隠れ層のニューロンの数のリスト（e.g. [100, 100, 100]）
 * @param outputSize : 出力サイズ（MNISTの場合は10）
 * activation : 'relu' or 'sigmoid'
 * @param weightInitStd : 重みの標準偏差を指定（e.g. 0.01）
 *  'relu'または'he'を指定した場合は「Heの初期値」を設定
 *  'sigmoid'または'xavier'を指定した場合は「Xavierの初期値」を設定
 */

export class SimpleConvNet {
  filterNum: number;
  filterSize: number;
  filterPadding: number;
  fitlerStride: number;

  hiddenSize: number;
  outputSize: number;
  weightInitStd: number;

  inputSize: number;
  convOutputSize: number;
  poolOutputSize: number;

  params!: {
    W1: np.TNdNum;
    b1: np.TNdNum;
    W2: np.TNdNum;
    b2: np.TNdNum;
    W3: np.TNdNum;
    b3: np.TNdNum;
  };

  layers: Layer[] = [];

  constructor(
    inputDim: [number, number, number] = [1, 28, 28],
    convParams = {
      filterNum: 30,
      filterSize: 5,
      padding: 0,
      stride: 1,
    },
    hiddenSize: number = 100,
    outputSize: number = 10,
    weightInitStd: number = 0.01
  ) {
    this.filterNum = convParams.filterNum;
    this.filterSize = convParams.filterSize;
    this.filterPadding = convParams.padding;
    this.fitlerStride = convParams.stride;

    this.hiddenSize = hiddenSize;
    this.outputSize = outputSize;
    this.weightInitStd = weightInitStd;

    this.inputSize = inputDim[1];

    this.convOutputSize = Math.round(
      (this.inputSize - this.filterSize + 2 * this.filterPadding) /
        this.fitlerStride +
        1
    );

    this.poolOutputSize = Math.round(
      this.filterNum * (this.convOutputSize / 2) * (this.convOutputSize / 2)
    );

    // 重みの初期化
    this.params = {
      W1: np.map(
        np.random.randn([
          this.filterNum,
          inputDim[0],
          this.filterSize,
          this.filterSize,
        ]),
        (e) => e * weightInitStd
      ),
      b1: np.zeros([this.filterNum]),
      W2: np.map(
        np.random.randn([this.poolOutputSize, hiddenSize]),
        (e) => e * weightInitStd
      ),
      b2: np.zeros([this.hiddenSize]),
      W3: np.map(
        np.random.randn([hiddenSize, outputSize]),
        (e) => e * weightInitStd
      ),
      b3: np.zeros([this.outputSize]),
    };

    // レイヤの生成
    this.layers = [];

    this.layers.push(
      new Convolution(
        this.params.W1,
        this.params.b1,
        convParams.stride,
        convParams.padding
      )
    );

    this.layers.push(new Relu());

    this.layers.push(new Pooling(2, 2, 2));

    this.layers.push(new Affine(this.params.W2, this.params.b2));

    this.layers.push(new Relu());

    this.layers.push(new Affine(this.params.W3, this.params.b3));

    // this.lastLayer = new SoftmaxWithLoss()
  }

  predict = (x: np.TNdNum): np.TNdNum => {
    let result = np.deepCopy(x);
    for (const layer of this.layers) {
      result = layer.forward(result);
    }
    return result;
  };

  loadParams = (params: any) => {
    this.params.W1 = params.W1;
    this.params.W2 = params.W2;
    this.params.W3 = params.W3;
    this.params.b1 = params.b1;
    this.params.b2 = params.b2;
    this.params.b3 = params.b3;

    (this.layers[0] as Convolution).W = this.params.W1;
    (this.layers[0] as Convolution).b = this.params.b1;
    (this.layers[3] as Affine).W = this.params.W2;
    (this.layers[3] as Affine).b = this.params.b2;
    (this.layers[5] as Affine).W = this.params.W3;
    (this.layers[5] as Affine).b = this.params.b3;
  };
}
