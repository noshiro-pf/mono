export const calcELODiff = (
  self_elo: number,
  other_elo: number,
  win: number,
  k: number,
): number =>
  // eslint-disable-next-line total-functions/no-partial-division
  k * (win - 1 / (10 ** ((other_elo - self_elo) / 400) + 1));

export const updateELO = (
  self_elo: number,
  self_score: number,
  other_elos: readonly [readonly number[]],
  other_scores: readonly [readonly (number | '')[]],
  k: number,
): number => {
  let mut_diff = 0;
  for (const [i, other_elo] of other_elos[0].entries()) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const other_score = other_scores[0][i]!;

    if (other_score === '') continue;

    const win =
      self_score > other_score ? 1 : self_score === other_score ? 0.5 : 0;

    mut_diff += calcELODiff(self_elo, other_elo, win, k);
  }
  return self_elo + mut_diff;
};
