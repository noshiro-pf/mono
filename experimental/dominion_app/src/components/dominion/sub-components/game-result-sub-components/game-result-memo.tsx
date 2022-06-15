import { memo } from 'react'
import { MyInput } from '~/utils/components/native-input'

export const GameResultMemo = memo(
  ({
    editMode,
    memo,
    memoChange,
  }: Readonly<{
    editMode: boolean
    memo: string
    memoChange: (value: string) => void
  }>) => (
    <div>
      {!editMode ? (
        <div>Memo: {memo}</div>
      ) : (
        <MyInput value={memo} valueChange={memoChange} label='Memo' />
      )}
    </div>
  )
)

GameResultMemo.displayName = 'GameResultMemo'
