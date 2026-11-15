import ghostOnDark from './assets/ghost-on-dark.svg'
import ghostOnLight from './assets/ghost-on-light.svg'
import markOnDark from './assets/mark-on-dark.svg'
import markOnLight from './assets/mark-on-light.svg'

/** The top of the window: form-builder's mark and name, its docs, and the ghost. */
export function TabBar() {
  return (
    <header className="ws-tab-bar">
      <span className="ws-tab-bar__brand">
        {/* The kit has a cut of the mark for each theme. The styles show the page's one. */}
        <img
          className="tab-bar__mark ws-theme-dark"
          src={markOnDark}
          alt=""
          width="32"
          height="32"
        />
        <img
          className="tab-bar__mark ws-theme-light"
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
        {/* On a project's page the ghost links to the handle's site. A cut for each theme, too. */}
        <a href="https://whatsaaaa.github.io/" aria-label="A whatsaaaa project">
          <img
            className="ws-theme-dark"
            src={ghostOnDark}
            alt=""
            width="20"
            height="24"
          />
          <img
            className="ws-theme-light"
            src={ghostOnLight}
            alt=""
            width="20"
            height="24"
          />
        </a>
      </div>
    </header>
  )
}
