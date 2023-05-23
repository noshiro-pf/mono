import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@material-ui/core'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import * as I from 'immutable'
import { memo } from 'react'
import styled from 'styled-components'
import { TDCardProperty, isWideCard } from '~/types/dcard-property'
import { Spacer } from '~/utils/components/spacer'
import { DCardImage } from '../dcard-image/dcard-image'
import { DCardPropertyDialogTable } from './dcard-property-table'

const TitleWrapper = styled.div`
  display: flex;
  flex-direction: row;
`

const ImageWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  padding: 10px;
`

export const DCardPropertyDialogView = memo(
  ({
    open,
    closeDialog,
    dcard,
    dcardForView,
    dcardIndex,
    filteredIndice: filteredIndiceInput,
    goToPreviousCard,
    goToNextCard,
  }: Readonly<{
    open: boolean
    closeDialog: () => void
    dcard: TDCardProperty
    dcardForView: I.Map<string, string>
    dcardIndex: number
    filteredIndice?: I.List<number>
    goToPreviousCard?: () => void
    goToNextCard?: () => void
  }>) => {
    const filteredIndice = filteredIndiceInput || I.List()

    return (
      <Dialog open={open} onClose={closeDialog}>
        <DialogTitle>
          <TitleWrapper>
            {filteredIndice.size > 1 && (
              <Button onClick={goToPreviousCard} disabled={dcardIndex <= 0}>
                <ChevronLeftIcon />
              </Button>
            )}
            <Spacer />
            <span>
              {dcard.nameJp} ({dcard.nameEng})
            </span>
            <Spacer />
            {filteredIndice.size > 1 && (
              <Button
                onClick={goToNextCard}
                disabled={dcardIndex >= filteredIndice.size - 1}
              >
                <ChevronRightIcon />
              </Button>
            )}
          </TitleWrapper>
        </DialogTitle>
        <DialogContent>
          <ImageWrapper>
            <DCardImage dcard={dcard} height={isWideCard(dcard) ? 280 : 330} />
          </ImageWrapper>
          <DCardPropertyDialogTable card={dcard} cardForView={dcardForView} />
        </DialogContent>
        <DialogActions>
          <Button color='primary' onClick={closeDialog}>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    )
  }
)

DCardPropertyDialogView.displayName = 'DCardPropertyDialogView'
