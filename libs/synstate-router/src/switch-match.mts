type RouteNodeLike = Readonly<{
  pattern: string;
  match: (
    segments: readonly string[],
  ) => Readonly<Record<string, string>> | undefined;
  matchExact: (
    segments: readonly string[],
  ) => Readonly<Record<string, string>> | undefined;
}>;

type SwitchMatchOptions = Readonly<{
  matchMode?: 'exact' | 'prefix';
}>;

type SwitchMatchResult = Readonly<{
  route: string | undefined;
  params: Readonly<Record<string, string>>;
}>;

export const switchMatch = (
  routeNodes: readonly RouteNodeLike[],
  pathSegments: readonly string[],
  options?: SwitchMatchOptions,
): SwitchMatchResult => {
  const matchMode = options?.matchMode ?? 'exact';

  const matchFn =
    matchMode === 'exact'
      ? (node: RouteNodeLike) => node.matchExact(pathSegments)
      : (node: RouteNodeLike) => node.match(pathSegments);

  for (const node of routeNodes) {
    const params = matchFn(node);

    if (params !== undefined) {
      return { route: node.pattern, params };
    }
  }

  return { route: undefined, params: {} };
};
