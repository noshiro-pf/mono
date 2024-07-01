```diff
@@ -14,6 +14,7 @@ and limitations under the License.
 ***************************************************************************** */
 
 /// <reference no-default-lib="true"/>
+/// <reference types="@noshiro/ts-type-utils-no-stdlib" />
 
 declare namespace Intl {
   // http://cldr.unicode.org/index/cldr-spec/plural-rules#TOC-Determining-Plural-Categories
@@ -21,24 +22,24 @@ declare namespace Intl {
   type PluralRuleType = 'cardinal' | 'ordinal';
 
   interface PluralRulesOptions {
-    localeMatcher?: 'lookup' | 'best fit' | undefined;
-    type?: PluralRuleType | undefined;
-    minimumIntegerDigits?: number | undefined;
-    minimumFractionDigits?: number | undefined;
-    maximumFractionDigits?: number | undefined;
-    minimumSignificantDigits?: number | undefined;
-    maximumSignificantDigits?: number | undefined;
+    readonly localeMatcher?: 'lookup' | 'best fit' | undefined;
+    readonly type?: PluralRuleType | undefined;
+    readonly minimumIntegerDigits?: UintRange<1, 22> | undefined;
+    readonly minimumFractionDigits?: UintRange<0, 21> | undefined;
+    readonly maximumFractionDigits?: UintRange<0, 21> | undefined;
+    readonly minimumSignificantDigits?: UintRange<1, 22> | undefined;
+    readonly maximumSignificantDigits?: UintRange<1, 22> | undefined;
   }
 
   interface ResolvedPluralRulesOptions {
-    locale: string;
-    pluralCategories: LDMLPluralRule[];
-    type: PluralRuleType;
-    minimumIntegerDigits: number;
-    minimumFractionDigits: number;
-    maximumFractionDigits: number;
-    minimumSignificantDigits?: number;
-    maximumSignificantDigits?: number;
+    readonly locale: string;
+    readonly pluralCategories: readonly LDMLPluralRule[];
+    readonly type: PluralRuleType;
+    readonly minimumIntegerDigits: UintRange<1, 22>;
+    readonly minimumFractionDigits: UintRange<0, 21>;
+    readonly maximumFractionDigits: UintRange<0, 21>;
+    readonly minimumSignificantDigits?: UintRange<1, 22>;
+    readonly maximumSignificantDigits?: UintRange<1, 22>;
   }
 
   interface PluralRules {
@@ -57,7 +58,7 @@ declare namespace Intl {
     ): PluralRules;
     supportedLocalesOf(
       locales: string | readonly string[],
-      options?: { localeMatcher?: 'lookup' | 'best fit' },
+      options?: { readonly localeMatcher?: 'lookup' | 'best fit' },
     ): string[];
   }
 
@@ -92,8 +93,8 @@ declare namespace Intl {
     | ES2020NumberFormatPartType;
 
   interface NumberFormatPart {
-    type: NumberFormatPartTypes;
-    value: string;
+    readonly type: NumberFormatPartTypes;
+    readonly value: string;
   }
 
   interface NumberFormat {
```
