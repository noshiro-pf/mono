```diff
@@ -14,8 +14,9 @@ and limitations under the License.
 ***************************************************************************** */
 
 /// <reference no-default-lib="true"/>
+/// <reference types="@noshiro/ts-type-utils-no-stdlib" />
 
-/// <reference lib="es5" />
-/// <reference lib="dom" />
-/// <reference lib="webworker.importscripts" />
-/// <reference lib="scripthost" />
+/// <reference path="./lib.es5.d.ts" />
+/// <reference path="./lib.dom.d.ts" />
+/// <reference path="./lib.webworker.importscripts.d.ts" />
+/// <reference path="./lib.scripthost.d.ts" />
```
