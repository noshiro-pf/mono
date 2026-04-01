import { Arr } from 'ts-data-forge';

type QueryParamSerializer<T> = Readonly<{
  key: string;
  encode: (value: T | undefined) => string | undefined;
  decode: (raw: string | null) => T | undefined;
  defaultValue?: T;
}>;

/** Serializer without a key — assigned by defineRoutes from the queryParams object key. */
type QueryParamSerializerDef<T> = Readonly<{
  encode: (value: T | undefined) => string | undefined;
  decode: (raw: string | null) => T | undefined;
  defaultValue?: T;
}>;

export type { QueryParamSerializerDef };

export type { QueryParamSerializer };

export const withKey = <T,>(
  key: string,
  def: QueryParamSerializerDef<T>,
): QueryParamSerializer<T> =>
  ({
    ...def,
    key,
  }) as const;

const stringSerializer = (): QueryParamSerializerDef<string> =>
  ({
    encode: (value) => value,
    decode: (raw) => raw ?? undefined,
  }) as const;

const numberSerializer = (
  options?: Readonly<{ default: number }>,
): QueryParamSerializerDef<number> =>
  ({
    encode: (value) => (value !== undefined ? String(value) : undefined),
    decode: (raw) => {
      if (raw === null || raw === '') {
        return options?.default;
      }

      const parsed = Number(raw);

      return Number.isNaN(parsed) ? options?.default : parsed;
    },
    defaultValue: options?.default,
  }) as const;

const booleanSerializer = (
  options?: Readonly<{ default: boolean }>,
): QueryParamSerializerDef<boolean> =>
  ({
    encode: (value) => {
      if (value === undefined) return undefined;

      return value ? '1' : '0';
    },
    decode: (raw) => {
      if (raw === null) return options?.default;

      if (raw === '1' || raw === 'true') return true;

      if (raw === '0' || raw === 'false') return false;

      return options?.default;
    },
    defaultValue: options?.default,
  }) as const;

const stringArraySerializer = (): QueryParamSerializerDef<readonly string[]> =>
  ({
    encode: (value) => {
      if (value === undefined || Arr.isArrayOfLength(value, 0))
        return undefined;

      return value.join(',');
    },
    decode: (raw) => {
      if (raw === null || raw === '') return undefined;

      return raw.split(',');
    },
  }) as const;

export const queryParamSerializers = {
  string: stringSerializer,
  number: numberSerializer,
  boolean: booleanSerializer,
  stringArray: stringArraySerializer,
} as const;
