```diff
@@ -14,10 +14,11 @@ and limitations under the License.
 ***************************************************************************** */
 
 /// <reference no-default-lib="true"/>
+/// <reference types="@noshiro/ts-type-utils-no-stdlib" />
 
-/// <reference lib="es2017" />
-/// <reference lib="es2018.asynciterable" />
-/// <reference lib="es2018.asyncgenerator" />
-/// <reference lib="es2018.promise" />
-/// <reference lib="es2018.regexp" />
-/// <reference lib="es2018.intl" />
+/// <reference path="./lib.es2017.d.ts" />
+/// <reference path="./lib.es2018.asynciterable.d.ts" />
+/// <reference path="./lib.es2018.asyncgenerator.d.ts" />
+/// <reference path="./lib.es2018.promise.d.ts" />
+/// <reference path="./lib.es2018.regexp.d.ts" />
+/// <reference path="./lib.es2018.intl.d.ts" />
```
