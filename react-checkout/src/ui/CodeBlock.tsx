import {
  Fragment,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type HTMLAttributes,
} from 'react'
import type { highlightJson } from './highlight'

type Highlight = typeof highlightJson

// Shiki is most of the app's weight and is needed only once an order is placed, so it is a file
// of its own. It starts loading with the app, and the first render does not wait for it. If the
// file does not load, the code stays plain text.
let loaded: Highlight | undefined
const loading = import('./highlight')
  .then(({ highlightJson }) => {
    loaded = highlightJson
    return highlightJson
  })
  .catch(() => undefined)

/** Lines of plain text, in the block's own text color, for while Shiki is not there. */
function plain(code: string): ReturnType<Highlight> {
  return code.split('\n').map((line) => [{ content: line, offset: 0 }])
}

interface CodeBlockProps extends HTMLAttributes<HTMLPreElement> {
  /** A piece of JSON, like the order as the server accepted it. */
  code: string
  /** The name the caption gives it. */
  file: string
}

/**
 * A piece of JSON in the design system's code block, highlighted in its code theme. The other
 * attributes, like a test id, go to the code, so they are on the text alone.
 */
export function CodeBlock({ code, file, ...props }: CodeBlockProps) {
  const [highlight, setHighlight] = useState(() => loaded)
  useEffect(() => {
    if (highlight) return
    let current = true
    void loading.then((loadedHighlight) => {
      if (current && loadedHighlight) setHighlight(() => loadedHighlight)
    })
    return () => {
      current = false
    }
  }, [highlight])

  // Each line with the column its wrapped rest starts at: one level in from its own text, so a
  // long value wraps inside the block instead of running out of it.
  const lines = useMemo(
    () =>
      (highlight ?? plain)(code).map((tokens) => {
        const text = tokens.map((token) => token.content).join('')
        return { tokens, hang: text.length - text.trimStart().length + 2 }
      }),
    [code, highlight],
  )
  // What a person typed can be long, so the block wraps its lines instead of scrolling.
  return (
    <figure className="ws-code ws-code--wrap">
      <figcaption>
        <span>{file}</span>
        <span>json</span>
      </figcaption>
      {/* A line break ends each line but the last: the text of the block is the code as given. */}
      <pre {...props}>
        <code>
          {lines.map((line, index) => (
            <Fragment key={index}>
              <span
                className="line"
                style={{ '--ws-code-hang': line.hang } as CSSProperties}
              >
                {line.tokens.map((token, column) => (
                  <span key={column} style={{ color: token.color }}>
                    {token.content}
                  </span>
                ))}
              </span>
              {index < lines.length - 1 ? '\n' : ''}
            </Fragment>
          ))}
        </code>
      </pre>
    </figure>
  )
}
