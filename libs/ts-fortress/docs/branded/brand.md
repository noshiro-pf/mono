[**ts-fortress**](../README.md)

---

[ts-fortress](../README.md) / branded/brand

# branded/brand

## Functions

### brand()

> **brand**\<`A`, `BrandTrueKeys`, `BrandFalseKeys`\>(`__namedParameters`): [`Type`](../type.md#type)\<`Brand`\<`A`, `ArrayToUnion`\<`BrandTrueKeys`\>, `ArrayToUnion`\<`BrandFalseKeys`\>\>\>

Defined in: [branded/brand.mts:9](https://github.com/noshiro-pf/ts-fortress/blob/main/src/branded/brand.mts#L9)

#### Type Parameters

##### A

`A` _extends_ `Primitive`

##### BrandTrueKeys

`BrandTrueKeys` _extends_ readonly `string`[]

##### BrandFalseKeys

`BrandFalseKeys` _extends_ readonly `string`[] = \[\]

#### Parameters

##### \_\_namedParameters

`Readonly`\<\{ `brandFalseKeys?`: `BrandFalseKeys`; `brandKeys`: `BrandTrueKeys`; `codec`: [`Type`](../type.md#type)\<`A`\>; `defaultValue`: `Brand`\<`A`, `ArrayToUnion`\<`BrandTrueKeys`\>, `ArrayToUnion`\<`BrandFalseKeys`\>\>; `is`: (`a`) => `a is Brand<A, ArrayToUnion<BrandTrueKeys>, ArrayToUnion<BrandFalseKeys>>`; \}\>

#### Returns

[`Type`](../type.md#type)\<`Brand`\<`A`, `ArrayToUnion`\<`BrandTrueKeys`\>, `ArrayToUnion`\<`BrandFalseKeys`\>\>\>
