```diff
@@ -14,6 +14,7 @@ and limitations under the License.
 ***************************************************************************** */
 
 /// <reference no-default-lib="true"/>
+/// <reference types="@noshiro/ts-type-utils-no-stdlib" />
 
 declare namespace Intl {
   /**
@@ -28,9 +29,9 @@ declare namespace Intl {
      * see [Intl
      * page](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Intl#Locale_negotiation).
      */
-    localeMatcher?: 'best fit' | 'lookup' | undefined;
+    readonly localeMatcher?: 'best fit' | 'lookup' | undefined;
     /** The type of input to be split */
-    granularity?: 'grapheme' | 'word' | 'sentence' | undefined;
+    readonly granularity?: 'grapheme' | 'word' | 'sentence' | undefined;
   }
 
   interface Segmenter {
@@ -47,8 +48,8 @@ declare namespace Intl {
   }
 
   interface ResolvedSegmenterOptions {
-    locale: string;
-    granularity: 'grapheme' | 'word' | 'sentence';
+    readonly locale: string;
+    readonly granularity: 'grapheme' | 'word' | 'sentence';
   }
 
   interface Segments {
@@ -68,25 +69,25 @@ declare namespace Intl {
 
   interface SegmentData {
     /** A string containing the segment extracted from the original input string. */
-    segment: string;
+    readonly segment: string;
     /**
      * The code unit index in the original input string at which the segment
      * begins.
      */
-    index: number;
+    readonly index: number;
     /** The complete input string that was segmented. */
-    input: string;
+    readonly input: string;
     /**
      * A boolean value only if granularity is "word"; otherwise, undefined. If
      * granularity is "word", then isWordLike is true when the segment is
      * word-like (i.e., consists of letters/numbers/ideographs/etc.); otherwise,
      * false.
      */
-    isWordLike?: boolean;
+    readonly isWordLike?: boolean;
   }
 
   const Segmenter: {
-    prototype: Segmenter;
+    readonly prototype: Segmenter;
 
     /**
      * Creates a new `Intl.Segmenter` object.
```
