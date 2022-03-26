export type Options =
  | {
      readonly paths: readonly {
        readonly name: string;
        readonly message: string;
        readonly allowTypeImports?: boolean;
      }[];
    }
  | {
      readonly paths: readonly {
        readonly name: string;
        readonly message: string;
        readonly importNames: readonly string[];
        readonly allowTypeImports?: boolean;
      }[];
    }
  | {
      readonly paths: readonly string[];
      readonly patterns: readonly string[];
      readonly allowTypeImports?: boolean;
    }
  | {
      readonly patterns: readonly {
        readonly group: readonly string[];
        readonly message: string;
        readonly allowTypeImports?: boolean;
      }[];
    }
  | { readonly paths: readonly string[] };
