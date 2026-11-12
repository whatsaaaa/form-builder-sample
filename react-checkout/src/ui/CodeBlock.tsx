import type { HTMLAttributes } from 'react'

/** Preformatted text, like the order as the server accepted it. */
export function CodeBlock(props: HTMLAttributes<HTMLPreElement>) {
  return <pre {...props} className="notice__code" />
}
