import { ArrowUpRight } from '../icons/ArrowUpRight'

type CtaRowVariant = 'tablet' | 'mobile'

type CtaRowProps = {
  number: string
  title: string
  href: string
  variant: CtaRowVariant
}

// Full class strings per variant so Tailwind can see them.
const STYLES: Record<CtaRowVariant, { row: string; number: string; title: string; arrow: number }> = {
  tablet: {
    row: 'py-[min(1.8vh,15px)]',
    number: 'text-[clamp(10px,1.2vw,12px)]',
    title: 'text-[clamp(19px,calc(1.7vw_+_1.7vh),30px)] tracking-heading',
    arrow: 24,
  },
  mobile: {
    row: 'py-2.5',
    number: 'text-[10px]',
    title: 'text-[clamp(17px,5.6vw,19px)] tracking-tight',
    arrow: 18,
  },
}

/** Numbered 01/02 row used on tablet + mobile. */
export function CtaRow({ number, title, href, variant }: CtaRowProps) {
  const styles = STYLES[variant]

  return (
    <a
      href={href}
      className={`flex items-center justify-between border-b border-line text-fg transition-colors duration-150 hover:text-accent ${styles.row}`}
    >
      <span className="flex flex-col gap-[3px]">
        <span className={`font-body font-semibold tracking-label text-fg-muted ${styles.number}`}>{number}</span>
        <span className={`font-display font-bold ${styles.title}`}>{title}</span>
      </span>
      <ArrowUpRight size={styles.arrow} strokeWidth={2.2} className="shrink-0" />
    </a>
  )
}
