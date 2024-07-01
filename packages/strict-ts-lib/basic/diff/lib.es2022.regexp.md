```diff
@@ -14,18 +14,19 @@ and limitations under the License.
 ***************************************************************************** */
 
 /// <reference no-default-lib="true"/>
+/// <reference types="@noshiro/ts-type-utils-no-stdlib" />
 
 interface RegExpMatchArray {
-  indices?: RegExpIndicesArray;
+  readonly indices?: RegExpIndicesArray;
 }
 
 interface RegExpExecArray {
-  indices?: RegExpIndicesArray;
+  readonly indices?: RegExpIndicesArray;
 }
 
-interface RegExpIndicesArray extends Array<[number, number]> {
-  groups?: {
-    [key: string]: [number, number];
+interface RegExpIndicesArray extends Array<readonly [number, number]> {
+  readonly groups?: {
+    readonly [key: string]: readonly [number, number];
   };
 }
 
```
