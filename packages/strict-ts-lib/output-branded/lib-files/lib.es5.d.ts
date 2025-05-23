/// <reference no-default-lib="true"/>
/// <reference types="@noshiro/ts-type-utils" />

/// <reference path="./lib.decorators.d.ts" />
/// <reference path="./lib.decorators.legacy.d.ts" />

/////////////////////////////
/// ECMAScript APIs
/////////////////////////////

declare const NaN: NaNType;
declare const Infinity: POSITIVE_INFINITY;

/**
 * Evaluates JavaScript code and executes it.
 *
 * @param x A String value that contains valid JavaScript code.
 * @deprecated
 */
declare function eval(x: string): unknown;

/**
 * Converts a string to an integer.
 *
 * @param string A string to convert into a number.
 * @param radix A value between 2 and 36 that specifies the base of the number in `string`. If this argument is not supplied, strings with a prefix of '0x' are considered hexadecimal. All other strings are considered decimal.
 */
declare function parseInt(
  string: string,
  radix?: UintRange<2, 37>,
): Int | NaNType;

/**
 * Converts a string to a floating-point number.
 *
 * @param string A string that contains a floating-point number.
 */
declare function parseFloat(string: string): number | NaNType;

/**
 * Returns a Boolean value that indicates whether a value is the reserved value NaN (not a number).
 *
 * @param number A numeric value.
 * @deprecated Use `Number.isNaN` instead.
 */
declare function isNaN(number: number): boolean;

/**
 * Determines whether a supplied number is finite.
 *
 * @param number Any numeric value.
 * @deprecated Use `Number.isFinite` instead.
 */
declare function isFinite(number: number): boolean;

/**
 * Gets the unencoded version of an encoded Uniform Resource Identifier (URI).
 *
 * @param encodedURI A value representing an encoded URI.
 */
declare function decodeURI(encodedURI: string): string;

/**
 * Gets the unencoded version of an encoded component of a Uniform Resource Identifier (URI).
 *
 * @param encodedURIComponent A value representing an encoded URI component.
 */
declare function decodeURIComponent(encodedURIComponent: string): string;

/**
 * Encodes a text string as a valid Uniform Resource Identifier (URI)
 *
 * @param uri A value representing an unencoded URI.
 */
declare function encodeURI(uri: string): string;

/**
 * Encodes a text string as a valid component of a Uniform Resource Identifier (URI).
 *
 * @param uriComponent A value representing an unencoded URI component.
 */
declare function encodeURIComponent(
  uriComponent: string | number | boolean,
): string;

/**
 * Computes a new string in which certain characters have been replaced by a hexadecimal escape sequence.
 *
 * @deprecated A legacy feature for browser compatibility
 * @param string A string value
 */
declare function escape(string: string): string;

/**
 * Computes a new string in which hexadecimal escape sequences are replaced with the character that it represents.
 *
 * @deprecated A legacy feature for browser compatibility
 * @param string A string value
 */
declare function unescape(string: string): string;

interface Symbol {
  /** Returns a string representation of an object. */
  toString(): string;

  /** Returns the primitive value of the specified object. */
  valueOf(): symbol;
}

// This is already defined in ts-type-utils.
// declare type PropertyKey = string | number | symbol;

interface PropertyDescriptor {
  readonly configurable?: boolean;
  readonly enumerable?: boolean;
  readonly value?: unknown;
  readonly writable?: boolean;
  get?(): unknown;
  set?(v: unknown): void;
}

interface PropertyDescriptorMap {
  readonly [key: PropertyKey]: PropertyDescriptor;
}

interface Object {
  /** The initial value of Object.prototype.constructor is the standard built-in Object constructor. */
  readonly constructor: Function;

  /** Returns a string representation of an object. */
  toString(): string;

  /** Returns a date converted to a string using the current locale. */
  toLocaleString(): string;

  /** Returns the primitive value of the specified object. */
  valueOf(): Object;

  /**
   * Determines whether an object has a property with the specified name.
   *
   * @param v A property name.
   */
  hasOwnProperty(v: PropertyKey): boolean;

  /**
   * Determines whether an object exists in another object's prototype chain.
   *
   * @param v Another object whose prototype chain is to be checked.
   */
  isPrototypeOf(v: Object): boolean;

  /**
   * Determines whether a specified property is enumerable.
   *
   * @param v A property name.
   */
  propertyIsEnumerable(v: PropertyKey): boolean;
}

interface ObjectConstructor {
  /** @deprecated Don't use Object constructor */
  new (value?: unknown): Object;
  /** @deprecated Don't use Object constructor */
  (): unknown;
  /** @deprecated Don't use Object constructor */
  (value: unknown): unknown;

  /** A reference to the prototype for a class of objects. */
  readonly prototype: Object;

  /**
   * Returns the prototype of an object.
   *
   * @param o The object that references the prototype.
   */
  getPrototypeOf(o: unknown): unknown;

  /**
   * Gets the own property descriptor of the specified object. An own property descriptor is one that is defined directly on the object and is not inherited from the object's prototype.
   *
   * @param o Object that contains the property.
   * @param p Name of the property.
   */
  getOwnPropertyDescriptor(
    o: unknown,
    p: PropertyKey,
  ): PropertyDescriptor | undefined;

  /**
   * Returns the names of the own properties of an object. The own properties of an object are those that are defined directly on that object, and are not inherited from the object's prototype. The properties of an object include both fields (objects) and functions.
   *
   * @param o Object that contains the own properties.
   */
  getOwnPropertyNames(o: unknown): readonly string[];

  /**
   * Creates an object that has the specified prototype or that has null prototype.
   *
   * @param o Object to use as a prototype. May be null.
   */
  create(o: object | null): unknown;

  /**
   * Creates an object that has the specified prototype, and that optionally contains specified properties.
   *
   * @param o Object to use as a prototype. May be null
   * @param properties JavaScript object that contains one or more property descriptors.
   */
  create(
    o: object | null,
    properties: PropertyDescriptorMap & ThisType<unknown>,
  ): unknown;

  /**
   * Adds a property to an object, or modifies attributes of an existing property.
   *
   * @param o Object on which to add or modify the property. This can be a native JavaScript object (that is, a user-defined object or a built in object) or a DOM object.
   * @param p The property name.
   * @param attributes Descriptor for the property. It can be for a data property or an accessor property.
   */
  defineProperty<T>(
    o: T,
    p: PropertyKey,
    attributes: PropertyDescriptor & ThisType<unknown>,
  ): T;

  /**
   * Adds one or more properties to an object, and/or modifies attributes of existing properties.
   *
   * @param o Object on which to add or modify the properties. This can be a native JavaScript object or a DOM object.
   * @param properties JavaScript object that contains one or more descriptor objects. Each descriptor object describes a data property or an accessor property.
   */
  defineProperties<T>(
    o: T,
    properties: PropertyDescriptorMap & ThisType<unknown>,
  ): T;

  /**
   * Prevents the modification of attributes of existing properties, and prevents the addition of new properties.
   *
   * @param o Object on which to lock the attributes.
   */
  seal<T>(o: T): T;

  /**
   * Prevents the modification of existing property attributes and values, and prevents the addition of new properties.
   *
   * @param f Object on which to lock the attributes.
   */
  freeze<T extends Function>(f: T): T;

  /**
   * Prevents the modification of existing property attributes and values, and prevents the addition of new properties.
   *
   * @param o Object on which to lock the attributes.
   */
  freeze<
    T extends { readonly [idx: string]: U | null | undefined | object },
    U extends string | bigint | number | boolean | symbol,
  >(
    o: T,
  ): Readonly<T>;

  /**
   * Prevents the modification of existing property attributes and values, and prevents the addition of new properties.
   *
   * @param o Object on which to lock the attributes.
   */
  freeze<T>(o: T): Readonly<T>;

  /**
   * Prevents the addition of new properties to an object.
   *
   * @param o Object to make non-extensible.
   */
  preventExtensions<T>(o: T): T;

  /**
   * Returns true if existing property attributes cannot be modified in an object and new properties cannot be added to the object.
   *
   * @param o Object to test.
   */
  isSealed(o: unknown): boolean;

  /**
   * Returns true if existing property attributes and values cannot be modified in an object, and new properties cannot be added to the object.
   *
   * @param o Object to test.
   */
  isFrozen(o: unknown): boolean;

  /**
   * Returns a value that indicates whether new properties can be added to an object.
   *
   * @param o Object to test.
   */
  isExtensible(o: unknown): boolean;

  /**
   * Returns the names of the enumerable string properties and methods of an object.
   *
   * @param o Object that contains the properties and methods. This can be an object that you created or an existing Document Object Model (DOM) object.
   *
   * @example
   * ```ts
   * const ks = Object.keys({ x: 1, y: 2, z: '3', 3: 4 }); // ('3' | 'x' | 'y' | 'z' | (string & {}))[]
   * ```
   */
  keys<const R extends UnknownRecord>(
    object: R,
  ): readonly StrictLibInternals.ToObjectKeys<R>[];
}

/** Provides functionality common to all JavaScript objects. */
declare const Object: ObjectConstructor;

/** Creates a new function. */
interface Function {
  /**
   * Calls the function, substituting the specified object for the this value of the function, and the specified array for the arguments of the function.
   *
   * @param thisArg The object to be used as the this object.
   * @param argArray A set of arguments to be passed to the function.
   */
  apply(this: Function, thisArg: unknown, argArray?: unknown): unknown;

  /**
   * Calls a method of an object, substituting another object for the current object.
   *
   * @param thisArg The object to be used as the current object.
   * @param argArray A list of arguments to be passed to the method.
   */
  call(
    this: Function,
    thisArg: unknown,
    ...argArray: readonly unknown[]
  ): unknown;

  /**
   * For a given function, creates a bound function that has the same body as the original function. The this object of the bound function is associated with the specified object, and has the specified initial parameters.
   *
   * @param thisArg An object to which the this keyword can refer inside the new function.
   * @param argArray A list of arguments to be passed to the new function.
   */
  bind(
    this: Function,
    thisArg: unknown,
    ...argArray: readonly unknown[]
  ): unknown;

  /** Returns a string representation of a function. */
  toString(): string;

  readonly prototype: unknown;
  readonly length: number;

  // Non-standard extensions
  readonly arguments: unknown;
  readonly caller: Function;
}

interface FunctionConstructor {
  /**
   * Creates a new function.
   *
   * @param args A list of arguments the function accepts.
   * @deprecated Don't use Function constructor
   */
  new (...args: readonly string[]): Function;
  /** @deprecated Don't use Function constructor */
  (...args: readonly string[]): Function;
  readonly prototype: Function;
}

declare const Function: FunctionConstructor;

/** Extracts the type of the 'this' parameter of a function type, or 'unknown' if the function type has no 'this' parameter. */
type ThisParameterType<T> = T extends (this: infer U, ...args: never) => unknown
  ? U
  : unknown;

/** Removes the 'this' parameter from a function type. */
type OmitThisParameter<T> =
  unknown extends ThisParameterType<T>
    ? T
    : T extends (...args: infer A) => infer R
      ? (...args: A) => R
      : T;

interface CallableFunction extends Function {
  /**
   * Calls the function with the specified object as the this value and the elements of specified array as the arguments.
   *
   * @param thisArg The object to be used as the this object.
   */
  apply<T, R>(this: (this: T) => R, thisArg: T): R;

  /**
   * Calls the function with the specified object as the this value and the elements of specified array as the arguments.
   *
   * @param thisArg The object to be used as the this object.
   * @param args An array of argument values to be passed to the function.
   */
  apply<T, A extends readonly unknown[], R>(
    this: (this: T, ...args: A) => R,
    thisArg: T,
    args: A,
  ): R;

  /**
   * Calls the function with the specified object as the this value and the specified rest arguments as the arguments.
   *
   * @param thisArg The object to be used as the this object.
   * @param args Argument values to be passed to the function.
   */
  call<T, A extends readonly unknown[], R>(
    this: (this: T, ...args: A) => R,
    thisArg: T,
    ...args: A
  ): R;

  /**
   * For a given function, creates a bound function that has the same body as the original function. The this object of the bound function is associated with the specified object, and has the specified initial parameters.
   *
   * @param thisArg The object to be used as the this object.
   */
  bind<T>(this: T, thisArg: ThisParameterType<T>): OmitThisParameter<T>;

  /**
   * For a given function, creates a bound function that has the same body as the original function. The this object of the bound function is associated with the specified object, and has the specified initial parameters.
   *
   * @param thisArg The object to be used as the this object.
   * @param args Arguments to bind to the parameters of the function.
   */
  bind<T, A extends readonly unknown[], B extends readonly unknown[], R>(
    this: (this: T, ...args: readonly [...A, ...B]) => R,
    thisArg: T,
    ...args: A
  ): (...args: B) => R;
}

interface NewableFunction extends Function {
  /**
   * Calls the function with the specified object as the this value and the elements of specified array as the arguments.
   *
   * @param thisArg The object to be used as the this object.
   */
  apply<T>(this: new () => T, thisArg: T): void;
  /**
   * Calls the function with the specified object as the this value and the elements of specified array as the arguments.
   *
   * @param thisArg The object to be used as the this object.
   * @param args An array of argument values to be passed to the function.
   */
  apply<T, A extends readonly unknown[]>(
    this: new (...args: A) => T,
    thisArg: T,
    args: A,
  ): void;

  /**
   * Calls the function with the specified object as the this value and the specified rest arguments as the arguments.
   *
   * @param thisArg The object to be used as the this object.
   * @param args Argument values to be passed to the function.
   */
  call<T, A extends readonly unknown[]>(
    this: new (...args: A) => T,
    thisArg: T,
    ...args: A
  ): void;

  /**
   * For a given function, creates a bound function that has the same body as the original function. The this object of the bound function is associated with the specified object, and has the specified initial parameters.
   *
   * @param thisArg The object to be used as the this object.
   */
  bind<T>(this: T, thisArg: unknown): T;

  /**
   * For a given function, creates a bound function that has the same body as the original function. The this object of the bound function is associated with the specified object, and has the specified initial parameters.
   *
   * @param thisArg The object to be used as the this object.
   * @param args Arguments to bind to the parameters of the function.
   */
  bind<A extends readonly unknown[], B extends readonly unknown[], R>(
    this: new (...args: readonly [...A, ...B]) => R,
    thisArg: unknown,
    ...args: A
  ): new (...args: B) => R;
}

interface IArguments {
  readonly [index: number]: unknown;
  readonly length: number;
  readonly callee: Function;
}

interface String {
  /** Returns a string representation of a string. */
  toString(): string;

  /**
   * Returns the character at the specified index.
   *
   * @param pos The zero-based index of the desired character.
   * @deprecated Prefer `String#at(...)` over `String#charAt(...)`. eslint(unicorn/prefer-at)
   */
  charAt(pos: NumberType.StringSizeArg): string;

  /**
   * Returns the Unicode value of the character at the specified location.
   *
   * @param index The zero-based index of the desired character. If there is no character at the specified index, NaN is returned.
   */
  charCodeAt(index: NumberType.StringSizeArg): number;

  /**
   * Returns a string that contains the concatenation of two or more strings.
   *
   * @param strings The strings to append to the end of the string.
   * @deprecated Prefer the spread operator over `Array#concat(...)`. eslint(unicorn/prefer-spread)
   */
  concat(...strings: readonly string[]): string;

  /**
   * Returns the position of the first occurrence of a substring.
   *
   * @param searchString The substring to search for in the string
   * @param position The index at which to begin searching the String object. If omitted, search starts at the beginning of the string.
   */
  indexOf(
    searchString: string,
    position?: NumberType.StringSizeArgNonNegative,
  ): NumberType.StringSearchResult;

  /**
   * Returns the last occurrence of a substring in the string.
   *
   * @param searchString The substring to search for.
   * @param position The index at which to begin searching. If omitted, the search begins at the end of the string.
   */
  lastIndexOf(
    searchString: string,
    position?: NumberType.StringSizeArgNonNegative,
  ): NumberType.StringSearchResult;

  /**
   * Determines whether two strings are equivalent in the current locale.
   *
   * @param that String to compare to target string
   */
  localeCompare(that: string): number;

  /**
   * Matches a string with a regular expression, and returns an array containing the results of that search.
   *
   * @param regexp A variable name or string literal containing the regular expression pattern and flags.
   */
  match(regexp: string | RegExp): RegExpMatchArray | null;

  /**
   * Replaces text in a string, using a regular expression or search string.
   *
   * @param searchValue A string or regular expression to search for.
   * @param replaceValue A string containing the text to replace. When the {@linkcode searchValue} is a `RegExp`, all matches are replaced if the `g` flag is set (or only those matches at the beginning, if the `y` flag is also present). Otherwise, only the first match of {@linkcode searchValue} is replaced.
   */
  replace(searchValue: string | RegExp, replaceValue: string): string;

  /**
   * Replaces text in a string, using a regular expression or search string.
   *
   * @param searchValue A string to search for.
   * @param replacer A function that returns the replacement text.
   */
  replace(
    searchValue: string | RegExp,
    replacer: (substring: string, ...args: readonly unknown[]) => string,
  ): string;

  /**
   * Finds the first substring match in a regular expression search.
   *
   * @param regexp The regular expression pattern and applicable flags.
   */
  search(regexp: string | RegExp): NumberType.StringSearchResult;

  /**
   * Returns a section of a string.
   *
   * @param start The index to the beginning of the specified portion of stringObj.
   * @param end The index to the end of the specified portion of stringObj. The substring includes the characters up to, but not including, the character indicated by end. If this value is not specified, the substring continues to the end of stringObj.
   */
  slice(
    start?: NumberType.StringSizeArg,
    end?: NumberType.StringSizeArg,
  ): string;

  /**
   * Split a string into substrings using the specified separator and return them as an array.
   *
   * @param separator A string that identifies character or characters to use in separating the string. If omitted, a single-element array containing the entire string is returned.
   * @param limit A value used to limit the number of elements returned in the array.
   */
  split(
    separator: string | RegExp,
    limit?: NumberType.StringSizeArgNonNegative,
  ): readonly string[];

  /**
   * Returns the substring at the specified location within a String object.
   *
   * @param start The zero-based index number indicating the beginning of the substring.
   * @param end Zero-based index number indicating the end of the substring. The substring includes the characters up to, but not including, the character indicated by end. If end is omitted, the characters from start through the end of the original string are returned.
   */
  substring(
    start: NumberType.StringSizeArgNonNegative,
    end?: NumberType.StringSizeArgNonNegative,
  ): string;

  /** Converts all the alphabetic characters in a string to lowercase. */
  toLowerCase(): string;

  /** Converts all alphabetic characters to lowercase, taking into account the host environment's current locale. */
  toLocaleLowerCase(locales?: string | readonly string[]): string;

  /** Converts all the alphabetic characters in a string to uppercase. */
  toUpperCase(): string;

  /** Returns a string where all alphabetic characters have been converted to uppercase, taking into account the host environment's current locale. */
  toLocaleUpperCase(locales?: string | readonly string[]): string;

  /** Removes the leading and trailing white space and line terminator characters from a string. */
  trim(): string;

  /** Returns the length of a String object. */
  readonly length: NumberType.StringSize;

  // IE extensions
  /**
   * Gets a substring beginning at the specified location and having the specified length.
   *
   * @deprecated A legacy feature for browser compatibility
   * @param from The starting position of the desired substring. The index of the first character in the string is zero.
   * @param length The number of characters to include in the returned substring.
   */
  substr(
    from: NumberType.StringSizeArgNonNegative,
    length?: NumberType.StringSizeArgNonNegative,
  ): string;

  /** Returns the primitive value of the specified object. */
  valueOf(): string;

  readonly [index: number]: string;
}

interface StringConstructor {
  /** @deprecated Don't use String constructor */
  new (value?: unknown): String;
  /** @deprecated Don't use String constructor */
  (value?: unknown): string;
  readonly prototype: String;
  fromCharCode(...codes: readonly number[]): string;
}

/** Allows manipulation and formatting of text strings and determination and location of substrings within strings. */
declare const String: StringConstructor;

interface Boolean {
  /** Returns the primitive value of the specified object. */
  valueOf(): boolean;
}

interface BooleanConstructor {
  /** @deprecated Don't use Boolean constructor */
  new (value?: unknown): Boolean;
  /** @deprecated Don't use Boolean constructor */
  <T>(value?: T): boolean;
  readonly prototype: Boolean;
}

declare const Boolean: BooleanConstructor;

interface Number {
  /**
   * Returns a string representation of an object.
   *
   * @param radix Specifies a radix for converting numeric values to strings. This value is only used for numbers.
   */
  toString(radix?: UintRange<2, 37>): string;

  /**
   * Returns a string representing a number in fixed-point notation.
   *
   * @param fractionDigits Number of digits after the decimal point. Must be in the range 0 - 20, inclusive.
   */
  toFixed(fractionDigits?: UintRange<0, 101>): string;

  /**
   * Returns a string containing a number represented in exponential notation.
   *
   * @param fractionDigits Number of digits after the decimal point. Must be in the range 0 - 20, inclusive.
   */
  toExponential(fractionDigits?: UintRange<1, 101>): string;

  /**
   * Returns a string containing a number represented either in exponential or fixed-point notation with a specified number of digits.
   *
   * @param precision Number of significant digits. Must be in the range 1 - 21, inclusive.
   */
  toPrecision(precision?: UintRange<1, 101>): string;

  /** Returns the primitive value of the specified object. */
  valueOf(): number;
}

interface NumberConstructor {
  /** @deprecated Don't use Number constructor */
  new (value?: unknown): Number;
  (value?: unknown): number;
  readonly prototype: Number;

  /** The largest number that can be represented in JavaScript. Equal to approximately 1.79E+308. */
  readonly MAX_VALUE: number;

  /** The closest number to zero that can be represented in JavaScript. Equal to approximately 5.00E-324. */
  readonly MIN_VALUE: number;

  /** A value that is not a number. In equality comparisons, NaN does not equal any value, including itself. To test whether a value is equivalent to NaN, use the isNaN function. */
  readonly NaN: NaNType;

  /** A value that is less than the largest negative number that can be represented in JavaScript. JavaScript displays NEGATIVE_INFINITY values as -infinity. */
  readonly NEGATIVE_INFINITY: NEGATIVE_INFINITY;

  /** A value greater than the largest number that can be represented in JavaScript. JavaScript displays POSITIVE_INFINITY values as infinity. */
  readonly POSITIVE_INFINITY: POSITIVE_INFINITY;
}

/** An object that represents a number of any kind. All JavaScript numbers are 64-bit floating-point numbers. */
declare const Number: NumberConstructor;

interface TemplateStringsArray extends ReadonlyArray<string> {
  readonly raw: readonly string[];
}

/**
 * The type of `import.meta`.
 *
 * If you need to declare that a given property exists on `import.meta`, this type may be augmented via interface merging.
 */
interface ImportMeta {}

/**
 * The type for the optional second argument to `import()`.
 *
 * If your host environment supports additional options, this type may be augmented via interface merging.
 */
interface ImportCallOptions {
  /** @deprecated */ readonly assert?: ImportAssertions;
  readonly with?: ImportAttributes;
}

/**
 * The type for the `assert` property of the optional second argument to `import()`.
 *
 * @deprecated
 */
interface ImportAssertions {
  readonly [key: string]: string;
}

/** The type for the `with` property of the optional second argument to `import()`. */
interface ImportAttributes {
  readonly [key: string]: string;
}

