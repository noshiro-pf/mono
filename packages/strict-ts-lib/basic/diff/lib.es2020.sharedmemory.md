```diff
@@ -14,6 +14,7 @@ and limitations under the License.
 ***************************************************************************** */
 
 /// <reference no-default-lib="true"/>
+/// <reference types="@noshiro/ts-type-utils-no-stdlib" />
 
 interface Atomics {
   /**
@@ -111,7 +112,7 @@ interface Atomics {
   wait(
     typedArray: BigInt64Array,
     index: number,
-    value: bigint,
+    value: number,
     timeout?: number,
   ): 'ok' | 'not-equal' | 'timed-out';
 
```
