[**ts-fortress**](../README.md)

---

[ts-fortress](../README.md) / primitives/number

# primitives/number

## Functions

### number()

#### Call Signature

> **number**(`defaultValue?`): [`Type`](../type/README.md#type)\<`number`\>

Defined in: [src/primitives/number.mts:6](https://github.com/noshiro-pf/ts-fortress/blob/main/src/primitives/number.mts#L6)

##### Parameters

###### defaultValue?

`number`

##### Returns

[`Type`](../type/README.md#type)\<`number`\>

#### Call Signature

> **number**\<`N`, `C`\>(`defaultValue`, `constraints`): [`Type`](../type/README.md#type)\<`number`\>

Defined in: [src/primitives/number.mts:8](https://github.com/noshiro-pf/ts-fortress/blob/main/src/primitives/number.mts#L8)

##### Type Parameters

###### N

`N` _extends_ `number`

###### C

`C` _extends_ `Partial`\<`Readonly`\<\{ `gt`: `number`; `gte`: `number`; `lt`: `number`; `lte`: `number`; `max`: `number`; `min`: `number`; `multipleOf`: `number`; `negative`: `boolean`; `nonNegative`: `boolean`; `nonPositive`: `boolean`; `positive`: `boolean`; `step`: `number`; \}\>\>

##### Parameters

###### defaultValue

`N` & `DefaultValueWhenNegativeIsOn`\<`N`, `C`\> & `DefaultValueWhenNonNegativeIsOn`\<`N`, `C`\> & `DefaultValueWhenPositiveIsOn`\<`N`, `C`\> & `DefaultValueWhenNonPositiveIsOn`\<`N`, `C`\>

###### constraints

`C`

##### Returns

[`Type`](../type/README.md#type)\<`number`\>
