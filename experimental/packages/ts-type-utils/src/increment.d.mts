type Increment<N extends number> = (readonly [0, ...MakeTuple<0, N>])['length'];

type Decrement<N extends number> = ListType.Tail<MakeTuple<0, N>>['length'];
