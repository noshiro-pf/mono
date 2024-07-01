```diff
@@ -14,6 +14,7 @@ and limitations under the License.
 ***************************************************************************** */
 
 /// <reference no-default-lib="true"/>
+/// <reference types="@noshiro/ts-type-utils-no-stdlib" />
 
 interface ProxyHandler<T extends object> {
   /**
@@ -21,7 +22,7 @@ interface ProxyHandler<T extends object> {
    *
    * @param target The original callable object which is being proxied.
    */
-  apply?(target: T, thisArg: any, argArray: any[]): any;
+  apply?(target: T, thisArg: unknown, argArray: readonly unknown[]): unknown;
 
   /**
    * A trap for the `new` operator.
@@ -29,7 +30,11 @@ interface ProxyHandler<T extends object> {
    * @param target The original object which is being proxied.
    * @param newTarget The constructor that was originally called.
    */
-  construct?(target: T, argArray: any[], newTarget: Function): object;
+  construct?(
+    target: T,
+    argArray: readonly unknown[],
+    newTarget: Function,
+  ): object;
 
   /**
    * A trap for `Object.defineProperty()`.
@@ -60,7 +65,7 @@ interface ProxyHandler<T extends object> {
    * @param p The name or `Symbol` of the property to get.
    * @param receiver The proxy or an object that inherits from the proxy.
    */
-  get?(target: T, p: string | symbol, receiver: any): any;
+  get?(target: T, p: string | symbol, receiver: unknown): unknown;
 
   /**
    * A trap for `Object.getOwnPropertyDescriptor()`.
@@ -117,7 +122,12 @@ interface ProxyHandler<T extends object> {
    * @param receiver The object to which the assignment was originally directed.
    * @returns A `Boolean` indicating whether or not the property was set.
    */
-  set?(target: T, p: string | symbol, newValue: any, receiver: any): boolean;
+  set?(
+    target: T,
+    p: string | symbol,
+    newValue: unknown,
+    receiver: unknown,
+  ): boolean;
 
   /**
    * A trap for `Object.setPrototypeOf()`.
@@ -139,7 +149,7 @@ interface ProxyConstructor {
   revocable<T extends object>(
     target: T,
     handler: ProxyHandler<T>,
-  ): { proxy: T; revoke: () => void };
+  ): { readonly proxy: T; readonly revoke: () => void };
 
   /**
    * Creates a Proxy object. The Proxy object allows you to create an object
@@ -154,4 +164,4 @@ interface ProxyConstructor {
    */
   new <T extends object>(target: T, handler: ProxyHandler<T>): T;
 }
-declare var Proxy: ProxyConstructor;
+declare const Proxy: ProxyConstructor;
```
