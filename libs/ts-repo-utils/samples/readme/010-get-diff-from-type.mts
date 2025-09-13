type Ret = Result<
  readonly string[],
  import('node:child_process').ExecException | Readonly<{ message: string }>
>;

// embed-sample-code-ignore
export type { Ret };
