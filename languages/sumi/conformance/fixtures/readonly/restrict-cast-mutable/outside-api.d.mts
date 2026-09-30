// Not a fixture: the outside API the fixtures hand values to. A library typed
// without readonly declares its parameters mutable, and only a declaration
// file can state that without tripping the readonly rules the fixtures are
// checked under. The strict standard library has no such parameter left.
export declare function joinAll(
  parts: string[],
  options: Readonly<{ separators: string[] }>,
): string;

export declare function joinReadonly(parts: readonly string[]): string;
