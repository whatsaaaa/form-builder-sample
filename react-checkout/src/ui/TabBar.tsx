import { ghostSvg } from '@whatsaaaa/design-system/ghost'
import markOnDark from './assets/mark-on-dark.svg'
import markOnLight from './assets/mark-on-light.svg'

// The ghost as a picture, for a link: on a project's page it links to the handle's site.
const ghost = { __html: ghostSvg({ px: 2 }) }

/** The top of the window: form-builder's mark and name, its docs, and the ghost. */
export function TabBar() {
  return (
    <header className="ws-tab-bar">
      <span className="ws-tab-bar__brand">
        {/* The kit has a cut of the mark for each theme. The stylesheet shows the page's one. */}
        <img
          className="tab-bar__mark tab-bar__mark--dark"
          src={markOnDark}
          alt=""
          width="32"
          height="32"
        />
        <img
          className="tab-bar__mark tab-bar__mark--light"
          src={markOnLight}
          alt=""
          width="32"
          height="32"
        />
        form-builder
      </span>
      <div className="ws-tab-bar__end">
        <a
          className="ws-arrow"
          href="https://whatsaaaa.github.io/form-builder/"
        >
          docs
        </a>
        {/* Markup built by the design system's ghost module. */}
        <a
          className="tab-bar__ghost"
          href="https://whatsaaaa.github.io/"
          aria-label="A whatsaaaa project"
          dangerouslySetInnerHTML={ghost}
        />
      </div>
    </header>
  )
}
