import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

const ConfirmContext = createContext(null)

const DEFAULTS = {
  title: 'Are you sure?',
  message: '',
  confirmLabel: 'Confirm',
  cancelLabel: 'Cancel',
  danger: false,
}

export function ConfirmProvider({ children }) {
  const [dialog, setDialog] = useState(null)
  const resolverRef = useRef(null)

  const close = useCallback((result) => {
    const resolve = resolverRef.current
    resolverRef.current = null
    setDialog(null)
    if (resolve) resolve(result)
  }, [])

  const confirm = useCallback((options = {}) => {
    // If a dialog is already open, dismiss it as cancelled first.
    if (resolverRef.current) {
      resolverRef.current(false)
      resolverRef.current = null
    }
    const opts = { ...DEFAULTS, ...(typeof options === 'string' ? { message: options } : options) }
    return new Promise((resolve) => {
      resolverRef.current = resolve
      setDialog(opts)
    })
  }, [])

  useEffect(() => {
    if (!dialog) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') close(false)
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [dialog, close])

  const value = useMemo(() => confirm, [confirm])

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      {dialog &&
        createPortal(
          <div
            className="confirm-overlay"
            role="presentation"
            onClick={(e) => {
              if (e.target === e.currentTarget) close(false)
            }}
          >
            <div
              className="confirm-dialog"
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="confirm-dialog-title"
              aria-describedby="confirm-dialog-desc"
            >
              <h2 id="confirm-dialog-title" className="confirm-dialog-title">
                {dialog.title}
              </h2>
              {dialog.message ? (
                <p id="confirm-dialog-desc" className="confirm-dialog-message">
                  {dialog.message}
                </p>
              ) : (
                <span id="confirm-dialog-desc" className="sr-only">
                  Confirm this action
                </span>
              )}
              <div className="confirm-dialog-actions">
                <button type="button" className="btn btn-ghost" onClick={() => close(false)} autoFocus>
                  {dialog.cancelLabel}
                </button>
                <button
                  type="button"
                  className={`btn ${dialog.danger ? 'btn-danger' : 'btn-primary'}`}
                  onClick={() => close(true)}
                >
                  {dialog.confirmLabel}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </ConfirmContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useConfirm() {
  const ctx = useContext(ConfirmContext)
  if (!ctx) throw new Error('useConfirm must be used within a ConfirmProvider')
  return ctx
}
