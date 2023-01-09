export const assertIsCredentialError: (
  e: unknown
) => asserts e is { code: string; message: string } = (e) => {
  if (
    !(
      isRecord(e) &&
      Obj.hasKeyValue(e, 'code', isString) &&
      Obj.hasKeyValue(e, 'message', isString)
    )
  ) {
    throw new Error(`object is not credential error type: ${Str.from(e)}`);
  }
};
