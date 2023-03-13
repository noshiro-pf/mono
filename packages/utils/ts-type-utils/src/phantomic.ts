// 幽霊型
export type Phantomic<T, U extends string> = T & { readonly [key in U]: never };
export type Brand<T, U extends string> = Phantomic<T, U>;
