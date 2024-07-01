```diff
@@ -14,6 +14,7 @@ and limitations under the License.
 ***************************************************************************** */
 
 /// <reference no-default-lib="true"/>
+/// <reference types="@noshiro/ts-type-utils-no-stdlib" />
 
 interface String {
   /**
@@ -23,5 +24,5 @@ interface String {
    * @param index The zero-based index of the desired code unit. A negative
    *   index will count back from the last item.
    */
-  at(index: number): string | undefined;
+  at(index: NumberType.StringSizeArg): string | undefined;
 }
```
