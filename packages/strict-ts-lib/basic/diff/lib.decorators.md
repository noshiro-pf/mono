```diff
@@ -14,6 +14,7 @@ and limitations under the License.
 ***************************************************************************** */
 
 /// <reference no-default-lib="true"/>
+/// <reference types="@noshiro/ts-type-utils-no-stdlib" />
 
 /** The decorator context types provided to class element decorators. */
 type ClassMemberDecoratorContext =
@@ -29,7 +30,7 @@ type DecoratorContext = ClassDecoratorContext | ClassMemberDecoratorContext;
 type DecoratorMetadataObject = Record<PropertyKey, unknown> & object;
 
 type DecoratorMetadata = typeof globalThis extends {
-  Symbol: { readonly metadata: symbol };
+  readonly Symbol: { readonly metadata: symbol };
 }
   ? DecoratorMetadataObject
   : DecoratorMetadataObject | undefined;
@@ -40,9 +41,9 @@ type DecoratorMetadata = typeof globalThis extends {
  * @template Class The type of the decorated class associated with this context.
  */
 interface ClassDecoratorContext<
-  Class extends abstract new (...args: any) => any = abstract new (
-    ...args: any
-  ) => any,
+  Class extends abstract new (
+    ...args: readonly never[]
+  ) => unknown = abstract new (...args: readonly never[]) => unknown,
 > {
   /** The kind of element that was decorated. */
   readonly kind: 'class';
@@ -83,10 +84,10 @@ interface ClassDecoratorContext<
  */
 interface ClassMethodDecoratorContext<
   This = unknown,
-  Value extends (this: This, ...args: any) => any = (
+  Value extends (this: This, ...args: readonly never[]) => unknown = (
     this: This,
-    ...args: any
-  ) => any,
+    ...args: readonly never[]
+  ) => unknown,
 > {
   /** The kind of class element that was decorated. */
   readonly kind: 'method';
```
