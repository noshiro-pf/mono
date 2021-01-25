import * as I from 'immutable'

export const isValidTable = (
  table: I.List<I.List<any>>,
  log = true
): boolean => {
  if (!table) {
    if (log) console.error('"table" is undefined')
    return false
  }

  if (!I.List.isList(table)) {
    if (log) console.error('"table" is not array')
    return false
  }

  if (table.isEmpty()) return true

  if (!I.List.isList(table.get(0))) {
    if (log) console.error('"table" must be 2D-array')
    return false
  }

  // 行の長さが合わない場合
  const lengthOfRow0 = table.get(0, I.List()).size
  if (table.findIndex((row) => row.size !== lengthOfRow0) !== -1) {
    if (log) console.error('some row differ in length')
    return false
  }

  return true
}