interface Math {
  /** The mathematical constant e. This is Euler's number, the base of natural logarithms. */
  readonly E: PositiveNumber;
  /** The natural logarithm of 10. */
  readonly LN10: PositiveNumber;
  /** The natural logarithm of 2. */
  readonly LN2: PositiveNumber;
  /** The base-2 logarithm of e. */
  readonly LOG2E: PositiveNumber;
  /** The base-10 logarithm of e. */
  readonly LOG10E: PositiveNumber;
  /** Pi. This is the ratio of the circumference of a circle to its diameter. */
  readonly PI: PositiveNumber;
  /** The square root of 0.5, or, equivalently, one divided by the square root of 2. */
  readonly SQRT1_2: PositiveNumber;
  /** The square root of 2. */
  readonly SQRT2: PositiveNumber;
  /**
   * Returns the absolute value of a number (the value without regard to whether it is positive or negative). For example, the absolute value of -5 is the same as the absolute value of 5.
   *
   * @param x A numeric expression for which the absolute value is needed.
   */
  abs<N extends SmallInt>(x: N): AbsoluteValue<N>;
  abs<N extends FiniteNumber>(x: N): IntersectBrand<N, NonNegativeNumber>;
  abs(x: number): NonNegativeNumber | NaNType;
  /**
   * Returns the arc cosine (or inverse cosine) of a number.
   *
   * @param x A numeric expression.
   */
  acos(x: number): NonNegativeNumber | NaNType;
  /**
   * Returns the arcsine of a number.
   *
   * @param x A numeric expression.
   */
  asin(x: number): number;
  /**
   * Returns the arctangent of a number.
   *
   * @param x A numeric expression for which the arctangent is needed.
   */
  atan(x: number): number;
  /**
   * Returns the angle (in radians) from the X axis to a point.
   *
   * @param y A numeric expression representing the cartesian y-coordinate.
   * @param x A numeric expression representing the cartesian x-coordinate.
   */
  atan2(y: number, x: number): number;
  /**
   * Returns the smallest integer greater than or equal to its numeric argument.
   *
   * @param x A numeric expression.
   */
  ceil<N extends FiniteNumber>(x: N): IntersectBrand<N, Int>;
  ceil(x: number): Int | InfiniteNumber | NaNType;
  /**
   * Returns the cosine of a number.
   *
   * @param x A numeric expression that contains an angle measured in radians.
   */
  cos(x: number): number;
  /**
   * Returns e (the base of natural logarithms) raised to a power.
   *
   * @param x A numeric expression representing the power of e.
   */
  exp(x: number): NonNegativeNumber | NaNType;
  /**
   * Returns the greatest integer less than or equal to its numeric argument.
   *
   * @param x A numeric expression.
   */
  floor<N extends FiniteNumber>(x: N): IntersectBrand<N, Int>;
  floor(x: number): Int | InfiniteNumber | NaNType;
  /**
   * Returns the natural logarithm (base e) of a number.
   *
   * @param x A numeric expression.
   */
  log(x: number): number;
  /**
   * Returns the larger of a set of supplied numeric expressions.
   *
   * @param values Numeric expressions to be evaluated.
   */
  max(...values: readonly number[]): number;
  /**
   * Returns the smaller of a set of supplied numeric expressions.
   *
   * @param values Numeric expressions to be evaluated.
   */
  min(...values: readonly number[]): number;
  /**
   * Returns the value of a base expression taken to a specified power.
   *
   * @param x The base value of the expression.
   * @param y The exponent value of the expression.
   */
  pow(x: number, y: number): number;
  /** Returns a pseudorandom number between 0 and 1. */
  random(): NonNegativeNumber;
  /**
   * Returns a supplied numeric expression rounded to the nearest integer.
   *
   * @param x The value to be rounded to the nearest integer.
   */
  round<N extends FiniteNumber>(x: N): IntersectBrand<N, Int>;
  round(x: number): Int | InfiniteNumber | NaNType;
  /**
   * Returns the sine of a number.
   *
   * @param x A numeric expression that contains an angle measured in radians.
   */
  sin(x: number): number;
  /**
   * Returns the square root of a number.
   *
   * @param x A numeric expression.
   */
  sqrt(x: number): NonNegativeNumber | NaNType;
  /**
   * Returns the tangent of a number.
   *
   * @param x A numeric expression that contains an angle measured in radians.
   */
  tan(x: number): number;
}
/** An intrinsic object that provides basic mathematics functionality and constants. */
declare const Math: Math;

/** Enables basic storage and retrieval of dates and times. */
interface Date {
  /** Returns a string representation of a date. The format of the string depends on the locale. */
  toString(): string;
  /** Returns a date as a string value. */
  toDateString(): string;
  /** Returns a time as a string value. */
  toTimeString(): string;
  /** Returns a value as a string value appropriate to the host environment's current locale. */
  toLocaleString(): string;
  /** Returns a date as a string value appropriate to the host environment's current locale. */
  toLocaleDateString(): string;
  /** Returns a time as a string value appropriate to the host environment's current locale. */
  toLocaleTimeString(): string;
  /** Returns the stored time value in milliseconds since midnight, January 1, 1970 UTC. */
  valueOf(): SafeUint;
  /** Returns the stored time value in milliseconds since midnight, January 1, 1970 UTC. */
  getTime(): SafeUint;
  /** Gets the year, using local time. */
  getFullYear(): YearEnum;
  /** Gets the year using Universal Coordinated Time (UTC). */
  getUTCFullYear(): YearEnum;
  /** Gets the month, using local time. */
  getMonth(): MonthIndexEnum;
  /** Gets the month of a Date object using Universal Coordinated Time (UTC). */
  getUTCMonth(): MonthIndexEnum;
  /** Gets the day-of-the-month, using local time. */
  getDate(): DateEnum;
  /** Gets the day-of-the-month, using Universal Coordinated Time (UTC). */
  getUTCDate(): DateEnum;
  /** Gets the day of the week, using local time. */
  getDay(): DayOfWeekIndex;
  /** Gets the day of the week using Universal Coordinated Time (UTC). */
  getUTCDay(): DayOfWeekIndex;
  /** Gets the hours in a date, using local time. */
  getHours(): HoursEnum;
  /** Gets the hours value in a Date object using Universal Coordinated Time (UTC). */
  getUTCHours(): HoursEnum;
  /** Gets the minutes of a Date object, using local time. */
  getMinutes(): MinutesEnum;
  /** Gets the minutes of a Date object using Universal Coordinated Time (UTC). */
  getUTCMinutes(): MinutesEnum;
  /** Gets the seconds of a Date object, using local time. */
  getSeconds(): SecondsEnum;
  /** Gets the seconds of a Date object using Universal Coordinated Time (UTC). */
  getUTCSeconds(): SecondsEnum;
  /** Gets the milliseconds of a Date, using local time. */
  getMilliseconds(): MillisecondsEnum;
  /** Gets the milliseconds of a Date object using Universal Coordinated Time (UTC). */
  getUTCMilliseconds(): MillisecondsEnum;
  /** Gets the difference in minutes between Universal Coordinated Time (UTC) and the time on the local computer. */
  getTimezoneOffset(): SafeInt;
  /**
   * Sets the date and time value in the Date object.
   *
   * @param time A numeric value representing the number of elapsed milliseconds since midnight, January 1, 1970 GMT.
   */
  setTime(time: number): number;
  /**
   * Sets the milliseconds value in the Date object using local time.
   *
   * @param ms A numeric value equal to the millisecond value.
   */
  setMilliseconds(ms: number): number;
  /**
   * Sets the milliseconds value in the Date object using Universal Coordinated Time (UTC).
   *
   * @param ms A numeric value equal to the millisecond value.
   */
  setUTCMilliseconds(ms: number): number;

  /**
   * Sets the seconds value in the Date object using local time.
   *
   * @param sec A numeric value equal to the seconds value.
   * @param ms A numeric value equal to the milliseconds value.
   */
  setSeconds(sec: number, ms?: number): number;
  /**
   * Sets the seconds value in the Date object using Universal Coordinated Time (UTC).
   *
   * @param sec A numeric value equal to the seconds value.
   * @param ms A numeric value equal to the milliseconds value.
   */
  setUTCSeconds(sec: number, ms?: number): number;
  /**
   * Sets the minutes value in the Date object using local time.
   *
   * @param min A numeric value equal to the minutes value.
   * @param sec A numeric value equal to the seconds value.
   * @param ms A numeric value equal to the milliseconds value.
   */
  setMinutes(min: number, sec?: number, ms?: number): number;
  /**
   * Sets the minutes value in the Date object using Universal Coordinated Time (UTC).
   *
   * @param min A numeric value equal to the minutes value.
   * @param sec A numeric value equal to the seconds value.
   * @param ms A numeric value equal to the milliseconds value.
   */
  setUTCMinutes(min: number, sec?: number, ms?: number): number;
  /**
   * Sets the hour value in the Date object using local time.
   *
   * @param hours A numeric value equal to the hours value.
   * @param min A numeric value equal to the minutes value.
   * @param sec A numeric value equal to the seconds value.
   * @param ms A numeric value equal to the milliseconds value.
   */
  setHours(hours: number, min?: number, sec?: number, ms?: number): number;
  /**
   * Sets the hours value in the Date object using Universal Coordinated Time (UTC).
   *
   * @param hours A numeric value equal to the hours value.
   * @param min A numeric value equal to the minutes value.
   * @param sec A numeric value equal to the seconds value.
   * @param ms A numeric value equal to the milliseconds value.
   */
  setUTCHours(hours: number, min?: number, sec?: number, ms?: number): number;
  /**
   * Sets the numeric day-of-the-month value of the Date object using local time.
   *
   * @param date A numeric value equal to the day of the month.
   */
  setDate(date: number): number;
  /**
   * Sets the numeric day of the month in the Date object using Universal Coordinated Time (UTC).
   *
   * @param date A numeric value equal to the day of the month.
   */
  setUTCDate(date: number): number;
  /**
   * Sets the month value in the Date object using local time.
   *
   * @param month A numeric value equal to the month. The value for January is 0, and other month values follow consecutively.
   * @param date A numeric value representing the day of the month. If this value is not supplied, the value from a call to the getDate method is used.
   */
  setMonth(month: number, date?: number): number;
  /**
   * Sets the month value in the Date object using Universal Coordinated Time (UTC).
   *
   * @param month A numeric value equal to the month. The value for January is 0, and other month values follow consecutively.
   * @param date A numeric value representing the day of the month. If it is not supplied, the value from a call to the getUTCDate method is used.
   */
  setUTCMonth(month: number, date?: number): number;
  /**
   * Sets the year of the Date object using local time.
   *
   * @param year A numeric value for the year.
   * @param month A zero-based numeric value for the month (0 for January, 11 for December). Must be specified if numDate is specified.
   * @param date A numeric value equal for the day of the month.
   */
  setFullYear(year: number, month?: number, date?: number): number;
  /**
   * Sets the year value in the Date object using Universal Coordinated Time (UTC).
   *
   * @param year A numeric value equal to the year.
   * @param month A numeric value equal to the month. The value for January is 0, and other month values follow consecutively. Must be supplied if numDate is supplied.
   * @param date A numeric value equal to the day of the month.
   */
  setUTCFullYear(year: number, month?: number, date?: number): number;
  /** Returns a date converted to a string using Universal Coordinated Time (UTC). */
  toUTCString(): string;
  /** Returns a date as a string value in ISO format. */
  toISOString(): string;
  /** Used by the JSON.stringify method to enable the transformation of an object's data for JavaScript Object Notation (JSON) serialization. */
  toJSON(key?: unknown): string;
}

interface DateConstructor {
  new (): Date;
  new (value: number | string): Date;
  /**
   * Creates a new Date.
   *
   * @param year The full year designation is required for cross-century date accuracy. If year is between 0 and 99 is used, then year is assumed to be 1900 + year.
   * @param monthIndex The month as a number between 0 and 11 (January to December).
   * @param date The date as a number between 1 and 31.
   * @param hours Must be supplied if minutes is supplied. A number from 0 to 23 (midnight to 11pm) that specifies the hour.
   * @param minutes Must be supplied if seconds is supplied. A number from 0 to 59 that specifies the minutes.
   * @param seconds Must be supplied if milliseconds is supplied. A number from 0 to 59 that specifies the seconds.
   * @param ms A number from 0 to 999 that specifies the milliseconds.
   */
  new (
    year: YearEnum,
    monthIndex: MonthIndexEnum,
    date?: DateEnum,
    hours?: HoursEnum,
    minutes?: MinutesEnum,
    seconds?: SecondsEnum,
    ms?: MillisecondsEnum,
  ): Date;
  (): string;
  readonly prototype: Date;
  /**
   * Parses a string containing a date, and returns the number of milliseconds between that date and midnight, January 1, 1970.
   *
   * @param s A date string
   */
  parse(s: string): SafeUint;
  /**
   * Returns the number of milliseconds between midnight, January 1, 1970 Universal Coordinated Time (UTC) (or GMT) and the specified date.
   *
   * @param year The full year designation is required for cross-century date accuracy. If year is between 0 and 99 is used, then year is assumed to be 1900 + year.
   * @param monthIndex The month as a number between 0 and 11 (January to December).
   * @param date The date as a number between 1 and 31.
   * @param hours Must be supplied if minutes is supplied. A number from 0 to 23 (midnight to 11pm) that specifies the hour.
   * @param minutes Must be supplied if seconds is supplied. A number from 0 to 59 that specifies the minutes.
   * @param seconds Must be supplied if milliseconds is supplied. A number from 0 to 59 that specifies the seconds.
   * @param ms A number from 0 to 999 that specifies the milliseconds.
   */
  UTC(
    year: YearEnum,
    monthIndex: MonthIndexEnum,
    date?: DateEnum,
    hours?: HoursEnum,
    minutes?: MinutesEnum,
    seconds?: SecondsEnum,
    ms?: MillisecondsEnum,
  ): SafeUint;
  /** Returns the number of milliseconds elapsed since midnight, January 1, 1970 Universal Coordinated Time (UTC). */
  now(): SafeUint;
}

declare const Date: DateConstructor;

interface RegExpMatchArray extends Array<string> {
  /** The index of the search at which the result was found. */
  readonly index?: NumberType.ArraySizeArg;
  /** A copy of the search string. */
  readonly input?: string;
  /** The first match. This will always be present because `null` will be returned if there are no matches. */
  readonly 0: string;
}

interface RegExpExecArray extends Array<string> {
  /** The index of the search at which the result was found. */
  readonly index: NumberType.ArraySize;
  /** A copy of the search string. */
  readonly input: string;
  /** The first match. This will always be present because `null` will be returned if there are no matches. */
  readonly 0: string;
}

interface RegExp {
  /**
   * Executes a search on a string using a regular expression pattern, and returns an array containing the results of that search.
   *
   * @param string The String object or string literal on which to perform the search.
   */
  exec(string: string): RegExpExecArray | null;

  /**
   * Returns a Boolean value that indicates whether or not a pattern exists in a searched string.
   *
   * @param string String on which to perform the search.
   */
  test(string: string): boolean;

  /** Returns a copy of the text of the regular expression pattern. Read-only. The regExp argument is a Regular expression object. It can be a variable name or a literal. */
  readonly source: string;

  /** Returns a Boolean value indicating the state of the global flag (g) used with a regular expression. Default is false. Read-only. */
  readonly global: boolean;

  /** Returns a Boolean value indicating the state of the ignoreCase flag (i) used with a regular expression. Default is false. Read-only. */
  readonly ignoreCase: boolean;

  /** Returns a Boolean value indicating the state of the multiline flag (m) used with a regular expression. Default is false. Read-only. */
  readonly multiline: boolean;

  readonly lastIndex: NumberType.ArraySize;

  // Non-standard extensions
  /** @deprecated A legacy feature for browser compatibility */
  compile(pattern: string, flags?: string): this;
}

interface RegExpConstructor {
  new (pattern: RegExp | string): RegExp;
  new (pattern: string, flags?: string): RegExp;
  (pattern: RegExp | string): RegExp;
  (pattern: string, flags?: string): RegExp;
  readonly prototype: RegExp;

  // Non-standard extensions
  /** @deprecated A legacy feature for browser compatibility */
  readonly $1: string;
  /** @deprecated A legacy feature for browser compatibility */
  readonly $2: string;
  /** @deprecated A legacy feature for browser compatibility */
  readonly $3: string;
  /** @deprecated A legacy feature for browser compatibility */
  readonly $4: string;
  /** @deprecated A legacy feature for browser compatibility */
  readonly $5: string;
  /** @deprecated A legacy feature for browser compatibility */
  readonly $6: string;
  /** @deprecated A legacy feature for browser compatibility */
  readonly $7: string;
  /** @deprecated A legacy feature for browser compatibility */
  readonly $8: string;
  /** @deprecated A legacy feature for browser compatibility */
  readonly $9: string;
  /** @deprecated A legacy feature for browser compatibility */
  readonly input: string;
  /** @deprecated A legacy feature for browser compatibility */
  readonly $_: string;
  /** @deprecated A legacy feature for browser compatibility */
  readonly lastMatch: string;
  /** @deprecated A legacy feature for browser compatibility */
  readonly '$&': string;
  /** @deprecated A legacy feature for browser compatibility */
  readonly lastParen: string;
  /** @deprecated A legacy feature for browser compatibility */
  readonly '$+': string;
  /** @deprecated A legacy feature for browser compatibility */
  readonly leftContext: string;
  /** @deprecated A legacy feature for browser compatibility */
  readonly '$`': string;
  /** @deprecated A legacy feature for browser compatibility */
  readonly rightContext: string;
  /** @deprecated A legacy feature for browser compatibility */
  readonly "$'": string;
}

declare const RegExp: RegExpConstructor;

interface Error {
  name: string;
  readonly message: string;
  stack?: string;
}

interface ErrorConstructor {
  new (message?: string): Error;
  (message?: string): Error;
  readonly prototype: Error;
}

declare const Error: ErrorConstructor;

interface EvalError extends Error {}

interface EvalErrorConstructor extends ErrorConstructor {
  new (message?: string): EvalError;
  (message?: string): EvalError;
  readonly prototype: EvalError;
}

declare const EvalError: EvalErrorConstructor;

interface RangeError extends Error {}

interface RangeErrorConstructor extends ErrorConstructor {
  new (message?: string): RangeError;
  (message?: string): RangeError;
  readonly prototype: RangeError;
}

declare const RangeError: RangeErrorConstructor;

interface ReferenceError extends Error {}

interface ReferenceErrorConstructor extends ErrorConstructor {
  new (message?: string): ReferenceError;
  (message?: string): ReferenceError;
  readonly prototype: ReferenceError;
}

declare const ReferenceError: ReferenceErrorConstructor;

interface SyntaxError extends Error {}

interface SyntaxErrorConstructor extends ErrorConstructor {
  new (message?: string): SyntaxError;
  (message?: string): SyntaxError;
  readonly prototype: SyntaxError;
}

declare const SyntaxError: SyntaxErrorConstructor;

interface TypeError extends Error {}

interface TypeErrorConstructor extends ErrorConstructor {
  new (message?: string): TypeError;
  (message?: string): TypeError;
  readonly prototype: TypeError;
}

declare const TypeError: TypeErrorConstructor;

interface URIError extends Error {}

interface URIErrorConstructor extends ErrorConstructor {
  new (message?: string): URIError;
  (message?: string): URIError;
  readonly prototype: URIError;
}

declare const URIError: URIErrorConstructor;

interface JSON {
  /**
   * Converts a JavaScript Object Notation (JSON) string into an object.
   *
   * @param text A valid JSON string.
   * @param reviver A function that transforms the results. This function is called for each member of the object. If a member contains nested objects, the nested objects are transformed before the parent object is.
   */
  parse(
    text: string,
    reviver?: (this: unknown, key: string, value: unknown) => unknown,
  ): JsonValue;
  /**
   * Converts a JavaScript value to a JavaScript Object Notation (JSON) string.
   *
   * @param value A JavaScript value, usually an object or array, to be converted.
   * @param replacer A function that transforms the results.
   * @param space Adds indentation, white space, and line break characters to the return-value JSON text to make it easier to read.
   */
  stringify(
    value: unknown,
    replacer?: (this: unknown, key: string, value: unknown) => unknown,
    space?: string | UintRange<1, 11>,
  ): string;
  /**
   * Converts a JavaScript value to a JavaScript Object Notation (JSON) string.
   *
   * @param value A JavaScript value, usually an object or array, to be converted.
   * @param replacer An array of strings and numbers that acts as an approved list for selecting the object properties that will be stringified.
   * @param space Adds indentation, white space, and line break characters to the return-value JSON text to make it easier to read.
   */
  stringify(
    value: unknown,
    replacer?: readonly (number | string)[] | null,
    space?: string | UintRange<1, 11>,
  ): string;
}

/** An intrinsic object that provides functions to convert JavaScript values to and from the JavaScript Object Notation (JSON) format. */
declare const JSON: JSON;

/////////////////////////////
/// ECMAScript Array API (specially handled by compiler)
/////////////////////////////

interface ReadonlyArray<T> {
  /** Gets the length of the array. This is a number one higher than the highest element defined in an array. */
  // This is already defined in ts-type-utils.
  // readonly length: number;
  /** Returns a string representation of an array. */
  toString(): string;
  /** Returns a string representation of an array. The elements are converted to string using their toLocaleString methods. */
  toLocaleString(): string;
  /**
   * Combines two or more arrays.
   *
   * @param items Additional items to add to the end of array1.
   */
  concat(...items: readonly ConcatArray<T>[]): readonly T[];
  /**
   * Combines two or more arrays.
   *
   * @param items Additional items to add to the end of array1.
   */
  concat(...items: readonly (T | ConcatArray<T>)[]): readonly T[];
  /**
   * Adds all the elements of an array separated by the specified separator string.
   *
   * @param separator A string used to separate one element of an array from the next in the resulting String. If omitted, the array elements are separated with a comma.
   */
  join(separator?: string): string;
  /**
   * Returns a section of an array.
   *
   * @param start The beginning of the specified portion of the array.
   * @param end The end of the specified portion of the array. This is exclusive of the element at the index 'end'.
   */
  slice(
    start?: NumberType.ArraySizeArg,
    end?: NumberType.ArraySizeArg,
  ): readonly T[];
  /**
   * Returns the index of the first occurrence of a value in an array.
   *
   * @param searchElement The value to locate in the array.
   * @param fromIndex The array index at which to begin the search. If fromIndex is omitted, the search starts at index 0.
   */
  indexOf(
    searchElement: T,
    fromIndex?: NumberType.ArraySizeArg,
  ): NumberType.ArraySearchResult;
  /**
   * Returns the index of the last occurrence of a specified value in an array.
   *
   * @param searchElement The value to locate in the array.
   * @param fromIndex The array index at which to begin the search. If fromIndex is omitted, the search starts at the last index in the array.
   */
  lastIndexOf(
    searchElement: T,
    fromIndex?: NumberType.ArraySizeArg,
  ): NumberType.ArraySearchResult;
  /**
   * Determines whether all the members of an array satisfy the specified test.
   *
   * @param predicate A function that accepts up to three arguments. The every method calls the predicate function for each element in the array until the predicate returns a value which is coercible to the Boolean value false, or until the end of the array.
   * @param thisArg An object to which the this keyword can refer in the predicate function. If thisArg is omitted, undefined is used as the this value.
   */
  every<S extends T>(
    predicate: (
      value: T,
      index: NumberType.ArraySize,
      array: readonly T[],
    ) => value is S,
    thisArg?: unknown,
  ): this is readonly S[];
  /**
   * Determines whether all the members of an array satisfy the specified test.
   *
   * @param predicate A function that accepts up to three arguments. The every method calls the predicate function for each element in the array until the predicate returns a value which is coercible to the Boolean value false, or until the end of the array.
   * @param thisArg An object to which the this keyword can refer in the predicate function. If thisArg is omitted, undefined is used as the this value.
   */
  every(
    predicate: (
      value: T,
      index: NumberType.ArraySize,
      array: readonly T[],
    ) => boolean,
    thisArg?: unknown,
  ): boolean;
  /**
   * Determines whether the specified callback function returns true for any element of an array.
   *
   * @param predicate A function that accepts up to three arguments. The some method calls the predicate function for each element in the array until the predicate returns a value which is coercible to the Boolean value true, or until the end of the array.
   * @param thisArg An object to which the this keyword can refer in the predicate function. If thisArg is omitted, undefined is used as the this value.
   */
  some(
    predicate: (
      value: T,
      index: NumberType.ArraySize,
      array: readonly T[],
    ) => boolean,
    thisArg?: unknown,
  ): boolean;
  /**
   * Performs the specified action for each element in an array.
   *
   * @param callbackfn A function that accepts up to three arguments. forEach calls the callbackfn function one time for each element in the array.
   * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
   */
  forEach(
    callbackfn: (
      value: T,
      index: NumberType.ArraySize,
      array: readonly T[],
    ) => void,
    thisArg?: unknown,
  ): void;
  /**
   * Calls a defined callback function on each element of an array, and returns an array that contains the results.
   *
   * @param callbackfn A function that accepts up to three arguments. The map method calls the callbackfn function one time for each element in the array.
   * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
   */
  map<U>(
    callbackfn: (
      value: T,
      index: NumberType.ArraySize,
      array: readonly T[],
    ) => U,
    thisArg?: unknown,
  ): readonly U[];
  /**
   * Returns the elements of an array that meet the condition specified in a callback function.
   *
   * @param predicate A function that accepts up to three arguments. The filter method calls the predicate function one time for each element in the array.
   * @param thisArg An object to which the this keyword can refer in the predicate function. If thisArg is omitted, undefined is used as the this value.
   */
  filter<S extends T>(
    predicate: (
      value: T,
      index: NumberType.ArraySize,
      array: readonly T[],
    ) => value is S,
    thisArg?: unknown,
  ): readonly S[];
  /**
   * Returns the elements of an array that meet the condition specified in a callback function.
   *
   * @param predicate A function that accepts up to three arguments. The filter method calls the predicate function one time for each element in the array.
   * @param thisArg An object to which the this keyword can refer in the predicate function. If thisArg is omitted, undefined is used as the this value.
   */
  filter(
    predicate: (
      value: T,
      index: NumberType.ArraySize,
      array: readonly T[],
    ) => boolean,
    thisArg?: unknown,
  ): readonly T[];
  /**
   * Calls the specified callback function for all the elements in an array. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
   *
   * @param callbackfn A function that accepts up to four arguments. The reduce method calls the callbackfn function one time for each element in the array.
   * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of an array value.
   */
  reduce(
    callbackfn: (
      previousValue: T,
      currentValue: T,
      currentIndex: NumberType.ArraySize,
      array: readonly T[],
    ) => T,
  ): T;
  reduce(
    callbackfn: (
      previousValue: T,
      currentValue: T,
      currentIndex: NumberType.ArraySize,
      array: readonly T[],
    ) => T,
    initialValue: T,
  ): T;
  /**
   * Calls the specified callback function for all the elements in an array. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
   *
   * @param callbackfn A function that accepts up to four arguments. The reduce method calls the callbackfn function one time for each element in the array.
   * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of an array value.
   */
  reduce<U>(
    callbackfn: (
      previousValue: U,
      currentValue: T,
      currentIndex: NumberType.ArraySize,
      array: readonly T[],
    ) => U,
    initialValue: U,
  ): U;
  /**
   * Calls the specified callback function for all the elements in an array, in descending order. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
   *
   * @param callbackfn A function that accepts up to four arguments. The reduceRight method calls the callbackfn function one time for each element in the array.
   * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of an array value.
   */
  reduceRight(
    callbackfn: (
      previousValue: T,
      currentValue: T,
      currentIndex: NumberType.ArraySize,
      array: readonly T[],
    ) => T,
  ): T;
  reduceRight(
    callbackfn: (
      previousValue: T,
      currentValue: T,
      currentIndex: NumberType.ArraySize,
      array: readonly T[],
    ) => T,
    initialValue: T,
  ): T;
  /**
   * Calls the specified callback function for all the elements in an array, in descending order. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
   *
   * @param callbackfn A function that accepts up to four arguments. The reduceRight method calls the callbackfn function one time for each element in the array.
   * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of an array value.
   */
  reduceRight<U>(
    callbackfn: (
      previousValue: U,
      currentValue: T,
      currentIndex: NumberType.ArraySize,
      array: readonly T[],
    ) => U,
    initialValue: U,
  ): U;

