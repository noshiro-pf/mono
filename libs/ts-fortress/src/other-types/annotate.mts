import { Arr } from 'ts-data-forge';
import type { TypeAnnotations, TypeOf, UnknownType } from '../type.mjs';

/**
 * Returns `type` with `annotations` added to the ones it carries: a title, a
 * description, a JSON Schema `format`, examples, or a deprecation mark, which
 * `toJsonSchema` writes out under the keywords of the same names.
 *
 * Everything else is kept as it is — validation, `fill` / `prune`, the
 * default value, `constraints`, a record's `shape`, and the `optional` marker,
 * so `t.annotate(t.optional(x), ...)` and `t.optional(t.annotate(x, ...))` are
 * the same record member. A key given again replaces the earlier value.
 *
 * Annotations never change what is valid: a `format` describes the values,
 * and the type alone decides which are accepted. A type built from an
 * annotated type, such as a `pick` of an annotated record or a `union` with an
 * annotated member, carries its own annotations, not those of what it was
 * built from; the members keep theirs.
 *
 * @example
 * ```ts
 * import * as t from 'ts-fortress';
 *
 * const Port = t.annotate(t.uint16(8080), {
 *   title: 'Port',
 *   description: 'The port the server listens on.',
 *   examples: [t.asUint16(8080)],
 * });
 *
 * assert.isTrue(Port.is(80));
 *
 * assert.deepStrictEqual(Port.annotations, {
 *   title: 'Port',
 *   description: 'The port the server listens on.',
 *   examples: [8080],
 * });
 * ```
 */
export const annotate = <T extends UnknownType>(
  type: T,
  annotations: TypeAnnotations<TypeOf<T>>,
): T => {
  const merged: TypeAnnotations = {
    ...type.annotations,
    ...annotations,
  } as const;

  // A proxy rather than a copy: copying reads every property, and a
  // `recursion` reads some of its properties off the type it resolves to,
  // which does not exist yet while `annotate(t.recursion(...))` initializes
  // the binding the definition refers to. Reading through also keeps the
  // lazy `defaultValue` getters lazy.
  //
  // The target is an empty object, whose own properties put no invariant on
  // what the traps report.
  // @sumi-expect-error banned-syntax/no-unsafe-type-assertion
  return new Proxy(
    {},
    {
      get: (_, key) =>
        key === ANNOTATIONS ? merged : Reflect.get(type, key, type),
      has: (_, key) => key === ANNOTATIONS || Reflect.has(type, key),
      ownKeys: () => {
        const keys = Reflect.ownKeys(type);

        return keys.includes(ANNOTATIONS)
          ? keys
          : Arr.toPushed(keys, ANNOTATIONS);
      },
      getOwnPropertyDescriptor: (_, key) => {
        const descriptor =
          key === ANNOTATIONS
            ? ({ value: merged, enumerable: true, writable: false } as const)
            : Reflect.getOwnPropertyDescriptor(type, key);

        // Reported configurable, as a property the target does not have
        // must be.
        return descriptor === undefined
          ? undefined
          : { ...descriptor, configurable: true };
      },
    },
  ) as T;
};

const ANNOTATIONS = 'annotations';
