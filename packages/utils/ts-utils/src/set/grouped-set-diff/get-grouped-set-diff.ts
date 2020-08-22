import {
  filter,
  filterNot,
  intersection,
  mappedSet,
  subtract,
} from '../../set';
import { IGroupedSetDiff, IGroupedSetDiffType } from './grouped-set-diff';

/**
 *
 * @param oldSet 変更前の集合
 * @param newSet 変更後の集合
 * @param idSelector （要素がobjectの場合）要素の同一性判定に使うメンバーを取り出す関数（`e => e.id`など）．
 * idが同じで中身のみ更新されている要素を `updated` の項目とするために使用する．
 * `number`等primitiveの集合である場合は`e => e`をダミーとして用いる（primitiveの場合は `updated` は常に空となる）．
 */
export const getGroupedSetDiff = <A>(
  oldSet: Set<A>,
  newSet: Set<A>,
  idSelector: (e: A) => any = (e) => e
): IGroupedSetDiffType<A> => {
  // TODO: Set.includesの使用を最小限に抑えたアルゴリズムに修正し高速化する
  const oldElements = subtract(oldSet, newSet); // oldSetに存在しnewSetに存在しない要素
  const newElements = subtract(newSet, oldSet); // newSetに存在しoldSetに存在しない要素
  const idsInOldElements = mappedSet(oldElements, idSelector);
  const idsInNewElements = mappedSet(newElements, idSelector);
  const commonIds = intersection(idsInOldElements, idsInNewElements);
  const isUpdatedElement = (e: A): boolean => commonIds.has(idSelector(e));
  const updated = filter(newElements, isUpdatedElement);
  const added = filterNot(newElements, isUpdatedElement);
  const deleted = filterNot(oldElements, isUpdatedElement);
  return IGroupedSetDiff({ deleted, added, updated });
};
