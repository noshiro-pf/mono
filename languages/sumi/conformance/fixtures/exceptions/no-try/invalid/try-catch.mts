export const parse = (text: string): unknown => {
  // @sumi-expect-error exceptions/no-try
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
};
