import { CtaRow } from './CtaRow'
import { Portrait } from './Portrait'

/** 768–1023px */
export function HeroTablet() {
  return (
    <div className="relative mx-auto hidden min-h-0 w-full max-w-[1000px] flex-1 flex-col justify-center gap-[min(4vh,34px)] overflow-hidden px-14 py-[2vh] md:flex lg:hidden">
      <div className="grid grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] items-center gap-x-[min(5vw,48px)]">
        {/* Text */}
        <div>
          <p className="font-serif text-[clamp(28px,calc(2.2vw_+_2.2vh),42px)] leading-none font-light text-fg italic">
            Hey, there
          </p>
          <div aria-hidden="true" className="my-[min(1.8vh,14px)] h-0.5 w-[34px] bg-accent" />
          <h1 className="font-display text-[clamp(38px,calc(3.4vw_+_3.4vh),66px)] leading-[0.95] font-bold tracking-display text-fg">
            I AM
            <br />
            Aman Raj
          </h1>
          <p className="mt-[min(1.6vh,12px)] font-body text-[clamp(12px,1.4vw,15px)] font-semibold tracking-caps text-fg-muted uppercase">
            Frontend Engineer
          </p>

          <div className="mt-[min(3.4vh,28px)]">
            <h2 className="font-body text-[clamp(10px,1.2vw,12px)] font-semibold tracking-eyebrow text-fg-muted uppercase">
              About me
            </h2>
            <p className="mt-[min(1.2vh,9px)] font-display text-[clamp(14px,calc(1.1vw_+_1.1vh),20px)] leading-[1.4] font-medium tracking-snug text-fg">
              I build clean, responsive and user-focused <span className="text-accent">web experiences</span> with
              modern technologies.
            </p>
            <a
              href="#about"
              aria-label="More about me"
              className="mt-[min(1.6vh,12px)] inline-flex items-center gap-1.5 border-b border-fg pb-px font-display text-[clamp(13px,1.5vw,16px)] font-semibold text-fg transition-colors duration-150 hover:border-accent hover:text-accent"
            >
              more <span aria-hidden="true" className="text-[0.85em]">↗</span>
            </a>
          </div>
        </div>

        <Portrait variant="tablet" />
      </div>

      <div className="flex flex-col">
        <CtaRow variant="tablet" number="01" title="View my work" href="#projects" />
        <CtaRow variant="tablet" number="02" title="Read my blogs" href="#blog" />
      </div>
    </div>
  )
}
