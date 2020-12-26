// 幽霊型
export type Phantomic<T, U extends string> = T & { [key in U]: never };
