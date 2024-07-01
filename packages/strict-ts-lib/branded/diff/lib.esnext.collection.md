```diff
@@ -14,6 +14,7 @@ and limitations under the License.
 ***************************************************************************** */
 
 /// <reference no-default-lib="true"/>
+/// <reference types="@noshiro/ts-type-utils-no-stdlib" />
 
 interface MapConstructor {
   /**
@@ -25,6 +26,6 @@ interface MapConstructor {
    */
   groupBy<K, T>(
     items: Iterable<T>,
-    keySelector: (item: T, index: number) => K,
-  ): Map<K, T[]>;
+    keySelector: (item: T, index: NumberType.ArraySizeArgNonNegative) => K,
+  ): ReadonlyMap<K, readonly T[]>;
 }
```
