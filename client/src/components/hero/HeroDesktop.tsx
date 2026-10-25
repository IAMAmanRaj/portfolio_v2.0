import { ArrowUpRight } from '../icons/ArrowUpRight'
import { Portrait } from './Portrait'

const GREETING = 'pointer-events-none absolute top-[15%] z-0 whitespace-nowrap font-serif text-[clamp(72px,10vw,190px)] font-light italic text-fg'

/** ≥1024px */
export function HeroDesktop() {
  return (
    <div className="relative mx-auto hidden min-h-0 w-full max-w-[1340px] flex-1 flex-col items-center justify-end px-7 lg:flex">
      <div className="relative flex min-h-0 w-full flex-1 translate-x-[40px] items-stretch justify-center">
        <p className={`${GREETING} right-[70%] left-[210px] text-right`}>Hey,</p>
        <p className={`${GREETING} right-5 left-[63%] text-left`}>there</p>

        {/* Left column */}
        <div className="relative min-w-0 flex-1">
          <h1 className="absolute right-3 bottom-5 -left-4 z-2 text-left font-display text-[clamp(52px,7vw,138px)] leading-[0.94] font-semibold tracking-tightest whitespace-nowrap text-fg select-none">
            I AM
            <br />
            Aman Raj
          </h1>
          <a
            href="#about"
            className="absolute top-1/2 -left-3.5 z-3 flex translate-y-7 items-center gap-[7px] border-b border-transparent pb-0.5 font-display text-[19px] font-medium tracking-snug whitespace-nowrap text-fg transition-colors duration-150 hover:border-fg"
          >
            About me
            <ArrowUpRight size={18} strokeWidth={2.2} className="relative -top-px" />
          </a>
        </div>

        <Portrait variant="desktop" />

        {/* Right column */}
        <div className="relative min-w-0 flex-1">
          <p className="absolute bottom-[70px] left-2.5 z-0 text-left font-display text-[clamp(28px,3.6vw,62px)] leading-[0.98] font-bold tracking-tighter whitespace-nowrap text-fg select-none">
            Frontend
            <br />
            Engineer
          </p>
          {/* Left offset shrinks near 1024px so the link isn't cut off at the right edge */}
          <a
            href="#blog"
            className="absolute top-1/2 left-[min(20px,calc(100%_-_188px))] z-3 flex -translate-y-1/2 items-center gap-[7px] border-b border-fg pb-0.5 font-display text-[19px] font-semibold tracking-snug whitespace-nowrap text-fg transition-colors duration-150 hover:border-accent hover:text-accent"
          >
            Read my blogs
            <ArrowUpRight size={20} strokeWidth={2.6} className="relative -top-px" />
          </a>
        </div>
      </div>
    </div>
  )
}
