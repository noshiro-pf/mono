```diff
@@ -14,6 +14,7 @@ and limitations under the License.
 ***************************************************************************** */
 
 /// <reference no-default-lib="true"/>
+/// <reference types="@noshiro/ts-type-utils-no-stdlib" />
 
 interface Map<K, V> {
   clear(): void;
@@ -27,8 +28,8 @@ interface Map<K, V> {
    * insertion order.
    */
   forEach(
-    callbackfn: (value: V, key: K, map: Map<K, V>) => void,
-    thisArg?: any,
+    callbackfn: (value: V, key: K, map: ReadonlyMap<K, V>) => void,
+    thisArg?: unknown,
   ): void;
   /**
    * Returns a specified element from the Map object. If the value that is
@@ -44,31 +45,31 @@ interface Map<K, V> {
    * @returns Boolean indicating whether an element with the specified key
    *   exists or not.
    */
-  has(key: K): boolean;
+  has(key: K | (WidenLiteral<K> & {})): key is K;
   /**
    * Adds a new element with a specified key and value to the Map. If an element
    * with the same key already exists, the element will be updated.
    */
   set(key: K, value: V): this;
   /** @returns The number of elements in the Map. */
-  readonly size: number;
+  readonly size: NumberType.ArraySize;
 }
 
 interface MapConstructor {
-  new (): Map<any, any>;
+  new (): Map<never, never>;
   new <K, V>(entries?: readonly (readonly [K, V])[] | null): Map<K, V>;
-  readonly prototype: Map<any, any>;
+  readonly prototype: Map<never, never>;
 }
-declare var Map: MapConstructor;
+declare const Map: MapConstructor;
 
 interface ReadonlyMap<K, V> {
   forEach(
     callbackfn: (value: V, key: K, map: ReadonlyMap<K, V>) => void,
-    thisArg?: any,
+    thisArg?: unknown,
   ): void;
   get(key: K): V | undefined;
-  has(key: K): boolean;
-  readonly size: number;
+  has(key: K | (WidenLiteral<K> & {})): key is K;
+  readonly size: NumberType.ArraySize;
 }
 
 interface WeakMap<K extends WeakKey, V> {
@@ -85,7 +86,7 @@ interface WeakMap<K extends WeakKey, V> {
    * @returns A boolean indicating whether an element with the specified key
    *   exists or not.
    */
-  has(key: K): boolean;
+  has(key: K | (WidenLiteral<K> & {})): key is K;
   /**
    * Adds a new element with a specified key and value.
    *
@@ -95,12 +96,12 @@ interface WeakMap<K extends WeakKey, V> {
 }
 
 interface WeakMapConstructor {
-  new <K extends WeakKey = WeakKey, V = any>(
+  new <K extends WeakKey = WeakKey, V = unknown>(
     entries?: readonly (readonly [K, V])[] | null,
   ): WeakMap<K, V>;
-  readonly prototype: WeakMap<WeakKey, any>;
+  readonly prototype: WeakMap<WeakKey, unknown>;
 }
-declare var WeakMap: WeakMapConstructor;
+declare const WeakMap: WeakMapConstructor;
 
 interface Set<T> {
   /** Appends a new element with a specified value to the end of the Set. */
@@ -119,31 +120,31 @@ interface Set<T> {
    * insertion order.
    */
   forEach(
-    callbackfn: (value: T, value2: T, set: Set<T>) => void,
-    thisArg?: any,
+    callbackfn: (value: T, value2: T, set: ReadonlySet<T>) => void,
+    thisArg?: unknown,
   ): void;
   /**
    * @returns A boolean indicating whether an element with the specified value
    *   exists in the Set or not.
    */
-  has(value: T): boolean;
+  has(value: T | (WidenLiteral<T> & {})): value is T;
   /** @returns The number of (unique) elements in Set. */
-  readonly size: number;
+  readonly size: NumberType.ArraySize;
 }
 
 interface SetConstructor {
-  new <T = any>(values?: readonly T[] | null): Set<T>;
-  readonly prototype: Set<any>;
+  new <T = never>(values?: readonly T[] | null): Set<T>;
+  readonly prototype: Set<never>;
 }
-declare var Set: SetConstructor;
+declare const Set: SetConstructor;
 
 interface ReadonlySet<T> {
   forEach(
     callbackfn: (value: T, value2: T, set: ReadonlySet<T>) => void,
-    thisArg?: any,
+    thisArg?: unknown,
   ): void;
-  has(value: T): boolean;
-  readonly size: number;
+  has(value: T | (WidenLiteral<T> & {})): value is T;
+  readonly size: NumberType.ArraySize;
 }
 
 interface WeakSet<T extends WeakKey> {
@@ -157,11 +158,11 @@ interface WeakSet<T extends WeakKey> {
    */
   delete(value: T): boolean;
   /** @returns A boolean indicating whether a value exists in the WeakSet or not. */
-  has(value: T): boolean;
+  has(value: T | (WidenLiteral<T> & {})): value is T;
 }
 
 interface WeakSetConstructor {
   new <T extends WeakKey = WeakKey>(values?: readonly T[] | null): WeakSet<T>;
   readonly prototype: WeakSet<WeakKey>;
 }
-declare var WeakSet: WeakSetConstructor;
+declare const WeakSet: WeakSetConstructor;
```
