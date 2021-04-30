// eslint-disable-next-line @typescript-eslint/ban-types
export type StrictOmit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
