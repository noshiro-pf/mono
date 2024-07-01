```diff
@@ -14,15 +14,16 @@ and limitations under the License.
 ***************************************************************************** */
 
 /// <reference no-default-lib="true"/>
+/// <reference types="@noshiro/ts-type-utils-no-stdlib" />
 
-/// <reference lib="es2015.iterable" />
+/// <reference path="./lib.es2015.iterable.d.ts" />
 
 interface Generator<T = unknown, TReturn = any, TNext = unknown>
   extends Iterator<T, TReturn, TNext> {
   // NOTE: 'next' is defined using a tuple to ensure we report the correct assignability errors in all places.
-  next(...args: [] | [TNext]): IteratorResult<T, TReturn>;
+  next(...args: readonly [] | readonly [TNext]): IteratorResult<T, TReturn>;
   return(value: TReturn): IteratorResult<T, TReturn>;
-  throw(e: any): IteratorResult<T, TReturn>;
+  throw(e: unknown): IteratorResult<T, TReturn>;
   [Symbol.iterator](): Generator<T, TReturn, TNext>;
 }
 
@@ -32,15 +33,15 @@ interface GeneratorFunction {
    *
    * @param args A list of arguments the function accepts.
    */
-  new (...args: any[]): Generator;
+  new (...args: readonly unknown[]): Generator;
   /**
    * Creates a new Generator object.
    *
    * @param args A list of arguments the function accepts.
    */
-  (...args: any[]): Generator;
+  (...args: readonly unknown[]): Generator;
   /** The length of the arguments. */
-  readonly length: number;
+  readonly length: NumberType.ArraySize;
   /** Returns the name of the function. */
   readonly name: string;
   /** A reference to the prototype. */
@@ -53,15 +54,15 @@ interface GeneratorFunctionConstructor {
    *
    * @param args A list of arguments the function accepts.
    */
-  new (...args: string[]): GeneratorFunction;
+  new (...args: readonly string[]): GeneratorFunction;
   /**
    * Creates a new Generator function.
    *
    * @param args A list of arguments the function accepts.
    */
-  (...args: string[]): GeneratorFunction;
+  (...args: readonly string[]): GeneratorFunction;
   /** The length of the arguments. */
-  readonly length: number;
+  readonly length: NumberType.ArraySize;
   /** Returns the name of the function. */
   readonly name: string;
   /** A reference to the prototype. */
```
