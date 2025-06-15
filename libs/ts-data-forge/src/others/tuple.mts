/**
 * Creates a readonly tuple from the given arguments with precise literal type inference.
 *
 * This utility function provides a concise way to create tuples while preserving
 * exact literal types. Without this function, TypeScript would infer arrays with
 * widened types instead of tuples with literal types.
 *
 * **Key benefits:**
 * - Preserves literal types (e.g., `1` instead of `number`)
 * - Creates readonly tuples for immutability
 * - Provides better type inference than array literals
 * - Zero runtime overhead - just returns the arguments
 *
 * @template T - A tuple type with literal types inferred from the arguments
 * @param args - The elements to include in the tuple (variadic)
 * @returns A readonly tuple containing the provided arguments with preserved literal types
 *
 * @example Basic tuple creation with literal types
 * ```typescript
 * // Without tp: types are widened
 * const arr = [1, 'hello', true]; // (string | number | boolean)[]
 *
 * // With tp: exact literal types preserved
 * const tuple = tp(1, 'hello', true); // readonly [1, 'hello', true]
 * const coords = tp(10, 20); // readonly [10, 20]
 * const single = tp('only'); // readonly ['only']
 * const empty = tp(); // readonly []
 *
 * // TypeScript knows exact values at compile time
 * type First = typeof tuple[0]; // 1 (literal type)
 * type Second = typeof tuple[1]; // 'hello' (literal type)
 * ```
 *
 * @example Creating type-safe coordinate systems
 * ```typescript
 * // 2D coordinates
 * const point2D = tp(10, 20);
 * const [x, y] = point2D; // x: 10, y: 20
 *
 * // 3D coordinates
 * const point3D = tp(10, 20, 30);
 * const [x3, y3, z3] = point3D; // Exact types preserved
 *
 * // Named coordinate system
 * const namedPoint = tp('x', 100, 'y', 200);
 * // Type: readonly ['x', 100, 'y', 200]
 * ```
 *
 * @example Building type-safe data structures
 * ```typescript
 * // Creating a type-safe map structure
 * const colorMap = [
 *   tp('red', '#FF0000'),
 *   tp('green', '#00FF00'),
 *   tp('blue', '#0000FF')
 * ] as const;
 * // Type: readonly [readonly ['red', '#FF0000'], ...]
 *
 * // Type-safe event system
 * type EventTuple = readonly ['click', MouseEvent] | readonly ['change', Event];
 * const event = tp('click', new MouseEvent('click')) as EventTuple;
 * ```
 *
 * @example Function argument patterns
 * ```typescript
 * // Functions expecting exact tuple types
 * function processCoordinate(coord: readonly [number, number]): void {
 *   const [x, y] = coord;
 *   console.log(`Processing point at (${x}, ${y})`);
 * }
 *
 * processCoordinate(tp(10, 20)); // ✅ Type-safe
 * processCoordinate([10, 20]); // ❌ Error: number[] not assignable
 *
 * // Pattern matching with tuples
 * function handleMessage(msg: readonly ['error', string] | readonly ['success', any]) {
 *   if (msg[0] === 'error') {
 *     console.error(msg[1]); // TypeScript knows msg[1] is string
 *   } else {
 *     console.log('Success:', msg[1]);
 *   }
 * }
 *
 * handleMessage(tp('error', 'Failed to load'));
 * handleMessage(tp('success', { id: 123 }));
 * ```
 *
 * @example Advanced type inference
 * ```typescript
 * // Const assertions comparison
 * const tuple1 = [1, 2, 3]; // number[]
 * const tuple2 = [1, 2, 3] as const; // readonly [1, 2, 3]
 * const tuple3 = tp(1, 2, 3); // readonly [1, 2, 3]
 *
 * // Building complex types
 * const config = tp(
 *   tp('host', 'localhost'),
 *   tp('port', 3000),
 *   tp('secure', true)
 * );
 * // Type: readonly [
 * //   readonly ['host', 'localhost'],
 * //   readonly ['port', 3000],
 * //   readonly ['secure', true]
 * // ]
 *
 * // Type-safe destructuring
 * const [[, host], [, port], [, secure]] = config;
 * // host: 'localhost', port: 3000, secure: true
 * ```
 *
 * @example Integration with other utilities
 * ```typescript
 * import { pipe } from '../functional/pipe';
 * import { Result } from '../functional/result';
 *
 * // Type-safe error handling
 * function divide(a: number, b: number): Result<number, string> {
 *   if (b === 0) return Result.err('Division by zero');
 *   return Result.ok(a / b);
 * }
 *
 * const calculation = tp(10, 2);
 * const result = divide(...calculation); // Spread tuple as arguments
 *
 * // Building pipelines with tuples
 * const pipeline = pipe(tp(5, 10))
 *   .map(([a, b]) => tp(a + b, a * b))
 *   .map(([sum, product]) => tp('sum', sum, 'product', product))
 *   .value;
 * // Type: readonly ['sum', 15, 'product', 50]
 * ```
 *
 * @example Common patterns and use cases
 * ```typescript
 * // React-style state tuples
 * const useState = <T>(initial: T) => tp(initial, (value: T) => void 0);
 * const [count, setCount] = useState(0);
 *
 * // Redux-style actions
 * const incrementAction = tp('INCREMENT', { amount: 1 });
 * const decrementAction = tp('DECREMENT', { amount: 1 });
 *
 * // Database query results
 * const queryResult = tp(
 *   true, // success
 *   [{ id: 1, name: 'John' }], // data
 *   null // error
 * );
 *
 * // Configuration flags
 * const features = tp('darkMode', 'analytics', 'notifications');
 * const enabledFeatures = features.filter(f => isEnabled(f));
 * ```
 *
 * @see https://www.typescriptlang.org/docs/handbook/2/objects.html#tuple-types
 */
export const tp = <const T extends readonly unknown[]>(
  ...args: T
): Readonly<T> => args;
