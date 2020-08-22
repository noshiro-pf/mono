export declare type GroupedSetDiffKeyType = 'deleted' | 'added' | 'updated';
declare type GroupedSetDiff<T> = {
    [key in GroupedSetDiffKeyType]: Set<T>;
};
export declare type IGroupedSetDiffType<T> = Map<GroupedSetDiffKeyType, Set<T>>;
export declare const IGroupedSetDiff: <T>({ deleted, added, updated, }: Partial<GroupedSetDiff<T>>) => IGroupedSetDiffType<T>;
export {};
//# sourceMappingURL=grouped-set-diff.d.ts.map