  // This is already defined in ts-type-utils.
  // readonly [n: number]: T;
}

interface ConcatArray<T> {
  readonly length: number;
  readonly [n: number]: T;
  join(separator?: string): string;
  slice(
    start?: NumberType.ArraySizeArg,
    end?: NumberType.ArraySizeArg,
  ): readonly T[];
}

interface Array<T> {
  /** Gets or sets the length of the array. This is a number one higher than the highest index in the array. */
  // This is already defined in ts-type-utils.
  // readonly length: number;
  /** Returns a string representation of an array. */
  toString(): string;
  /** Returns a string representation of an array. The elements are converted to string using their toLocaleString methods. */
  toLocaleString(): string;
  /** Removes the last element from an array and returns it. If the array is empty, undefined is returned and the array is not modified. */
  pop(): T | undefined;
  /**
   * Appends new elements to the end of an array, and returns the new length of the array.
   *
   * @param items New elements to add to the array.
   */
  push(...items: readonly T[]): NumberType.ArraySize;
  /**
   * Combines two or more arrays. This method returns a new array without modifying any existing arrays.
   *
   * @param items Additional arrays and/or items to add to the end of the array.
   */
  concat(...items: readonly ConcatArray<T>[]): readonly T[];
  /**
   * Combines two or more arrays. This method returns a new array without modifying any existing arrays.
   *
   * @param items Additional arrays and/or items to add to the end of the array.
   */
  concat(...items: readonly (T | ConcatArray<T>)[]): readonly T[];
  /**
   * Adds all the elements of an array into a string, separated by the specified separator string.
   *
   * @param separator A string used to separate one element of the array from the next in the resulting string. If omitted, the array elements are separated with a comma.
   */
  join(separator?: string): string;
  /** Reverses the elements in an array in place. This method mutates the array and returns a reference to the same array. */
  reverse(): readonly T[];
  /** Removes the first element from an array and returns it. If the array is empty, undefined is returned and the array is not modified. */
  shift(): T | undefined;
  /**
   * Returns a copy of a section of an array. For both start and end, a negative index can be used to indicate an offset from the end of the array. For example, -2 refers to the second to last element of the array.
   *
   * @param start The beginning index of the specified portion of the array. If start is undefined, then the slice begins at index 0.
   * @param end The end index of the specified portion of the array. This is exclusive of the element at the index 'end'. If end is undefined, then the slice extends to the end of the array.
   */
  slice(
    start?: NumberType.ArraySizeArg,
    end?: NumberType.ArraySizeArg,
  ): readonly T[];
  /**
   * Sorts an array in place. This method mutates the array and returns a reference to the same array.
   *
   * @param compareFn Function used to determine the order of the elements. It is expected to return a negative value if the first argument is less than the second argument, zero if they're equal, and a positive value otherwise. If omitted, the elements are sorted in ascending, ASCII character order.
   *
   *   ```ts
   *   [11, 2, 22, 1].sort((a, b) => a - b);
   *   ```
   */
  sort(compareFn?: (a: T, b: T) => number): this;
  /**
   * Removes elements from an array and, if necessary, inserts new elements in their place, returning the deleted elements.
   *
   * @param start The zero-based location in the array from which to start removing elements.
   * @param deleteCount The number of elements to remove.
   * @returns An array containing the elements that were deleted.
   */
  splice(
    start: NumberType.ArraySizeArg,
    deleteCount?: NumberType.ArraySizeArgNonNegative,
  ): readonly T[];
  /**
   * Removes elements from an array and, if necessary, inserts new elements in their place, returning the deleted elements.
   *
   * @param start The zero-based location in the array from which to start removing elements.
   * @param deleteCount The number of elements to remove.
   * @param items Elements to insert into the array in place of the deleted elements.
   * @returns An array containing the elements that were deleted.
   */
  splice(
    start: NumberType.ArraySizeArg,
    deleteCount: NumberType.ArraySizeArgNonNegative,
    ...items: readonly T[]
  ): readonly T[];
  /**
   * Inserts new elements at the start of an array, and returns the new length of the array.
   *
   * @param items Elements to insert at the start of the array.
   */
  unshift(...items: readonly T[]): NumberType.ArraySize;
  /**
   * Returns the index of the first occurrence of a value in an array, or -1 if it is not present.
   *
   * @param searchElement The value to locate in the array.
   * @param fromIndex The array index at which to begin the search. If fromIndex is omitted, the search starts at index 0.
   */
  indexOf(
    searchElement: T,
    fromIndex?: NumberType.ArraySizeArg,
  ): NumberType.ArraySearchResult;
  /**
   * Returns the index of the last occurrence of a specified value in an array, or -1 if it is not present.
   *
   * @param searchElement The value to locate in the array.
   * @param fromIndex The array index at which to begin searching backward. If fromIndex is omitted, the search starts at the last index in the array.
   */
  lastIndexOf(
    searchElement: T,
    fromIndex?: NumberType.ArraySizeArg,
  ): NumberType.ArraySearchResult;
  /**
   * Determines whether all the members of an array satisfy the specified test.
   *
   * @param predicate A function that accepts up to three arguments. The every method calls the predicate function for each element in the array until the predicate returns a value which is coercible to the Boolean value false, or until the end of the array.
   * @param thisArg An object to which the this keyword can refer in the predicate function. If thisArg is omitted, undefined is used as the this value.
   */
  every<S extends T>(
    predicate: (
      value: T,
      index: NumberType.ArraySize,
      array: readonly T[],
    ) => value is S,
    thisArg?: unknown,
  ): this is S[];
  /**
   * Determines whether all the members of an array satisfy the specified test.
   *
   * @param predicate A function that accepts up to three arguments. The every method calls the predicate function for each element in the array until the predicate returns a value which is coercible to the Boolean value false, or until the end of the array.
   * @param thisArg An object to which the this keyword can refer in the predicate function. If thisArg is omitted, undefined is used as the this value.
   */
  every(
    predicate: (
      value: T,
      index: NumberType.ArraySize,
      array: readonly T[],
    ) => boolean,
    thisArg?: unknown,
  ): boolean;
  /**
   * Determines whether the specified callback function returns true for any element of an array.
   *
   * @param predicate A function that accepts up to three arguments. The some method calls the predicate function for each element in the array until the predicate returns a value which is coercible to the Boolean value true, or until the end of the array.
   * @param thisArg An object to which the this keyword can refer in the predicate function. If thisArg is omitted, undefined is used as the this value.
   */
  some(
    predicate: (
      value: T,
      index: NumberType.ArraySize,
      array: readonly T[],
    ) => boolean,
    thisArg?: unknown,
  ): boolean;
  /**
   * Performs the specified action for each element in an array.
   *
   * @param callbackfn A function that accepts up to three arguments. forEach calls the callbackfn function one time for each element in the array.
   * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
   */
  forEach(
    callbackfn: (
      value: T,
      index: NumberType.ArraySize,
      array: readonly T[],
    ) => void,
    thisArg?: unknown,
  ): void;
  /**
   * Calls a defined callback function on each element of an array, and returns an array that contains the results.
   *
   * @param callbackfn A function that accepts up to three arguments. The map method calls the callbackfn function one time for each element in the array.
   * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
   */
  map<U>(
    callbackfn: (
      value: T,
      index: NumberType.ArraySize,
      array: readonly T[],
    ) => U,
    thisArg?: unknown,
  ): readonly U[];
  /**
   * Returns the elements of an array that meet the condition specified in a callback function.
   *
   * @param predicate A function that accepts up to three arguments. The filter method calls the predicate function one time for each element in the array.
   * @param thisArg An object to which the this keyword can refer in the predicate function. If thisArg is omitted, undefined is used as the this value.
   */
  filter<S extends T>(
    predicate: (
      value: T,
      index: NumberType.ArraySize,
      array: readonly T[],
    ) => value is S,
    thisArg?: unknown,
  ): readonly S[];
  /**
   * Returns the elements of an array that meet the condition specified in a callback function.
   *
   * @param predicate A function that accepts up to three arguments. The filter method calls the predicate function one time for each element in the array.
   * @param thisArg An object to which the this keyword can refer in the predicate function. If thisArg is omitted, undefined is used as the this value.
   */
  filter(
    predicate: (
      value: T,
      index: NumberType.ArraySize,
      array: readonly T[],
    ) => boolean,
    thisArg?: unknown,
  ): readonly T[];
  /**
   * Calls the specified callback function for all the elements in an array. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
   *
   * @param callbackfn A function that accepts up to four arguments. The reduce method calls the callbackfn function one time for each element in the array.
   * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of an array value.
   */
  reduce(
    callbackfn: (
      previousValue: T,
      currentValue: T,
      currentIndex: NumberType.ArraySize,
      array: readonly T[],
    ) => T,
  ): T;
  reduce(
    callbackfn: (
      previousValue: T,
      currentValue: T,
      currentIndex: NumberType.ArraySize,
      array: readonly T[],
    ) => T,
    initialValue: T,
  ): T;
  /**
   * Calls the specified callback function for all the elements in an array. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
   *
   * @param callbackfn A function that accepts up to four arguments. The reduce method calls the callbackfn function one time for each element in the array.
   * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of an array value.
   */
  reduce<U>(
    callbackfn: (
      previousValue: U,
      currentValue: T,
      currentIndex: NumberType.ArraySize,
      array: readonly T[],
    ) => U,
    initialValue: U,
  ): U;
  /**
   * Calls the specified callback function for all the elements in an array, in descending order. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
   *
   * @param callbackfn A function that accepts up to four arguments. The reduceRight method calls the callbackfn function one time for each element in the array.
   * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of an array value.
   */
  reduceRight(
    callbackfn: (
      previousValue: T,
      currentValue: T,
      currentIndex: NumberType.ArraySize,
      array: readonly T[],
    ) => T,
  ): T;
  reduceRight(
    callbackfn: (
      previousValue: T,
      currentValue: T,
      currentIndex: NumberType.ArraySize,
      array: readonly T[],
    ) => T,
    initialValue: T,
  ): T;
  /**
   * Calls the specified callback function for all the elements in an array, in descending order. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
   *
   * @param callbackfn A function that accepts up to four arguments. The reduceRight method calls the callbackfn function one time for each element in the array.
   * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of an array value.
   */
  reduceRight<U>(
    callbackfn: (
      previousValue: U,
      currentValue: T,
      currentIndex: NumberType.ArraySize,
      array: readonly T[],
    ) => U,
    initialValue: U,
  ): U;

  // This is already defined in ts-type-utils.
  // [n: number]: T;
}

interface ArrayConstructor {
  /** @deprecated use `Array.from({ length })` instead */
  new (arrayLength?: NumberType.NewArrayMaxSize): readonly unknown[];
  /** @deprecated use `Array.from({ length })` instead */
  new <T>(arrayLength: NumberType.NewArrayMaxSize): readonly T[];
  /** @deprecated use `[...items]` instead */
  new <T>(...items: readonly T[]): readonly T[];
  /** @deprecated use `Array.from({ length })` instead */
  (arrayLength?: NumberType.NewArrayMaxSize): readonly unknown[];
  /** @deprecated use `Array.from({ length })` instead */
  <T>(arrayLength: NumberType.NewArrayMaxSize): readonly T[];
  /** @deprecated use `[...items]` instead */
  <T>(...items: readonly T[]): readonly T[];
  isArray(arg: unknown): arg is readonly unknown[];
  readonly prototype: readonly unknown[];
}

declare const Array: ArrayConstructor;

interface TypedPropertyDescriptor<T> {
  readonly enumerable?: boolean;
  readonly configurable?: boolean;
  readonly writable?: boolean;
  readonly value?: T;
  readonly get?: () => T;
  readonly set?: (value: T) => void;
}

declare type PromiseConstructorLike = new <T>(
  executor: (
    resolve: (value: T | PromiseLike<T>) => void,
    reject: (reason?: unknown) => void,
  ) => void,
) => PromiseLike<T>;

interface PromiseLike<T> {
  /**
   * Attaches callbacks for the resolution and/or rejection of the Promise.
   *
   * @param onfulfilled The callback to execute when the Promise is resolved.
   * @param onrejected The callback to execute when the Promise is rejected.
   * @returns A Promise for the completion of which ever callback is executed.
   */
  then<TResult1 = T, TResult2 = never>(
    onfulfilled?:
      | ((value: T) => TResult1 | PromiseLike<TResult1>)
      | undefined
      | null,
    onrejected?:
      | ((reason: unknown) => TResult2 | PromiseLike<TResult2>)
      | undefined
      | null,
  ): PromiseLike<TResult1 | TResult2>;
}

/** Represents the completion of an asynchronous operation */
interface Promise<T> {
  /**
   * Attaches callbacks for the resolution and/or rejection of the Promise.
   *
   * @param onfulfilled The callback to execute when the Promise is resolved.
   * @param onrejected The callback to execute when the Promise is rejected.
   * @returns A Promise for the completion of which ever callback is executed.
   */
  then<TResult1 = T, TResult2 = never>(
    onfulfilled?:
      | ((value: T) => TResult1 | PromiseLike<TResult1>)
      | undefined
      | null,
    onrejected?:
      | ((reason: unknown) => TResult2 | PromiseLike<TResult2>)
      | undefined
      | null,
  ): Promise<TResult1 | TResult2>;

  /**
   * Attaches a callback for only the rejection of the Promise.
   *
   * @param onrejected The callback to execute when the Promise is rejected.
   * @returns A Promise for the completion of the callback.
   */
  catch<TResult = never>(
    onrejected?:
      | ((reason: unknown) => TResult | PromiseLike<TResult>)
      | undefined
      | null,
  ): Promise<T | TResult>;
}

/** Recursively unwraps the "awaited type" of a type. Non-promise "thenables" should resolve to `never`. This emulates the behavior of `await`. */
type Awaited<T> = T extends null | undefined
  ? T // special case for `null | undefined` when not in `--strictNullChecks` mode
  : T extends object & { then(onfulfilled: infer F, ...args: infer _): unknown } // `await` only unwraps object types with a callable `then`. Non-object types are not unwrapped
    ? F extends (value: infer V, ...args: infer _) => unknown // if the argument to `then` is callable, extracts the first argument
      ? Awaited<V> // recursively unwrap the value
      : never // the argument to `then` was not callable
    : T; // non-object or non-thenable

interface ArrayLike<T> {
  readonly length: number;
  readonly [n: number]: T;
}

/** Make all properties in T optional */
// This is already defined in ts-type-utils.
// type Partial<T> = {
//   [P in keyof T]?: T[P];
// };

/** Make all properties in T required */
// This is already defined in ts-type-utils.
// type Required<T> = {
//   [P in keyof T]-?: T[P];
// };

/** Make all properties in T readonly */
// This is already defined in ts-type-utils.
// type Readonly<T> = {
//   readonly [P in keyof T]: T[P];
// };

/** From T, pick a set of properties whose keys are in the union K */
// This is already defined in ts-type-utils.
// type Pick<T, K extends keyof T> = {
//   [P in K]: T[P];
// };

/** Construct a type with a set of properties K of type T */
// This is already defined in ts-type-utils.
// type Record<K extends keyof never, T> = {
//   readonly [P in K]: T;
// };

/** Exclude from T those types that are assignable to U */
// This is already defined in ts-type-utils.
// type Exclude<T, U extends T> = T extends U ? never : T;

/** Extract from T those types that are assignable to U */
// This is already defined in ts-type-utils.
// type Extract<T, U> = T extends U ? T : never;

/** Construct a type with the properties of T except for those in type K. */
// This is already defined in ts-type-utils.
// type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

/** Exclude null and undefined from T */
type NonNullable<T> = T & {};

/** Obtain the parameters of a function type in a tuple */
// This is already defined in ts-type-utils.
// type Parameters<T extends (...args: readonly never[]) => unknown> = T extends (...args: infer P) => unknown ? P : never;

/** Obtain the parameters of a constructor function type in a tuple */
type ConstructorParameters<
  T extends abstract new (...args: readonly never[]) => unknown,
> = T extends abstract new (...args: infer P) => unknown ? P : never;

/** Obtain the return type of a function type */
// This is already defined in ts-type-utils.
// type ReturnType<T extends (...args: readonly never[]) => unknown> = T extends (...args: readonly never[]) => infer R ? R : unknown;

/** Obtain the return type of a constructor function type */
type InstanceType<
  T extends abstract new (...args: readonly never[]) => unknown,
> = T extends abstract new (...args: readonly never[]) => infer R ? R : unknown;

/** Convert string literal type to uppercase */
// This is already defined in ts-type-utils.
// type Uppercase<S extends string> = intrinsic;

/** Convert string literal type to lowercase */
type Lowercase<S extends string> = intrinsic;

/** Convert first character of string literal type to uppercase */
type Capitalize<S extends string> = intrinsic;

/** Convert first character of string literal type to lowercase */
type Uncapitalize<S extends string> = intrinsic;

/** Marker for non-inference type position */
type NoInfer<T> = intrinsic;

/** Marker for contextual 'this' type */
interface ThisType<T> {}

/** Stores types to be used with WeakSet, WeakMap, WeakRef, and FinalizationRegistry */
interface WeakKeyTypes {
  readonly object: object;
}

type WeakKey = WeakKeyTypes[keyof WeakKeyTypes];

/** Represents a raw buffer of binary data, which is used to store data for the different typed arrays. ArrayBuffers cannot be read from or written to directly, but can be passed to a typed array or DataView Object to interpret the raw buffer as needed. */
interface ArrayBuffer {
  /** Read-only. The length of the ArrayBuffer (in bytes). */
  readonly byteLength: NumberType.TypedArraySize;

  /** Returns a section of an ArrayBuffer. */
  slice(
    begin?: NumberType.TypedArraySizeArg,
    end?: NumberType.TypedArraySizeArg,
  ): ArrayBuffer;
}

/** Allowed ArrayBuffer types for the buffer of an ArrayBufferView and related Typed Arrays. */
interface ArrayBufferTypes {
  readonly ArrayBuffer: ArrayBuffer;
}
type ArrayBufferLike = ArrayBufferTypes[keyof ArrayBufferTypes];

interface ArrayBufferConstructor {
  readonly prototype: ArrayBuffer;
  new (byteLength: NumberType.TypedArraySize): ArrayBuffer;
  isView(arg: unknown): arg is ArrayBufferView;
}
declare const ArrayBuffer: ArrayBufferConstructor;

interface ArrayBufferView<
  TArrayBuffer extends ArrayBufferLike = ArrayBufferLike,
> {
  /** The ArrayBuffer instance referenced by the array. */
  readonly buffer: TArrayBuffer;

  /** The length in bytes of the array. */
  readonly byteLength: NumberType.TypedArraySize;

  /** The offset in bytes of the array. */
  readonly byteOffset: NumberType.TypedArraySize;
}

interface DataView<TArrayBuffer extends ArrayBufferLike = ArrayBufferLike> {
  readonly buffer: TArrayBuffer;
  readonly byteLength: NumberType.TypedArraySize;
  readonly byteOffset: NumberType.TypedArraySize;
  /**
   * Gets the Float32 value at the specified byte offset from the start of the view. There is no alignment constraint; multi-byte values may be fetched from any offset.
   *
   * @param byteOffset The place in the buffer at which the value should be retrieved.
   * @param littleEndian If false or undefined, a big-endian value should be read.
   */
  getFloat32(
    byteOffset: NumberType.TypedArraySizeArg,
    littleEndian?: boolean,
  ): Float32;

  /**
   * Gets the Float64 value at the specified byte offset from the start of the view. There is no alignment constraint; multi-byte values may be fetched from any offset.
   *
   * @param byteOffset The place in the buffer at which the value should be retrieved.
   * @param littleEndian If false or undefined, a big-endian value should be read.
   */
  getFloat64(
    byteOffset: NumberType.TypedArraySizeArg,
    littleEndian?: boolean,
  ): Float64;

  /**
   * Gets the Int8 value at the specified byte offset from the start of the view. There is no alignment constraint; multi-byte values may be fetched from any offset.
   *
   * @param byteOffset The place in the buffer at which the value should be retrieved.
   */
  getInt8(byteOffset: NumberType.TypedArraySizeArg): Int8;

  /**
   * Gets the Int16 value at the specified byte offset from the start of the view. There is no alignment constraint; multi-byte values may be fetched from any offset.
   *
   * @param byteOffset The place in the buffer at which the value should be retrieved.
   * @param littleEndian If false or undefined, a big-endian value should be read.
   */
  getInt16(
    byteOffset: NumberType.TypedArraySizeArg,
    littleEndian?: boolean,
  ): Int16;
  /**
   * Gets the Int32 value at the specified byte offset from the start of the view. There is no alignment constraint; multi-byte values may be fetched from any offset.
   *
   * @param byteOffset The place in the buffer at which the value should be retrieved.
   * @param littleEndian If false or undefined, a big-endian value should be read.
   */
  getInt32(
    byteOffset: NumberType.TypedArraySizeArg,
    littleEndian?: boolean,
  ): Int32;

  /**
   * Gets the Uint8 value at the specified byte offset from the start of the view. There is no alignment constraint; multi-byte values may be fetched from any offset.
   *
   * @param byteOffset The place in the buffer at which the value should be retrieved.
   */
  getUint8(byteOffset: NumberType.TypedArraySizeArg): Uint8;

