/// <reference no-default-lib="true"/>
/// <reference types="@noshiro/ts-type-utils" />

interface Symbol {
  /**
   * Expose the [[Description]] internal slot of a symbol directly.
   */
  readonly description: string | undefined;
}
