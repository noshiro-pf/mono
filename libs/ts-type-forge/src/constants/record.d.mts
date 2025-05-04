/**
 * Represents a generic record (object) type where keys are of `RecordKeyType`
 * (`string`, `number`, or `symbol`) and values are of type `unknown`.
 * This is often a safer alternative to `Record<string, any>` or `{ [key: string]: any }`.
 */
type UnknownRecord = ReadonlyRecord<string, unknown>;
