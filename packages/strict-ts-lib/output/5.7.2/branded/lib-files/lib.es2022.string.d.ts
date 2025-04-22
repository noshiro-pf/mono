/// <reference no-default-lib="true"/>
/// <reference types="@noshiro/ts-type-utils" />

interface String {
  /**
   * Returns a new String consisting of the single UTF-16 code unit located at the specified index.
   *
   * @param index The zero-based index of the desired code unit. A negative index will count back from the last item.
   */
  at(index: NumberType.StringSizeArg): string | undefined;
}
