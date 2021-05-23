/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { NOT_SET } from '../TrieUtils';
import { updateIn } from './updateIn';

export function removeIn(collection, keyPath) {
  return updateIn(collection, keyPath, () => NOT_SET);
}
