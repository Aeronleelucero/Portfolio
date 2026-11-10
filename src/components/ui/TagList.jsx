/** Compact list of technology tags. */
export default function TagList({ items, label, className = '' }) {
  return (
    <ul className={`tags ${className}`.trim()} aria-label={label}>
      {items.map((item) => (
        <li key={item} className="tag">
          {item}
        </li>
      ))}
    </ul>
  )
}
