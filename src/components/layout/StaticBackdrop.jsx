/**
 * CSS-only backdrop shown while the 3D scene loads, or permanently when
 * WebGL is unavailable. Keeps the cinematic mood without any GPU work.
 */
export default function StaticBackdrop({ reason }) {
  return (
    <div className="backdrop" aria-hidden="true" data-reason={reason}>
      <div className="backdrop__core">
        <span className="backdrop__ring backdrop__ring--1" />
        <span className="backdrop__ring backdrop__ring--2" />
        <span className="backdrop__ring backdrop__ring--3" />
        <span className="backdrop__heart" />
      </div>
    </div>
  )
}
