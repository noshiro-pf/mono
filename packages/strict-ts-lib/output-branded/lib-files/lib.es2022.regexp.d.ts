/// <reference no-default-lib="true"/>
/// <reference types="@noshiro/ts-type-utils" />

interface RegExpMatchArray {
  readonly indices?: RegExpIndicesArray;
}

interface RegExpExecArray {
  readonly indices?: RegExpIndicesArray;
}

interface RegExpIndicesArray
  extends Array<readonly [NumberType.ArraySize, NumberType.ArraySize]> {
  readonly groups?: {
    readonly [key: string]: readonly [
      NumberType.ArraySize,
      NumberType.ArraySize,
    ];
  };
}

interface RegExp {
  /** Returns a Boolean value indicating the state of the hasIndices flag (d) used with a regular expression. Default is false. Read-only. */
  readonly hasIndices: boolean;
}
