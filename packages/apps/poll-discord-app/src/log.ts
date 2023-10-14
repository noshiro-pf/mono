// eslint-disable-next-line import/no-unused-modules
export const log = (value: JSONValue, prettyPrint: boolean = true): void => {
  console.log(
    Result.unwrapThrow(
      Json.stringify(value, undefined, prettyPrint ? 2 : undefined),
    ),
  );
};
