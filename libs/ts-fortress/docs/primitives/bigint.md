[**ts-fortress**](../README.md)

***

[ts-fortress](../README.md) / primitives/bigint

# primitives/bigint

## Functions

### bigint()

#### Call Signature

> **bigint**(`defaultValue?`): [`Type`](../type/README.md#type)\<`bigint`\>

Defined in: [src/primitives/bigint.mts:6](https://github.com/noshiro-pf/ts-fortress/blob/main/src/primitives/bigint.mts#L6)

##### Parameters

###### defaultValue?

`bigint`

##### Returns

[`Type`](../type/README.md#type)\<`bigint`\>

#### Call Signature

> **bigint**\<`B`, `C`\>(`defaultValue`, `constraints`): [`Type`](../type/README.md#type)\<`bigint`\>

Defined in: [src/primitives/bigint.mts:8](https://github.com/noshiro-pf/ts-fortress/blob/main/src/primitives/bigint.mts#L8)

##### Type Parameters

###### B

`B` *extends* `bigint`

###### C

`C` *extends* `Partial`\<`Readonly`\<\{ `gt`: `bigint`; `gte`: `bigint`; `lt`: `bigint`; `lte`: `bigint`; `max`: `bigint`; `min`: `bigint`; `multipleOf`: `bigint`; `negative`: `boolean`; `nonNegative`: `boolean`; `nonPositive`: `boolean`; `positive`: `boolean`; `step`: `bigint`; \}\>\>

##### Parameters

###### defaultValue

`B` & `DefaultValueWhenNegativeIsOn`\<`B`, `C`\> & `DefaultValueWhenNonNegativeIsOn`\<`B`, `C`\> & `DefaultValueWhenPositiveIsOn`\<`B`, `C`\> & `DefaultValueWhenNonPositiveIsOn`\<`B`, `C`\>

###### constraints

`C`

##### Returns

[`Type`](../type/README.md#type)\<`bigint`\>
