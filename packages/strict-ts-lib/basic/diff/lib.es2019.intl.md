```diff
@@ -14,9 +14,10 @@ and limitations under the License.
 ***************************************************************************** */
 
 /// <reference no-default-lib="true"/>
+/// <reference types="@noshiro/ts-type-utils-no-stdlib" />
 
 declare namespace Intl {
   interface DateTimeFormatPartTypesRegistry {
-    unknown: any;
+    readonly unknown: unknown;
   }
 }
```