  /**
   * Gets the Uint16 value at the specified byte offset from the start of the view. There is no alignment constraint; multi-byte values may be fetched from any offset.
   *
   * @param byteOffset The place in the buffer at which the value should be retrieved.
   * @param littleEndian If false or undefined, a big-endian value should be read.
   */
  getUint16(
    byteOffset: NumberType.TypedArraySizeArg,
    littleEndian?: boolean,
  ): Uint16;

  /**
   * Gets the Uint32 value at the specified byte offset from the start of the view. There is no alignment constraint; multi-byte values may be fetched from any offset.
   *
   * @param byteOffset The place in the buffer at which the value should be retrieved.
   * @param littleEndian If false or undefined, a big-endian value should be read.
   */
  getUint32(
    byteOffset: NumberType.TypedArraySizeArg,
    littleEndian?: boolean,
  ): Uint32;

  /**
   * Stores an Float32 value at the specified byte offset from the start of the view.
   *
   * @param byteOffset The place in the buffer at which the value should be set.
   * @param value The value to set.
   * @param littleEndian If false or undefined, a big-endian value should be written.
   */
  setFloat32(
    byteOffset: NumberType.TypedArraySizeArg,
    value: Float32,
    littleEndian?: boolean,
  ): void;

  /**
   * Stores an Float64 value at the specified byte offset from the start of the view.
   *
   * @param byteOffset The place in the buffer at which the value should be set.
   * @param value The value to set.
   * @param littleEndian If false or undefined, a big-endian value should be written.
   */
  setFloat64(
    byteOffset: NumberType.TypedArraySizeArg,
    value: Float64,
    littleEndian?: boolean,
  ): void;

  /**
   * Stores an Int8 value at the specified byte offset from the start of the view.
   *
   * @param byteOffset The place in the buffer at which the value should be set.
   * @param value The value to set.
   */
  setInt8(byteOffset: NumberType.TypedArraySizeArg, value: Int8): void;

  /**
   * Stores an Int16 value at the specified byte offset from the start of the view.
   *
   * @param byteOffset The place in the buffer at which the value should be set.
   * @param value The value to set.
   * @param littleEndian If false or undefined, a big-endian value should be written.
   */
  setInt16(
    byteOffset: NumberType.TypedArraySizeArg,
    value: Int16,
    littleEndian?: boolean,
  ): void;

  /**
   * Stores an Int32 value at the specified byte offset from the start of the view.
   *
   * @param byteOffset The place in the buffer at which the value should be set.
   * @param value The value to set.
   * @param littleEndian If false or undefined, a big-endian value should be written.
   */
  setInt32(
    byteOffset: NumberType.TypedArraySizeArg,
    value: Int32,
    littleEndian?: boolean,
  ): void;

  /**
   * Stores an Uint8 value at the specified byte offset from the start of the view.
   *
   * @param byteOffset The place in the buffer at which the value should be set.
   * @param value The value to set.
   */
  setUint8(byteOffset: NumberType.TypedArraySizeArg, value: Uint8): void;

  /**
   * Stores an Uint16 value at the specified byte offset from the start of the view.
   *
   * @param byteOffset The place in the buffer at which the value should be set.
   * @param value The value to set.
   * @param littleEndian If false or undefined, a big-endian value should be written.
   */
  setUint16(
    byteOffset: NumberType.TypedArraySizeArg,
    value: Uint16,
    littleEndian?: boolean,
  ): void;

  /**
   * Stores an Uint32 value at the specified byte offset from the start of the view.
   *
   * @param byteOffset The place in the buffer at which the value should be set.
   * @param value The value to set.
   * @param littleEndian If false or undefined, a big-endian value should be written.
   */
  setUint32(
    byteOffset: NumberType.TypedArraySizeArg,
    value: Uint32,
    littleEndian?: boolean,
  ): void;
}
interface DataViewConstructor {
  readonly prototype: DataView<ArrayBufferLike>;
  new <
    TArrayBuffer extends ArrayBufferLike & {
      readonly BYTES_PER_ELEMENT?: never;
    },
  >(
    buffer: TArrayBuffer,
    byteOffset?: NumberType.TypedArraySize,
    byteLength?: NumberType.TypedArraySize,
  ): DataView<TArrayBuffer>;
}
declare const DataView: DataViewConstructor;

/** A typed array of 8-bit integer values. The contents are initialized to 0. If the requested number of bytes could not be allocated an exception is raised. */
interface Int8Array<TArrayBuffer extends ArrayBufferLike = ArrayBufferLike> {
  /** The size in bytes of each element in the array. */
  readonly BYTES_PER_ELEMENT: 1;

  /** The ArrayBuffer instance referenced by the array. */
  readonly buffer: TArrayBuffer;

  /** The length in bytes of the array. */
  readonly byteLength: NumberType.TypedArraySize;

  /** The offset in bytes of the array. */
  readonly byteOffset: NumberType.TypedArraySize;

  /**
   * Returns the this object after copying a section of the array identified by start and end to the same array starting at position target
   *
   * @param target If target is negative, it is treated as length+target where length is the length of the array.
   * @param start If start is negative, it is treated as length+start. If end is negative, it is treated as length+end.
   * @param end If not specified, length of the this object is used as its default value.
   */
  copyWithin(
    target: NumberType.TypedArraySizeArg,
    start: NumberType.TypedArraySizeArg,
    end?: NumberType.TypedArraySizeArg,
  ): this;

  /**
   * Determines whether all the members of an array satisfy the specified test.
   *
   * @param predicate A function that accepts up to three arguments. The every method calls the predicate function for each element in the array until the predicate returns a value which is coercible to the Boolean value false, or until the end of the array.
   * @param thisArg An object to which the this keyword can refer in the predicate function. If thisArg is omitted, undefined is used as the this value.
   */
  every(
    predicate: (
      value: Int8,
      index: NumberType.TypedArraySize,
      array: this,
    ) => boolean,
    thisArg?: unknown,
  ): boolean;

  /**
   * Changes all array elements from `start` to `end` index to a static `value` and returns the modified array
   *
   * @param value Value to fill array section with
   * @param start Index to start filling the array at. If start is negative, it is treated as length+start where length is the length of the array.
   * @param end Index to stop filling the array at. If end is negative, it is treated as length+end.
   */
  fill(
    value: Int8,
    start?: NumberType.TypedArraySizeArg,
    end?: NumberType.TypedArraySizeArg,
  ): this;

  /**
   * Returns the elements of an array that meet the condition specified in a callback function.
   *
   * @param predicate A function that accepts up to three arguments. The filter method calls the predicate function one time for each element in the array.
   * @param thisArg An object to which the this keyword can refer in the predicate function. If thisArg is omitted, undefined is used as the this value.
   */
  filter(
    predicate: (
      value: Int8,
      index: NumberType.TypedArraySize,
      array: this,
    ) => boolean,
    thisArg?: unknown,
  ): Int8Array<ArrayBuffer>;

  /**
   * Returns the value of the first element in the array where predicate is true, and undefined otherwise.
   *
   * @param predicate Find calls predicate once for each element of the array, in ascending order, until it finds one where predicate returns true. If such an element is found, find immediately returns that element value. Otherwise, find returns undefined.
   * @param thisArg If provided, it will be used as the this value for each invocation of predicate. If it is not provided, undefined is used instead.
   */
  find(
    predicate: (
      value: Int8,
      index: NumberType.TypedArraySize,
      obj: this,
    ) => boolean,
    thisArg?: unknown,
  ): Int8 | undefined;

  /**
   * Returns the index of the first element in the array where predicate is true, and -1 otherwise.
   *
   * @param predicate Find calls predicate once for each element of the array, in ascending order, until it finds one where predicate returns true. If such an element is found, findIndex immediately returns that element index. Otherwise, findIndex returns -1.
   * @param thisArg If provided, it will be used as the this value for each invocation of predicate. If it is not provided, undefined is used instead.
   */
  findIndex(
    predicate: (
      value: Int8,
      index: NumberType.TypedArraySize,
      obj: this,
    ) => boolean,
    thisArg?: unknown,
  ): NumberType.TypedArraySearchResult;

  /**
   * Performs the specified action for each element in an array.
   *
   * @param callbackfn A function that accepts up to three arguments. forEach calls the callbackfn function one time for each element in the array.
   * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
   */
  forEach(
    callbackfn: (
      value: Int8,
      index: NumberType.TypedArraySize,
      array: this,
    ) => void,
    thisArg?: unknown,
  ): void;

  /**
   * Returns the index of the first occurrence of a value in an array.
   *
   * @param searchElement The value to locate in the array.
   * @param fromIndex The array index at which to begin the search. If fromIndex is omitted, the search starts at index 0.
   */
  indexOf(
    searchElement: Int8,
    fromIndex?: NumberType.TypedArraySizeArg,
  ): NumberType.TypedArraySearchResult;

  /**
   * Adds all the elements of an array separated by the specified separator string.
   *
   * @param separator A string used to separate one element of an array from the next in the resulting String. If omitted, the array elements are separated with a comma.
   */
  join(separator?: string): string;

  /**
   * Returns the index of the last occurrence of a value in an array.
   *
   * @param searchElement The value to locate in the array.
   * @param fromIndex The array index at which to begin the search. If fromIndex is omitted, the search starts at index 0.
   */
  lastIndexOf(
    searchElement: Int8,
    fromIndex?: NumberType.TypedArraySizeArg,
  ): NumberType.TypedArraySearchResult;

  /** The length of the array. */
  readonly length: number;

  /**
   * Calls a defined callback function on each element of an array, and returns an array that contains the results.
   *
   * @param callbackfn A function that accepts up to three arguments. The map method calls the callbackfn function one time for each element in the array.
   * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
   */
  map(
    callbackfn: (
      value: Int8,
      index: NumberType.TypedArraySize,
      array: this,
    ) => Int8,
    thisArg?: unknown,
  ): Int8Array<ArrayBuffer>;

  /**
   * Calls the specified callback function for all the elements in an array. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
   *
   * @param callbackfn A function that accepts up to four arguments. The reduce method calls the callbackfn function one time for each element in the array.
   * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of an array value.
   */
  reduce(
    callbackfn: (
      previousValue: Int8,
      currentValue: Int8,
      currentIndex: NumberType.TypedArraySize,
      array: this,
    ) => Int8,
  ): Int8;
  reduce(
    callbackfn: (
      previousValue: Int8,
      currentValue: Int8,
      currentIndex: NumberType.TypedArraySize,
      array: this,
    ) => Int8,
    initialValue: Int8,
  ): Int8;

  /**
   * Calls the specified callback function for all the elements in an array. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
   *
   * @param callbackfn A function that accepts up to four arguments. The reduce method calls the callbackfn function one time for each element in the array.
   * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of an array value.
   */
  reduce<U>(
    callbackfn: (
      previousValue: U,
      currentValue: Int8,
      currentIndex: NumberType.TypedArraySize,
      array: this,
    ) => U,
    initialValue: U,
  ): U;

  /**
   * Calls the specified callback function for all the elements in an array, in descending order. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
   *
   * @param callbackfn A function that accepts up to four arguments. The reduceRight method calls the callbackfn function one time for each element in the array.
   * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of an array value.
   */
  reduceRight(
    callbackfn: (
      previousValue: Int8,
      currentValue: Int8,
      currentIndex: NumberType.TypedArraySize,
      array: this,
    ) => Int8,
  ): Int8;
  reduceRight(
    callbackfn: (
      previousValue: Int8,
      currentValue: Int8,
      currentIndex: NumberType.TypedArraySize,
      array: this,
    ) => Int8,
    initialValue: Int8,
  ): Int8;

  /**
   * Calls the specified callback function for all the elements in an array, in descending order. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
   *
   * @param callbackfn A function that accepts up to four arguments. The reduceRight method calls the callbackfn function one time for each element in the array.
   * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of an array value.
   */
  reduceRight<U>(
    callbackfn: (
      previousValue: U,
      currentValue: Int8,
      currentIndex: NumberType.TypedArraySize,
      array: this,
    ) => U,
    initialValue: U,
  ): U;

  /** Reverses the elements in an Array. */
  reverse(): this;

  /**
   * Sets a value or an array of values.
   *
   * @param array A typed or untyped array of values to set.
   * @param offset The index in the current array at which the values are to be written.
   */
  set(
    array: ArrayLike<Int8>,
    offset?: NumberType.TypedArraySizeArgNonNegative,
  ): void;

  /**
   * Returns a section of an array.
   *
   * @param start The beginning of the specified portion of the array.
   * @param end The end of the specified portion of the array. This is exclusive of the element at the index 'end'.
   */
  slice(
    start?: NumberType.TypedArraySizeArg,
    end?: NumberType.TypedArraySizeArg,
  ): Int8Array<ArrayBuffer>;

  /**
   * Determines whether the specified callback function returns true for any element of an array.
   *
   * @param predicate A function that accepts up to three arguments. The some method calls the predicate function for each element in the array until the predicate returns a value which is coercible to the Boolean value true, or until the end of the array.
   * @param thisArg An object to which the this keyword can refer in the predicate function. If thisArg is omitted, undefined is used as the this value.
   */
  some(
    predicate: (
      value: Int8,
      index: NumberType.TypedArraySize,
      array: this,
    ) => boolean,
    thisArg?: unknown,
  ): boolean;

  /**
   * Sorts an array.
   *
   * @param compareFn Function used to determine the order of the elements. It is expected to return a negative value if the first argument is less than the second argument, zero if they're equal, and a positive value otherwise. If omitted, the elements are sorted in ascending order.
   *
   *   ```ts
   *   [11, 2, 22, 1].sort((a, b) => a - b);
   *   ```
   */
  sort(compareFn?: (a: Int8, b: Int8) => number): this;

  /**
   * Gets a new Int8Array view of the ArrayBuffer store for this array, referencing the elements at begin, inclusive, up to end, exclusive.
   *
   * @param begin The index of the beginning of the array.
   * @param end The index of the end of the array.
   */
  subarray(
    begin?: NumberType.TypedArraySizeArg,
    end?: NumberType.TypedArraySizeArg,
  ): Int8Array<TArrayBuffer>;

  /** Converts a number to a string by using the current locale. */
  toLocaleString(): string;

  /** Returns a string representation of an array. */
  toString(): string;

  /** Returns the primitive value of the specified object. */
  valueOf(): this;

  [index: number]: Int8;
}
interface Int8ArrayConstructor {
  readonly prototype: Int8Array<ArrayBufferLike>;
  new (length: NumberType.TypedArraySize): Int8Array<ArrayBuffer>;
  new (array: ArrayLike<Int8>): Int8Array<ArrayBuffer>;
  new <TArrayBuffer extends ArrayBufferLike = ArrayBuffer>(
    buffer: TArrayBuffer,
    byteOffset?: NumberType.TypedArraySize,
    length?: NumberType.TypedArraySize,
  ): Int8Array<TArrayBuffer>;
  new (array: ArrayLike<Int8> | ArrayBuffer): Int8Array<ArrayBuffer>;

  /** The size in bytes of each element in the array. */
  readonly BYTES_PER_ELEMENT: 1;

  /**
   * Returns a new array from a set of elements.
   *
   * @param items A set of elements to include in the new array object.
   */
  of(...items: readonly Int8[]): Int8Array<ArrayBuffer>;

  /**
   * Creates an array from an array-like or iterable object.
   *
   * @param arrayLike An array-like or iterable object to convert to an array.
   */
  from(arrayLike: ArrayLike<Int8>): Int8Array<ArrayBuffer>;

  /**
   * Creates an array from an array-like or iterable object.
   *
   * @param arrayLike An array-like or iterable object to convert to an array.
   * @param mapfn A mapping function to call on every element of the array.
   * @param thisArg Value of 'this' used to invoke the mapfn.
   */
  from<T>(
    arrayLike: ArrayLike<T>,
    mapfn: (v: T, k: NumberType.TypedArraySize) => Int8,
    thisArg?: unknown,
  ): Int8Array<ArrayBuffer>;
}
declare const Int8Array: Int8ArrayConstructor;

/** A typed array of 8-bit unsigned integer values. The contents are initialized to 0. If the requested number of bytes could not be allocated an exception is raised. */
interface Uint8Array<TArrayBuffer extends ArrayBufferLike = ArrayBufferLike> {
  /** The size in bytes of each element in the array. */
  readonly BYTES_PER_ELEMENT: 1;

  /** The ArrayBuffer instance referenced by the array. */
  readonly buffer: TArrayBuffer;

  /** The length in bytes of the array. */
  readonly byteLength: NumberType.TypedArraySize;

  /** The offset in bytes of the array. */
  readonly byteOffset: NumberType.TypedArraySize;

  /**
   * Returns the this object after copying a section of the array identified by start and end to the same array starting at position target
   *
   * @param target If target is negative, it is treated as length+target where length is the length of the array.
   * @param start If start is negative, it is treated as length+start. If end is negative, it is treated as length+end.
   * @param end If not specified, length of the this object is used as its default value.
   */
  copyWithin(
    target: NumberType.TypedArraySizeArg,
    start: NumberType.TypedArraySizeArg,
    end?: NumberType.TypedArraySizeArg,
  ): this;

  /**
   * Determines whether all the members of an array satisfy the specified test.
   *
   * @param predicate A function that accepts up to three arguments. The every method calls the predicate function for each element in the array until the predicate returns a value which is coercible to the Boolean value false, or until the end of the array.
   * @param thisArg An object to which the this keyword can refer in the predicate function. If thisArg is omitted, undefined is used as the this value.
   */
  every(
    predicate: (
      value: Uint8,
      index: NumberType.TypedArraySize,
      array: this,
    ) => boolean,
    thisArg?: unknown,
  ): boolean;

  /**
   * Changes all array elements from `start` to `end` index to a static `value` and returns the modified array
   *
   * @param value Value to fill array section with
   * @param start Index to start filling the array at. If start is negative, it is treated as length+start where length is the length of the array.
   * @param end Index to stop filling the array at. If end is negative, it is treated as length+end.
   */
  fill(
    value: Uint8,
    start?: NumberType.TypedArraySizeArg,
    end?: NumberType.TypedArraySizeArg,
  ): this;

  /**
   * Returns the elements of an array that meet the condition specified in a callback function.
   *
   * @param predicate A function that accepts up to three arguments. The filter method calls the predicate function one time for each element in the array.
   * @param thisArg An object to which the this keyword can refer in the predicate function. If thisArg is omitted, undefined is used as the this value.
   */
  filter(
    predicate: (
      value: Uint8,
      index: NumberType.TypedArraySize,
      array: this,
    ) => boolean,
    thisArg?: unknown,
  ): Uint8Array<ArrayBuffer>;

  /**
   * Returns the value of the first element in the array where predicate is true, and undefined otherwise.
   *
   * @param predicate Find calls predicate once for each element of the array, in ascending order, until it finds one where predicate returns true. If such an element is found, find immediately returns that element value. Otherwise, find returns undefined.
   * @param thisArg If provided, it will be used as the this value for each invocation of predicate. If it is not provided, undefined is used instead.
   */
  find(
    predicate: (
      value: Uint8,
      index: NumberType.TypedArraySize,
      obj: this,
    ) => boolean,
    thisArg?: unknown,
  ): Uint8 | undefined;

  /**
   * Returns the index of the first element in the array where predicate is true, and -1 otherwise.
   *
   * @param predicate Find calls predicate once for each element of the array, in ascending order, until it finds one where predicate returns true. If such an element is found, findIndex immediately returns that element index. Otherwise, findIndex returns -1.
   * @param thisArg If provided, it will be used as the this value for each invocation of predicate. If it is not provided, undefined is used instead.
   */
  findIndex(
    predicate: (
      value: Uint8,
      index: NumberType.TypedArraySize,
      obj: this,
    ) => boolean,
    thisArg?: unknown,
  ): NumberType.TypedArraySearchResult;

  /**
   * Performs the specified action for each element in an array.
   *
   * @param callbackfn A function that accepts up to three arguments. forEach calls the callbackfn function one time for each element in the array.
   * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
   */
  forEach(
    callbackfn: (
      value: Uint8,
      index: NumberType.TypedArraySize,
      array: this,
    ) => void,
    thisArg?: unknown,
  ): void;

  /**
   * Returns the index of the first occurrence of a value in an array.
   *
   * @param searchElement The value to locate in the array.
   * @param fromIndex The array index at which to begin the search. If fromIndex is omitted, the search starts at index 0.
   */
  indexOf(
    searchElement: Uint8,
    fromIndex?: NumberType.TypedArraySizeArg,
  ): NumberType.TypedArraySearchResult;

  /**
   * Adds all the elements of an array separated by the specified separator string.
   *
   * @param separator A string used to separate one element of an array from the next in the resulting String. If omitted, the array elements are separated with a comma.
   */
  join(separator?: string): string;

  /**
   * Returns the index of the last occurrence of a value in an array.
   *
   * @param searchElement The value to locate in the array.
   * @param fromIndex The array index at which to begin the search. If fromIndex is omitted, the search starts at index 0.
   */
  lastIndexOf(
    searchElement: Uint8,
    fromIndex?: NumberType.TypedArraySizeArg,
  ): NumberType.TypedArraySearchResult;

  /** The length of the array. */
  readonly length: number;

  /**
   * Calls a defined callback function on each element of an array, and returns an array that contains the results.
   *
   * @param callbackfn A function that accepts up to three arguments. The map method calls the callbackfn function one time for each element in the array.
   * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
   */
  map(
    callbackfn: (
      value: Uint8,
      index: NumberType.TypedArraySize,
      array: this,
    ) => Uint8,
    thisArg?: unknown,
  ): Uint8Array<ArrayBuffer>;

  /**
   * Calls the specified callback function for all the elements in an array. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
   *
   * @param callbackfn A function that accepts up to four arguments. The reduce method calls the callbackfn function one time for each element in the array.
   * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of an array value.
   */
  reduce(
    callbackfn: (
      previousValue: Uint8,
      currentValue: Uint8,
      currentIndex: NumberType.TypedArraySize,
      array: this,
    ) => Uint8,
  ): Uint8;
  reduce(
    callbackfn: (
      previousValue: Uint8,
      currentValue: Uint8,
      currentIndex: NumberType.TypedArraySize,
      array: this,
    ) => Uint8,
    initialValue: Uint8,
  ): Uint8;

  /**
   * Calls the specified callback function for all the elements in an array. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
   *
   * @param callbackfn A function that accepts up to four arguments. The reduce method calls the callbackfn function one time for each element in the array.
   * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of an array value.
   */
  reduce<U>(
    callbackfn: (
      previousValue: U,
      currentValue: Uint8,
      currentIndex: NumberType.TypedArraySize,
      array: this,
    ) => U,
    initialValue: U,
  ): U;

  /**
   * Calls the specified callback function for all the elements in an array, in descending order. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
   *
   * @param callbackfn A function that accepts up to four arguments. The reduceRight method calls the callbackfn function one time for each element in the array.
   * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of an array value.
   */
  reduceRight(
    callbackfn: (
      previousValue: Uint8,
      currentValue: Uint8,
      currentIndex: NumberType.TypedArraySize,
      array: this,
    ) => Uint8,
  ): Uint8;
  reduceRight(
    callbackfn: (
      previousValue: Uint8,
      currentValue: Uint8,
      currentIndex: NumberType.TypedArraySize,
      array: this,
    ) => Uint8,
    initialValue: Uint8,
  ): Uint8;

  /**
   * Calls the specified callback function for all the elements in an array, in descending order. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
   *
   * @param callbackfn A function that accepts up to four arguments. The reduceRight method calls the callbackfn function one time for each element in the array.
   * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of an array value.
   */
  reduceRight<U>(
    callbackfn: (
      previousValue: U,
      currentValue: Uint8,
      currentIndex: NumberType.TypedArraySize,
      array: this,
    ) => U,
    initialValue: U,
  ): U;

  /** Reverses the elements in an Array. */
  reverse(): this;

  /**
   * Sets a value or an array of values.
   *
   * @param array A typed or untyped array of values to set.
   * @param offset The index in the current array at which the values are to be written.
   */
  set(
    array: ArrayLike<Uint8>,
    offset?: NumberType.TypedArraySizeArgNonNegative,
  ): void;

  /**
   * Returns a section of an array.
   *
   * @param start The beginning of the specified portion of the array.
   * @param end The end of the specified portion of the array. This is exclusive of the element at the index 'end'.
   */
  slice(
    start?: NumberType.TypedArraySizeArg,
    end?: NumberType.TypedArraySizeArg,
  ): Uint8Array<ArrayBuffer>;

