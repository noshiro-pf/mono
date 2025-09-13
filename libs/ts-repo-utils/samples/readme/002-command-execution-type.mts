type Ret = Promise<
  Result<
    Readonly<{ stdout: string | Buffer; stderr: string | Buffer }>,
    import('node:child_process').ExecException
  >
>;

// embed-sample-code-ignore
export type { Ret };
