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
@@ -66,7 +67,7 @@ interface ReadonlyArray<T> {
       this: This,
       value: T,
       index: number,
-      array: T[],
+      array: readonly T[],
     ) => U | ReadonlyArray<U>,
     thisArg?: This,
   ): U[];
@@ -98,7 +99,7 @@ interface Array<T> {
       this: This,
       value: T,
       index: number,
-      array: T[],
+      array: readonly T[],
     ) => U | ReadonlyArray<U>,
     thisArg?: This,
   ): U[];
```
