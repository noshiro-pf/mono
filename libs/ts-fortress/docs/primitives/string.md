[**ts-fortress**](../README.md)

---

[ts-fortress](../README.md) / primitives/string

# primitives/string

## Functions

### string()

#### Call Signature

> **string**(`defaultValue?`): [`Type`](../type/README.md#type)\<`string`\>

Defined in: [src/primitives/string.mts:6](https://github.com/noshiro-pf/ts-fortress/blob/main/src/primitives/string.mts#L6)

##### Parameters

###### defaultValue?

`string`

##### Returns

[`Type`](../type/README.md#type)\<`string`\>

#### Call Signature

> **string**\<`S`, `C`\>(`defaultValue`, `constraints`): [`Type`](../type/README.md#type)\<`ConstraintsResultType`\<`C`\>\>

Defined in: [src/primitives/string.mts:8](https://github.com/noshiro-pf/ts-fortress/blob/main/src/primitives/string.mts#L8)

##### Type Parameters

###### S

`S` _extends_ `string`

###### C

`C` _extends_ `Partial`\<`Readonly`\<\{ `endsWith`: `string`; `includes`: `string`; `lowercase`: `boolean`; `maxLength`: `number`; `minLength`: `number`; `nonempty`: `boolean`; `regex`: \{ `dotAll`: `boolean`; `flags`: `string`; `global`: `boolean`; `hasIndices`: `boolean`; `ignoreCase`: `boolean`; `lastIndex`: `number`; `multiline`: `boolean`; `source`: `string`; `sticky`: `boolean`; `unicode`: `boolean`; `unicodeSets`: `boolean`; `[match]`: `null` \| `RegExpMatchArray`; `[matchAll]`: `RegExpStringIterator`\<`RegExpMatchArray`\>; `[replace]`: `string`; `[search]`: `number`; `[split]`: `string`[]; `compile`: `this`; `exec`: `null` \| `RegExpExecArray`; `test`: `boolean`; \}; `startsWith`: `string`; `uppercase`: `boolean`; \}\>\>

##### Parameters

###### defaultValue

`S` & `DefaultValueWhenStartsWithIsOn`\<`C`\> & `DefaultValueWhenEndsWithIsOn`\<`C`\> & `DefaultValueWhenIncludesIsOn`\<`C`\> & `DefaultValueWhenUppercaseIsOn`\<`S`, `C`\> & `DefaultValueWhenLowercaseIsOn`\<`S`, `C`\> & `DefaultValueWhenNonemptyIsOn`\<`S`, `C`\> & `DefaultValueWhenMinLengthIsOn`\<`S`, `C`\> & `DefaultValueWhenMaxLengthIsOn`\<`S`, `C`\>

###### constraints

`C`

##### Returns

[`Type`](../type/README.md#type)\<`ConstraintsResultType`\<`C`\>\>
