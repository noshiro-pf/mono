/**
 * The Standard Schema interface (https://standardschema.dev), version 1,
 * written out here rather than imported: the specification asks libraries that
 * accept schemas to copy it, so that accepting Zod, Valibot or ArkType adds no
 * dependency.
 */
export type StandardSchemaV1<Input = unknown, Output = Input> = Readonly<{
  '~standard': StandardSchemaV1Props<Input, Output>;
}>;

export type StandardSchemaV1Props<Input = unknown, Output = Input> = Readonly<{
  version: 1;
  vendor: string;
  validate: (
    value: unknown,
  ) => StandardSchemaV1Result<Output> | Promise<StandardSchemaV1Result<Output>>;
  types?: StandardSchemaV1Types<Input, Output> | undefined;
}>;

export type StandardSchemaV1Types<Input = unknown, Output = Input> = Readonly<{
  input: Input;
  output: Output;
}>;

export type StandardSchemaV1Result<Output> = Readonly<
  | { value: Output; issues?: undefined }
  | { issues: readonly StandardSchemaV1Issue[] }
>;

export type StandardSchemaV1Issue = Readonly<{
  message: string;
  path?: readonly (PropertyKey | Readonly<{ key: PropertyKey }>)[] | undefined;
}>;

/** The output type of a Standard Schema. */
export type StandardSchemaV1Output<S extends StandardSchemaV1> = NonNullable<
  S['~standard']['types']
>['output'];
