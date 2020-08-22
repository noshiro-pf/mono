import { IGroupedSetDiffType } from './grouped-set-diff';
/**
 *
 * @param oldSet 変更前の集合
 * @param newSet 変更後の集合
 * @param idSelector （要素がobjectの場合）要素の同一性判定に使うメンバーを取り出す関数（`e => e.id`など）．
 * idが同じで中身のみ更新されている要素を `updated` の項目とするために使用する．
 * `number`等primitiveの集合である場合は`e => e`をダミーとして用いる（primitiveの場合は `updated` は常に空となる）．
 */
export declare const getGroupedSetDiff: <A>(oldSet: Set<A>, newSet: Set<A>, idSelector?: (e: A) => any) => IGroupedSetDiffType<A>;
//# sourceMappingURL=get-grouped-set-diff.d.ts.map