  /**
   * Determines whether the specified callback function returns true for any element of an array.
   *
   * @param predicate A function that accepts up to three arguments. The some method calls the predicate function for each element in the array until the predicate returns a value which is coercible to the Boolean value true, or until the end of the array.
   * @param thisArg An object to which the this keyword can refer in the predicate function. If thisArg is omitted, undefined is used as the this value.
   */
  some(
    predicate: (
      value: Uint8,
      index: NumberType.TypedArraySize,
      array: this,
    ) => boolean,
    thisArg?: unknown,
  ): boolean;

  /**
   * Sorts an array.
   *
   * @param compareFn Function used to determine the order of the elements. It is expected to return a negative value if the first argument is less than the second argument, zero if they're equal, and a positive value otherwise. If omitted, the elements are sorted in ascending order.
   *
   *   ```ts
   *   [11, 2, 22, 1].sort((a, b) => a - b);
   *   ```
   */
  sort(compareFn?: (a: Uint8, b: Uint8) => number): this;

  /**
   * Gets a new Uint8Array view of the ArrayBuffer store for this array, referencing the elements at begin, inclusive, up to end, exclusive.
   *
   * @param begin The index of the beginning of the array.
   * @param end The index of the end of the array.
   */
  subarray(
    begin?: NumberType.TypedArraySizeArg,
    end?: NumberType.TypedArraySizeArg,
  ): Uint8Array<TArrayBuffer>;

  /** Converts a number to a string by using the current locale. */
  toLocaleString(): string;

  /** Returns a string representation of an array. */
  toString(): string;

  /** Returns the primitive value of the specified object. */
  valueOf(): this;

  [index: number]: Uint8;
}
interface Uint8ArrayConstructor {
  readonly prototype: Uint8Array<ArrayBufferLike>;
  new (length: NumberType.TypedArraySize): Uint8Array<ArrayBuffer>;
  new (array: ArrayLike<Uint8>): Uint8Array<ArrayBuffer>;
  new <TArrayBuffer extends ArrayBufferLike = ArrayBuffer>(
    buffer: TArrayBuffer,
    byteOffset?: NumberType.TypedArraySize,
    length?: NumberType.TypedArraySize,
  ): Uint8Array<TArrayBuffer>;
  new (array: ArrayLike<Uint8> | ArrayBuffer): Uint8Array<ArrayBuffer>;

  /** The size in bytes of each element in the array. */
  readonly BYTES_PER_ELEMENT: 1;

  /**
   * Returns a new array from a set of elements.
   *
   * @param items A set of elements to include in the new array object.
   */
  of(...items: readonly Uint8[]): Uint8Array<ArrayBuffer>;

  /**
   * Creates an array from an array-like or iterable object.
   *
   * @param arrayLike An array-like or iterable object to convert to an array.
   */
  from(arrayLike: ArrayLike<Uint8>): Uint8Array<ArrayBuffer>;

  /**
   * Creates an array from an array-like or iterable object.
   *
   * @param arrayLike An array-like or iterable object to convert to an array.
   * @param mapfn A mapping function to call on every element of the array.
   * @param thisArg Value of 'this' used to invoke the mapfn.
   */
  from<T>(
    arrayLike: ArrayLike<T>,
    mapfn: (v: T, k: NumberType.TypedArraySize) => Uint8,
    thisArg?: unknown,
  ): Uint8Array<ArrayBuffer>;
}
declare const Uint8Array: Uint8ArrayConstructor;

/** A typed array of 8-bit unsigned integer (clamped) values. The contents are initialized to 0. If the requested number of bytes could not be allocated an exception is raised. */
interface Uint8ClampedArray<
  TArrayBuffer extends ArrayBufferLike = ArrayBufferLike,
> {
  /** The size in bytes of each element in the array. */
  readonly BYTES_PER_ELEMENT: 1;

  /** The ArrayBuffer instance referenced by the array. */
  readonly buffer: TArrayBuffer;

  /** The length in bytes of the array. */
  readonly byteLength: NumberType.TypedArraySize;

  /** The offset in bytes of the array. */
  readonly byteOffset: NumberType.TypedArraySize;

  /**
   * Returns the this object after copying a section of the array identified by start and end to the same array starting at position target
   *
   * @param target If target is negative, it is treated as length+target where length is the length of the array.
   * @param start If start is negative, it is treated as length+start. If end is negative, it is treated as length+end.
   * @param end If not specified, length of the this object is used as its default value.
   */
  copyWithin(
    target: NumberType.TypedArraySizeArg,
    start: NumberType.TypedArraySizeArg,
    end?: NumberType.TypedArraySizeArg,
  ): this;

  /**
   * Determines whether all the members of an array satisfy the specified test.
   *
   * @param predicate A function that accepts up to three arguments. The every method calls the predicate function for each element in the array until the predicate returns a value which is coercible to the Boolean value false, or until the end of the array.
   * @param thisArg An object to which the this keyword can refer in the predicate function. If thisArg is omitted, undefined is used as the this value.
   */
  every(
    predicate: (
      value: Uint8,
      index: NumberType.TypedArraySize,
      array: this,
    ) => boolean,
    thisArg?: unknown,
  ): boolean;

  /**
   * Changes all array elements from `start` to `end` index to a static `value` and returns the modified array
   *
   * @param value Value to fill array section with
   * @param start Index to start filling the array at. If start is negative, it is treated as length+start where length is the length of the array.
   * @param end Index to stop filling the array at. If end is negative, it is treated as length+end.
   */
  fill(
    value: Uint8,
    start?: NumberType.TypedArraySizeArg,
    end?: NumberType.TypedArraySizeArg,
  ): this;

  /**
   * Returns the elements of an array that meet the condition specified in a callback function.
   *
   * @param predicate A function that accepts up to three arguments. The filter method calls the predicate function one time for each element in the array.
   * @param thisArg An object to which the this keyword can refer in the predicate function. If thisArg is omitted, undefined is used as the this value.
   */
  filter(
    predicate: (
      value: Uint8,
      index: NumberType.TypedArraySize,
      array: this,
    ) => boolean,
    thisArg?: unknown,
  ): Uint8ClampedArray<ArrayBuffer>;

  /**
   * Returns the value of the first element in the array where predicate is true, and undefined otherwise.
   *
   * @param predicate Find calls predicate once for each element of the array, in ascending order, until it finds one where predicate returns true. If such an element is found, find immediately returns that element value. Otherwise, find returns undefined.
   * @param thisArg If provided, it will be used as the this value for each invocation of predicate. If it is not provided, undefined is used instead.
   */
  find(
    predicate: (
      value: Uint8,
      index: NumberType.TypedArraySize,
      obj: this,
    ) => boolean,
    thisArg?: unknown,
  ): Uint8 | undefined;

  /**
   * Returns the index of the first element in the array where predicate is true, and -1 otherwise.
   *
   * @param predicate Find calls predicate once for each element of the array, in ascending order, until it finds one where predicate returns true. If such an element is found, findIndex immediately returns that element index. Otherwise, findIndex returns -1.
   * @param thisArg If provided, it will be used as the this value for each invocation of predicate. If it is not provided, undefined is used instead.
   */
  findIndex(
    predicate: (
      value: Uint8,
      index: NumberType.TypedArraySize,
      obj: this,
    ) => boolean,
    thisArg?: unknown,
  ): NumberType.TypedArraySearchResult;

  /**
   * Performs the specified action for each element in an array.
   *
   * @param callbackfn A function that accepts up to three arguments. forEach calls the callbackfn function one time for each element in the array.
   * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
   */
  forEach(
    callbackfn: (
      value: Uint8,
      index: NumberType.TypedArraySize,
      array: this,
    ) => void,
    thisArg?: unknown,
  ): void;

  /**
   * Returns the index of the first occurrence of a value in an array.
   *
   * @param searchElement The value to locate in the array.
   * @param fromIndex The array index at which to begin the search. If fromIndex is omitted, the search starts at index 0.
   */
  indexOf(
    searchElement: Uint8,
    fromIndex?: NumberType.TypedArraySizeArg,
  ): NumberType.TypedArraySearchResult;

  /**
   * Adds all the elements of an array separated by the specified separator string.
   *
   * @param separator A string used to separate one element of an array from the next in the resulting String. If omitted, the array elements are separated with a comma.
   */
  join(separator?: string): string;

  /**
   * Returns the index of the last occurrence of a value in an array.
   *
   * @param searchElement The value to locate in the array.
   * @param fromIndex The array index at which to begin the search. If fromIndex is omitted, the search starts at index 0.
   */
  lastIndexOf(
    searchElement: Uint8,
    fromIndex?: NumberType.TypedArraySizeArg,
  ): NumberType.TypedArraySearchResult;

  /** The length of the array. */
  readonly length: number;

  /**
   * Calls a defined callback function on each element of an array, and returns an array that contains the results.
   *
   * @param callbackfn A function that accepts up to three arguments. The map method calls the callbackfn function one time for each element in the array.
   * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
   */
  map(
    callbackfn: (
      value: Uint8,
      index: NumberType.TypedArraySize,
      array: this,
    ) => Uint8,
    thisArg?: unknown,
  ): Uint8ClampedArray<ArrayBuffer>;

  /**
   * Calls the specified callback function for all the elements in an array. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
   *
   * @param callbackfn A function that accepts up to four arguments. The reduce method calls the callbackfn function one time for each element in the array.
   * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of an array value.
   */
  reduce(
    callbackfn: (
      previousValue: Uint8,
      currentValue: Uint8,
      currentIndex: NumberType.TypedArraySize,
      array: this,
    ) => Uint8,
  ): Uint8;
  reduce(
    callbackfn: (
      previousValue: Uint8,
      currentValue: Uint8,
      currentIndex: NumberType.TypedArraySize,
      array: this,
    ) => Uint8,
    initialValue: Uint8,
  ): Uint8;

  /**
   * Calls the specified callback function for all the elements in an array. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
   *
   * @param callbackfn A function that accepts up to four arguments. The reduce method calls the callbackfn function one time for each element in the array.
   * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of an array value.
   */
  reduce<U>(
    callbackfn: (
      previousValue: U,
      currentValue: Uint8,
      currentIndex: NumberType.TypedArraySize,
      array: this,
    ) => U,
    initialValue: U,
  ): U;

  /**
   * Calls the specified callback function for all the elements in an array, in descending order. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
   *
   * @param callbackfn A function that accepts up to four arguments. The reduceRight method calls the callbackfn function one time for each element in the array.
   * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of an array value.
   */
  reduceRight(
    callbackfn: (
      previousValue: Uint8,
      currentValue: Uint8,
      currentIndex: NumberType.TypedArraySize,
      array: this,
    ) => Uint8,
  ): Uint8;
  reduceRight(
    callbackfn: (
      previousValue: Uint8,
      currentValue: Uint8,
      currentIndex: NumberType.TypedArraySize,
      array: this,
    ) => Uint8,
    initialValue: Uint8,
  ): Uint8;

  /**
   * Calls the specified callback function for all the elements in an array, in descending order. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
   *
   * @param callbackfn A function that accepts up to four arguments. The reduceRight method calls the callbackfn function one time for each element in the array.
   * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of an array value.
   */
  reduceRight<U>(
    callbackfn: (
      previousValue: U,
      currentValue: Uint8,
      currentIndex: NumberType.TypedArraySize,
      array: this,
    ) => U,
    initialValue: U,
  ): U;

  /** Reverses the elements in an Array. */
  reverse(): this;

  /**
   * Sets a value or an array of values.
   *
   * @param array A typed or untyped array of values to set.
   * @param offset The index in the current array at which the values are to be written.
   */
  set(
    array: ArrayLike<Uint8>,
    offset?: NumberType.TypedArraySizeArgNonNegative,
  ): void;

  /**
   * Returns a section of an array.
   *
   * @param start The beginning of the specified portion of the array.
   * @param end The end of the specified portion of the array. This is exclusive of the element at the index 'end'.
   */
  slice(
    start?: NumberType.TypedArraySizeArg,
    end?: NumberType.TypedArraySizeArg,
  ): Uint8ClampedArray<ArrayBuffer>;

  /**
   * Determines whether the specified callback function returns true for any element of an array.
   *
   * @param predicate A function that accepts up to three arguments. The some method calls the predicate function for each element in the array until the predicate returns a value which is coercible to the Boolean value true, or until the end of the array.
   * @param thisArg An object to which the this keyword can refer in the predicate function. If thisArg is omitted, undefined is used as the this value.
   */
  some(
    predicate: (
      value: Uint8,
      index: NumberType.TypedArraySize,
      array: this,
    ) => boolean,
    thisArg?: unknown,
  ): boolean;

  /**
   * Sorts an array.
   *
   * @param compareFn Function used to determine the order of the elements. It is expected to return a negative value if the first argument is less than the second argument, zero if they're equal, and a positive value otherwise. If omitted, the elements are sorted in ascending order.
   *
   *   ```ts
   *   [11, 2, 22, 1].sort((a, b) => a - b);
   *   ```
   */
  sort(compareFn?: (a: Uint8, b: Uint8) => number): this;

  /**
   * Gets a new Uint8ClampedArray view of the ArrayBuffer store for this array, referencing the elements at begin, inclusive, up to end, exclusive.
   *
   * @param begin The index of the beginning of the array.
   * @param end The index of the end of the array.
   */
  subarray(
    begin?: NumberType.TypedArraySizeArg,
    end?: NumberType.TypedArraySizeArg,
  ): Uint8ClampedArray<TArrayBuffer>;

  /** Converts a number to a string by using the current locale. */
  toLocaleString(): string;

  /** Returns a string representation of an array. */
  toString(): string;

  /** Returns the primitive value of the specified object. */
  valueOf(): this;

  [index: number]: Uint8;
}
interface Uint8ClampedArrayConstructor {
  readonly prototype: Uint8ClampedArray<ArrayBufferLike>;
  new (length: NumberType.TypedArraySize): Uint8ClampedArray<ArrayBuffer>;
  new (array: ArrayLike<Uint8>): Uint8ClampedArray<ArrayBuffer>;
  new <TArrayBuffer extends ArrayBufferLike = ArrayBuffer>(
    buffer: TArrayBuffer,
    byteOffset?: NumberType.TypedArraySize,
    length?: NumberType.TypedArraySize,
  ): Uint8ClampedArray<TArrayBuffer>;
  new (array: ArrayLike<Uint8> | ArrayBuffer): Uint8ClampedArray<ArrayBuffer>;

  /** The size in bytes of each element in the array. */
  readonly BYTES_PER_ELEMENT: 1;

  /**
   * Returns a new array from a set of elements.
   *
   * @param items A set of elements to include in the new array object.
   */
  of(...items: readonly Uint8[]): Uint8ClampedArray<ArrayBuffer>;

  /**
   * Creates an array from an array-like or iterable object.
   *
   * @param arrayLike An array-like or iterable object to convert to an array.
   */
  from(arrayLike: ArrayLike<Uint8>): Uint8ClampedArray<ArrayBuffer>;

  /**
   * Creates an array from an array-like or iterable object.
   *
   * @param arrayLike An array-like or iterable object to convert to an array.
   * @param mapfn A mapping function to call on every element of the array.
   * @param thisArg Value of 'this' used to invoke the mapfn.
   */
  from<T>(
    arrayLike: ArrayLike<T>,
    mapfn: (v: T, k: NumberType.TypedArraySize) => Uint8,
    thisArg?: unknown,
  ): Uint8ClampedArray<ArrayBuffer>;
}
declare const Uint8ClampedArray: Uint8ClampedArrayConstructor;

/** A typed array of 16-bit signed integer values. The contents are initialized to 0. If the requested number of bytes could not be allocated an exception is raised. */
interface Int16Array<TArrayBuffer extends ArrayBufferLike = ArrayBufferLike> {
  /** The size in bytes of each element in the array. */
  readonly BYTES_PER_ELEMENT: 2;

  /** The ArrayBuffer instance referenced by the array. */
  readonly buffer: TArrayBuffer;

  /** The length in bytes of the array. */
  readonly byteLength: NumberType.TypedArraySize;

  /** The offset in bytes of the array. */
  readonly byteOffset: NumberType.TypedArraySize;

  /**
   * Returns the this object after copying a section of the array identified by start and end to the same array starting at position target
   *
   * @param target If target is negative, it is treated as length+target where length is the length of the array.
   * @param start If start is negative, it is treated as length+start. If end is negative, it is treated as length+end.
   * @param end If not specified, length of the this object is used as its default value.
   */
  copyWithin(
    target: NumberType.TypedArraySizeArg,
    start: NumberType.TypedArraySizeArg,
    end?: NumberType.TypedArraySizeArg,
  ): this;

  /**
   * Determines whether all the members of an array satisfy the specified test.
   *
   * @param predicate A function that accepts up to three arguments. The every method calls the predicate function for each element in the array until the predicate returns a value which is coercible to the Boolean value false, or until the end of the array.
   * @param thisArg An object to which the this keyword can refer in the predicate function. If thisArg is omitted, undefined is used as the this value.
   */
  every(
    predicate: (
      value: Int16,
      index: NumberType.TypedArraySize,
      array: this,
    ) => boolean,
    thisArg?: unknown,
  ): boolean;

  /**
   * Changes all array elements from `start` to `end` index to a static `value` and returns the modified array
   *
   * @param value Value to fill array section with
   * @param start Index to start filling the array at. If start is negative, it is treated as length+start where length is the length of the array.
   * @param end Index to stop filling the array at. If end is negative, it is treated as length+end.
   */
  fill(
    value: Int16,
    start?: NumberType.TypedArraySizeArg,
    end?: NumberType.TypedArraySizeArg,
  ): this;

  /**
   * Returns the elements of an array that meet the condition specified in a callback function.
   *
   * @param predicate A function that accepts up to three arguments. The filter method calls the predicate function one time for each element in the array.
   * @param thisArg An object to which the this keyword can refer in the predicate function. If thisArg is omitted, undefined is used as the this value.
   */
  filter(
    predicate: (
      value: Int16,
      index: NumberType.TypedArraySize,
      array: this,
    ) => boolean,
    thisArg?: unknown,
  ): Int16Array<ArrayBuffer>;

  /**
   * Returns the value of the first element in the array where predicate is true, and undefined otherwise.
   *
   * @param predicate Find calls predicate once for each element of the array, in ascending order, until it finds one where predicate returns true. If such an element is found, find immediately returns that element value. Otherwise, find returns undefined.
   * @param thisArg If provided, it will be used as the this value for each invocation of predicate. If it is not provided, undefined is used instead.
   */
  find(
    predicate: (
      value: Int16,
      index: NumberType.TypedArraySize,
      obj: this,
    ) => boolean,
    thisArg?: unknown,
  ): Int16 | undefined;

  /**
   * Returns the index of the first element in the array where predicate is true, and -1 otherwise.
   *
   * @param predicate Find calls predicate once for each element of the array, in ascending order, until it finds one where predicate returns true. If such an element is found, findIndex immediately returns that element index. Otherwise, findIndex returns -1.
   * @param thisArg If provided, it will be used as the this value for each invocation of predicate. If it is not provided, undefined is used instead.
   */
  findIndex(
    predicate: (
      value: Int16,
      index: NumberType.TypedArraySize,
      obj: this,
    ) => boolean,
    thisArg?: unknown,
  ): NumberType.TypedArraySearchResult;

  /**
   * Performs the specified action for each element in an array.
   *
   * @param callbackfn A function that accepts up to three arguments. forEach calls the callbackfn function one time for each element in the array.
   * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
   */
  forEach(
    callbackfn: (
      value: Int16,
      index: NumberType.TypedArraySize,
      array: this,
    ) => void,
    thisArg?: unknown,
  ): void;

  /**
   * Returns the index of the first occurrence of a value in an array.
   *
   * @param searchElement The value to locate in the array.
   * @param fromIndex The array index at which to begin the search. If fromIndex is omitted, the search starts at index 0.
   */
  indexOf(
    searchElement: Int16,
    fromIndex?: NumberType.TypedArraySizeArg,
  ): NumberType.TypedArraySearchResult;

  /**
   * Adds all the elements of an array separated by the specified separator string.
   *
   * @param separator A string used to separate one element of an array from the next in the resulting String. If omitted, the array elements are separated with a comma.
   */
  join(separator?: string): string;

  /**
   * Returns the index of the last occurrence of a value in an array.
   *
   * @param searchElement The value to locate in the array.
   * @param fromIndex The array index at which to begin the search. If fromIndex is omitted, the search starts at index 0.
   */
  lastIndexOf(
    searchElement: Int16,
    fromIndex?: NumberType.TypedArraySizeArg,
  ): NumberType.TypedArraySearchResult;

  /** The length of the array. */
  readonly length: number;

  /**
   * Calls a defined callback function on each element of an array, and returns an array that contains the results.
   *
   * @param callbackfn A function that accepts up to three arguments. The map method calls the callbackfn function one time for each element in the array.
   * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
   */
  map(
    callbackfn: (
      value: Int16,
      index: NumberType.TypedArraySize,
      array: this,
    ) => Int16,
    thisArg?: unknown,
  ): Int16Array<ArrayBuffer>;

  /**
   * Calls the specified callback function for all the elements in an array. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
   *
   * @param callbackfn A function that accepts up to four arguments. The reduce method calls the callbackfn function one time for each element in the array.
   * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of an array value.
   */
  reduce(
    callbackfn: (
      previousValue: Int16,
      currentValue: Int16,
      currentIndex: NumberType.TypedArraySize,
      array: this,
    ) => Int16,
  ): Int16;
  reduce(
    callbackfn: (
      previousValue: Int16,
      currentValue: Int16,
      currentIndex: NumberType.TypedArraySize,
      array: this,
    ) => Int16,
    initialValue: Int16,
  ): Int16;

  /**
   * Calls the specified callback function for all the elements in an array. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
   *
   * @param callbackfn A function that accepts up to four arguments. The reduce method calls the callbackfn function one time for each element in the array.
   * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of an array value.
   */
  reduce<U>(
    callbackfn: (
      previousValue: U,
      currentValue: Int16,
      currentIndex: NumberType.TypedArraySize,
      array: this,
    ) => U,
    initialValue: U,
  ): U;

  /**
   * Calls the specified callback function for all the elements in an array, in descending order. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
   *
   * @param callbackfn A function that accepts up to four arguments. The reduceRight method calls the callbackfn function one time for each element in the array.
   * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of an array value.
   */
  reduceRight(
    callbackfn: (
      previousValue: Int16,
      currentValue: Int16,
      currentIndex: NumberType.TypedArraySize,
      array: this,
    ) => Int16,
  ): Int16;
  reduceRight(
    callbackfn: (
      previousValue: Int16,
      currentValue: Int16,
      currentIndex: NumberType.TypedArraySize,
      array: this,
    ) => Int16,
    initialValue: Int16,
  ): Int16;

  /**
   * Calls the specified callback function for all the elements in an array, in descending order. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
   *
   * @param callbackfn A function that accepts up to four arguments. The reduceRight method calls the callbackfn function one time for each element in the array.
   * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of an array value.
   */
  reduceRight<U>(
    callbackfn: (
      previousValue: U,
      currentValue: Int16,
      currentIndex: NumberType.TypedArraySize,
      array: this,
    ) => U,
    initialValue: U,
  ): U;

  /** Reverses the elements in an Array. */
  reverse(): this;

  /**
   * Sets a value or an array of values.
   *
   * @param array A typed or untyped array of values to set.
   * @param offset The index in the current array at which the values are to be written.
   */
  set(
    array: ArrayLike<Int16>,
    offset?: NumberType.TypedArraySizeArgNonNegative,
  ): void;

  /**
   * Returns a section of an array.
   *
   * @param start The beginning of the specified portion of the array.
   * @param end The end of the specified portion of the array. This is exclusive of the element at the index 'end'.
   */
  slice(
    start?: NumberType.TypedArraySizeArg,
    end?: NumberType.TypedArraySizeArg,
  ): Int16Array<ArrayBuffer>;

  /**
   * Determines whether the specified callback function returns true for any element of an array.
   *
   * @param predicate A function that accepts up to three arguments. The some method calls the predicate function for each element in the array until the predicate returns a value which is coercible to the Boolean value true, or until the end of the array.
   * @param thisArg An object to which the this keyword can refer in the predicate function. If thisArg is omitted, undefined is used as the this value.
   */
  some(
    predicate: (
      value: Int16,
      index: NumberType.TypedArraySize,
      array: this,
    ) => boolean,
    thisArg?: unknown,
  ): boolean;

