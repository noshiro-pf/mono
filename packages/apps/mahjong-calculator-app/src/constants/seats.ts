export const Seats = {
  Chicha: { id: 0, displayName: '自家' },
  Kamicha: { id: 1, displayName: '上家' },
  Toimen: { id: 2, displayName: '対面' },
  Shimocha: { id: 3, displayName: '下家' },
} as const satisfies Record<
  string,
  Readonly<{ id: UintRange<0, 4>; displayName: string }>
>;
