[**Documentation**](../README.md)

---

[Documentation](../README.md) / promise/promise

# promise/promise

## Functions

### createPromise()

> **createPromise**\<`S`, `E`\>(`executor`): `Promise`\<[`Result`](../functional/result/README.md#result)\<`S`, `E`\>\>

Defined in: [src/promise/promise.mts:32](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/promise/promise.mts#L32)

Creates a Promise that wraps the result in a Result type for type-safe error handling.
This function is an alternative to `new Promise(executor)` that provides enhanced type safety
by returning a Result type instead of throwing exceptions.

#### Type Parameters

##### S

`S`

The type of successful value

##### E

`E`

The type of error value

#### Parameters

##### executor

(`resolve`, `reject`) => `void`

Function that takes resolve and reject callbacks

#### Returns

`Promise`\<[`Result`](../functional/result/README.md#result)\<`S`, `E`\>\>

A Promise that resolves to a Result containing either success or error

#### Example

```typescript
const result = await createPromise<string, Error>((resolve, reject) => {
    setTimeout(() => {
        if (Math.random() > 0.5) {
            resolve('Success!');
        } else {
            reject(new Error('Failed'));
        }
    }, 1000);
});

if (result.isOk()) {
    console.log(result.value); // "Success!"
} else {
    console.log(result.error); // Error: Failed
}
```
