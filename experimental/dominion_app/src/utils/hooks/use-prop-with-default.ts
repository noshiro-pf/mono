import { useMemo } from 'react'

export const useValueWithDefault = <T>(
  nullableValue: T | undefined,
  defaultValue: T
): T => {
  const value = useMemo(
    () => (nullableValue === undefined ? defaultValue : nullableValue),
    [nullableValue, defaultValue]
  )
  return value
}
