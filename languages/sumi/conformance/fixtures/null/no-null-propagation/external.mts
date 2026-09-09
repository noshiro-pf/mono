/** Stands in for an external API: the `null` the boundary has to normalize. */
export const findElement = (selector: string): string | null =>
  selector === '' ? null : selector;
