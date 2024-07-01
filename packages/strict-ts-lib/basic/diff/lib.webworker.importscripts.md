```diff
@@ -14,9 +14,10 @@ and limitations under the License.
 ***************************************************************************** */
 
 /// <reference no-default-lib="true"/>
+/// <reference types="@noshiro/ts-type-utils-no-stdlib" />
 
 /////////////////////////////
 /// WorkerGlobalScope APIs
 /////////////////////////////
 // These are only available in a Web Worker
-declare function importScripts(...urls: string[]): void;
+declare function importScripts(...urls: readonly string[]): void;
```
