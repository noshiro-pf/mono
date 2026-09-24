export const theNameIsAlreadyUsedFn = (
  userName: UserName,
  answers: readonly Answer[],
  nameToOmit: UserName | undefined,
): boolean =>
  userName !== nameToOmit && answers.some((a) => a.user.name === userName);
