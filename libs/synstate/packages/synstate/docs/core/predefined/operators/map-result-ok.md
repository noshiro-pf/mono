[**synstate**](../../../README.md)

***

[synstate](../../../README.md) / core/predefined/operators/map-result-ok

# core/predefined/operators/map-result-ok

## Functions

### mapResultOk()

> **mapResultOk**\<`R`, `S2`\>(`mapFn`): [`KeepInitialValueOperator`](../../types/observable.md#keepinitialvalueoperator)\<`R`, `Result`\<`S2`, `UnwrapErr`\<`R`\>\>\>

Defined in: [core/predefined/operators/map-result-ok.mts:5](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/predefined/operators/map-result-ok.mts#L5)

#### Type Parameters

##### R

`R` *extends* `UnknownResult`

##### S2

`S2`

#### Parameters

##### mapFn

(`x`) => `S2`

#### Returns

[`KeepInitialValueOperator`](../../types/observable.md#keepinitialvalueoperator)\<`R`, `Result`\<`S2`, `UnwrapErr`\<`R`\>\>\>
