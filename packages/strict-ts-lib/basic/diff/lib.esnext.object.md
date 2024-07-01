```diff
@@ -14,6 +14,7 @@ and limitations under the License.
 ***************************************************************************** */
 
 /// <reference no-default-lib="true"/>
+/// <reference types="@noshiro/ts-type-utils-no-stdlib" />
 
 interface ObjectConstructor {
   /**
@@ -26,5 +27,5 @@ interface ObjectConstructor {
   groupBy<K extends PropertyKey, T>(
     items: Iterable<T>,
     keySelector: (item: T, index: number) => K,
-  ): Partial<Record<K, T[]>>;
+  ): Partial<MutableRecord<K, T[]>>;
 }
```
