import { Nav } from '../nav/Nav'
import { HeroDesktop } from './HeroDesktop'
import { HeroMobile } from './HeroMobile'
import { HeroTablet } from './HeroTablet'

/**
 * All three layouts are rendered; CSS breakpoints pick one, so the right layout shows on first paint.
 * `leading-[normal]`: the design uses the browser's default line-height, not preflight's 1.5.
 */
export function Hero() {
  return (
    <div className="relative flex h-dvh flex-col overflow-hidden bg-bg font-body leading-[normal] text-fg">
      <Nav />
      <main className="flex min-h-0 flex-1 flex-col">
        <HeroDesktop />
        <HeroTablet />
        <HeroMobile />
      </main>
    </div>
  )
}
