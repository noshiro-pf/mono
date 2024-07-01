```diff
@@ -14,17 +14,20 @@ and limitations under the License.
 ***************************************************************************** */
 
 /// <reference no-default-lib="true"/>
+/// <reference types="@noshiro/ts-type-utils-no-stdlib" />
 
-/// <reference lib="es2018.asynciterable" />
+/// <reference path="./lib.es2018.asynciterable.d.ts" />
 
 interface AsyncGenerator<T = unknown, TReturn = any, TNext = unknown>
   extends AsyncIterator<T, TReturn, TNext> {
   // NOTE: 'next' is defined using a tuple to ensure we report the correct assignability errors in all places.
-  next(...args: [] | [TNext]): Promise<IteratorResult<T, TReturn>>;
+  next(
+    ...args: readonly [] | readonly [TNext]
+  ): Promise<IteratorResult<T, TReturn>>;
   return(
     value: TReturn | PromiseLike<TReturn>,
   ): Promise<IteratorResult<T, TReturn>>;
-  throw(e: any): Promise<IteratorResult<T, TReturn>>;
+  throw(e: unknown): Promise<IteratorResult<T, TReturn>>;
   [Symbol.asyncIterator](): AsyncGenerator<T, TReturn, TNext>;
 }
 
@@ -34,13 +37,13 @@ interface AsyncGeneratorFunction {
    *
    * @param args A list of arguments the function accepts.
    */
-  new (...args: any[]): AsyncGenerator;
+  new (...args: readonly unknown[]): AsyncGenerator;
   /**
    * Creates a new AsyncGenerator object.
    *
    * @param args A list of arguments the function accepts.
    */
-  (...args: any[]): AsyncGenerator;
+  (...args: readonly unknown[]): AsyncGenerator;
   /** The length of the arguments. */
   readonly length: number;
   /** Returns the name of the function. */
@@ -55,13 +58,13 @@ interface AsyncGeneratorFunctionConstructor {
    *
    * @param args A list of arguments the function accepts.
    */
-  new (...args: string[]): AsyncGeneratorFunction;
+  new (...args: readonly string[]): AsyncGeneratorFunction;
   /**
    * Creates a new AsyncGenerator function.
    *
    * @param args A list of arguments the function accepts.
    */
-  (...args: string[]): AsyncGeneratorFunction;
+  (...args: readonly string[]): AsyncGeneratorFunction;
   /** The length of the arguments. */
   readonly length: number;
   /** Returns the name of the function. */
```
