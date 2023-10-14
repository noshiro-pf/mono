import * as I from 'immutable'
import { memo } from 'react'
import { AutoComplete } from '~/utils/components/auto-complete'

// import { TextField } from '@material-ui/core';

export const GameResultPlace = memo(
  ({
    editMode,
    place,
    placeList,
    placeChange,
  }: Readonly<{
    editMode: boolean
    place: string
    placeList: I.List<string>
    placeChange: (value: string) => void
  }>) => (
    <div>
      {!editMode ? (
        <div>場所：{place}</div>
      ) : (
        // <TextField
        //   label='場所'
        //   margin='dense'
        //   value={place}
        //   InputLabelProps={{ shrink: true }}
        //   onChange={onChange}
        // />
        <AutoComplete
          placeholder='場所'
          value={place}
          options={placeList}
          onChange={placeChange}
        />
      )}
    </div>
  ),
)

GameResultPlace.displayName = 'GameResultPlace'
