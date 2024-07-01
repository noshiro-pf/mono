```diff
@@ -14,8 +14,9 @@ and limitations under the License.
 ***************************************************************************** */
 
 /// <reference no-default-lib="true"/>
+/// <reference types="@noshiro/ts-type-utils-no-stdlib" />
 
-/// <reference lib="es2018.intl" />
+/// <reference path="./lib.es2018.intl.d.ts" />
 declare namespace Intl {
   /**
    * A string that is a valid [Unicode BCP 47 Locale
@@ -115,11 +116,11 @@ declare namespace Intl {
      * see [Intl
      * page](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Intl#Locale_negotiation).
      */
-    localeMatcher?: RelativeTimeFormatLocaleMatcher;
+    readonly localeMatcher?: RelativeTimeFormatLocaleMatcher;
     /** The format of output message. */
-    numeric?: RelativeTimeFormatNumeric;
+    readonly numeric?: RelativeTimeFormatNumeric;
     /** The length of the internationalized message. */
-    style?: RelativeTimeFormatStyle;
+    readonly style?: RelativeTimeFormatStyle;
   }
 
   /**
@@ -129,10 +130,10 @@ declare namespace Intl {
    * [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/RelativeTimeFormat/resolvedOptions#Description).
    */
   interface ResolvedRelativeTimeFormatOptions {
-    locale: UnicodeBCP47LocaleIdentifier;
-    style: RelativeTimeFormatStyle;
-    numeric: RelativeTimeFormatNumeric;
-    numberingSystem: string;
+    readonly locale: UnicodeBCP47LocaleIdentifier;
+    readonly style: RelativeTimeFormatStyle;
+    readonly numeric: RelativeTimeFormatNumeric;
+    readonly numberingSystem: string;
   }
 
   /**
@@ -143,13 +144,13 @@ declare namespace Intl {
    */
   type RelativeTimeFormatPart =
     | {
-        type: 'literal';
-        value: string;
+        readonly type: 'literal';
+        readonly value: string;
       }
     | {
-        type: Exclude<NumberFormatPartTypes, 'literal'>;
-        value: string;
-        unit: RelativeTimeFormatUnitSingular;
+        readonly type: Exclude<NumberFormatPartTypes, 'literal'>;
+        readonly value: string;
+        readonly unit: RelativeTimeFormatUnitSingular;
       };
 
   interface RelativeTimeFormat {
@@ -267,38 +268,43 @@ declare namespace Intl {
   };
 
   interface NumberFormatOptions {
-    compactDisplay?: 'short' | 'long' | undefined;
-    notation?:
+    readonly compactDisplay?: 'short' | 'long' | undefined;
+    readonly notation?:
       | 'standard'
       | 'scientific'
       | 'engineering'
       | 'compact'
       | undefined;
-    signDisplay?: 'auto' | 'never' | 'always' | 'exceptZero' | undefined;
-    unit?: string | undefined;
-    unitDisplay?: 'short' | 'long' | 'narrow' | undefined;
-    currencyDisplay?: string | undefined;
-    currencySign?: string | undefined;
+    readonly signDisplay?:
+      | 'auto'
+      | 'never'
+      | 'always'
+      | 'exceptZero'
+      | undefined;
+    readonly unit?: string | undefined;
+    readonly unitDisplay?: 'short' | 'long' | 'narrow' | undefined;
+    readonly currencyDisplay?: string | undefined;
+    readonly currencySign?: string | undefined;
   }
 
   interface ResolvedNumberFormatOptions {
-    compactDisplay?: 'short' | 'long';
-    notation?: 'standard' | 'scientific' | 'engineering' | 'compact';
-    signDisplay?: 'auto' | 'never' | 'always' | 'exceptZero';
-    unit?: string;
-    unitDisplay?: 'short' | 'long' | 'narrow';
-    currencyDisplay?: string;
-    currencySign?: string;
+    readonly compactDisplay?: 'short' | 'long';
+    readonly notation?: 'standard' | 'scientific' | 'engineering' | 'compact';
+    readonly signDisplay?: 'auto' | 'never' | 'always' | 'exceptZero';
+    readonly unit?: string;
+    readonly unitDisplay?: 'short' | 'long' | 'narrow';
+    readonly currencyDisplay?: string;
+    readonly currencySign?: string;
   }
 
   interface DateTimeFormatOptions {
-    calendar?: string | undefined;
-    dayPeriod?: 'narrow' | 'short' | 'long' | undefined;
-    numberingSystem?: string | undefined;
+    readonly calendar?: string | undefined;
+    readonly dayPeriod?: 'narrow' | 'short' | 'long' | undefined;
+    readonly numberingSystem?: string | undefined;
 
-    dateStyle?: 'full' | 'long' | 'medium' | 'short' | undefined;
-    timeStyle?: 'full' | 'long' | 'medium' | 'short' | undefined;
-    hourCycle?: 'h11' | 'h12' | 'h23' | 'h24' | undefined;
+    readonly dateStyle?: 'full' | 'long' | 'medium' | 'short' | undefined;
+    readonly timeStyle?: 'full' | 'long' | 'medium' | 'short' | undefined;
+    readonly hourCycle?: 'h11' | 'h12' | 'h23' | 'h24' | undefined;
   }
 
   type LocaleHourCycleKey = 'h12' | 'h23' | 'h11' | 'h24';
@@ -306,44 +312,44 @@ declare namespace Intl {
 
   interface LocaleOptions {
     /** A string containing the language, and the script and region if available. */
-    baseName?: string;
+    readonly baseName?: string;
     /** The part of the Locale that indicates the locale's calendar era. */
-    calendar?: string;
+    readonly calendar?: string;
     /**
      * Flag that defines whether case is taken into account for the locale's
      * collation rules.
      */
-    caseFirst?: LocaleCollationCaseFirst;
+    readonly caseFirst?: LocaleCollationCaseFirst;
     /** The collation type used for sorting */
-    collation?: string;
+    readonly collation?: string;
     /** The time keeping format convention used by the locale. */
-    hourCycle?: LocaleHourCycleKey;
+    readonly hourCycle?: LocaleHourCycleKey;
     /** The primary language subtag associated with the locale. */
-    language?: string;
+    readonly language?: string;
     /** The numeral system used by the locale. */
-    numberingSystem?: string;
+    readonly numberingSystem?: string;
     /**
      * Flag that defines whether the locale has special collation handling for
      * numeric characters.
      */
-    numeric?: boolean;
+    readonly numeric?: boolean;
     /**
      * The region of the world (usually a country) associated with the locale.
      * Possible values are region codes as defined by ISO 3166-1.
      */
-    region?: string;
+    readonly region?: string;
     /**
      * The script used for writing the particular language used in the locale.
      * Possible values are script codes as defined by ISO 15924.
      */
-    script?: string;
+    readonly script?: string;
   }
 
   interface Locale extends LocaleOptions {
     /** A string containing the language, and the script and region if available. */
-    baseName: string;
+    readonly baseName: string;
     /** The primary language subtag associated with the locale. */
-    language: string;
+    readonly language: string;
     /**
      * Gets the most likely values for the language, script, and region of the
      * locale based on existing values.
@@ -396,19 +402,19 @@ declare namespace Intl {
   type DisplayNamesLanguageDisplay = 'dialect' | 'standard';
 
   interface DisplayNamesOptions {
-    localeMatcher?: RelativeTimeFormatLocaleMatcher;
-    style?: RelativeTimeFormatStyle;
-    type: DisplayNamesType;
-    languageDisplay?: DisplayNamesLanguageDisplay;
-    fallback?: DisplayNamesFallback;
+    readonly localeMatcher?: RelativeTimeFormatLocaleMatcher;
+    readonly style?: RelativeTimeFormatStyle;
+    readonly type: DisplayNamesType;
+    readonly languageDisplay?: DisplayNamesLanguageDisplay;
+    readonly fallback?: DisplayNamesFallback;
   }
 
   interface ResolvedDisplayNamesOptions {
-    locale: UnicodeBCP47LocaleIdentifier;
-    style: RelativeTimeFormatStyle;
-    type: DisplayNamesType;
-    fallback: DisplayNamesFallback;
-    languageDisplay?: DisplayNamesLanguageDisplay;
+    readonly locale: UnicodeBCP47LocaleIdentifier;
+    readonly style: RelativeTimeFormatStyle;
+    readonly type: DisplayNamesType;
+    readonly fallback: DisplayNamesFallback;
+    readonly languageDisplay?: DisplayNamesLanguageDisplay;
   }
 
   interface DisplayNames {
@@ -459,7 +465,7 @@ declare namespace Intl {
    * [Compatibility](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DisplayNames#browser_compatibility).
    */
   const DisplayNames: {
-    prototype: DisplayNames;
+    readonly prototype: DisplayNames;
 
     /**
      * @param locales A string with a BCP 47 language tag, or an array of such
@@ -492,7 +498,7 @@ declare namespace Intl {
      */
     supportedLocalesOf(
       locales?: LocalesArgument,
-      options?: { localeMatcher?: RelativeTimeFormatLocaleMatcher },
+      options?: { readonly localeMatcher?: RelativeTimeFormatLocaleMatcher },
     ): UnicodeBCP47LocaleIdentifier[];
   };
 
@@ -538,7 +544,7 @@ declare namespace Intl {
 
     supportedLocalesOf(
       locales: LocalesArgument,
-      options?: { localeMatcher?: 'lookup' | 'best fit' },
+      options?: { readonly localeMatcher?: 'lookup' | 'best fit' },
     ): string[];
   }
 }
```
