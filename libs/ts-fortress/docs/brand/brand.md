[**ts-fortress**](../README.md)

---

[ts-fortress](../README.md) / brand/brand

# brand/brand

## Functions

### brand()

> **brand**\<`A`, `BrandTrueKeys`, `BrandFalseKeys`\>(`__namedParameters`): [`Type`](../type/README.md#type)\<`Brand`\<`A`, `ArrayToUnion`\<`BrandTrueKeys`\>, `ArrayToUnion`\<`BrandFalseKeys`\>\>\>

Defined in: [src/brand/brand.mts:9](https://github.com/noshiro-pf/ts-fortress/blob/main/src/brand/brand.mts#L9)

#### Type Parameters

##### A

`A` _extends_ `string` \| `number` \| `bigint` \| `boolean`

##### BrandTrueKeys

`BrandTrueKeys` _extends_ readonly `string`[]

##### BrandFalseKeys

`BrandFalseKeys` _extends_ readonly `string`[] = \[\]

#### Parameters

##### \_\_namedParameters

`Readonly`\<\{ `baseType`: [`Type`](../type/README.md#type)\<`A`\>; `brandFalseKeys?`: `BrandFalseKeys`; `brandKeys`: `BrandTrueKeys`; `defaultValue`: `A`; `is`: (`a`) => `a is Brand<A, ArrayToUnion<BrandTrueKeys>, ArrayToUnion<BrandFalseKeys>>`; `typeName?`: `string`; \}\>

#### Returns

[`Type`](../type/README.md#type)\<`Brand`\<`A`, `ArrayToUnion`\<`BrandTrueKeys`\>, `ArrayToUnion`\<`BrandFalseKeys`\>\>\>
