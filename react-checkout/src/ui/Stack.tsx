import type { ReactNode } from 'react'

/** Its children one under the other, closer together when `tight`. */
export function Stack({
  tight,
  children,
}: {
  tight?: boolean
  children: ReactNode
}) {
  return (
    <div className={tight ? 'stack stack--tight' : 'stack'}>{children}</div>
  )
}
