import amanCutout from '../../assets/images/aman-cutout.png'

type PortraitVariant = 'desktop' | 'tablet' | 'mobile'

// Full class strings per variant so Tailwind can see them.
const STYLES: Record<PortraitVariant, { wrapper?: string; grid?: string; img: string }> = {
  desktop: {
    img: 'relative top-[170px] z-1 -mx-10 block h-[118%] w-auto max-w-[66vw] shrink-0 self-end object-contain mask-b-from-88%',
  },
  tablet: {
    wrapper: 'relative ml-auto w-max max-w-full pr-[42px] pl-[34px]',
    grid: 'pointer-events-none absolute inset-[-6%_0_0_0] z-0 bg-blueprint bg-size-[24px_24px]',
    img: 'relative z-1 mx-auto block h-auto w-[min(40vh,27vw,340px)] mask-b-from-70%',
  },
  mobile: {
    // content-box: 54% / 220px size the image itself; padding sits outside (as in the reference).
    // Short phones (≤700px tall) cap the width so the CTAs still fit without clipping.
    wrapper: 'relative mx-auto box-content w-[54%] max-w-[220px] px-5 pt-2 pb-1.5 [@media(max-height:700px)]:max-w-[24vh]',
    grid: 'pointer-events-none absolute inset-[-4%_-12%_-2%_-12%] z-0 bg-blueprint bg-size-[16px_16px]',
    img: 'relative z-1 block h-auto w-full object-contain mask-b-from-90%',
  },
}

export function Portrait({ variant }: { variant: PortraitVariant }) {
  const styles = STYLES[variant]

  const img = (
    <img
      src={amanCutout}
      alt="Aman Raj"
      width={1888}
      height={2256}
      className={styles.img}
    />
  )

  if (!styles.wrapper) return img

  // Grid (z-0) must stay behind the portrait (z-1).
  return (
    <div className={styles.wrapper}>
      <div aria-hidden="true" className={styles.grid} />
      {img}
    </div>
  )
}
