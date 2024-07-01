```diff
@@ -14,16 +14,17 @@ and limitations under the License.
 ***************************************************************************** */
 
 /// <reference no-default-lib="true"/>
+/// <reference types="@noshiro/ts-type-utils-no-stdlib" />
 
 interface RegExpMatchArray {
-  groups?: {
-    [key: string]: string;
+  readonly groups?: {
+    readonly [key: string]: string;
   };
 }
 
 interface RegExpExecArray {
-  groups?: {
-    [key: string]: string;
+  readonly groups?: {
+    readonly [key: string]: string;
   };
 }
 
```
