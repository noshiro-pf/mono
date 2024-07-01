```diff
@@ -14,6 +14,7 @@ and limitations under the License.
 ***************************************************************************** */
 
 /// <reference no-default-lib="true"/>
+/// <reference types="@noshiro/ts-type-utils-no-stdlib" />
 
 /////////////////////////////
 /// Window Iterable APIs
@@ -59,8 +60,8 @@ interface CSSKeyframesRule {
 
 interface CSSNumericArray {
   [Symbol.iterator](): IterableIterator<CSSNumericValue>;
-  entries(): IterableIterator<[number, CSSNumericValue]>;
-  keys(): IterableIterator<number>;
+  entries(): IterableIterator<readonly [NumberType.ArraySize, CSSNumericValue]>;
+  keys(): IterableIterator<NumberType.ArraySize>;
   values(): IterableIterator<CSSNumericValue>;
 }
 
@@ -74,15 +75,19 @@ interface CSSStyleDeclaration {
 
 interface CSSTransformValue {
   [Symbol.iterator](): IterableIterator<CSSTransformComponent>;
-  entries(): IterableIterator<[number, CSSTransformComponent]>;
-  keys(): IterableIterator<number>;
+  entries(): IterableIterator<
+    readonly [NumberType.ArraySize, CSSTransformComponent]
+  >;
+  keys(): IterableIterator<NumberType.ArraySize>;
   values(): IterableIterator<CSSTransformComponent>;
 }
 
 interface CSSUnparsedValue {
   [Symbol.iterator](): IterableIterator<CSSUnparsedSegment>;
-  entries(): IterableIterator<[number, CSSUnparsedSegment]>;
-  keys(): IterableIterator<number>;
+  entries(): IterableIterator<
+    readonly [NumberType.ArraySize, CSSUnparsedSegment]
+  >;
+  keys(): IterableIterator<NumberType.ArraySize>;
   values(): IterableIterator<CSSUnparsedSegment>;
 }
 
@@ -123,8 +128,8 @@ interface DOMStringList {
 
 interface DOMTokenList {
   [Symbol.iterator](): IterableIterator<string>;
-  entries(): IterableIterator<[number, string]>;
-  keys(): IterableIterator<number>;
+  entries(): IterableIterator<readonly [NumberType.ArraySize, string]>;
+  keys(): IterableIterator<NumberType.ArraySize>;
   values(): IterableIterator<string>;
 }
 
@@ -141,9 +146,9 @@ interface FileList {
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
@@ -171,12 +176,12 @@ interface HTMLSelectElement {
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
@@ -238,8 +243,10 @@ interface MIDIOutput {
 interface MIDIOutputMap extends ReadonlyMap<string, MIDIOutput> {}
 
 interface MediaKeyStatusMap {
-  [Symbol.iterator](): IterableIterator<[BufferSource, MediaKeyStatus]>;
-  entries(): IterableIterator<[BufferSource, MediaKeyStatus]>;
+  [Symbol.iterator](): IterableIterator<
+    readonly [BufferSource, MediaKeyStatus]
+  >;
+  entries(): IterableIterator<readonly [BufferSource, MediaKeyStatus]>;
   keys(): IterableIterator<BufferSource>;
   values(): IterableIterator<MediaKeyStatus>;
 }
@@ -248,7 +255,7 @@ interface MediaList {
   [Symbol.iterator](): IterableIterator<string>;
 }
 
-interface MessageEvent<T = any> {
+interface MessageEvent<T = unknown> {
   /**
    * @deprecated
    *
@@ -259,7 +266,7 @@ interface MessageEvent<T = any> {
     type: string,
     bubbles?: boolean,
     cancelable?: boolean,
-    data?: any,
+    data?: unknown,
     origin?: string,
     lastEventId?: string,
     source?: MessageEventSource | null,
@@ -296,9 +303,9 @@ interface Navigator {
 interface NodeList {
   [Symbol.iterator](): IterableIterator<Node>;
   /** Returns an array of key, value pairs for every entry in the list. */
-  entries(): IterableIterator<[number, Node]>;
+  entries(): IterableIterator<readonly [NumberType.ArraySize, Node]>;
   /** Returns an list of keys in the list. */
-  keys(): IterableIterator<number>;
+  keys(): IterableIterator<NumberType.ArraySize>;
   /** Returns an list of values in the list. */
   values(): IterableIterator<Node>;
 }
@@ -306,9 +313,9 @@ interface NodeList {
 interface NodeListOf<TNode extends Node> {
   [Symbol.iterator](): IterableIterator<TNode>;
   /** Returns an array of key, value pairs for every entry in the list. */
-  entries(): IterableIterator<[number, TNode]>;
+  entries(): IterableIterator<readonly [NumberType.ArraySize, TNode]>;
   /** Returns an list of keys in the list. */
-  keys(): IterableIterator<number>;
+  keys(): IterableIterator<NumberType.ArraySize>;
   /** Returns an list of values in the list. */
   values(): IterableIterator<TNode>;
 }
@@ -329,7 +336,7 @@ interface RTCRtpTransceiver {
   setCodecPreferences(codecs: Iterable<RTCRtpCodecCapability>): void;
 }
 
-interface RTCStatsReport extends ReadonlyMap<string, any> {}
+interface RTCStatsReport extends ReadonlyMap<string, unknown> {}
 
 interface SVGLengthList {
   [Symbol.iterator](): IterableIterator<SVGLength>;
@@ -364,8 +371,10 @@ interface SpeechRecognitionResultList {
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
@@ -485,9 +494,9 @@ interface TouchList {
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
@@ -603,7 +612,7 @@ interface WebGL2RenderingContextBase {
     program: WebGLProgram,
     uniformIndices: Iterable<GLuint>,
     pname: GLenum,
-  ): any;
+  ): unknown;
   /**
    * [MDN
    * Reference](https://developer.mozilla.org/docs/Web/API/WebGL2RenderingContext/getUniformIndices)
```
