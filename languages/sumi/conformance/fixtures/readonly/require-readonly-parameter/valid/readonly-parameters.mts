export const size = (index: ReadonlyMap<string, number>): number => index.size;

// Inferred parameter types are not checked (ignoreInferredTypes).
export const doubled = [1, 2].map((n) => n * 2);
