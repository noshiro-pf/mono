export const log = (
  value: ReadonlyJSONValue,
  prettyPrint: boolean = true
): void => {
  console.log(
    Result.unwrapThrow(
      Json.stringify(value, undefined, prettyPrint ? 2 : undefined)
    )
  );
};