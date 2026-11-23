import { useState } from 'react'

/**
 * A real website screenshot framed as a browser window, for projects without
 * a public deployment. Shares the live preview cards' frame and hover glow.
 * The intrinsic size is known, so the frame reserves its space up front (no
 * layout shift for the scroll stations); if the file is missing, nothing renders.
 */
export default function ScreenshotFigure({ src, alt, width, height, label }) {
  const [failed, setFailed] = useState(false)
  if (failed) return null

  return (
    <figure className="shot-shell" data-reveal>
      <div className="shot">
        <div className="shot__bar" aria-hidden="true">
          <span className="shot__lights">
            <span />
            <span />
            <span />
          </span>
          <span className="shot__label">{label}</span>
          <span className="shot__status">Screenshot</span>
        </div>
        <div className="shot__viewport" style={{ aspectRatio: `${width} / ${height}` }}>
          <img
            src={src}
            alt={alt}
            width={width}
            height={height}
            loading="lazy"
            decoding="async"
            onError={() => setFailed(true)}
          />
        </div>
      </div>
    </figure>
  )
}