  /**
   * Sorts an array.
   *
   * @param compareFn Function used to determine the order of the elements. It is expected to return a negative value if the first argument is less than the second argument, zero if they're equal, and a positive value otherwise. If omitted, the elements are sorted in ascending order.
   *
   *   ```ts
   *   [11, 2, 22, 1].sort((a, b) => a - b);
   *   ```
   */
  sort(compareFn?: (a: Int16, b: Int16) => number): this;

  /**
   * Gets a new Int16Array view of the ArrayBuffer store for this array, referencing the elements at begin, inclusive, up to end, exclusive.
   *
   * @param begin The index of the beginning of the array.
   * @param end The index of the end of the array.
   */
  subarray(
    begin?: NumberType.TypedArraySizeArg,
    end?: NumberType.TypedArraySizeArg,
  ): Int16Array<TArrayBuffer>;

  /** Converts a number to a string by using the current locale. */
  toLocaleString(): string;

  /** Returns a string representation of an array. */
  toString(): string;

  /** Returns the primitive value of the specified object. */
  valueOf(): this;

  [index: number]: Int16;
}
interface Int16ArrayConstructor {
  readonly prototype: Int16Array<ArrayBufferLike>;
  new (length: NumberType.TypedArraySize): Int16Array<ArrayBuffer>;
  new (array: ArrayLike<Int16>): Int16Array<ArrayBuffer>;
  new <TArrayBuffer extends ArrayBufferLike = ArrayBuffer>(
    buffer: TArrayBuffer,
    byteOffset?: NumberType.TypedArraySize,
    length?: NumberType.TypedArraySize,
  ): Int16Array<TArrayBuffer>;
  new (array: ArrayLike<Int16> | ArrayBuffer): Int16Array<ArrayBuffer>;

  /** The size in bytes of each element in the array. */
  readonly BYTES_PER_ELEMENT: 2;

  /**
   * Returns a new array from a set of elements.
   *
   * @param items A set of elements to include in the new array object.
   */
  of(...items: readonly Int16[]): Int16Array<ArrayBuffer>;

  /**
   * Creates an array from an array-like or iterable object.
   *
   * @param arrayLike An array-like or iterable object to convert to an array.
   */
  from(arrayLike: ArrayLike<Int16>): Int16Array<ArrayBuffer>;

  /**
   * Creates an array from an array-like or iterable object.
   *
   * @param arrayLike An array-like or iterable object to convert to an array.
   * @param mapfn A mapping function to call on every element of the array.
   * @param thisArg Value of 'this' used to invoke the mapfn.
   */
  from<T>(
    arrayLike: ArrayLike<T>,
    mapfn: (v: T, k: NumberType.TypedArraySize) => Int16,
    thisArg?: unknown,
  ): Int16Array<ArrayBuffer>;
}
declare const Int16Array: Int16ArrayConstructor;

/** A typed array of 16-bit unsigned integer values. The contents are initialized to 0. If the requested number of bytes could not be allocated an exception is raised. */
interface Uint16Array<TArrayBuffer extends ArrayBufferLike = ArrayBufferLike> {
  /** The size in bytes of each element in the array. */
  readonly BYTES_PER_ELEMENT: 2;

  /** The ArrayBuffer instance referenced by the array. */
  readonly buffer: TArrayBuffer;

  /** The length in bytes of the array. */
  readonly byteLength: NumberType.TypedArraySize;

  /** The offset in bytes of the array. */
  readonly byteOffset: NumberType.TypedArraySize;

  /**
   * Returns the this object after copying a section of the array identified by start and end to the same array starting at position target
   *
   * @param target If target is negative, it is treated as length+target where length is the length of the array.
   * @param start If start is negative, it is treated as length+start. If end is negative, it is treated as length+end.
   * @param end If not specified, length of the this object is used as its default value.
   */
  copyWithin(
    target: NumberType.TypedArraySizeArg,
    start: NumberType.TypedArraySizeArg,
    end?: NumberType.TypedArraySizeArg,
  ): this;

  /**
   * Determines whether all the members of an array satisfy the specified test.
   *
   * @param predicate A function that accepts up to three arguments. The every method calls the predicate function for each element in the array until the predicate returns a value which is coercible to the Boolean value false, or until the end of the array.
   * @param thisArg An object to which the this keyword can refer in the predicate function. If thisArg is omitted, undefined is used as the this value.
   */
  every(
    predicate: (
      value: Uint16,
      index: NumberType.TypedArraySize,
      array: this,
    ) => boolean,
    thisArg?: unknown,
  ): boolean;

  /**
   * Changes all array elements from `start` to `end` index to a static `value` and returns the modified array
   *
   * @param value Value to fill array section with
   * @param start Index to start filling the array at. If start is negative, it is treated as length+start where length is the length of the array.
   * @param end Index to stop filling the array at. If end is negative, it is treated as length+end.
   */
  fill(
    value: Uint16,
    start?: NumberType.TypedArraySizeArg,
    end?: NumberType.TypedArraySizeArg,
  ): this;

  /**
   * Returns the elements of an array that meet the condition specified in a callback function.
   *
   * @param predicate A function that accepts up to three arguments. The filter method calls the predicate function one time for each element in the array.
   * @param thisArg An object to which the this keyword can refer in the predicate function. If thisArg is omitted, undefined is used as the this value.
   */
  filter(
    predicate: (
      value: Uint16,
      index: NumberType.TypedArraySize,
      array: this,
    ) => boolean,
    thisArg?: unknown,
  ): Uint16Array<ArrayBuffer>;

  /**
   * Returns the value of the first element in the array where predicate is true, and undefined otherwise.
   *
   * @param predicate Find calls predicate once for each element of the array, in ascending order, until it finds one where predicate returns true. If such an element is found, find immediately returns that element value. Otherwise, find returns undefined.
   * @param thisArg If provided, it will be used as the this value for each invocation of predicate. If it is not provided, undefined is used instead.
   */
  find(
    predicate: (
      value: Uint16,
      index: NumberType.TypedArraySize,
      obj: this,
    ) => boolean,
    thisArg?: unknown,
  ): Uint16 | undefined;

  /**
   * Returns the index of the first element in the array where predicate is true, and -1 otherwise.
   *
   * @param predicate Find calls predicate once for each element of the array, in ascending order, until it finds one where predicate returns true. If such an element is found, findIndex immediately returns that element index. Otherwise, findIndex returns -1.
   * @param thisArg If provided, it will be used as the this value for each invocation of predicate. If it is not provided, undefined is used instead.
   */
  findIndex(
    predicate: (
      value: Uint16,
      index: NumberType.TypedArraySize,
      obj: this,
    ) => boolean,
    thisArg?: unknown,
  ): NumberType.TypedArraySearchResult;

  /**
   * Performs the specified action for each element in an array.
   *
   * @param callbackfn A function that accepts up to three arguments. forEach calls the callbackfn function one time for each element in the array.
   * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
   */
  forEach(
    callbackfn: (
      value: Uint16,
      index: NumberType.TypedArraySize,
      array: this,
    ) => void,
    thisArg?: unknown,
  ): void;

  /**
   * Returns the index of the first occurrence of a value in an array.
   *
   * @param searchElement The value to locate in the array.
   * @param fromIndex The array index at which to begin the search. If fromIndex is omitted, the search starts at index 0.
   */
  indexOf(
    searchElement: Uint16,
    fromIndex?: NumberType.TypedArraySizeArg,
  ): NumberType.TypedArraySearchResult;

  /**
   * Adds all the elements of an array separated by the specified separator string.
   *
   * @param separator A string used to separate one element of an array from the next in the resulting String. If omitted, the array elements are separated with a comma.
   */
  join(separator?: string): string;

  /**
   * Returns the index of the last occurrence of a value in an array.
   *
   * @param searchElement The value to locate in the array.
   * @param fromIndex The array index at which to begin the search. If fromIndex is omitted, the search starts at index 0.
   */
  lastIndexOf(
    searchElement: Uint16,
    fromIndex?: NumberType.TypedArraySizeArg,
  ): NumberType.TypedArraySearchResult;

  /** The length of the array. */
  readonly length: number;

  /**
   * Calls a defined callback function on each element of an array, and returns an array that contains the results.
   *
   * @param callbackfn A function that accepts up to three arguments. The map method calls the callbackfn function one time for each element in the array.
   * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
   */
  map(
    callbackfn: (
      value: Uint16,
      index: NumberType.TypedArraySize,
      array: this,
    ) => Uint16,
    thisArg?: unknown,
  ): Uint16Array<ArrayBuffer>;

  /**
   * Calls the specified callback function for all the elements in an array. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
   *
   * @param callbackfn A function that accepts up to four arguments. The reduce method calls the callbackfn function one time for each element in the array.
   * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of an array value.
   */
  reduce(
    callbackfn: (
      previousValue: Uint16,
      currentValue: Uint16,
      currentIndex: NumberType.TypedArraySize,
      array: this,
    ) => Uint16,
  ): Uint16;
  reduce(
    callbackfn: (
      previousValue: Uint16,
      currentValue: Uint16,
      currentIndex: NumberType.TypedArraySize,
      array: this,
    ) => Uint16,
    initialValue: Uint16,
  ): Uint16;

  /**
   * Calls the specified callback function for all the elements in an array. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
   *
   * @param callbackfn A function that accepts up to four arguments. The reduce method calls the callbackfn function one time for each element in the array.
   * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of an array value.
   */
  reduce<U>(
    callbackfn: (
      previousValue: U,
      currentValue: Uint16,
      currentIndex: NumberType.TypedArraySize,
      array: this,
    ) => U,
    initialValue: U,
  ): U;

  /**
   * Calls the specified callback function for all the elements in an array, in descending order. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
   *
   * @param callbackfn A function that accepts up to four arguments. The reduceRight method calls the callbackfn function one time for each element in the array.
   * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of an array value.
   */
  reduceRight(
    callbackfn: (
      previousValue: Uint16,
      currentValue: Uint16,
      currentIndex: NumberType.TypedArraySize,
      array: this,
    ) => Uint16,
  ): Uint16;
  reduceRight(
    callbackfn: (
      previousValue: Uint16,
      currentValue: Uint16,
      currentIndex: NumberType.TypedArraySize,
      array: this,
    ) => Uint16,
    initialValue: Uint16,
  ): Uint16;

  /**
   * Calls the specified callback function for all the elements in an array, in descending order. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
   *
   * @param callbackfn A function that accepts up to four arguments. The reduceRight method calls the callbackfn function one time for each element in the array.
   * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of an array value.
   */
  reduceRight<U>(
    callbackfn: (
      previousValue: U,
      currentValue: Uint16,
      currentIndex: NumberType.TypedArraySize,
      array: this,
    ) => U,
    initialValue: U,
  ): U;

  /** Reverses the elements in an Array. */
  reverse(): this;

  /**
   * Sets a value or an array of values.
   *
   * @param array A typed or untyped array of values to set.
   * @param offset The index in the current array at which the values are to be written.
   */
  set(
    array: ArrayLike<Uint16>,
    offset?: NumberType.TypedArraySizeArgNonNegative,
  ): void;

  /**
   * Returns a section of an array.
   *
   * @param start The beginning of the specified portion of the array.
   * @param end The end of the specified portion of the array. This is exclusive of the element at the index 'end'.
   */
  slice(
    start?: NumberType.TypedArraySizeArg,
    end?: NumberType.TypedArraySizeArg,
  ): Uint16Array<ArrayBuffer>;

  /**
   * Determines whether the specified callback function returns true for any element of an array.
   *
   * @param predicate A function that accepts up to three arguments. The some method calls the predicate function for each element in the array until the predicate returns a value which is coercible to the Boolean value true, or until the end of the array.
   * @param thisArg An object to which the this keyword can refer in the predicate function. If thisArg is omitted, undefined is used as the this value.
   */
  some(
    predicate: (
      value: Uint16,
      index: NumberType.TypedArraySize,
      array: this,
    ) => boolean,
    thisArg?: unknown,
  ): boolean;

  /**
   * Sorts an array.
   *
   * @param compareFn Function used to determine the order of the elements. It is expected to return a negative value if the first argument is less than the second argument, zero if they're equal, and a positive value otherwise. If omitted, the elements are sorted in ascending order.
   *
   *   ```ts
   *   [11, 2, 22, 1].sort((a, b) => a - b);
   *   ```
   */
  sort(compareFn?: (a: Uint16, b: Uint16) => number): this;

  /**
   * Gets a new Uint16Array view of the ArrayBuffer store for this array, referencing the elements at begin, inclusive, up to end, exclusive.
   *
   * @param begin The index of the beginning of the array.
   * @param end The index of the end of the array.
   */
  subarray(
    begin?: NumberType.TypedArraySizeArg,
    end?: NumberType.TypedArraySizeArg,
  ): Uint16Array<TArrayBuffer>;

  /** Converts a number to a string by using the current locale. */
  toLocaleString(): string;

  /** Returns a string representation of an array. */
  toString(): string;

  /** Returns the primitive value of the specified object. */
  valueOf(): this;

  [index: number]: Uint16;
}
interface Uint16ArrayConstructor {
  readonly prototype: Uint16Array<ArrayBufferLike>;
  new (length: NumberType.TypedArraySize): Uint16Array<ArrayBuffer>;
  new (array: ArrayLike<Uint16>): Uint16Array<ArrayBuffer>;
  new <TArrayBuffer extends ArrayBufferLike = ArrayBuffer>(
    buffer: TArrayBuffer,
    byteOffset?: NumberType.TypedArraySize,
    length?: NumberType.TypedArraySize,
  ): Uint16Array<TArrayBuffer>;
  new (array: ArrayLike<Uint16> | ArrayBuffer): Uint16Array<ArrayBuffer>;

  /** The size in bytes of each element in the array. */
  readonly BYTES_PER_ELEMENT: 2;

  /**
   * Returns a new array from a set of elements.
   *
   * @param items A set of elements to include in the new array object.
   */
  of(...items: readonly Uint16[]): Uint16Array<ArrayBuffer>;

  /**
   * Creates an array from an array-like or iterable object.
   *
   * @param arrayLike An array-like or iterable object to convert to an array.
   */
  from(arrayLike: ArrayLike<Uint16>): Uint16Array<ArrayBuffer>;

  /**
   * Creates an array from an array-like or iterable object.
   *
   * @param arrayLike An array-like or iterable object to convert to an array.
   * @param mapfn A mapping function to call on every element of the array.
   * @param thisArg Value of 'this' used to invoke the mapfn.
   */
  from<T>(
    arrayLike: ArrayLike<T>,
    mapfn: (v: T, k: NumberType.TypedArraySize) => Uint16,
    thisArg?: unknown,
  ): Uint16Array<ArrayBuffer>;
}
declare const Uint16Array: Uint16ArrayConstructor;
/** A typed array of 32-bit signed integer values. The contents are initialized to 0. If the requested number of bytes could not be allocated an exception is raised. */
interface Int32Array<TArrayBuffer extends ArrayBufferLike = ArrayBufferLike> {
  /** The size in bytes of each element in the array. */
  readonly BYTES_PER_ELEMENT: 4;

  /** The ArrayBuffer instance referenced by the array. */
  readonly buffer: TArrayBuffer;

  /** The length in bytes of the array. */
  readonly byteLength: NumberType.TypedArraySize;

  /** The offset in bytes of the array. */
  readonly byteOffset: NumberType.TypedArraySize;

  /**
   * Returns the this object after copying a section of the array identified by start and end to the same array starting at position target
   *
   * @param target If target is negative, it is treated as length+target where length is the length of the array.
   * @param start If start is negative, it is treated as length+start. If end is negative, it is treated as length+end.
   * @param end If not specified, length of the this object is used as its default value.
   */
  copyWithin(
    target: NumberType.TypedArraySizeArg,
    start: NumberType.TypedArraySizeArg,
    end?: NumberType.TypedArraySizeArg,
  ): this;

  /**
   * Determines whether all the members of an array satisfy the specified test.
   *
   * @param predicate A function that accepts up to three arguments. The every method calls the predicate function for each element in the array until the predicate returns a value which is coercible to the Boolean value false, or until the end of the array.
   * @param thisArg An object to which the this keyword can refer in the predicate function. If thisArg is omitted, undefined is used as the this value.
   */
  every(
    predicate: (
      value: Int32,
      index: NumberType.TypedArraySize,
      array: this,
    ) => boolean,
    thisArg?: unknown,
  ): boolean;

  /**
   * Changes all array elements from `start` to `end` index to a static `value` and returns the modified array
   *
   * @param value Value to fill array section with
   * @param start Index to start filling the array at. If start is negative, it is treated as length+start where length is the length of the array.
   * @param end Index to stop filling the array at. If end is negative, it is treated as length+end.
   */
  fill(
    value: Int32,
    start?: NumberType.TypedArraySizeArg,
    end?: NumberType.TypedArraySizeArg,
  ): this;

  /**
   * Returns the elements of an array that meet the condition specified in a callback function.
   *
   * @param predicate A function that accepts up to three arguments. The filter method calls the predicate function one time for each element in the array.
   * @param thisArg An object to which the this keyword can refer in the predicate function. If thisArg is omitted, undefined is used as the this value.
   */
  filter(
    predicate: (
      value: Int32,
      index: NumberType.TypedArraySize,
      array: this,
    ) => boolean,
    thisArg?: unknown,
  ): Int32Array<ArrayBuffer>;

  /**
   * Returns the value of the first element in the array where predicate is true, and undefined otherwise.
   *
   * @param predicate Find calls predicate once for each element of the array, in ascending order, until it finds one where predicate returns true. If such an element is found, find immediately returns that element value. Otherwise, find returns undefined.
   * @param thisArg If provided, it will be used as the this value for each invocation of predicate. If it is not provided, undefined is used instead.
   */
  find(
    predicate: (
      value: Int32,
      index: NumberType.TypedArraySize,
      obj: this,
    ) => boolean,
    thisArg?: unknown,
  ): Int32 | undefined;

  /**
   * Returns the index of the first element in the array where predicate is true, and -1 otherwise.
   *
   * @param predicate Find calls predicate once for each element of the array, in ascending order, until it finds one where predicate returns true. If such an element is found, findIndex immediately returns that element index. Otherwise, findIndex returns -1.
   * @param thisArg If provided, it will be used as the this value for each invocation of predicate. If it is not provided, undefined is used instead.
   */
  findIndex(
    predicate: (
      value: Int32,
      index: NumberType.TypedArraySize,
      obj: this,
    ) => boolean,
    thisArg?: unknown,
  ): NumberType.TypedArraySearchResult;

  /**
   * Performs the specified action for each element in an array.
   *
   * @param callbackfn A function that accepts up to three arguments. forEach calls the callbackfn function one time for each element in the array.
   * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
   */
  forEach(
    callbackfn: (
      value: Int32,
      index: NumberType.TypedArraySize,
      array: this,
    ) => void,
    thisArg?: unknown,
  ): void;

  /**
   * Returns the index of the first occurrence of a value in an array.
   *
   * @param searchElement The value to locate in the array.
   * @param fromIndex The array index at which to begin the search. If fromIndex is omitted, the search starts at index 0.
   */
  indexOf(
    searchElement: Int32,
    fromIndex?: NumberType.TypedArraySizeArg,
  ): NumberType.TypedArraySearchResult;

  /**
   * Adds all the elements of an array separated by the specified separator string.
   *
   * @param separator A string used to separate one element of an array from the next in the resulting String. If omitted, the array elements are separated with a comma.
   */
  join(separator?: string): string;

  /**
   * Returns the index of the last occurrence of a value in an array.
   *
   * @param searchElement The value to locate in the array.
   * @param fromIndex The array index at which to begin the search. If fromIndex is omitted, the search starts at index 0.
   */
  lastIndexOf(
    searchElement: Int32,
    fromIndex?: NumberType.TypedArraySizeArg,
  ): NumberType.TypedArraySearchResult;

  /** The length of the array. */
  readonly length: number;

  /**
   * Calls a defined callback function on each element of an array, and returns an array that contains the results.
   *
   * @param callbackfn A function that accepts up to three arguments. The map method calls the callbackfn function one time for each element in the array.
   * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
   */
  map(
    callbackfn: (
      value: Int32,
      index: NumberType.TypedArraySize,
      array: this,
    ) => Int32,
    thisArg?: unknown,
  ): Int32Array<ArrayBuffer>;

  /**
   * Calls the specified callback function for all the elements in an array. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
   *
   * @param callbackfn A function that accepts up to four arguments. The reduce method calls the callbackfn function one time for each element in the array.
   * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of an array value.
   */
  reduce(
    callbackfn: (
      previousValue: Int32,
      currentValue: Int32,
      currentIndex: NumberType.TypedArraySize,
      array: this,
    ) => Int32,
  ): Int32;
  reduce(
    callbackfn: (
      previousValue: Int32,
      currentValue: Int32,
      currentIndex: NumberType.TypedArraySize,
      array: this,
    ) => Int32,
    initialValue: Int32,
  ): Int32;

  /**
   * Calls the specified callback function for all the elements in an array. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
   *
   * @param callbackfn A function that accepts up to four arguments. The reduce method calls the callbackfn function one time for each element in the array.
   * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of an array value.
   */
  reduce<U>(
    callbackfn: (
      previousValue: U,
      currentValue: Int32,
      currentIndex: NumberType.TypedArraySize,
      array: this,
    ) => U,
    initialValue: U,
  ): U;

  /**
   * Calls the specified callback function for all the elements in an array, in descending order. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
   *
   * @param callbackfn A function that accepts up to four arguments. The reduceRight method calls the callbackfn function one time for each element in the array.
   * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of an array value.
   */
  reduceRight(
    callbackfn: (
      previousValue: Int32,
      currentValue: Int32,
      currentIndex: NumberType.TypedArraySize,
      array: this,
    ) => Int32,
  ): Int32;
  reduceRight(
    callbackfn: (
      previousValue: Int32,
      currentValue: Int32,
      currentIndex: NumberType.TypedArraySize,
      array: this,
    ) => Int32,
    initialValue: Int32,
  ): Int32;

  /**
   * Calls the specified callback function for all the elements in an array, in descending order. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
   *
   * @param callbackfn A function that accepts up to four arguments. The reduceRight method calls the callbackfn function one time for each element in the array.
   * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of an array value.
   */
  reduceRight<U>(
    callbackfn: (
      previousValue: U,
      currentValue: Int32,
      currentIndex: NumberType.TypedArraySize,
      array: this,
    ) => U,
    initialValue: U,
  ): U;

  /** Reverses the elements in an Array. */
  reverse(): this;

  /**
   * Sets a value or an array of values.
   *
   * @param array A typed or untyped array of values to set.
   * @param offset The index in the current array at which the values are to be written.
   */
  set(
    array: ArrayLike<Int32>,
    offset?: NumberType.TypedArraySizeArgNonNegative,
  ): void;

  /**
   * Returns a section of an array.
   *
   * @param start The beginning of the specified portion of the array.
   * @param end The end of the specified portion of the array. This is exclusive of the element at the index 'end'.
   */
  slice(
    start?: NumberType.TypedArraySizeArg,
    end?: NumberType.TypedArraySizeArg,
  ): Int32Array<ArrayBuffer>;

  /**
   * Determines whether the specified callback function returns true for any element of an array.
   *
   * @param predicate A function that accepts up to three arguments. The some method calls the predicate function for each element in the array until the predicate returns a value which is coercible to the Boolean value true, or until the end of the array.
   * @param thisArg An object to which the this keyword can refer in the predicate function. If thisArg is omitted, undefined is used as the this value.
   */
  some(
    predicate: (
      value: Int32,
      index: NumberType.TypedArraySize,
      array: this,
    ) => boolean,
    thisArg?: unknown,
  ): boolean;

  /**
   * Sorts an array.
   *
   * @param compareFn Function used to determine the order of the elements. It is expected to return a negative value if the first argument is less than the second argument, zero if they're equal, and a positive value otherwise. If omitted, the elements are sorted in ascending order.
   *
   *   ```ts
   *   [11, 2, 22, 1].sort((a, b) => a - b);
   *   ```
   */
  sort(compareFn?: (a: Int32, b: Int32) => number): this;

