/// <reference no-default-lib="true"/>
/// <reference types="@noshiro/ts-type-utils" />

/// <reference path="./lib.es2015.iterable.d.ts" />
/// <reference path="./lib.es2015.symbol.d.ts" />

interface SymbolConstructor {
  /** A regular expression method that matches the regular expression against a string. Called by the String.prototype.matchAll method. */
  readonly matchAll: unique symbol;
}

interface RegExpStringIterator<T>
  extends IteratorObject<T, BuiltinIteratorReturn, unknown> {
  [Symbol.iterator](): RegExpStringIterator<T>;
}

interface RegExp {
  /**
   * Matches a string with this regular expression, and returns an iterable of matches containing the results of that search.
   *
   * @param string A string to search within.
   */
  [Symbol.matchAll](str: string): RegExpStringIterator<RegExpMatchArray>;
}
