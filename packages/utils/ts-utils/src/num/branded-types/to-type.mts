export const castType =
  <BrandedType extends number>(
    is: (n: number) => n is BrandedType,
    typeNameInErrorMessage: string,
  ) =>
  <N extends number>(a: N): BrandedType & N => {
    if (!is(a)) {
      throw new TypeError(`Expected ${typeNameInErrorMessage}, got: ${a}`);
    }
    return a;
  };
