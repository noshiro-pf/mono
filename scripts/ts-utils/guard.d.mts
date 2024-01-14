export declare const isRecord: (a: unknown) => a is Record<string, unknown>;
export declare const isNotUndefined: <T>(
  a: T,
) => a is RelaxedExclude<T, undefined>;
export declare const isNumber: (a: unknown) => a is number;
export declare const isString: (a: unknown) => a is string;
export declare const isNonNullish: <T>(a: T) => a is NonNullable<T>;
