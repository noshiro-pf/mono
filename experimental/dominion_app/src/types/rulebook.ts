import * as I from 'immutable'

interface IRulebook {
  imgurl: string
  pdfurl: string
  title: string
}

export type TRulebook = I.Record<IRulebook> & Readonly<IRulebook>

export const Rulebook = (rb: Partial<IRulebook>): TRulebook =>
  I.Record({
    imgurl: '',
    pdfurl: '',
    title: '',
  })(rb)
