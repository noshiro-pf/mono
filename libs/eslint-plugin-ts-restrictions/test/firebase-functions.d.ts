// A stand-in for the `firebase-functions` package, which this package does not
// depend on: `no-unreturned-promise-in-cloud-function.test.mts` references it
// to check that a function the package declares is read as a trigger registrar.
// A script, so that the module is ambient; the rule reads such a module by its
// name, as it reads the package under `node_modules`.
declare module 'firebase-functions' {
  type Handler = (data: unknown) => unknown;

  export const logger: Readonly<{
    error: (...args: readonly unknown[]) => void;
  }>;

  export const https: Readonly<{ onCall: (handler: Handler) => unknown }>;

  export const auth: Readonly<{
    user: () => Readonly<{ onDelete: (handler: Handler) => unknown }>;
  }>;

  export const pubsub: Readonly<{
    schedule: (
      cron: string,
    ) => Readonly<{ onRun: (handler: Handler) => unknown }>;
  }>;
}
