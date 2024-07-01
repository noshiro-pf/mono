```diff
@@ -14,18 +14,23 @@ and limitations under the License.
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
+interface RegExpIndicesArray
+  extends Array<readonly [NumberType.ArraySize, NumberType.ArraySize]> {
+  readonly groups?: {
+    readonly [key: string]: readonly [
+      NumberType.ArraySize,
+      NumberType.ArraySize,
+    ];
   };
 }
 
```
