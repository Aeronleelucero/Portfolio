/**
 * Button / link with consistent styling.
 * Renders an <a> when `href` is given, otherwise a <button>.
 */
export default function Button({
  href,
  variant = 'primary',
  icon: Icon,
  iconPosition = 'end',
  children,
  className = '',
  external = false,
  ...rest
}) {
  const classes = `btn btn--${variant} ${className}`.trim()
  const content = (
    <>
      {Icon && iconPosition === 'start' && <Icon className="btn__icon" aria-hidden="true" size={18} strokeWidth={1.6} />}
      <span className="btn__label">{children}</span>
      {Icon && iconPosition === 'end' && <Icon className="btn__icon" aria-hidden="true" size={18} strokeWidth={1.6} />}
    </>
  )

  if (href) {
    const externalProps = external ? { target: '_blank', rel: 'noopener noreferrer' } : {}
    return (
      <a href={href} className={classes} {...externalProps} {...rest}>
        {content}
      </a>
    )
  }

  return (
    <button type="button" className={classes} {...rest}>
      {content}
    </button>
  )
}