  /**
   * Gets a new Int32Array view of the ArrayBuffer store for this array, referencing the elements at begin, inclusive, up to end, exclusive.
   *
   * @param begin The index of the beginning of the array.
   * @param end The index of the end of the array.
   */
  subarray(
    begin?: NumberType.TypedArraySizeArg,
    end?: NumberType.TypedArraySizeArg,
  ): Int32Array<TArrayBuffer>;

  /** Converts a number to a string by using the current locale. */
  toLocaleString(): string;

  /** Returns a string representation of an array. */
  toString(): string;

  /** Returns the primitive value of the specified object. */
  valueOf(): this;

  [index: number]: Int32;
}
interface Int32ArrayConstructor {
  readonly prototype: Int32Array<ArrayBufferLike>;
  new (length: NumberType.TypedArraySize): Int32Array<ArrayBuffer>;
  new (array: ArrayLike<Int32>): Int32Array<ArrayBuffer>;
  new <TArrayBuffer extends ArrayBufferLike = ArrayBuffer>(
    buffer: TArrayBuffer,
    byteOffset?: NumberType.TypedArraySize,
    length?: NumberType.TypedArraySize,
  ): Int32Array<TArrayBuffer>;
  new (array: ArrayLike<Int32> | ArrayBuffer): Int32Array<ArrayBuffer>;

  /** The size in bytes of each element in the array. */
  readonly BYTES_PER_ELEMENT: 4;

  /**
   * Returns a new array from a set of elements.
   *
   * @param items A set of elements to include in the new array object.
   */
  of(...items: readonly Int32[]): Int32Array<ArrayBuffer>;

  /**
   * Creates an array from an array-like or iterable object.
   *
   * @param arrayLike An array-like or iterable object to convert to an array.
   */
  from(arrayLike: ArrayLike<Int32>): Int32Array<ArrayBuffer>;

  /**
   * Creates an array from an array-like or iterable object.
   *
   * @param arrayLike An array-like or iterable object to convert to an array.
   * @param mapfn A mapping function to call on every element of the array.
   * @param thisArg Value of 'this' used to invoke the mapfn.
   */
  from<T>(
    arrayLike: ArrayLike<T>,
    mapfn: (v: T, k: NumberType.TypedArraySize) => Int32,
    thisArg?: unknown,
  ): Int32Array<ArrayBuffer>;
}
declare const Int32Array: Int32ArrayConstructor;

/** A typed array of 32-bit unsigned integer values. The contents are initialized to 0. If the requested number of bytes could not be allocated an exception is raised. */
interface Uint32Array<TArrayBuffer extends ArrayBufferLike = ArrayBufferLike> {
  /** The size in bytes of each element in the array. */
  readonly BYTES_PER_ELEMENT: 4;

  /** The ArrayBuffer instance referenced by the array. */
  readonly buffer: TArrayBuffer;

  /** The length in bytes of the array. */
  readonly byteLength: NumberType.TypedArraySize;

  /** The offset in bytes of the array. */
  readonly byteOffset: NumberType.TypedArraySize;

  /**
   * Returns the this object after copying a section of the array identified by start and end to the same array starting at position target
   *
   * @param target If target is negative, it is treated as length+target where length is the length of the array.
   * @param start If start is negative, it is treated as length+start. If end is negative, it is treated as length+end.
   * @param end If not specified, length of the this object is used as its default value.
   */
  copyWithin(
    target: NumberType.TypedArraySizeArg,
    start: NumberType.TypedArraySizeArg,
    end?: NumberType.TypedArraySizeArg,
  ): this;

  /**
   * Determines whether all the members of an array satisfy the specified test.
   *
   * @param predicate A function that accepts up to three arguments. The every method calls the predicate function for each element in the array until the predicate returns a value which is coercible to the Boolean value false, or until the end of the array.
   * @param thisArg An object to which the this keyword can refer in the predicate function. If thisArg is omitted, undefined is used as the this value.
   */
  every(
    predicate: (
      value: Uint32,
      index: NumberType.TypedArraySize,
      array: this,
    ) => boolean,
    thisArg?: unknown,
  ): boolean;

  /**
   * Changes all array elements from `start` to `end` index to a static `value` and returns the modified array
   *
   * @param value Value to fill array section with
   * @param start Index to start filling the array at. If start is negative, it is treated as length+start where length is the length of the array.
   * @param end Index to stop filling the array at. If end is negative, it is treated as length+end.
   */
  fill(
    value: Uint32,
    start?: NumberType.TypedArraySizeArg,
    end?: NumberType.TypedArraySizeArg,
  ): this;

  /**
   * Returns the elements of an array that meet the condition specified in a callback function.
   *
   * @param predicate A function that accepts up to three arguments. The filter method calls the predicate function one time for each element in the array.
   * @param thisArg An object to which the this keyword can refer in the predicate function. If thisArg is omitted, undefined is used as the this value.
   */
  filter(
    predicate: (
      value: Uint32,
      index: NumberType.TypedArraySize,
      array: this,
    ) => boolean,
    thisArg?: unknown,
  ): Uint32Array<ArrayBuffer>;

  /**
   * Returns the value of the first element in the array where predicate is true, and undefined otherwise.
   *
   * @param predicate Find calls predicate once for each element of the array, in ascending order, until it finds one where predicate returns true. If such an element is found, find immediately returns that element value. Otherwise, find returns undefined.
   * @param thisArg If provided, it will be used as the this value for each invocation of predicate. If it is not provided, undefined is used instead.
   */
  find(
    predicate: (
      value: Uint32,
      index: NumberType.TypedArraySize,
      obj: this,
    ) => boolean,
    thisArg?: unknown,
  ): Uint32 | undefined;

  /**
   * Returns the index of the first element in the array where predicate is true, and -1 otherwise.
   *
   * @param predicate Find calls predicate once for each element of the array, in ascending order, until it finds one where predicate returns true. If such an element is found, findIndex immediately returns that element index. Otherwise, findIndex returns -1.
   * @param thisArg If provided, it will be used as the this value for each invocation of predicate. If it is not provided, undefined is used instead.
   */
  findIndex(
    predicate: (
      value: Uint32,
      index: NumberType.TypedArraySize,
      obj: this,
    ) => boolean,
    thisArg?: unknown,
  ): NumberType.TypedArraySearchResult;

  /**
   * Performs the specified action for each element in an array.
   *
   * @param callbackfn A function that accepts up to three arguments. forEach calls the callbackfn function one time for each element in the array.
   * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
   */
  forEach(
    callbackfn: (
      value: Uint32,
      index: NumberType.TypedArraySize,
      array: this,
    ) => void,
    thisArg?: unknown,
  ): void;

  /**
   * Returns the index of the first occurrence of a value in an array.
   *
   * @param searchElement The value to locate in the array.
   * @param fromIndex The array index at which to begin the search. If fromIndex is omitted, the search starts at index 0.
   */
  indexOf(
    searchElement: Uint32,
    fromIndex?: NumberType.TypedArraySizeArg,
  ): NumberType.TypedArraySearchResult;

  /**
   * Adds all the elements of an array separated by the specified separator string.
   *
   * @param separator A string used to separate one element of an array from the next in the resulting String. If omitted, the array elements are separated with a comma.
   */
  join(separator?: string): string;

  /**
   * Returns the index of the last occurrence of a value in an array.
   *
   * @param searchElement The value to locate in the array.
   * @param fromIndex The array index at which to begin the search. If fromIndex is omitted, the search starts at index 0.
   */
  lastIndexOf(
    searchElement: Uint32,
    fromIndex?: NumberType.TypedArraySizeArg,
  ): NumberType.TypedArraySearchResult;

  /** The length of the array. */
  readonly length: number;

  /**
   * Calls a defined callback function on each element of an array, and returns an array that contains the results.
   *
   * @param callbackfn A function that accepts up to three arguments. The map method calls the callbackfn function one time for each element in the array.
   * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
   */
  map(
    callbackfn: (
      value: Uint32,
      index: NumberType.TypedArraySize,
      array: this,
    ) => Uint32,
    thisArg?: unknown,
  ): Uint32Array<ArrayBuffer>;

  /**
   * Calls the specified callback function for all the elements in an array. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
   *
   * @param callbackfn A function that accepts up to four arguments. The reduce method calls the callbackfn function one time for each element in the array.
   * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of an array value.
   */
  reduce(
    callbackfn: (
      previousValue: Uint32,
      currentValue: Uint32,
      currentIndex: NumberType.TypedArraySize,
      array: this,
    ) => Uint32,
  ): Uint32;
  reduce(
    callbackfn: (
      previousValue: Uint32,
      currentValue: Uint32,
      currentIndex: NumberType.TypedArraySize,
      array: this,
    ) => Uint32,
    initialValue: Uint32,
  ): Uint32;

  /**
   * Calls the specified callback function for all the elements in an array. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
   *
   * @param callbackfn A function that accepts up to four arguments. The reduce method calls the callbackfn function one time for each element in the array.
   * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of an array value.
   */
  reduce<U>(
    callbackfn: (
      previousValue: U,
      currentValue: Uint32,
      currentIndex: NumberType.TypedArraySize,
      array: this,
    ) => U,
    initialValue: U,
  ): U;

  /**
   * Calls the specified callback function for all the elements in an array, in descending order. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
   *
   * @param callbackfn A function that accepts up to four arguments. The reduceRight method calls the callbackfn function one time for each element in the array.
   * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of an array value.
   */
  reduceRight(
    callbackfn: (
      previousValue: Uint32,
      currentValue: Uint32,
      currentIndex: NumberType.TypedArraySize,
      array: this,
    ) => Uint32,
  ): Uint32;
  reduceRight(
    callbackfn: (
      previousValue: Uint32,
      currentValue: Uint32,
      currentIndex: NumberType.TypedArraySize,
      array: this,
    ) => Uint32,
    initialValue: Uint32,
  ): Uint32;

  /**
   * Calls the specified callback function for all the elements in an array, in descending order. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
   *
   * @param callbackfn A function that accepts up to four arguments. The reduceRight method calls the callbackfn function one time for each element in the array.
   * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of an array value.
   */
  reduceRight<U>(
    callbackfn: (
      previousValue: U,
      currentValue: Uint32,
      currentIndex: NumberType.TypedArraySize,
      array: this,
    ) => U,
    initialValue: U,
  ): U;

  /** Reverses the elements in an Array. */
  reverse(): this;

  /**
   * Sets a value or an array of values.
   *
   * @param array A typed or untyped array of values to set.
   * @param offset The index in the current array at which the values are to be written.
   */
  set(
    array: ArrayLike<Uint32>,
    offset?: NumberType.TypedArraySizeArgNonNegative,
  ): void;

  /**
   * Returns a section of an array.
   *
   * @param start The beginning of the specified portion of the array.
   * @param end The end of the specified portion of the array. This is exclusive of the element at the index 'end'.
   */
  slice(
    start?: NumberType.TypedArraySizeArg,
    end?: NumberType.TypedArraySizeArg,
  ): Uint32Array<ArrayBuffer>;

  /**
   * Determines whether the specified callback function returns true for any element of an array.
   *
   * @param predicate A function that accepts up to three arguments. The some method calls the predicate function for each element in the array until the predicate returns a value which is coercible to the Boolean value true, or until the end of the array.
   * @param thisArg An object to which the this keyword can refer in the predicate function. If thisArg is omitted, undefined is used as the this value.
   */
  some(
    predicate: (
      value: Uint32,
      index: NumberType.TypedArraySize,
      array: this,
    ) => boolean,
    thisArg?: unknown,
  ): boolean;

  /**
   * Sorts an array.
   *
   * @param compareFn Function used to determine the order of the elements. It is expected to return a negative value if the first argument is less than the second argument, zero if they're equal, and a positive value otherwise. If omitted, the elements are sorted in ascending order.
   *
   *   ```ts
   *   [11, 2, 22, 1].sort((a, b) => a - b);
   *   ```
   */
  sort(compareFn?: (a: Uint32, b: Uint32) => number): this;

  /**
   * Gets a new Uint32Array view of the ArrayBuffer store for this array, referencing the elements at begin, inclusive, up to end, exclusive.
   *
   * @param begin The index of the beginning of the array.
   * @param end The index of the end of the array.
   */
  subarray(
    begin?: NumberType.TypedArraySizeArg,
    end?: NumberType.TypedArraySizeArg,
  ): Uint32Array<TArrayBuffer>;

  /** Converts a number to a string by using the current locale. */
  toLocaleString(): string;

  /** Returns a string representation of an array. */
  toString(): string;

  /** Returns the primitive value of the specified object. */
  valueOf(): this;

  [index: number]: Uint32;
}
interface Uint32ArrayConstructor {
  readonly prototype: Uint32Array<ArrayBufferLike>;
  new (length: NumberType.TypedArraySize): Uint32Array<ArrayBuffer>;
  new (array: ArrayLike<Uint32>): Uint32Array<ArrayBuffer>;
  new <TArrayBuffer extends ArrayBufferLike = ArrayBuffer>(
    buffer: TArrayBuffer,
    byteOffset?: NumberType.TypedArraySize,
    length?: NumberType.TypedArraySize,
  ): Uint32Array<TArrayBuffer>;
  new (array: ArrayLike<Uint32> | ArrayBuffer): Uint32Array<ArrayBuffer>;

  /** The size in bytes of each element in the array. */
  readonly BYTES_PER_ELEMENT: 4;

  /**
   * Returns a new array from a set of elements.
   *
   * @param items A set of elements to include in the new array object.
   */
  of(...items: readonly Uint32[]): Uint32Array<ArrayBuffer>;

  /**
   * Creates an array from an array-like or iterable object.
   *
   * @param arrayLike An array-like or iterable object to convert to an array.
   */
  from(arrayLike: ArrayLike<Uint32>): Uint32Array<ArrayBuffer>;

  /**
   * Creates an array from an array-like or iterable object.
   *
   * @param arrayLike An array-like or iterable object to convert to an array.
   * @param mapfn A mapping function to call on every element of the array.
   * @param thisArg Value of 'this' used to invoke the mapfn.
   */
  from<T>(
    arrayLike: ArrayLike<T>,
    mapfn: (v: T, k: NumberType.TypedArraySize) => Uint32,
    thisArg?: unknown,
  ): Uint32Array<ArrayBuffer>;
}
declare const Uint32Array: Uint32ArrayConstructor;

/** A typed array of 32-bit float values. The contents are initialized to 0. If the requested number of bytes could not be allocated an exception is raised. */
interface Float32Array<TArrayBuffer extends ArrayBufferLike = ArrayBufferLike> {
  /** The size in bytes of each element in the array. */
  readonly BYTES_PER_ELEMENT: 4;

  /** The ArrayBuffer instance referenced by the array. */
  readonly buffer: TArrayBuffer;

  /** The length in bytes of the array. */
  readonly byteLength: NumberType.TypedArraySize;

  /** The offset in bytes of the array. */
  readonly byteOffset: NumberType.TypedArraySize;

  /**
   * Returns the this object after copying a section of the array identified by start and end to the same array starting at position target
   *
   * @param target If target is negative, it is treated as length+target where length is the length of the array.
   * @param start If start is negative, it is treated as length+start. If end is negative, it is treated as length+end.
   * @param end If not specified, length of the this object is used as its default value.
   */
  copyWithin(
    target: NumberType.TypedArraySizeArg,
    start: NumberType.TypedArraySizeArg,
    end?: NumberType.TypedArraySizeArg,
  ): this;

  /**
   * Determines whether all the members of an array satisfy the specified test.
   *
   * @param predicate A function that accepts up to three arguments. The every method calls the predicate function for each element in the array until the predicate returns a value which is coercible to the Boolean value false, or until the end of the array.
   * @param thisArg An object to which the this keyword can refer in the predicate function. If thisArg is omitted, undefined is used as the this value.
   */
  every(
    predicate: (
      value: Float32,
      index: NumberType.TypedArraySize,
      array: this,
    ) => boolean,
    thisArg?: unknown,
  ): boolean;

  /**
   * Changes all array elements from `start` to `end` index to a static `value` and returns the modified array
   *
   * @param value Value to fill array section with
   * @param start Index to start filling the array at. If start is negative, it is treated as length+start where length is the length of the array.
   * @param end Index to stop filling the array at. If end is negative, it is treated as length+end.
   */
  fill(
    value: Float32,
    start?: NumberType.TypedArraySizeArg,
    end?: NumberType.TypedArraySizeArg,
  ): this;

  /**
   * Returns the elements of an array that meet the condition specified in a callback function.
   *
   * @param predicate A function that accepts up to three arguments. The filter method calls the predicate function one time for each element in the array.
   * @param thisArg An object to which the this keyword can refer in the predicate function. If thisArg is omitted, undefined is used as the this value.
   */
  filter(
    predicate: (
      value: Float32,
      index: NumberType.TypedArraySize,
      array: this,
    ) => boolean,
    thisArg?: unknown,
  ): Float32Array<ArrayBuffer>;

  /**
   * Returns the value of the first element in the array where predicate is true, and undefined otherwise.
   *
   * @param predicate Find calls predicate once for each element of the array, in ascending order, until it finds one where predicate returns true. If such an element is found, find immediately returns that element value. Otherwise, find returns undefined.
   * @param thisArg If provided, it will be used as the this value for each invocation of predicate. If it is not provided, undefined is used instead.
   */
  find(
    predicate: (
      value: Float32,
      index: NumberType.TypedArraySize,
      obj: this,
    ) => boolean,
    thisArg?: unknown,
  ): Float32 | undefined;

  /**
   * Returns the index of the first element in the array where predicate is true, and -1 otherwise.
   *
   * @param predicate Find calls predicate once for each element of the array, in ascending order, until it finds one where predicate returns true. If such an element is found, findIndex immediately returns that element index. Otherwise, findIndex returns -1.
   * @param thisArg If provided, it will be used as the this value for each invocation of predicate. If it is not provided, undefined is used instead.
   */
  findIndex(
    predicate: (
      value: Float32,
      index: NumberType.TypedArraySize,
      obj: this,
    ) => boolean,
    thisArg?: unknown,
  ): NumberType.TypedArraySearchResult;

  /**
   * Performs the specified action for each element in an array.
   *
   * @param callbackfn A function that accepts up to three arguments. forEach calls the callbackfn function one time for each element in the array.
   * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
   */
  forEach(
    callbackfn: (
      value: Float32,
      index: NumberType.TypedArraySize,
      array: this,
    ) => void,
    thisArg?: unknown,
  ): void;

  /**
   * Returns the index of the first occurrence of a value in an array.
   *
   * @param searchElement The value to locate in the array.
   * @param fromIndex The array index at which to begin the search. If fromIndex is omitted, the search starts at index 0.
   */
  indexOf(
    searchElement: Float32,
    fromIndex?: NumberType.TypedArraySizeArg,
  ): NumberType.TypedArraySearchResult;

  /**
   * Adds all the elements of an array separated by the specified separator string.
   *
   * @param separator A string used to separate one element of an array from the next in the resulting String. If omitted, the array elements are separated with a comma.
   */
  join(separator?: string): string;

  /**
   * Returns the index of the last occurrence of a value in an array.
   *
   * @param searchElement The value to locate in the array.
   * @param fromIndex The array index at which to begin the search. If fromIndex is omitted, the search starts at index 0.
   */
  lastIndexOf(
    searchElement: Float32,
    fromIndex?: NumberType.TypedArraySizeArg,
  ): NumberType.TypedArraySearchResult;

  /** The length of the array. */
  readonly length: number;

  /**
   * Calls a defined callback function on each element of an array, and returns an array that contains the results.
   *
   * @param callbackfn A function that accepts up to three arguments. The map method calls the callbackfn function one time for each element in the array.
   * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
   */
  map(
    callbackfn: (
      value: Float32,
      index: NumberType.TypedArraySize,
      array: this,
    ) => Float32,
    thisArg?: unknown,
  ): Float32Array<ArrayBuffer>;

  /**
   * Calls the specified callback function for all the elements in an array. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
   *
   * @param callbackfn A function that accepts up to four arguments. The reduce method calls the callbackfn function one time for each element in the array.
   * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of an array value.
   */
  reduce(
    callbackfn: (
      previousValue: Float32,
      currentValue: Float32,
      currentIndex: NumberType.TypedArraySize,
      array: this,
    ) => Float32,
  ): Float32;
  reduce(
    callbackfn: (
      previousValue: Float32,
      currentValue: Float32,
      currentIndex: NumberType.TypedArraySize,
      array: this,
    ) => Float32,
    initialValue: Float32,
  ): Float32;

  /**
   * Calls the specified callback function for all the elements in an array. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
   *
   * @param callbackfn A function that accepts up to four arguments. The reduce method calls the callbackfn function one time for each element in the array.
   * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of an array value.
   */
  reduce<U>(
    callbackfn: (
      previousValue: U,
      currentValue: Float32,
      currentIndex: NumberType.TypedArraySize,
      array: this,
    ) => U,
    initialValue: U,
  ): U;

  /**
   * Calls the specified callback function for all the elements in an array, in descending order. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
   *
   * @param callbackfn A function that accepts up to four arguments. The reduceRight method calls the callbackfn function one time for each element in the array.
   * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of an array value.
   */
  reduceRight(
    callbackfn: (
      previousValue: Float32,
      currentValue: Float32,
      currentIndex: NumberType.TypedArraySize,
      array: this,
    ) => Float32,
  ): Float32;
  reduceRight(
    callbackfn: (
      previousValue: Float32,
      currentValue: Float32,
      currentIndex: NumberType.TypedArraySize,
      array: this,
    ) => Float32,
    initialValue: Float32,
  ): Float32;

  /**
   * Calls the specified callback function for all the elements in an array, in descending order. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
   *
   * @param callbackfn A function that accepts up to four arguments. The reduceRight method calls the callbackfn function one time for each element in the array.
   * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of an array value.
   */
  reduceRight<U>(
    callbackfn: (
      previousValue: U,
      currentValue: Float32,
      currentIndex: NumberType.TypedArraySize,
      array: this,
    ) => U,
    initialValue: U,
  ): U;

  /** Reverses the elements in an Array. */
  reverse(): this;

  /**
   * Sets a value or an array of values.
   *
   * @param array A typed or untyped array of values to set.
   * @param offset The index in the current array at which the values are to be written.
   */
  set(
    array: ArrayLike<Float32>,
    offset?: NumberType.TypedArraySizeArgNonNegative,
  ): void;

  /**
   * Returns a section of an array.
   *
   * @param start The beginning of the specified portion of the array.
   * @param end The end of the specified portion of the array. This is exclusive of the element at the index 'end'.
   */
  slice(
    start?: NumberType.TypedArraySizeArg,
    end?: NumberType.TypedArraySizeArg,
  ): Float32Array<ArrayBuffer>;

  /**
   * Determines whether the specified callback function returns true for any element of an array.
   *
   * @param predicate A function that accepts up to three arguments. The some method calls the predicate function for each element in the array until the predicate returns a value which is coercible to the Boolean value true, or until the end of the array.
   * @param thisArg An object to which the this keyword can refer in the predicate function. If thisArg is omitted, undefined is used as the this value.
   */
  some(
    predicate: (
      value: Float32,
      index: NumberType.TypedArraySize,
      array: this,
    ) => boolean,
    thisArg?: unknown,
  ): boolean;

  /**
   * Sorts an array.
   *
   * @param compareFn Function used to determine the order of the elements. It is expected to return a negative value if the first argument is less than the second argument, zero if they're equal, and a positive value otherwise. If omitted, the elements are sorted in ascending order.
   *
   *   ```ts
   *   [11, 2, 22, 1].sort((a, b) => a - b);
   *   ```
   */
  sort(compareFn?: (a: Float32, b: Float32) => number): this;

  /**
   * Gets a new Float32Array view of the ArrayBuffer store for this array, referencing the elements at begin, inclusive, up to end, exclusive.
   *
   * @param begin The index of the beginning of the array.
   * @param end The index of the end of the array.
   */
  subarray(
    begin?: NumberType.TypedArraySizeArg,
    end?: NumberType.TypedArraySizeArg,
  ): Float32Array<TArrayBuffer>;

  /** Converts a number to a string by using the current locale. */
  toLocaleString(): string;

  /** Returns a string representation of an array. */
  toString(): string;

  /** Returns the primitive value of the specified object. */
  valueOf(): this;

