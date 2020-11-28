# [Namespaces](https://www.typescriptlang.org/docs/handbook/namespaces.html)

> A note about terminology: It's important to note that in TypeScript 1.5, the nomenclature has changed. "Internal modules" are now "namespaces". "External modules" are now simply "modules", as to align with [ECMAScript 2015](http://www.ecma-international.org/ecma-262/6.0/)'s terminology, (namely that `module X {` is equivalent to the now-preferred `namespace X {`).

用語に関する注意：

-   TypeScript 1.5 では、命名法が変更されている
-   「内部モジュール」は「名前空間」になった
-   「外部モジュール」は、ECMAScript 2015 の用語に合わせて、単に「モジュール」になった（つまり、`module X {`は、現在推奨されている`namespace X {`と同等）。

> This post outlines the various ways to organize your code using namespaces (previously "internal modules”) in TypeScript. As we alluded in our note about terminology, "internal modules” are now referred to as "namespaces”. Additionally, anywhere the `module` keyword was used when declaring an internal module, the `namespace` keyword can and should be used instead. This avoids confusing new users by overloading them with similarly named terms.

-   この投稿では、TypeScript で名前空間（以前の「内部モジュール」）を使用してコードを整理するさまざまな方法の概要を説明する。
-   内部モジュールを宣言するときに`module`キーワードが使用された場合は常に、`namespace`キーワードを代わりに使用できる。これにより、同じ名前の用語で新しいユーザーをオーバーロードすることで、新しいユーザーを混乱させることを回避できます。

## [First steps](https://www.typescriptlang.org/docs/handbook/namespaces.html#first-steps)

> Let's start with the program we'll be using as our example throughout this page. We've written a small set of simplistic string validators, as you might write to check a user's input on a form in a webpage or check the format of an externally-provided data file.

文字列バリデーターを例として用いる．

## [Validators in a single file](https://www.typescriptlang.org/docs/handbook/namespaces.html#validators-in-a-single-file)

```ts
interface StringValidator {
    isAcceptable(s: string): boolean;
}

let lettersRegexp = /^[A-Za-z]+$/;
let numberRegexp = /^[0-9]+$/;

class LettersOnlyValidator implements StringValidator {
    isAcceptable(s: string) {
        return lettersRegexp.test(s);
    }
}

class ZipCodeValidator implements StringValidator {
    isAcceptable(s: string) {
        return s.length === 5 && numberRegexp.test(s);
    }
}

// Some samples to try
let strings = ['Hello', '98052', '101'];

// Validators to use
let validators: { [s: string]: StringValidator } = {};
validators['ZIP code'] = new ZipCodeValidator();
validators['Letters only'] = new LettersOnlyValidator();

// Show whether each string passed each validator
for (let s of strings) {
    for (let name in validators) {
        let isMatch = validators[name].isAcceptable(s);
        console.log(
            `'${s}' ${isMatch ? 'matches' : 'does not match'} '${name}'.`
        );
    }
}
```

## [Namespacing](https://www.typescriptlang.org/docs/handbook/namespaces.html#namespacing)

> As we add more validators, we're going to want to have some kind of organization scheme so that we can keep track of our types and not worry about name collisions with other objects. Instead of putting lots of different names into the global namespace, let's wrap up our objects into a namespace.

-   バリデーターをさらに追加していく際、型を管理し名前の衝突を避けるための仕組みが必要
-   グローバル名前空間にたくさんの互いに異なる名前を定義する代わりに、これらのオブジェクトを名前空間に包むことを考える。

> In this example, we'll move all validator-related entities into a namespace called `Validation`. Because we want the interfaces and classes here to be visible outside the namespace, we preface them with `export`. Conversely, the variables `lettersRegexp` and `numberRegexp` are implementation details, so they are left unexported and will not be visible to code outside the namespace. In the test code at the bottom of the file, we now need to qualify the names of the types when used outside the namespace, e.g. `Validation.LettersOnlyValidator`.

-   この例では、`Validation`という名前空間にバリデーター関連のものをすべて移動する。
-   外から使える必要があるものは `export` する

```ts
namespace Validation {
    export interface StringValidator {
        isAcceptable(s: string): boolean;
    }

    const lettersRegexp = /^[A-Za-z]+$/;
    const numberRegexp = /^[0-9]+$/;

    export class LettersOnlyValidator implements StringValidator {
        isAcceptable(s: string) {
            return lettersRegexp.test(s);
        }
    }

    export class ZipCodeValidator implements StringValidator {
        isAcceptable(s: string) {
            return s.length === 5 && numberRegexp.test(s);
        }
    }
}

// Some samples to try
let strings = ['Hello', '98052', '101'];

// Validators to use
let validators: { [s: string]: Validation.StringValidator } = {};
validators['ZIP code'] = new Validation.ZipCodeValidator();
validators['Letters only'] = new Validation.LettersOnlyValidator();

// Show whether each string passed each validator
for (let s of strings) {
    for (let name in validators) {
        console.log(
            `"${s}" - ${
                validators[name].isAcceptable(s) ? 'matches' : 'does not match'
            } ${name}`
        );
    }
}
```

## [Splitting Across Files](https://www.typescriptlang.org/docs/handbook/namespaces.html#splitting-across-files)

> As our application grows, we'll want to split the code across multiple files to make it easier to maintain.

ファイルを分けたくなるよね

## [Multi-file namespaces](https://www.typescriptlang.org/docs/handbook/namespaces.html#multi-file-namespaces)

> Here, we'll split our `Validation` namespace across many files. Even though the files are separate, they can each contribute to the same namespace and can be consumed as if they were all defined in one place. Because there are dependencies between files, we'll add reference tags to tell the compiler about the relationships between the files. Our test code is otherwise unchanged.

-   `Validation`名前空間をいくつかのファイルに分割する
-   分割しても同じ名前空間にあるかのように使用できる
-   依存関係があるので reference tag を追加しコンパイラにファイル間の関係を教える必要がある

[Validation.ts](https://www.typescriptlang.org/docs/handbook/namespaces.html#validationts)

```ts
namespace Validation {
    export interface StringValidator {
        isAcceptable(s: string): boolean;
    }
}
```

[LettersOnlyValidator.ts](https://www.typescriptlang.org/docs/handbook/namespaces.html#lettersonlyvalidatorts)

```ts
/// <reference path="Validation.ts" />
namespace Validation {
    const lettersRegexp = /^[A-Za-z]+$/;
    export class LettersOnlyValidator implements StringValidator {
        isAcceptable(s: string) {
            return lettersRegexp.test(s);
        }
    }
}
```

[ZipCodeValidator.ts](https://www.typescriptlang.org/docs/handbook/namespaces.html#zipcodevalidatorts)

```ts
/// <reference path="Validation.ts" />
namespace Validation {
    const numberRegexp = /^[0-9]+$/;
    export class ZipCodeValidator implements StringValidator {
        isAcceptable(s: string) {
            return s.length === 5 && numberRegexp.test(s);
        }
    }
}
```

[Test.ts](https://www.typescriptlang.org/docs/handbook/namespaces.html#testts)

```ts
/// <reference path="Validation.ts" />
/// <reference path="LettersOnlyValidator.ts" />
/// <reference path="ZipCodeValidator.ts" />

// Some samples to try
let strings = ['Hello', '98052', '101'];

// Validators to use
let validators: { [s: string]: Validation.StringValidator } = {};
validators['ZIP code'] = new Validation.ZipCodeValidator();
validators['Letters only'] = new Validation.LettersOnlyValidator();

// Show whether each string passed each validator
for (let s of strings) {
    for (let name in validators) {
        console.log(
            `"${s}" - ${
                validators[name].isAcceptable(s) ? 'matches' : 'does not match'
            } ${name}`
        );
    }
}
```

> Once there are multiple files involved, we'll need to make sure all of the compiled code gets loaded. There are two ways of doing this.

> First, we can use concatenated output using the --outFile flag to compile all of the input files into a single JavaScript output file:

```sh
$  tsc --outFile sample.js Test.ts
```

> The compiler will automatically order the output file based on the reference tags present in the files. You can also specify each file individually:

```sh
$  tsc --outFile sample.js Validation.ts LettersOnlyValidator.ts ZipCodeValidator.ts Test.ts
```

> Alternatively, we can use per-file compilation (the default) to emit one JavaScript file for each input file. If multiple JS files get produced, we'll need to use &lt;script&gt; tags on our webpage to load each emitted file in the appropriate order, for example:

ファイル毎にコンパイルすることもできる。その場合は以下のように`script`タグで正しい順番でロードする

[MyTestPage.html (excerpt)](https://www.typescriptlang.org/docs/handbook/namespaces.html#mytestpagehtml-excerpt)

```html
<script src="Validation.js" type="text/javascript" />
<script src="LettersOnlyValidator.js" type="text/javascript" />
<script src="ZipCodeValidator.js" type="text/javascript" />
<script src="Test.js" type="text/javascript" />
```

## [Aliases](https://www.typescriptlang.org/docs/handbook/namespaces.html#aliases)

> Another way that you can simplify working with namespaces is to use `import q = x.y.z` to create shorter names for commonly-used objects. Not to be confused with the `import x = require("name")` syntax used to load modules, this syntax simply creates an alias for the specified symbol. You can use these sorts of imports (commonly referred to as aliases) for any kind of identifier, including objects created from module imports.

```ts
namespace Shapes {
    export namespace Polygons {
        export class Triangle {}
        export class Square {}
    }
}

import polygons = Shapes.Polygons;
let sq = new polygons.Square(); // Same as 'new Shapes.Polygons.Square()'
```

> Notice that we don't use the `require` keyword; instead we assign directly from the qualified name of the symbol we're importing. This is similar to using `var`, but also works on the type and namespace meanings of the imported symbol. Importantly, for values, `import` is a distinct reference from the original symbol, so changes to an aliased `var` will not be reflected in the original variable.

-   require キーワードを使用しない
-   `var` と似ているが、`import`は元のシンボルとは異なる参照であるためエイリアス変数への変更は元の変数に反映されないという点で異なる。

## [Working with Other JavaScript Libraries](https://www.typescriptlang.org/docs/handbook/namespaces.html#working-with-other-javascript-libraries)

> To describe the shape of libraries not written in TypeScript, we need to declare the API that the library exposes. Because most JavaScript libraries expose only a few top-level objects, namespaces are a good way to represent them.

> We call declarations that don't define an implementation "ambient”. Typically these are defined in `.d.ts` files. If you're familiar with C/C++, you can think of these as `.h` files. Let's look at a few examples.

## [Ambient Namespaces](https://www.typescriptlang.org/docs/handbook/namespaces.html#ambient-namespaces)

> The popular library D3 defines its functionality in a global object called `d3`. Because this library is loaded through a &lt;script&gt; tag (instead of a module loader), its declaration uses namespaces to define its shape. For the TypeScript compiler to see this shape, we use an ambient namespace declaration. For example, we could begin writing it as follows:

[D3.d.ts (simplified excerpt)](https://www.typescriptlang.org/docs/handbook/namespaces.html#d3dts-simplified-excerpt)

```ts
declare namespace D3 {
    export interface Selectors {
        select: {
            (selector: string): Selection;
            (element: EventTarget): Selection;
        };
    }

    export interface Event {
        x: number;
        y: number;
    }

    export interface Base extends Selectors {
        event: Event;
    }
}

declare var d3: D3.Base;
```
