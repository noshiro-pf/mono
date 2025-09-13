type Ret = Promise<
  Result<
    undefined,
    | import('node:child_process').ExecException
    | Readonly<{ message: string }>
    | readonly unknown[]
  >
>;

// embed-sample-code-ignore
export type { Ret };
