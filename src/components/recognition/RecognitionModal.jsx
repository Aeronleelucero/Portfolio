import { useEffect, useRef } from 'react'
import { ExternalLink, X } from 'lucide-react'
import { CATEGORY_LABELS } from '../../data/recognition'

/**
 * Full-size preview built on the native <dialog>: focus is trapped while
 * open, Escape closes it, focus returns to the opening control, and the
 * rest of the page is inert. Clicking the backdrop also closes it.
 */
export default function RecognitionModal({ item, onClose }) {
  const dialog = useRef(null)

  useEffect(() => {
    const d = dialog.current
    if (!d) return
    if (item && !d.open) {
      d.showModal()
      document.body.classList.add('modal-open')
    } else if (!item && d.open) {
      d.close()
    }
  }, [item])

  // Keep the page scroll lock in sync however the dialog closes.
  useEffect(() => {
    const d = dialog.current
    const onDialogClose = () => {
      document.body.classList.remove('modal-open')
      onClose()
    }
    d?.addEventListener('close', onDialogClose)
    return () => {
      d?.removeEventListener('close', onDialogClose)
      document.body.classList.remove('modal-open')
    }
  }, [onClose])

  const onBackdrop = (e) => {
    // A click on the dialog element itself (not its content) is the backdrop.
    if (e.target === dialog.current) dialog.current.close()
  }

  return (
    <dialog
      ref={dialog}
      className="rmodal"
      aria-labelledby={item ? 'rmodal-title' : undefined}
      onClick={onBackdrop}
    >
      {item && (
        <div className="rmodal__inner">
          <button type="button" className="rmodal__close" onClick={() => dialog.current.close()} autoFocus>
            <X size={20} strokeWidth={1.6} aria-hidden="true" />
            <span className="sr-only">Close preview</span>
          </button>

          <div className="rmodal__media">
            <img
              src={item.image}
              width={item.width}
              height={item.height}
              alt={item.alt}
              decoding="async"
              style={{ backgroundImage: `url("${item.thumb}")` }}
            />
          </div>

          <div className="rmodal__details">
            <p className="rmodal__category">{CATEGORY_LABELS[item.category]}</p>
            <h2 id="rmodal-title" className="rmodal__title">
              {item.title}
            </h2>
            {item.event && <p className="rmodal__event">{item.event}</p>}
            {item.certificateType && <p className="rmodal__event">{item.certificateType}</p>}
            <p className="rmodal__desc">{item.description}</p>

            <dl className="rmodal__facts">
              <div>
                <dt>Organization</dt>
                <dd>{item.organization}</dd>
              </div>
              {item.date && (
                <div>
                  <dt>{item.certificateId ? 'Completion date' : 'Date'}</dt>
                  <dd>{item.date}</dd>
                </div>
              )}
              {item.duration && (
                <div>
                  <dt>Duration</dt>
                  <dd>{item.duration}</dd>
                </div>
              )}
              {item.certificateId && (
                <div>
                  <dt>Certificate ID</dt>
                  <dd>{item.certificateId}</dd>
                </div>
              )}
            </dl>

            {item.verificationUrl && (
              <p className="rmodal__verify">
                <a className="link-pill" href={item.verificationUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink size={14} strokeWidth={1.7} aria-hidden="true" />
                  Verify Certificate
                  <span className="sr-only"> on the issuer’s website (opens in a new tab)</span>
                </a>
                <span className="rmodal__note">Verification link as printed on the certificate.</span>
              </p>
            )}

            {item.credit && <p className="rmodal__credit">{item.credit}</p>}
          </div>
        </div>
      )}
    </dialog>
  )
}
