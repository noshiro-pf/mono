import { memo, ReactNodeArray } from 'react'

// 非表示componentも状態を維持するためdisplay: noneを利用

export const ComponentSwitcher = memo(
  ({
    children,
    index,
  }: Readonly<{
    children: ReactNodeArray
    index: number
  }>) => (
    <>
      {children.map((c, i) =>
        i === index ? (
          <div key={i}>{c}</div>
        ) : (
          <div key={i} style={{ display: 'none' }}>
            {c}
          </div>
        )
      )}
    </>
  )
)

ComponentSwitcher.displayName = 'ComponentSwitcher'
