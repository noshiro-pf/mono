import * as np from '../../../../mylib/numts/num';
import { Layer } from './layer';

export class Relu implements Layer {

  constructor() {}

  forward(x: np.TNdNum): np.TNdNum {
    return np.map( x, e => Math.max(0, e) );
  }

  backward(dout: np.TNdNum): np.TNdNum {
    return np.map( dout, e => Math.max(0, e) );
  }

}
