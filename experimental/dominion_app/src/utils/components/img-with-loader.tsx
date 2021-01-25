import React, {
  CSSProperties,
  memo,
  useCallback,
  useEffect,
  useState,
} from 'react'

export const ImgWithLoader = memo(
  ({
    Loading,
    img,
  }: Readonly<{
    Loading: JSX.Element
    img: {
      src: string
      style?: CSSProperties
      height?: number
      width?: number
      alt?: string
    }
  }>) => {
    const [loading, setLoading] = useState(true)

    useEffect(() => {
      setLoading(true)
    }, [img.src, setLoading])

    const onLoad = useCallback(() => {
      setLoading(false)
    }, [setLoading])

    return (
      <>
        {loading && Loading}
        <img
          style={{ ...img.style, display: loading ? 'none' : 'block' }}
          src={img.src}
          onLoad={onLoad}
          height={loading ? 0 : img.height}
          width={loading ? 0 : img.width}
          alt={img.alt}
        />
      </>
    )
  }
)

ImgWithLoader.displayName = 'ImgWithLoader'
