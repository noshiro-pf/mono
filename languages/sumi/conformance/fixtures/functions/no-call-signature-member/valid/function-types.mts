// The same four types without a signature member: a function type, an
// overload set as an intersection, a callable value with properties as an
// intersection with an object type, and a constructor type.
export type Parse = (value: string) => number;

export type Show = ((value: string) => string) & ((value: number) => number);

export type Labelled = ((value: number) => string) &
  Readonly<{ label: string }>;

export type Make = new (value: string) => Date;

// An overloaded member under `method-signature-style: "property"` is an
// intersection too, so a signature member is never the only way to write one.
export type Codec = Readonly<{
  encode: ((value: string) => string) & ((value: number) => number);
}>;
