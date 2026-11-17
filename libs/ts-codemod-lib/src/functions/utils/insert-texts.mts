/**
 * Returns `fullText` with each `text` inserted at its `position`, an offset
 * into `fullText` as it was. The insertions are made in one pass, in order of
 * position, with those at the same position kept in the order given.
 *
 * Transformers use it to make every edit of a file as one text replacement:
 * ts-morph forgets every descendant of a node it inserts text into, so editing
 * one site at a time would reparse the file once per edit.
 */
export const insertTexts = (
  fullText: string,
  insertions: readonly Readonly<{ position: number; text: string }>[],
): string => {
  const mut_parts: string[] = [];

  let mut_restStart: number = 0;

  for (const { position, text } of insertions.toSorted(
    (a, b) => a.position - b.position,
  )) {
    mut_parts.push(fullText.slice(mut_restStart, position), text);

    mut_restStart = position;
  }

  mut_parts.push(fullText.slice(mut_restStart));

  return mut_parts.join('');
};
