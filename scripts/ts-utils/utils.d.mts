export declare function zeros<N extends SmallUint>(len: N): ArrayOfLength<N, 0>;
export declare function zeros(
  len: PositiveSafeIntWithSmallInt,
): NonEmptyArray<0>;
export declare function zeros(len: number): readonly 0[];
