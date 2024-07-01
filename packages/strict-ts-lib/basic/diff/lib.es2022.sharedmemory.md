```diff
@@ -14,6 +14,7 @@ and limitations under the License.
 ***************************************************************************** */
 
 /// <reference no-default-lib="true"/>
+/// <reference types="@noshiro/ts-type-utils-no-stdlib" />
 
 interface Atomics {
   /**
@@ -32,8 +33,8 @@ interface Atomics {
     value: number,
     timeout?: number,
   ):
-    | { async: false; value: 'not-equal' | 'timed-out' }
-    | { async: true; value: Promise<'ok' | 'timed-out'> };
+    | { readonly async: false; readonly value: 'not-equal' | 'timed-out' }
+    | { readonly async: true; readonly value: Promise<'ok' | 'timed-out'> };
 
   /**
    * A non-blocking, asynchronous version of wait which is usable on the main
@@ -48,9 +49,9 @@ interface Atomics {
   waitAsync(
     typedArray: BigInt64Array,
     index: number,
-    value: bigint,
+    value: number,
     timeout?: number,
   ):
-    | { async: false; value: 'not-equal' | 'timed-out' }
-    | { async: true; value: Promise<'ok' | 'timed-out'> };
+    | { readonly async: false; readonly value: 'not-equal' | 'timed-out' }
+    | { readonly async: true; readonly value: Promise<'ok' | 'timed-out'> };
 }
```
