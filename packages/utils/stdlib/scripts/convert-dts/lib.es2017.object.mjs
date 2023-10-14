/**
 *
 * @param {string} from
 * @returns {string}
 */
export const convertLibEs2017Object = (from) => {
  let ret = from;

  ret = ret.replaceAll(
    'interface ObjectConstructor {',
    '/** @internal */\ntype ToObjectKeysValue<A> = A extends string\n  ? A\n  : A extends number\n  ? `${A}`\n  : never;\n\n/** @internal */\ntype PickByValue<R, V> = Pick<\n  R,\n  {\n    [K in keyof R]: R[K] extends V ? K : never;\n  }[keyof R]\n>;\n\n/** @internal */\ntype _RecordUtilsEntries<R extends RecordBase> = R extends R\n  ? readonly {\n      readonly [K in keyof R]: readonly [\n        ToObjectKeysValue<keyof PickByValue<R, R[K]>>,\n        R[K]\n      ];\n      // eslint-disable-next-line @typescript-eslint/ban-types\n    }[RelaxedExclude<keyof R, symbol>][]\n  : never;\n\ninterface ObjectConstructor {',
  );

  ret = ret.replaceAll(
    '/**\n   * Returns an array of key/values of the enumerable properties of an object\n   * @param o Object that contains the properties and methods. This can be an object that you created or an existing Document Object Model (DOM) object.\n   */\n  entries<T>(\n    o: { readonly [s: string]: T } | ArrayLike<T>\n  ): readonly (readonly [string, T])[];',
    "/**\n   * Returns an array of key/values of the enumerable properties of an object\n   * @param o Object that contains the properties and methods. This can be an object that you created or an existing Document Object Model (DOM) object.\n   *\n   * @example\n   * ```ts\n   * const obj = {\n   *   x: 1,\n   *   y: 2,\n   *   z: 2,\n   *   3: 4,\n   * } as const;\n   *\n   * const entries = Object.entries(obj); // (['3', 4] | ['x', 1] | ['y' | 'z', 2])[]\n   * ```\n   */\n  entries<R extends RecordBase>(object: R): _RecordUtilsEntries<R>;",
  );

  return ret;
};
