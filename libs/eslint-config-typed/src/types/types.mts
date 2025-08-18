export type RestrictedImportsOption = DeepReadonly<{
  paths: {
    name: string;
    message: string;
    importNames: string[];
  }[];
}>;
