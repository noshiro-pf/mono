```diff
@@ -14,6 +14,7 @@ and limitations under the License.
 ***************************************************************************** */
 
 /// <reference no-default-lib="true"/>
+/// <reference types="@noshiro/ts-type-utils-no-stdlib" />
 
 declare namespace Intl {
   /**
@@ -27,5 +28,7 @@ declare namespace Intl {
    *   names
    * @returns An array containing the canonical and validated locale names.
    */
-  function getCanonicalLocales(locale?: string | readonly string[]): string[];
+  function getCanonicalLocales(
+    locale?: string | readonly string[],
+  ): readonly string[];
 }
```