  [index: number]: Float32;
}
interface Float32ArrayConstructor {
  readonly prototype: Float32Array<ArrayBufferLike>;
  new (length: NumberType.TypedArraySize): Float32Array<ArrayBuffer>;
  new (array: ArrayLike<Float32>): Float32Array<ArrayBuffer>;
  new <TArrayBuffer extends ArrayBufferLike = ArrayBuffer>(
    buffer: TArrayBuffer,
    byteOffset?: NumberType.TypedArraySize,
    length?: NumberType.TypedArraySize,
  ): Float32Array<TArrayBuffer>;
  new (array: ArrayLike<Float32> | ArrayBuffer): Float32Array<ArrayBuffer>;

  /** The size in bytes of each element in the array. */
  readonly BYTES_PER_ELEMENT: 4;

  /**
   * Returns a new array from a set of elements.
   *
   * @param items A set of elements to include in the new array object.
   */
  of(...items: readonly Float32[]): Float32Array<ArrayBuffer>;

  /**
   * Creates an array from an array-like or iterable object.
   *
   * @param arrayLike An array-like or iterable object to convert to an array.
   */
  from(arrayLike: ArrayLike<Float32>): Float32Array<ArrayBuffer>;

  /**
   * Creates an array from an array-like or iterable object.
   *
   * @param arrayLike An array-like or iterable object to convert to an array.
   * @param mapfn A mapping function to call on every element of the array.
   * @param thisArg Value of 'this' used to invoke the mapfn.
   */
  from<T>(
    arrayLike: ArrayLike<T>,
    mapfn: (v: T, k: NumberType.TypedArraySize) => Float32,
    thisArg?: unknown,
  ): Float32Array<ArrayBuffer>;
}
declare const Float32Array: Float32ArrayConstructor;

/** A typed array of 64-bit float values. The contents are initialized to 0. If the requested number of bytes could not be allocated an exception is raised. */
interface Float64Array<TArrayBuffer extends ArrayBufferLike = ArrayBufferLike> {
  /** The size in bytes of each element in the array. */
  readonly BYTES_PER_ELEMENT: 8;

  /** The ArrayBuffer instance referenced by the array. */
  readonly buffer: TArrayBuffer;

  /** The length in bytes of the array. */
  readonly byteLength: NumberType.TypedArraySize;

  /** The offset in bytes of the array. */
  readonly byteOffset: NumberType.TypedArraySize;

  /**
   * Returns the this object after copying a section of the array identified by start and end to the same array starting at position target
   *
   * @param target If target is negative, it is treated as length+target where length is the length of the array.
   * @param start If start is negative, it is treated as length+start. If end is negative, it is treated as length+end.
   * @param end If not specified, length of the this object is used as its default value.
   */
  copyWithin(
    target: NumberType.TypedArraySizeArg,
    start: NumberType.TypedArraySizeArg,
    end?: NumberType.TypedArraySizeArg,
  ): this;

  /**
   * Determines whether all the members of an array satisfy the specified test.
   *
   * @param predicate A function that accepts up to three arguments. The every method calls the predicate function for each element in the array until the predicate returns a value which is coercible to the Boolean value false, or until the end of the array.
   * @param thisArg An object to which the this keyword can refer in the predicate function. If thisArg is omitted, undefined is used as the this value.
   */
  every(
    predicate: (
      value: Float64,
      index: NumberType.TypedArraySize,
      array: this,
    ) => boolean,
    thisArg?: unknown,
  ): boolean;

  /**
   * Changes all array elements from `start` to `end` index to a static `value` and returns the modified array
   *
   * @param value Value to fill array section with
   * @param start Index to start filling the array at. If start is negative, it is treated as length+start where length is the length of the array.
   * @param end Index to stop filling the array at. If end is negative, it is treated as length+end.
   */
  fill(
    value: Float64,
    start?: NumberType.TypedArraySizeArg,
    end?: NumberType.TypedArraySizeArg,
  ): this;

  /**
   * Returns the elements of an array that meet the condition specified in a callback function.
   *
   * @param predicate A function that accepts up to three arguments. The filter method calls the predicate function one time for each element in the array.
   * @param thisArg An object to which the this keyword can refer in the predicate function. If thisArg is omitted, undefined is used as the this value.
   */
  filter(
    predicate: (
      value: Float64,
      index: NumberType.TypedArraySize,
      array: this,
    ) => boolean,
    thisArg?: unknown,
  ): Float64Array<ArrayBuffer>;

  /**
   * Returns the value of the first element in the array where predicate is true, and undefined otherwise.
   *
   * @param predicate Find calls predicate once for each element of the array, in ascending order, until it finds one where predicate returns true. If such an element is found, find immediately returns that element value. Otherwise, find returns undefined.
   * @param thisArg If provided, it will be used as the this value for each invocation of predicate. If it is not provided, undefined is used instead.
   */
  find(
    predicate: (
      value: Float64,
      index: NumberType.TypedArraySize,
      obj: this,
    ) => boolean,
    thisArg?: unknown,
  ): Float64 | undefined;

  /**
   * Returns the index of the first element in the array where predicate is true, and -1 otherwise.
   *
   * @param predicate Find calls predicate once for each element of the array, in ascending order, until it finds one where predicate returns true. If such an element is found, findIndex immediately returns that element index. Otherwise, findIndex returns -1.
   * @param thisArg If provided, it will be used as the this value for each invocation of predicate. If it is not provided, undefined is used instead.
   */
  findIndex(
    predicate: (
      value: Float64,
      index: NumberType.TypedArraySize,
      obj: this,
    ) => boolean,
    thisArg?: unknown,
  ): NumberType.TypedArraySearchResult;

  /**
   * Performs the specified action for each element in an array.
   *
   * @param callbackfn A function that accepts up to three arguments. forEach calls the callbackfn function one time for each element in the array.
   * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
   */
  forEach(
    callbackfn: (
      value: Float64,
      index: NumberType.TypedArraySize,
      array: this,
    ) => void,
    thisArg?: unknown,
  ): void;

  /**
   * Returns the index of the first occurrence of a value in an array.
   *
   * @param searchElement The value to locate in the array.
   * @param fromIndex The array index at which to begin the search. If fromIndex is omitted, the search starts at index 0.
   */
  indexOf(
    searchElement: Float64,
    fromIndex?: NumberType.TypedArraySizeArg,
  ): NumberType.TypedArraySearchResult;

  /**
   * Adds all the elements of an array separated by the specified separator string.
   *
   * @param separator A string used to separate one element of an array from the next in the resulting String. If omitted, the array elements are separated with a comma.
   */
  join(separator?: string): string;

  /**
   * Returns the index of the last occurrence of a value in an array.
   *
   * @param searchElement The value to locate in the array.
   * @param fromIndex The array index at which to begin the search. If fromIndex is omitted, the search starts at index 0.
   */
  lastIndexOf(
    searchElement: Float64,
    fromIndex?: NumberType.TypedArraySizeArg,
  ): NumberType.TypedArraySearchResult;

  /** The length of the array. */
  readonly length: number;

  /**
   * Calls a defined callback function on each element of an array, and returns an array that contains the results.
   *
   * @param callbackfn A function that accepts up to three arguments. The map method calls the callbackfn function one time for each element in the array.
   * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
   */
  map(
    callbackfn: (
      value: Float64,
      index: NumberType.TypedArraySize,
      array: this,
    ) => Float64,
    thisArg?: unknown,
  ): Float64Array<ArrayBuffer>;

  /**
   * Calls the specified callback function for all the elements in an array. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
   *
   * @param callbackfn A function that accepts up to four arguments. The reduce method calls the callbackfn function one time for each element in the array.
   * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of an array value.
   */
  reduce(
    callbackfn: (
      previousValue: Float64,
      currentValue: Float64,
      currentIndex: NumberType.TypedArraySize,
      array: this,
    ) => Float64,
  ): Float64;
  reduce(
    callbackfn: (
      previousValue: Float64,
      currentValue: Float64,
      currentIndex: NumberType.TypedArraySize,
      array: this,
    ) => Float64,
    initialValue: Float64,
  ): Float64;

  /**
   * Calls the specified callback function for all the elements in an array. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
   *
   * @param callbackfn A function that accepts up to four arguments. The reduce method calls the callbackfn function one time for each element in the array.
   * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of an array value.
   */
  reduce<U>(
    callbackfn: (
      previousValue: U,
      currentValue: Float64,
      currentIndex: NumberType.TypedArraySize,
      array: this,
    ) => U,
    initialValue: U,
  ): U;

  /**
   * Calls the specified callback function for all the elements in an array, in descending order. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
   *
   * @param callbackfn A function that accepts up to four arguments. The reduceRight method calls the callbackfn function one time for each element in the array.
   * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of an array value.
   */
  reduceRight(
    callbackfn: (
      previousValue: Float64,
      currentValue: Float64,
      currentIndex: NumberType.TypedArraySize,
      array: this,
    ) => Float64,
  ): Float64;
  reduceRight(
    callbackfn: (
      previousValue: Float64,
      currentValue: Float64,
      currentIndex: NumberType.TypedArraySize,
      array: this,
    ) => Float64,
    initialValue: Float64,
  ): Float64;

  /**
   * Calls the specified callback function for all the elements in an array, in descending order. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
   *
   * @param callbackfn A function that accepts up to four arguments. The reduceRight method calls the callbackfn function one time for each element in the array.
   * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of an array value.
   */
  reduceRight<U>(
    callbackfn: (
      previousValue: U,
      currentValue: Float64,
      currentIndex: NumberType.TypedArraySize,
      array: this,
    ) => U,
    initialValue: U,
  ): U;

  /** Reverses the elements in an Array. */
  reverse(): this;

  /**
   * Sets a value or an array of values.
   *
   * @param array A typed or untyped array of values to set.
   * @param offset The index in the current array at which the values are to be written.
   */
  set(
    array: ArrayLike<Float64>,
    offset?: NumberType.TypedArraySizeArgNonNegative,
  ): void;

  /**
   * Returns a section of an array.
   *
   * @param start The beginning of the specified portion of the array.
   * @param end The end of the specified portion of the array. This is exclusive of the element at the index 'end'.
   */
  slice(
    start?: NumberType.TypedArraySizeArg,
    end?: NumberType.TypedArraySizeArg,
  ): Float64Array<ArrayBuffer>;

  /**
   * Determines whether the specified callback function returns true for any element of an array.
   *
   * @param predicate A function that accepts up to three arguments. The some method calls the predicate function for each element in the array until the predicate returns a value which is coercible to the Boolean value true, or until the end of the array.
   * @param thisArg An object to which the this keyword can refer in the predicate function. If thisArg is omitted, undefined is used as the this value.
   */
  some(
    predicate: (
      value: Float64,
      index: NumberType.TypedArraySize,
      array: this,
    ) => boolean,
    thisArg?: unknown,
  ): boolean;

  /**
   * Sorts an array.
   *
   * @param compareFn Function used to determine the order of the elements. It is expected to return a negative value if the first argument is less than the second argument, zero if they're equal, and a positive value otherwise. If omitted, the elements are sorted in ascending order.
   *
   *   ```ts
   *   [11, 2, 22, 1].sort((a, b) => a - b);
   *   ```
   */
  sort(compareFn?: (a: Float64, b: Float64) => number): this;

  /**
   * Gets a new Float64Array view of the ArrayBuffer store for this array, referencing the elements at begin, inclusive, up to end, exclusive.
   *
   * @param begin The index of the beginning of the array.
   * @param end The index of the end of the array.
   */
  subarray(
    begin?: NumberType.TypedArraySizeArg,
    end?: NumberType.TypedArraySizeArg,
  ): Float64Array<TArrayBuffer>;

  /** Converts a number to a string by using the current locale. */
  toLocaleString(): string;

  /** Returns a string representation of an array. */
  toString(): string;

  /** Returns the primitive value of the specified object. */
  valueOf(): this;

  [index: number]: Float64;
}
interface Float64ArrayConstructor {
  readonly prototype: Float64Array<ArrayBufferLike>;
  new (length: NumberType.TypedArraySize): Float64Array<ArrayBuffer>;
  new (array: ArrayLike<Float64>): Float64Array<ArrayBuffer>;
  new <TArrayBuffer extends ArrayBufferLike = ArrayBuffer>(
    buffer: TArrayBuffer,
    byteOffset?: NumberType.TypedArraySize,
    length?: NumberType.TypedArraySize,
  ): Float64Array<TArrayBuffer>;
  new (array: ArrayLike<Float64> | ArrayBuffer): Float64Array<ArrayBuffer>;

  /** The size in bytes of each element in the array. */
  readonly BYTES_PER_ELEMENT: 8;

  /**
   * Returns a new array from a set of elements.
   *
   * @param items A set of elements to include in the new array object.
   */
  of(...items: readonly Float64[]): Float64Array<ArrayBuffer>;

  /**
   * Creates an array from an array-like or iterable object.
   *
   * @param arrayLike An array-like or iterable object to convert to an array.
   */
  from(arrayLike: ArrayLike<Float64>): Float64Array<ArrayBuffer>;

  /**
   * Creates an array from an array-like or iterable object.
   *
   * @param arrayLike An array-like or iterable object to convert to an array.
   * @param mapfn A mapping function to call on every element of the array.
   * @param thisArg Value of 'this' used to invoke the mapfn.
   */
  from<T>(
    arrayLike: ArrayLike<T>,
    mapfn: (v: T, k: NumberType.TypedArraySize) => Float64,
    thisArg?: unknown,
  ): Float64Array<ArrayBuffer>;
}
declare const Float64Array: Float64ArrayConstructor;

/////////////////////////////
/// ECMAScript Internationalization API
/////////////////////////////

declare namespace Intl {
  interface CollatorOptions {
    readonly usage?: 'sort' | 'search' | undefined;
    readonly localeMatcher?: 'lookup' | 'best fit' | undefined;
    readonly numeric?: boolean | undefined;
    readonly caseFirst?: 'upper' | 'lower' | 'false' | undefined;
    readonly sensitivity?: 'base' | 'accent' | 'case' | 'variant' | undefined;
    readonly collation?:
      | 'big5han'
      | 'compat'
      | 'dict'
      | 'direct'
      | 'ducet'
      | 'emoji'
      | 'eor'
      | 'gb2312'
      | 'phonebk'
      | 'phonetic'
      | 'pinyin'
      | 'reformed'
      | 'searchjl'
      | 'stroke'
      | 'trad'
      | 'unihan'
      | 'zhuyin'
      | undefined;
    readonly ignorePunctuation?: boolean | undefined;
  }

  interface ResolvedCollatorOptions {
    readonly locale: string;
    readonly usage: string;
    readonly sensitivity: string;
    readonly ignorePunctuation: boolean;
    readonly collation: string;
    readonly caseFirst: string;
    readonly numeric: boolean;
  }

  interface Collator {
    compare(x: string, y: string): number;
    resolvedOptions(): ResolvedCollatorOptions;
  }

  interface CollatorConstructor {
    new (
      locales?: string | readonly string[],
      options?: CollatorOptions,
    ): Collator;
    (locales?: string | readonly string[], options?: CollatorOptions): Collator;
    supportedLocalesOf(
      locales: string | readonly string[],
      options?: CollatorOptions,
    ): readonly string[];
  }

  const Collator: CollatorConstructor;

  interface NumberFormatOptionsStyleRegistry {
    readonly decimal: never;
    readonly percent: never;
    readonly currency: never;
  }

  type NumberFormatOptionsStyle = keyof NumberFormatOptionsStyleRegistry;

  interface NumberFormatOptionsCurrencyDisplayRegistry {
    readonly code: never;
    readonly symbol: never;
    readonly name: never;
  }

  type NumberFormatOptionsCurrencyDisplay =
    keyof NumberFormatOptionsCurrencyDisplayRegistry;

  interface NumberFormatOptionsUseGroupingRegistry {}

  type NumberFormatOptionsUseGrouping =
    {} extends NumberFormatOptionsUseGroupingRegistry
      ? boolean
      :
          | keyof NumberFormatOptionsUseGroupingRegistry
          | 'true'
          | 'false'
          | boolean;
  type ResolvedNumberFormatOptionsUseGrouping =
    {} extends NumberFormatOptionsUseGroupingRegistry
      ? boolean
      : keyof NumberFormatOptionsUseGroupingRegistry | false;

  interface NumberFormatOptions {
    readonly localeMatcher?: 'lookup' | 'best fit' | undefined;
    readonly style?: NumberFormatOptionsStyle | undefined;
    readonly currency?: string | undefined;
    readonly currencyDisplay?: NumberFormatOptionsCurrencyDisplay | undefined;
    readonly useGrouping?: NumberFormatOptionsUseGrouping | undefined;
    readonly minimumIntegerDigits?: UintRange<1, 22> | undefined;
    readonly minimumFractionDigits?: UintRange<0, 21> | undefined;
    readonly maximumFractionDigits?: UintRange<0, 21> | undefined;
    readonly minimumSignificantDigits?: UintRange<1, 22> | undefined;
    readonly maximumSignificantDigits?: UintRange<1, 22> | undefined;
  }

  interface ResolvedNumberFormatOptions {
    readonly locale: string;
    readonly numberingSystem: string;
    readonly style: NumberFormatOptionsStyle;
    readonly currency?: string;
    readonly currencyDisplay?: NumberFormatOptionsCurrencyDisplay;
    readonly minimumIntegerDigits: UintRange<1, 22>;
    readonly minimumFractionDigits?: UintRange<0, 21>;
    readonly maximumFractionDigits?: UintRange<0, 21>;
    readonly minimumSignificantDigits?: UintRange<1, 22>;
    readonly maximumSignificantDigits?: UintRange<1, 22>;
    readonly useGrouping: ResolvedNumberFormatOptionsUseGrouping;
  }

  interface NumberFormat {
    format(value: number): string;
    resolvedOptions(): ResolvedNumberFormatOptions;
  }

  interface NumberFormatConstructor {
    new (
      locales?: string | readonly string[],
      options?: NumberFormatOptions,
    ): NumberFormat;
    (
      locales?: string | readonly string[],
      options?: NumberFormatOptions,
    ): NumberFormat;
    supportedLocalesOf(
      locales: string | readonly string[],
      options?: NumberFormatOptions,
    ): readonly string[];
    readonly prototype: NumberFormat;
  }

  const NumberFormat: NumberFormatConstructor;

  interface DateTimeFormatOptions {
    readonly localeMatcher?: 'best fit' | 'lookup' | undefined;
    readonly weekday?: 'long' | 'short' | 'narrow' | undefined;
    readonly era?: 'long' | 'short' | 'narrow' | undefined;
    readonly year?: 'numeric' | '2-digit' | undefined;
    readonly month?:
      | 'numeric'
      | '2-digit'
      | 'long'
      | 'short'
      | 'narrow'
      | undefined;
    readonly day?: 'numeric' | '2-digit' | undefined;
    readonly hour?: 'numeric' | '2-digit' | undefined;
    readonly minute?: 'numeric' | '2-digit' | undefined;
    readonly second?: 'numeric' | '2-digit' | undefined;
    readonly timeZoneName?:
      | 'short'
      | 'long'
      | 'shortOffset'
      | 'longOffset'
      | 'shortGeneric'
      | 'longGeneric'
      | undefined;
    readonly formatMatcher?: 'best fit' | 'basic' | undefined;
    readonly hour12?: boolean | undefined;
    readonly timeZone?: string | undefined;
  }

  interface ResolvedDateTimeFormatOptions {
    readonly locale: string;
    readonly calendar: string;
    readonly numberingSystem: string;
    readonly timeZone: string;
    readonly hour12?: boolean;
    readonly weekday?: string;
    readonly era?: string;
    readonly year?: string;
    readonly month?: string;
    readonly day?: string;
    readonly hour?: string;
    readonly minute?: string;
    readonly second?: string;
    readonly timeZoneName?: string;
  }

  interface DateTimeFormat {
    format(date?: Date | number): string;
    resolvedOptions(): ResolvedDateTimeFormatOptions;
  }

  interface DateTimeFormatConstructor {
    new (
      locales?: string | readonly string[],
      options?: DateTimeFormatOptions,
    ): DateTimeFormat;
    (
      locales?: string | readonly string[],
      options?: DateTimeFormatOptions,
    ): DateTimeFormat;
    supportedLocalesOf(
      locales: string | readonly string[],
      options?: DateTimeFormatOptions,
    ): readonly string[];
    readonly prototype: DateTimeFormat;
  }

  const DateTimeFormat: DateTimeFormatConstructor;
}

interface String {
  /**
   * Determines whether two strings are equivalent in the current or specified locale.
   *
   * @param that String to compare to target string
   * @param locales A locale string or array of locale strings that contain one or more language or locale tags. If you include more than one locale string, list them in descending order of priority so that the first entry is the preferred locale. If you omit this parameter, the default locale of the JavaScript runtime
   *   is used. This parameter must conform to BCP 47 standards; see the Intl.Collator object for details.
   * @param options An object that contains one or more properties that specify comparison options. see the Intl.Collator object for details.
   */
  localeCompare(
    that: string,
    locales?: string | readonly string[],
    options?: Intl.CollatorOptions,
  ): number;
}

interface Number {
  /**
   * Converts a number to a string by using the current or specified locale.
   *
   * @param locales A locale string or array of locale strings that contain one or more language or locale tags. If you include more than one locale string, list them in descending order of priority so that the first entry is the preferred locale. If you omit this parameter, the default locale of the JavaScript runtime
   *   is used.
   * @param options An object that contains one or more properties that specify comparison options.
   */
  toLocaleString(
    locales?: string | readonly string[],
    options?: Intl.NumberFormatOptions,
  ): string;
}

interface Date {
  /**
   * Converts a date and time to a string by using the current or specified locale.
   *
   * @param locales A locale string or array of locale strings that contain one or more language or locale tags. If you include more than one locale string, list them in descending order of priority so that the first entry is the preferred locale. If you omit this parameter, the default locale of the JavaScript runtime
   *   is used.
   * @param options An object that contains one or more properties that specify comparison options.
   */
  toLocaleString(
    locales?: string | readonly string[],
    options?: Intl.DateTimeFormatOptions,
  ): string;
  /**
   * Converts a date to a string by using the current or specified locale.
   *
   * @param locales A locale string or array of locale strings that contain one or more language or locale tags. If you include more than one locale string, list them in descending order of priority so that the first entry is the preferred locale. If you omit this parameter, the default locale of the JavaScript runtime
   *   is used.
   * @param options An object that contains one or more properties that specify comparison options.
   */
  toLocaleDateString(
    locales?: string | readonly string[],
    options?: Intl.DateTimeFormatOptions,
  ): string;

  /**
   * Converts a time to a string by using the current or specified locale.
   *
   * @param locales A locale string or array of locale strings that contain one or more language or locale tags. If you include more than one locale string, list them in descending order of priority so that the first entry is the preferred locale. If you omit this parameter, the default locale of the JavaScript runtime
   *   is used.
   * @param options An object that contains one or more properties that specify comparison options.
   */
  toLocaleTimeString(
    locales?: string | readonly string[],
    options?: Intl.DateTimeFormatOptions,
  ): string;
}

type RawDateMutType = Date;

type RawDateType = Readonly<RawDateMutType>;

type TimerId = ReturnType<typeof setTimeout>; // NodeJS.Timeout or number

/**
 * https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Array/length
 * https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/String/length
 *
 *     Max array length : 2^32 - 1
 *     Max string length : 2^53 - 1
 */
declare namespace NumberType {
  export type StringSize = SafeUint;
  export type ArraySize = Uint32;
  export type TypedArraySize = SafeUint;

  export type ArraySizeArgPositive = WithSmallInt<
    IntersectBrand<PositiveNumber, ArraySize>
  >;
  export type TypedArraySizeArgPositive = WithSmallInt<
    IntersectBrand<PositiveNumber, TypedArraySize>
  >;
  export type StringSizeArgPositive = WithSmallInt<
    IntersectBrand<PositiveNumber, StringSize>
  >;

  export type StringSizeArgNonNegative = WithSmallInt<StringSize>;
  export type ArraySizeArgNonNegative = WithSmallInt<ArraySize>;
  export type TypedArraySizeArgNonNegative = WithSmallInt<TypedArraySize>;

  export type StringSizeArg = WithSmallInt<SafeInt>;
  export type ArraySizeArg = WithSmallInt<NegativeInt32 | ArraySize>;
  export type TypedArraySizeArg = WithSmallInt<SafeInt>;

  export type StringSearchResult = StringSize | -1;
  export type ArraySearchResult = ArraySize | -1;
  export type TypedArraySearchResult = TypedArraySize | -1;

  export type NewArrayMaxSize = ArraySize;
}
