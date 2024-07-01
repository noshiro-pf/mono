```diff
@@ -14,8 +14,9 @@ and limitations under the License.
 ***************************************************************************** */
 
 /// <reference no-default-lib="true"/>
+/// <reference types="@noshiro/ts-type-utils-no-stdlib" />
 
-/// <reference lib="es2020.intl" />
+/// <reference path="./lib.es2020.intl.d.ts" />
 
 interface Date {
   /**
```
