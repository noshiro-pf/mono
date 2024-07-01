```diff
@@ -14,10 +14,11 @@ and limitations under the License.
 ***************************************************************************** */
 
 /// <reference no-default-lib="true"/>
+/// <reference types="@noshiro/ts-type-utils-no-stdlib" />
 
 type FlatArray<Arr, Depth extends number> = {
-  done: Arr;
-  recur: Arr extends ReadonlyArray<infer InnerArr>
+  readonly done: Arr;
+  readonly recur: Arr extends ReadonlyArray<infer InnerArr>
     ? FlatArray<
         InnerArr,
         [
@@ -65,11 +66,11 @@ interface ReadonlyArray<T> {
     callback: (
       this: This,
       value: T,
-      index: number,
-      array: T[],
+      index: NumberType.ArraySize,
+      array: readonly T[],
     ) => U | ReadonlyArray<U>,
     thisArg?: This,
-  ): U[];
+  ): readonly U[];
 
   /**
    * Returns a new array with all sub-array elements concatenated into it
@@ -77,7 +78,10 @@ interface ReadonlyArray<T> {
    *
    * @param depth The maximum recursion depth
    */
-  flat<A, D extends number = 1>(this: A, depth?: D): FlatArray<A, D>[];
+  flat<A, D extends NumberType.ArraySizeArgNonNegative = 1>(
+    this: A,
+    depth?: D,
+  ): readonly FlatArray<A, D>[];
 }
 
 interface Array<T> {
@@ -97,11 +101,11 @@ interface Array<T> {
     callback: (
       this: This,
       value: T,
-      index: number,
-      array: T[],
+      index: NumberType.ArraySize,
+      array: readonly T[],
     ) => U | ReadonlyArray<U>,
     thisArg?: This,
-  ): U[];
+  ): readonly U[];
 
   /**
    * Returns a new array with all sub-array elements concatenated into it
@@ -109,5 +113,8 @@ interface Array<T> {
    *
    * @param depth The maximum recursion depth
    */
-  flat<A, D extends number = 1>(this: A, depth?: D): FlatArray<A, D>[];
+  flat<A, D extends NumberType.ArraySizeArgNonNegative = 1>(
+    this: A,
+    depth?: D,
+  ): readonly FlatArray<A, D>[];
 }
```
