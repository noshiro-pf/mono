// eslint-disable-next-line @typescript-eslint/no-namespace,@typescript-eslint/no-unused-vars,no-unused-vars
namespace Validation {
  export type StringValidator = Readonly<{
    isAcceptable(s: string): boolean;
  }>;
}
