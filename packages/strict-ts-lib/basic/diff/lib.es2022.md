```diff
@@ -14,12 +14,13 @@ and limitations under the License.
 ***************************************************************************** */
 
 /// <reference no-default-lib="true"/>
+/// <reference types="@noshiro/ts-type-utils-no-stdlib" />
 
-/// <reference lib="es2021" />
-/// <reference lib="es2022.array" />
-/// <reference lib="es2022.error" />
-/// <reference lib="es2022.intl" />
-/// <reference lib="es2022.object" />
-/// <reference lib="es2022.sharedmemory" />
-/// <reference lib="es2022.string" />
-/// <reference lib="es2022.regexp" />
+/// <reference path="./lib.es2021.d.ts" />
+/// <reference path="./lib.es2022.array.d.ts" />
+/// <reference path="./lib.es2022.error.d.ts" />
+/// <reference path="./lib.es2022.intl.d.ts" />
+/// <reference path="./lib.es2022.object.d.ts" />
+/// <reference path="./lib.es2022.sharedmemory.d.ts" />
+/// <reference path="./lib.es2022.string.d.ts" />
+/// <reference path="./lib.es2022.regexp.d.ts" />
```
