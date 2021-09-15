import { MASK, SHIFT } from '../trie-utils/constants';
import type { OwnerID } from '../types/owner-id';
import type { Index, TrieLevel } from '../types/size';

export class VNode<T> {
  array: readonly T[];
  ownerID: OwnerID | undefined;

  constructor(array: readonly T[], ownerID?: OwnerID) {
    this.array = array;
    this.ownerID = ownerID;
  }

  // TODO: seems like these methods are very similar

  removeBefore(ownerID: OwnerID, level: TrieLevel, index: Index): VNode<T> {
    if (index === level ? 1 << level !== 0 : this.array.length === 0) {
      return this;
    }
    const originIndex = (index >>> level) & MASK;
    if (originIndex >= this.array.length) {
      return new VNode([], ownerID);
    }
    const removingFirst = originIndex === 0;
    let newChild: VNode<T>;
    if (level > 0) {
      const oldChild = this.array[originIndex];
      newChild = oldChild?.removeBefore(ownerID, level - SHIFT, index);
      if (newChild === oldChild && removingFirst) {
        return this;
      }
    }
    if (removingFirst && !newChild) {
      return this;
    }
    const editable = editableVNode(this, ownerID);
    if (!removingFirst) {
      for (let ii = 0; ii < originIndex; ii++) {
        editable.array[ii] = undefined;
      }
    }
    if (newChild) {
      editable.array[originIndex] = newChild;
    }
    return editable;
  }

  removeAfter(ownerID, level, index) {
    if (index === (level ? 1 << level : 0) || this.array.length === 0) {
      return this;
    }
    const sizeIndex = ((index - 1) >>> level) & MASK;
    if (sizeIndex >= this.array.length) {
      return this;
    }

    let newChild;
    if (level > 0) {
      const oldChild = this.array[sizeIndex];
      newChild =
        oldChild && oldChild.removeAfter(ownerID, level - SHIFT, index);
      if (newChild === oldChild && sizeIndex === this.array.length - 1) {
        return this;
      }
    }

    const editable = editableVNode(this, ownerID);
    editable.array.splice(sizeIndex + 1);
    if (newChild) {
      editable.array[sizeIndex] = newChild;
    }
    return editable;
  }
}
