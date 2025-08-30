[**ts-fortress**](../README.md)

---

[ts-fortress](../README.md) / branded/brand

# branded/brand

## Functions

### brand()

> **brand**\<`A`, `BrandTrueKeys`, `BrandFalseKeys`\>(`__namedParameters`): [`Type`](../type.md#type)\<`Brand`\<`A`, `ArrayToUnion`\<`BrandTrueKeys`\>, `ArrayToUnion`\<`BrandFalseKeys`\>\>\>

Defined in: [src/branded/brand.mts:9](https://github.com/noshiro-pf/ts-fortress/blob/main/src/branded/brand.mts#L9)

#### Type Parameters

##### A

`A` _extends_ `Primitive`

##### BrandTrueKeys

`BrandTrueKeys` _extends_ readonly `string`[]

##### BrandFalseKeys

`BrandFalseKeys` _extends_ readonly `string`[] = \[\]

#### Parameters

##### \_\_namedParameters

`Readonly`\<\{ `baseType`: [`Type`](../type.md#type)\<`A`\>; `brandFalseKeys?`: `BrandFalseKeys`; `brandKeys`: `BrandTrueKeys`; `defaultValue`: `Brand`\<`A`, `ArrayToUnion`\<`BrandTrueKeys`\>, `ArrayToUnion`\<`BrandFalseKeys`\>\>; `is`: (`a`) => `a is Brand<A, ArrayToUnion<BrandTrueKeys>, ArrayToUnion<BrandFalseKeys>>`; `typeName?`: `string`; \}\>

#### Returns

[`Type`](../type.md#type)\<`Brand`\<`A`, `ArrayToUnion`\<`BrandTrueKeys`\>, `ArrayToUnion`\<`BrandFalseKeys`\>\>\>
