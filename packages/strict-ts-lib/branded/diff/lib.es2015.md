```diff
@@ -14,14 +14,15 @@ and limitations under the License.
 ***************************************************************************** */
 
 /// <reference no-default-lib="true"/>
+/// <reference types="@noshiro/ts-type-utils-no-stdlib" />
 
-/// <reference lib="es5" />
-/// <reference lib="es2015.core" />
-/// <reference lib="es2015.collection" />
-/// <reference lib="es2015.iterable" />
-/// <reference lib="es2015.generator" />
-/// <reference lib="es2015.promise" />
-/// <reference lib="es2015.proxy" />
-/// <reference lib="es2015.reflect" />
-/// <reference lib="es2015.symbol" />
-/// <reference lib="es2015.symbol.wellknown" />
+/// <reference path="./lib.es5.d.ts" />
+/// <reference path="./lib.es2015.core.d.ts" />
+/// <reference path="./lib.es2015.collection.d.ts" />
+/// <reference path="./lib.es2015.iterable.d.ts" />
+/// <reference path="./lib.es2015.generator.d.ts" />
+/// <reference path="./lib.es2015.promise.d.ts" />
+/// <reference path="./lib.es2015.proxy.d.ts" />
+/// <reference path="./lib.es2015.reflect.d.ts" />
+/// <reference path="./lib.es2015.symbol.d.ts" />
+/// <reference path="./lib.es2015.symbol.wellknown.d.ts" />
```
