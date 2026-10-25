type ArrowUpRightProps = {
  size?: number
  strokeWidth?: number
  className?: string
}

/** Decorative ↗ arrow. Colour comes from `currentColor`. */
export function ArrowUpRight({ size = 24, strokeWidth = 2.2, className }: ArrowUpRightProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <line x1="7" y1="17" x2="17" y2="7" />
      <polyline points="7 7 17 7 17 17" />
    </svg>
  )
}
