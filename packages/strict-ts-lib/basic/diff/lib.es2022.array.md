```diff
@@ -14,6 +14,7 @@ and limitations under the License.
 ***************************************************************************** */
 
 /// <reference no-default-lib="true"/>
+/// <reference types="@noshiro/ts-type-utils-no-stdlib" />
 
 interface Array<T> {
   /**
@@ -42,7 +43,7 @@ interface Int8Array {
    * @param index The zero-based index of the desired code unit. A negative
    *   index will count back from the last item.
    */
-  at(index: number): number | undefined;
+  at(index: number): Int8 | undefined;
 }
 
 interface Uint8Array {
@@ -52,7 +53,7 @@ interface Uint8Array {
    * @param index The zero-based index of the desired code unit. A negative
    *   index will count back from the last item.
    */
-  at(index: number): number | undefined;
+  at(index: number): Uint8 | undefined;
 }
 
 interface Uint8ClampedArray {
@@ -62,7 +63,7 @@ interface Uint8ClampedArray {
    * @param index The zero-based index of the desired code unit. A negative
    *   index will count back from the last item.
    */
-  at(index: number): number | undefined;
+  at(index: number): Uint8 | undefined;
 }
 
 interface Int16Array {
@@ -132,7 +133,7 @@ interface BigInt64Array {
    * @param index The zero-based index of the desired code unit. A negative
    *   index will count back from the last item.
    */
-  at(index: number): bigint | undefined;
+  at(index: number): number | undefined;
 }
 
 interface BigUint64Array {
@@ -142,5 +143,5 @@ interface BigUint64Array {
    * @param index The zero-based index of the desired code unit. A negative
    *   index will count back from the last item.
    */
-  at(index: number): bigint | undefined;
+  at(index: number): number | undefined;
 }
```
