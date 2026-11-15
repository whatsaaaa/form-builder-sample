import { enableShortcuts, isTyping } from '@whatsaaaa/design-system/shortcuts'
import { toggleTheme } from '@whatsaaaa/design-system/theme'
import { useEffect, useState } from 'react'

type Mode = 'NORMAL' | 'INSERT'

/**
 * NORMAL while single keys are shortcuts, INSERT while they are typed into a field. It says
 * whether the key hints next to it work right now.
 */
function currentMode(): Mode {
  return isTyping(document.activeElement) ? 'INSERT' : 'NORMAL'
}

/**
 * The bottom of the window, the design system's status line: the mode, the app's path, the
 * theme switch and the switch for the shortcut keys.
 */
export function StatusLine() {
  const [mode, setMode] = useState<Mode>('NORMAL')

  useEffect(() => {
    const updateMode = () => {
      setMode(currentMode())
    }
    updateMode()
    document.addEventListener('focusin', updateMode)
    document.addEventListener('focusout', updateMode)
    const disableShortcuts = enableShortcuts()
    return () => {
      document.removeEventListener('focusin', updateMode)
      document.removeEventListener('focusout', updateMode)
      disableShortcuts()
    }
  }, [])

  return (
    <footer className="ws-status-line" aria-label="Status">
      <span className="ws-status-line__mode">{mode}</span>
      {/* The room left in the line, which the path shows in whole or not at all. */}
      <span className="ws-status-line__path">
        <span className="ws-status-line__file">
          <span>~/react-checkout</span>
        </span>
      </span>
      {/* Each hint is the control it names: the key clicks the button. */}
      <span className="ws-status-line__keys">
        <button
          type="button"
          data-ws-key="t"
          aria-label="Switch theme"
          onClick={toggleTheme}
        >
          <kbd className="ws-kbd">t</kbd>theme
        </button>
      </span>
      {/* The shortcuts module gives the switch its state. Until then the styles keep it hidden. */}
      <button
        type="button"
        className="ws-status-line__switch"
        role="switch"
        aria-label="Shortcut keys"
        data-ws-keys-switch
      >
        keys
        <span className="ws-status-line__on" aria-hidden="true">
          on
        </span>
        <span className="ws-status-line__off" aria-hidden="true">
          off
        </span>
      </button>
      {/*
        The name of the theme, which also switches it: the hints above are hidden on a narrow
        screen, and this is not. Both names are in the button and the styles show the theme's
        one, so it keeps the focus when the theme changes.
      */}
      <button
        type="button"
        className="ws-status-line__theme"
        onClick={toggleTheme}
      >
        <span className="ws-visually-hidden">Switch theme, now </span>
        <span className="ws-theme-dark">rose-pine</span>
        <span className="ws-theme-light">rose-pine-dawn</span>
      </button>
    </footer>
  )
}
