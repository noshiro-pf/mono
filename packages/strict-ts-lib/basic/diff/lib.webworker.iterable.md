```diff
@@ -14,6 +14,7 @@ and limitations under the License.
 ***************************************************************************** */
 
 /// <reference no-default-lib="true"/>
+/// <reference types="@noshiro/ts-type-utils-no-stdlib" />
 
 /////////////////////////////
 /// Worker Iterable APIs
@@ -21,21 +22,21 @@ and limitations under the License.
 
 interface CSSNumericArray {
   [Symbol.iterator](): IterableIterator<CSSNumericValue>;
-  entries(): IterableIterator<[number, CSSNumericValue]>;
+  entries(): IterableIterator<readonly [number, CSSNumericValue]>;
   keys(): IterableIterator<number>;
   values(): IterableIterator<CSSNumericValue>;
 }
 
 interface CSSTransformValue {
   [Symbol.iterator](): IterableIterator<CSSTransformComponent>;
-  entries(): IterableIterator<[number, CSSTransformComponent]>;
+  entries(): IterableIterator<readonly [number, CSSTransformComponent]>;
   keys(): IterableIterator<number>;
   values(): IterableIterator<CSSTransformComponent>;
 }
 
 interface CSSUnparsedValue {
   [Symbol.iterator](): IterableIterator<CSSUnparsedSegment>;
-  entries(): IterableIterator<[number, CSSUnparsedSegment]>;
+  entries(): IterableIterator<readonly [number, CSSUnparsedSegment]>;
   keys(): IterableIterator<number>;
   values(): IterableIterator<CSSUnparsedSegment>;
 }
@@ -78,9 +79,9 @@ interface FileList {
 interface FontFaceSet extends Set<FontFace> {}
 
 interface FormData {
-  [Symbol.iterator](): IterableIterator<[string, FormDataEntryValue]>;
+  [Symbol.iterator](): IterableIterator<readonly [string, FormDataEntryValue]>;
   /** Returns an array of key, value pairs for every entry in the list. */
-  entries(): IterableIterator<[string, FormDataEntryValue]>;
+  entries(): IterableIterator<readonly [string, FormDataEntryValue]>;
   /** Returns a list of keys in the list. */
   keys(): IterableIterator<string>;
   /** Returns a list of values in the list. */
@@ -88,12 +89,12 @@ interface FormData {
 }
 
 interface Headers {
-  [Symbol.iterator](): IterableIterator<[string, string]>;
+  [Symbol.iterator](): IterableIterator<readonly [string, string]>;
   /**
    * Returns an iterator allowing to go through all key/value pairs contained in
    * this object.
    */
-  entries(): IterableIterator<[string, string]>;
+  entries(): IterableIterator<readonly [string, string]>;
   /**
    * Returns an iterator allowing to go through all keys of the key/value pairs
    * contained in this object.
@@ -141,7 +142,7 @@ interface IDBObjectStore {
   ): IDBIndex;
 }
 
-interface MessageEvent<T = any> {
+interface MessageEvent<T = unknown> {
   /**
    * @deprecated
    *
@@ -152,7 +153,7 @@ interface MessageEvent<T = any> {
     type: string,
     bubbles?: boolean,
     cancelable?: boolean,
-    data?: any,
+    data?: unknown,
     origin?: string,
     lastEventId?: string,
     source?: MessageEventSource | null,
@@ -161,8 +162,10 @@ interface MessageEvent<T = any> {
 }
 
 interface StylePropertyMapReadOnly {
-  [Symbol.iterator](): IterableIterator<[string, Iterable<CSSStyleValue>]>;
-  entries(): IterableIterator<[string, Iterable<CSSStyleValue>]>;
+  [Symbol.iterator](): IterableIterator<
+    readonly [string, Iterable<CSSStyleValue>]
+  >;
+  entries(): IterableIterator<readonly [string, Iterable<CSSStyleValue>]>;
   keys(): IterableIterator<string>;
   values(): IterableIterator<Iterable<CSSStyleValue>>;
 }
@@ -266,9 +269,9 @@ interface SubtleCrypto {
 }
 
 interface URLSearchParams {
-  [Symbol.iterator](): IterableIterator<[string, string]>;
+  [Symbol.iterator](): IterableIterator<readonly [string, string]>;
   /** Returns an array of key, value pairs for every entry in the search params. */
-  entries(): IterableIterator<[string, string]>;
+  entries(): IterableIterator<readonly [string, string]>;
   /** Returns a list of keys in the search params. */
   keys(): IterableIterator<string>;
   /** Returns a list of values in the search params. */
@@ -384,7 +387,7 @@ interface WebGL2RenderingContextBase {
     program: WebGLProgram,
     uniformIndices: Iterable<GLuint>,
     pname: GLenum,
-  ): any;
+  ): unknown;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/WebGL2RenderingContext/getUniformIndices)
```
