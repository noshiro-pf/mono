export const strcmp = (x: string, y: string): number => x.localeCompare(y);

export const strcmpR = (x: string, y: string): number => strcmp(y, x);
