export const isValidTable = (table: any[][]): boolean => {
  if (!table || !Array.isArray(table) || !Array.isArray(table[0])) return false;

  // 行の長さが合わない場合
  const lengthOfLine0 = table[0].length;
  if (table.findIndex((line) => line.length !== lengthOfLine0) !== -1)
    return false;

  return true;
};
