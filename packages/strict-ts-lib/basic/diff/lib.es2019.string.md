```diff
@@ -14,6 +14,7 @@ and limitations under the License.
 ***************************************************************************** */
 
 /// <reference no-default-lib="true"/>
+/// <reference types="@noshiro/ts-type-utils-no-stdlib" />
 
 interface String {
   /**
@@ -35,7 +36,7 @@ interface String {
    * @deprecated A legacy feature for browser compatibility. Use `trimStart`
    *   instead
    */
-  trimLeft(): string;
+  // trimLeft(): string;
 
   /**
    * Removes the trailing white space and line terminator characters from a
@@ -44,5 +45,5 @@ interface String {
    * @deprecated A legacy feature for browser compatibility. Use `trimEnd`
    *   instead
    */
-  trimRight(): string;
+  // trimRight(): string;
 }
```
