[**ts-fortress**](../../README.md)

---

[ts-fortress](../../README.md) / [type](../README.md) / TsFortressInternal

# TsFortressInternal

## Type Aliases

### RecordTypeValue\<R\>

> **RecordTypeValue**\<`R`\> = [`RecordTypeValueImpl`](#recordtypevalueimpl)\<`R`\>

Defined in: [src/type.mts:49](https://github.com/noshiro-pf/ts-fortress/blob/main/src/type.mts#L49)

#### Type Parameters

##### R

`R` _extends_ `ReadonlyRecord`\<`string`, [`Type`](../README.md#type)\<`unknown`\>\>

---

### RecordTypeValueImpl\<R\>

> **RecordTypeValueImpl**\<`R`\> = `RecordTypeValueImplSub`\<`R`, `OptionalTypeKeys`\<`R`\>\>

Defined in: [src/type.mts:52](https://github.com/noshiro-pf/ts-fortress/blob/main/src/type.mts#L52)

#### Type Parameters

##### R

`R` _extends_ `ReadonlyRecord`\<`string`, [`Type`](../README.md#type)\<`unknown`\>\>
