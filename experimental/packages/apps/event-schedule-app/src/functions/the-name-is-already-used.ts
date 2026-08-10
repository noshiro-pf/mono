export const theNameIsAlreadyUsedFn = (
  userName: UserName,
  answers: readonly Answer[],
  nameToOmit: UserName | undefined,
): boolean =>
  userName === nameToOmit
    ? false
    : answers.some((a) => a.user.name === userName);
