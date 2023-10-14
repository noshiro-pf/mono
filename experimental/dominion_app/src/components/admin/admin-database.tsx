import { Button } from '@material-ui/core'
import { memo, useCallback, useState } from 'react'
import { useRNValue } from 'rnjs-hooks'
import { fbPaths } from '~/constants/firebase-config'
import * as fb from '~/firebase/firebase-worker'

export const AdminDatabase = memo(() => {
  const dcardlist = useRNValue(fb.dcardlist$)

  const [inProcess, setInProcess] = useState(false)

  // 画像URLの更新
  const updateCardImgUrls = useCallback(async () => {
    setInProcess(true)
    const BoonBackImgName = 'Boon-back.jpg'
    const HexBackImgName = 'Hex-back.jpg'
    const StashBackImgName = 'Stash-back.jpg'
    const NormalBackImgName = 'Card_back.jpg'

    const [BoonBackImgUrl, HexBackImgUrl, StashBackImgUrl, NormalBackImgUrl]: [
      string,
      string,
      string,
      string,
    ] = await Promise.all([
      fb.storage
        .ref(`${fbPaths.storage.dcardImages}/${BoonBackImgName}`)
        .getDownloadURL(),
      fb.storage
        .ref(`${fbPaths.storage.dcardImages}/${HexBackImgName}`)
        .getDownloadURL(),
      fb.storage
        .ref(`${fbPaths.storage.dcardImages}/${StashBackImgName}`)
        .getDownloadURL(),
      fb.storage
        .ref(`${fbPaths.storage.dcardImages}/${NormalBackImgName}`)
        .getDownloadURL(),
    ])

    const frontImageUrls: string[] = await Promise.all(
      dcardlist.map((dcard) =>
        fb.storage
          .ref(
            `${fbPaths.storage.dcardImages}/${dcard.nameEng.replace(
              / /g,
              '_',
            )}.jpg`,
          )
          .getDownloadURL(),
      ),
    )

    await Promise.all(
      dcardlist
        .map((dcard, i) =>
          fb.setDcardImgUrl(dcard.key, 'front', frontImageUrls[i]),
        )
        .toArray(),
    )

    await Promise.all(
      dcardlist
        .map((dcard) => {
          const backImageUrl: string = (() => {
            if (dcard.cardTypes.includes('Boon')) return BoonBackImgUrl
            if (dcard.cardTypes.includes('Hex')) return HexBackImgUrl
            if (dcard.cardId === 'Stash') return StashBackImgUrl
            return NormalBackImgUrl
          })()
          return fb.setDcardImgUrl(dcard.key, 'back', backImageUrl)
        })
        .toArray(),
    )

    setInProcess(false)
  }, [setInProcess, dcardlist])

  return (
    <div>
      <div style={{ padding: '10px' }}>
        <Button
          variant='outlined'
          onClick={updateCardImgUrls}
          disabled={dcardlist.isEmpty() || inProcess}
        >
          Update Card Image Urls
        </Button>
        {inProcess && <div>処理中…</div>}
      </div>
    </div>
  )
})

AdminDatabase.displayName = 'AdminDatabase'
