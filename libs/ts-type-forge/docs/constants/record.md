[**Documentation**](../README.md)

---

[Documentation](../README.md) / constants/record

# constants/record

## Type Aliases

### UnknownRecord

> **UnknownRecord** = [`ReadonlyRecord`](../record/std.md#readonlyrecord)\<`string`, `unknown`\>

Defined in: [constants/record.d.mts:6](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/constants/record.d.mts#L6)

Represents a generic record (object) type where keys are of `RecordKeyType`
(`string`, `number`, or `symbol`) and values are of type `unknown`.
This is often a safer alternative to `Record<string, any>` or `{ [key: string]: any }`.
