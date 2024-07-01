```diff
@@ -14,9 +14,10 @@ and limitations under the License.
 ***************************************************************************** */
 
 /// <reference no-default-lib="true"/>
+/// <reference types="@noshiro/ts-type-utils-no-stdlib" />
 
-/// <reference lib="es2017" />
-/// <reference lib="dom" />
-/// <reference lib="webworker.importscripts" />
-/// <reference lib="scripthost" />
-/// <reference lib="dom.iterable" />
+/// <reference path="./lib.es2017.d.ts" />
+/// <reference path="./lib.dom.d.ts" />
+/// <reference path="./lib.webworker.importscripts.d.ts" />
+/// <reference path="./lib.scripthost.d.ts" />
+/// <reference path="./lib.dom.iterable.d.ts" />
```
