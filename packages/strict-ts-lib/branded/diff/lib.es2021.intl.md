```diff
@@ -14,22 +14,23 @@ and limitations under the License.
 ***************************************************************************** */
 
 /// <reference no-default-lib="true"/>
+/// <reference types="@noshiro/ts-type-utils-no-stdlib" />
 
 declare namespace Intl {
   interface DateTimeFormatPartTypesRegistry {
-    fractionalSecond: any;
+    readonly fractionalSecond: unknown;
   }
 
   interface DateTimeFormatOptions {
-    formatMatcher?: 'basic' | 'best fit' | 'best fit' | undefined;
-    dateStyle?: 'full' | 'long' | 'medium' | 'short' | undefined;
-    timeStyle?: 'full' | 'long' | 'medium' | 'short' | undefined;
-    dayPeriod?: 'narrow' | 'short' | 'long' | undefined;
-    fractionalSecondDigits?: 1 | 2 | 3 | undefined;
+    readonly formatMatcher?: 'basic' | 'best fit' | 'best fit' | undefined;
+    readonly dateStyle?: 'full' | 'long' | 'medium' | 'short' | undefined;
+    readonly timeStyle?: 'full' | 'long' | 'medium' | 'short' | undefined;
+    readonly dayPeriod?: 'narrow' | 'short' | 'long' | undefined;
+    readonly fractionalSecondDigits?: 1 | 2 | 3 | undefined;
   }
 
   interface DateTimeRangeFormatPart extends DateTimeFormatPart {
-    source: 'startRange' | 'endRange' | 'shared';
+    readonly source: 'startRange' | 'endRange' | 'shared';
   }
 
   interface DateTimeFormat {
@@ -40,16 +41,16 @@ declare namespace Intl {
     formatRangeToParts(
       startDate: Date | number | bigint,
       endDate: Date | number | bigint,
-    ): DateTimeRangeFormatPart[];
+    ): readonly DateTimeRangeFormatPart[];
   }
 
   interface ResolvedDateTimeFormatOptions {
-    formatMatcher?: 'basic' | 'best fit' | 'best fit';
-    dateStyle?: 'full' | 'long' | 'medium' | 'short';
-    timeStyle?: 'full' | 'long' | 'medium' | 'short';
-    hourCycle?: 'h11' | 'h12' | 'h23' | 'h24';
-    dayPeriod?: 'narrow' | 'short' | 'long';
-    fractionalSecondDigits?: 1 | 2 | 3;
+    readonly formatMatcher?: 'basic' | 'best fit' | 'best fit';
+    readonly dateStyle?: 'full' | 'long' | 'medium' | 'short';
+    readonly timeStyle?: 'full' | 'long' | 'medium' | 'short';
+    readonly hourCycle?: 'h11' | 'h12' | 'h23' | 'h24';
+    readonly dayPeriod?: 'narrow' | 'short' | 'long';
+    readonly fractionalSecondDigits?: 1 | 2 | 3;
   }
 
   /**
@@ -85,17 +86,17 @@ declare namespace Intl {
      * see [Intl
      * page](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Intl#Locale_negotiation).
      */
-    localeMatcher?: ListFormatLocaleMatcher | undefined;
+    readonly localeMatcher?: ListFormatLocaleMatcher | undefined;
     /** The format of output message. */
-    type?: ListFormatType | undefined;
+    readonly type?: ListFormatType | undefined;
     /** The length of the internationalized message. */
-    style?: ListFormatStyle | undefined;
+    readonly style?: ListFormatStyle | undefined;
   }
 
   interface ResolvedListFormatOptions {
-    locale: string;
-    style: ListFormatStyle;
-    type: ListFormatType;
+    readonly locale: string;
+    readonly style: ListFormatStyle;
+    readonly type: ListFormatType;
   }
 
   interface ListFormat {
@@ -127,9 +128,10 @@ declare namespace Intl {
      * @throws `TypeError` if `list` includes something other than the possible
      *   values.
      */
-    formatToParts(
-      list: Iterable<string>,
-    ): { type: 'element' | 'literal'; value: string }[];
+    formatToParts(list: Iterable<string>): readonly {
+      readonly type: 'element' | 'literal';
+      readonly value: string;
+    }[];
 
     /**
      * Returns a new object with properties reflecting the locale and style
@@ -142,7 +144,7 @@ declare namespace Intl {
   }
 
   const ListFormat: {
-    prototype: ListFormat;
+    readonly prototype: ListFormat;
 
     /**
      * Creates
@@ -187,6 +189,6 @@ declare namespace Intl {
     supportedLocalesOf(
       locales: LocalesArgument,
       options?: Pick<ListFormatOptions, 'localeMatcher'>,
-    ): UnicodeBCP47LocaleIdentifier[];
+    ): readonly UnicodeBCP47LocaleIdentifier[];
   };
 }
```
