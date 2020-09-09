export type SortColumnType =
  | false
  | 'string'
  | 'string-reverse'
  | 'string-lex'
  | 'string-lex-reverse'
  | 'number'
  | 'number-reverse'
  | 'number-lex'
  | 'number-lex-reverse'
  | ((x: any, y: any) => number)
