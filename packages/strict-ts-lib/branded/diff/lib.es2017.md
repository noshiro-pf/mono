```diff
@@ -14,11 +14,12 @@ and limitations under the License.
 ***************************************************************************** */
 
 /// <reference no-default-lib="true"/>
+/// <reference types="@noshiro/ts-type-utils-no-stdlib" />
 
-/// <reference lib="es2016" />
-/// <reference lib="es2017.object" />
-/// <reference lib="es2017.sharedmemory" />
-/// <reference lib="es2017.string" />
-/// <reference lib="es2017.intl" />
-/// <reference lib="es2017.typedarrays" />
-/// <reference lib="es2017.date" />
+/// <reference path="./lib.es2016.d.ts" />
+/// <reference path="./lib.es2017.object.d.ts" />
+/// <reference path="./lib.es2017.sharedmemory.d.ts" />
+/// <reference path="./lib.es2017.string.d.ts" />
+/// <reference path="./lib.es2017.intl.d.ts" />
+/// <reference path="./lib.es2017.typedarrays.d.ts" />
+/// <reference path="./lib.es2017.date.d.ts" />
```
