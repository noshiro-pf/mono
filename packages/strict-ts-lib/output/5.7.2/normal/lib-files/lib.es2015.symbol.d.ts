/// <reference no-default-lib="true"/>
/// <reference types="@noshiro/ts-type-utils" />

interface SymbolConstructor {
  /** A reference to the prototype. */
  readonly prototype: Symbol;

  /**
   * Returns a new unique Symbol value.
   *
   * @param description Description of the new Symbol object.
   */
  (description?: string | number): symbol;

  /**
   * Returns a Symbol object from the global symbol registry matching the given key if found. Otherwise, returns a new symbol with this key.
   *
   * @param key Key to search for.
   */
  for(key: string): symbol;

  /**
   * Returns a key from the global symbol registry matching the given Symbol if found. Otherwise, returns a undefined.
   *
   * @param sym Symbol to find the key for.
   */
  keyFor(sym: symbol): string | undefined;
}

declare const Symbol: SymbolConstructor;
