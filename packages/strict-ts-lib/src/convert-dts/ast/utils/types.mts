import type * as parser from '@typescript-eslint/parser';

type TSESTree = ReturnType<typeof parser.parse>;

export type ASTNode = DeepReadonly<TSESTree['body'][0]>;
