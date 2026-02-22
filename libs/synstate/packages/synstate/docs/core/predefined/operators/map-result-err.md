[**synstate**](../../../README.md)

***

[synstate](../../../README.md) / core/predefined/operators/map-result-err

# core/predefined/operators/map-result-err

## Functions

### mapResultErr()

> **mapResultErr**\<`R`, `E2`\>(`mapFn`): [`KeepInitialValueOperator`](../../types/observable.md#keepinitialvalueoperator)\<`R`, `Result`\<`UnwrapOk`\<`R`\>, `E2`\>\>

Defined in: [core/predefined/operators/map-result-err.mts:5](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/predefined/operators/map-result-err.mts#L5)

#### Type Parameters

##### R

`R` *extends* `UnknownResult`

##### E2

`E2`

#### Parameters

##### mapFn

(`x`) => `E2`

#### Returns

[`KeepInitialValueOperator`](../../types/observable.md#keepinitialvalueoperator)\<`R`, `Result`\<`UnwrapOk`\<`R`\>, `E2`\>\>
