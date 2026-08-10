export type Options =
  | {
      paths: {
        name: string;
        message: string;
        allowTypeImports?: boolean;
      }[];
    }
  | {
      paths: {
        name: string;
        message: string;
        importNames: string[];
        allowTypeImports?: boolean;
      }[];
    }
  | {
      paths: string[];
      patterns: string[];
      allowTypeImports?: boolean;
    }
  | {
      paths: string[];
    }
  | {
      patterns: {
        group: string[];
        message: string;
        allowTypeImports?: boolean;
      }[];
    };
