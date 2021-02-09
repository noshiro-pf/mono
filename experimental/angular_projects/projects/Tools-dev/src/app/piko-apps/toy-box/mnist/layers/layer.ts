import * as np from '../../../../mylib/numts/num';

export interface Layer {
  forward: (tensor: np.TNdNum) => np.TNdNum;
  backward: (tensor: np.TNdNum) => np.TNdNum;
}
