import { useCallback, useEffect, useRef } from 'react'
import { ExternalLink, X } from 'lucide-react'
import { setSceneSuspended } from '../../hooks/interaction'

/**
 * Near full-screen view of a live deployed site (native <dialog>):
 * focus moves to the close button, Escape and backdrop clicks close it, page
 * scrolling is locked, and the portfolio's own 3D scene pauses meanwhile.
 * On close, focus returns to `returnFocusRef`.
 */
export default function LiveSiteModal({ open, live, title, onClose, returnFocusRef }) {
  const dialog = useRef(null)
  const closeButton = useRef(null)

  useEffect(() => {
    const d = dialog.current
    if (!d) return
    if (open && !d.open) {
      d.showModal()
      // showModal() focuses the first focusable element; start on Close instead.
      closeButton.current?.focus()
      document.body.classList.add('modal-open')
      setSceneSuspended(true)
    } else if (!open && d.open) {
      d.close()
    }
  }, [open])

  // Every close path (button, backdrop, Escape) runs this synchronously, so
  // the scroll lock, paused scene and focus never wait on the async "close"
  // event (which can be delayed while a heavy WebGL page is rendering, and
  // could otherwise arrive after the modal has been reopened).
  const finishClose = useCallback(() => {
    if (!document.body.classList.contains('modal-open') && !dialog.current?.open) return
    document.body.classList.remove('modal-open')
    setSceneSuspended(false)
    if (dialog.current?.open) dialog.current.close()
    onClose()
    returnFocusRef?.current?.focus({ preventScroll: true })
  }, [onClose, returnFocusRef])

  useEffect(() => {
    const d = dialog.current
    const onCancel = (e) => {
      e.preventDefault() // handle Escape ourselves, synchronously
      finishClose()
    }
    d?.addEventListener('cancel', onCancel)
    return () => {
      d?.removeEventListener('cancel', onCancel)
      document.body.classList.remove('modal-open')
      setSceneSuspended(false)
    }
  }, [finishClose])

  const onBackdrop = (e) => {
    if (e.target === dialog.current) finishClose()
  }

  return (
    <dialog ref={dialog} className="live-modal" aria-labelledby="live-modal-title" onClick={onBackdrop}>
      {open && (
        <div className="live-modal__inner">
          <header className="live-modal__bar">
            <div className="live-modal__heading">
              <span className="live-modal__dot" aria-hidden="true" />
              <h2 id="live-modal-title" className="live-modal__title">
                {title}
              </h2>
              <span className="live-modal__sub">{live.title.replace(/^[^—]*—\s*/, '')}</span>
            </div>
            <div className="live-modal__actions">
              <a className="btn btn--primary live-modal__visit" href={live.url} target="_blank" rel="noopener noreferrer">
                <span className="btn__label">Visit Site</span>
                <ExternalLink className="btn__icon" size={16} strokeWidth={1.7} aria-hidden="true" />
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
              <button ref={closeButton} type="button" className="live-modal__close" onClick={finishClose}>
                <X size={20} strokeWidth={1.6} aria-hidden="true" />
                <span className="sr-only">Close {title} preview</span>
              </button>
            </div>
          </header>
          <iframe
            className="live-modal__frame"
            src={live.url}
            title={live.title}
            referrerPolicy="strict-origin-when-cross-origin"
            sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
            allow="fullscreen"
          />
        </div>
      )}
    </dialog>
  )
}
