import {
  Button,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@material-ui/core'
import * as I from 'immutable'
import { CSSProperties, Fragment, memo, useCallback } from 'react'
import styled from 'styled-components'
import { dcardCostToStr } from '~/types/card-cost'
import { DCardProperty, TDCardProperty } from '~/types/dcard-property'
import {
  TSelectedCards,
  TSelectedCardsKeys,
  isEmpty,
} from '~/types/selected-cards'
import { TSelectedCardsCheckbox } from '~/types/selected-cards-checkbox-values'

const TableWrapper = styled.div`
  overflow-x: auto;
`

const expansionColumnCellStyle: CSSProperties = {
  minWidth: '140px',
}

const nameJpColumnCellStyle: CSSProperties = {
  minWidth: '180px',
}

const nameEngColumnCellStyle: CSSProperties = {
  minWidth: '140px',
}

export const SelectedCardsListView = memo(
  ({
    selectedCards,
    showSelectedCardsCheckbox,
    selectedCardsCheckboxOnChange,
    dcardlist,
    selectedCardsCheckbox,
    selectedCardsCategories,
    cardInfoButtonClicked,
  }: Readonly<{
    selectedCards: TSelectedCards
    showSelectedCardsCheckbox: boolean
    selectedCardsCheckboxOnChange: (v: {
      category: string
      index: number
      checked: boolean
    }) => void
    dcardlist: I.List<TDCardProperty>
    selectedCardsCheckbox: TSelectedCardsCheckbox
    selectedCardsCategories: I.List<{
      name: TSelectedCardsKeys
      title: string
    }>
    cardInfoButtonClicked: (cardIndex: number) => void
  }>) => {
    const checkboxOnChange = useCallback(
      (category: string, index: number) => (_ev: any, checked: boolean) => {
        selectedCardsCheckboxOnChange({ category, index, checked })
      },
      [selectedCardsCheckboxOnChange],
    )

    const buttonOnClick = useCallback(
      (index: number) => () => {
        cardInfoButtonClicked(index)
      },
      [cardInfoButtonClicked],
    )

    return (
      <TableWrapper>
        <Table>
          <TableHead>
            {!isEmpty(selectedCards) && (
              <TableRow>
                {showSelectedCardsCheckbox && <TableCell />}
                <TableCell align='center' style={expansionColumnCellStyle}>
                  セット
                </TableCell>
                <TableCell align='center' style={nameJpColumnCellStyle}>
                  名前
                </TableCell>
                <TableCell align='center' style={nameEngColumnCellStyle}>
                  name
                </TableCell>
                <TableCell align='center'>コスト</TableCell>
              </TableRow>
            )}
          </TableHead>
          {selectedCardsCategories.map((category) => (
            <Fragment key={category.name}>
              <TableHead>
                {!selectedCards.get(category.name).isEmpty() && (
                  <TableRow>
                    <TableCell colSpan={5}>{category.title}</TableCell>
                  </TableRow>
                )}
              </TableHead>
              <TableBody>
                {selectedCards.get(category.name).map((cardIndex, idx) => {
                  const dcard = dcardlist.get(cardIndex, DCardProperty())
                  return (
                    <TableRow key={cardIndex}>
                      {showSelectedCardsCheckbox && (
                        <TableCell align='center'>
                          {category.name !== 'Obelisk' && (
                            <Checkbox
                              checked={selectedCardsCheckbox.getIn([
                                category.name,
                                idx,
                              ])}
                              onChange={checkboxOnChange(category.name, idx)}
                            />
                          )}
                        </TableCell>
                      )}
                      <TableCell align='center'>
                        {dcard.expansionName.join('，')}
                      </TableCell>
                      <TableCell align='center'>
                        <Button
                          color='primary'
                          onClick={buttonOnClick(cardIndex)}
                        >
                          {dcard.nameJp}
                        </Button>
                      </TableCell>
                      <TableCell align='center'>{dcard.nameEng} </TableCell>
                      <TableCell align='center'>
                        {dcardCostToStr(dcard.effects.cost)}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Fragment>
          ))}
        </Table>
      </TableWrapper>
    )
  },
)

SelectedCardsListView.displayName = 'SelectedCardsListView'
