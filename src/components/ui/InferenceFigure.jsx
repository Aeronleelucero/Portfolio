import { useState } from 'react'
import { COW_SKELETON } from '../../data/herdVisionInference'
import { ScrollTrigger } from '../../animations/scrollConfig'

const KPT_MIN_CONF = 0.25

/**
 * Presents a project screenshot as a computer-vision inference panel.
 *
 * The overlay (bounding box, label, confidence, keypoints) is drawn ONLY
 * from `inference` — real model output. With no inference data the original
 * image is shown cleanly. The figure stays hidden until the image loads,
 * and renders nothing if the file is missing.
 */
export default function InferenceFigure({ src, alt, inference, caption }) {
  const [status, setStatus] = useState('loading')
  const [size, setSize] = useState(null)

  if (status === 'error') return null

  const hasBox = Boolean(inference?.box)
  const kpts = inference?.keypoints ?? null

  return (
    <figure className={`inference ${status === 'ready' ? 'is-ready' : ''}`} data-reveal>
      <div className="inference__bar" aria-hidden="true">
        <span className="inference__dot" />
        <span>HERD-VISION{inference?.model ? ` · ${inference.model}` : ''}</span>
        <span className="inference__status">{hasBox ? 'Detection' : 'Source image'}</span>
      </div>

      <div className="inference__stage" style={size ? { aspectRatio: `${size.w} / ${size.h}` } : undefined}>
        <img
          src={src}
          alt={alt}
          decoding="async"
          onLoad={(e) => {
            setSize({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })
            setStatus('ready')
            // The figure changes the page height — re-measure scroll stations.
            requestAnimationFrame(() => ScrollTrigger.refresh())
          }}
          onError={() => setStatus('error')}
        />

        {hasBox && size && (
          <svg className="inference__overlay" viewBox={`0 0 ${size.w} ${size.h}`} aria-hidden="true">
            {(() => {
              const [x, y, w, h] = inference.box
              const bx = x * size.w
              const by = y * size.h
              const bw = w * size.w
              const bh = h * size.h
              const stroke = Math.max(2, size.w / 360)
              const label = `${inference.label ?? 'COW'}${
                typeof inference.confidence === 'number' ? ` ${inference.confidence.toFixed(2)}` : ''
              }`
              const fs = Math.max(12, size.w / 48)
              return (
                <>
                  <rect x={bx} y={by} width={bw} height={bh} className="inference__box" strokeWidth={stroke} />
                  <rect x={bx} y={by - fs * 1.5} width={label.length * fs * 0.62 + fs} height={fs * 1.5} className="inference__tag" />
                  <text x={bx + fs * 0.5} y={by - fs * 0.45} fontSize={fs} className="inference__label">
                    {label}
                  </text>
                  {kpts &&
                    COW_SKELETON.map(([a, b]) => {
                      const ka = kpts[a]
                      const kb = kpts[b]
                      if (!ka || !kb || ka[2] < KPT_MIN_CONF || kb[2] < KPT_MIN_CONF) return null
                      return (
                        <line
                          key={`${a}-${b}`}
                          x1={ka[0] * size.w}
                          y1={ka[1] * size.h}
                          x2={kb[0] * size.w}
                          y2={kb[1] * size.h}
                          className="inference__bone"
                          strokeWidth={stroke}
                        />
                      )
                    })}
                  {kpts?.map(([kx, ky, c], i) =>
                    c >= KPT_MIN_CONF ? (
                      <circle key={i} cx={kx * size.w} cy={ky * size.h} r={stroke * 2.4} className="inference__kpt" strokeWidth={stroke * 0.6} />
                    ) : null,
                  )}
                </>
              )
            })()}
          </svg>
        )}
      </div>

      {caption && <figcaption className="inference__caption">{caption}</figcaption>}
    </figure>
  )
}
