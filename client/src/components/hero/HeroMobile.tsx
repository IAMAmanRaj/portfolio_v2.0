import { CtaRow } from './CtaRow'
import { Portrait } from './Portrait'

/** <768px */
export function HeroMobile() {
  return (
    <div className="relative mx-auto flex min-h-0 w-full flex-1 flex-col justify-center gap-[2.4vh] overflow-hidden px-[22px] py-[1.5vh] md:hidden">
      {/* Intro */}
      <div>
        <p className="font-serif text-[clamp(21px,6.4vw,27px)] leading-none font-light text-fg italic">Hey, there</p>
        <div aria-hidden="true" className="my-2.5 h-0.5 w-6 bg-accent" />
        <h1 className="font-display text-[clamp(29px,9.5vw,37px)] leading-[0.98] font-bold tracking-tighter text-fg">
          I AM
          <br />
          Aman Raj
        </h1>
        <p className="mt-2 font-body text-[11px] font-semibold tracking-eyebrow text-fg-muted uppercase">
          Frontend Engineer
        </p>
      </div>

      <Portrait variant="mobile" />

      {/* About */}
      <div>
        <h2 className="font-body text-[10px] font-semibold tracking-eyebrow text-fg-muted uppercase">About me</h2>
        <p className="mt-1.5 font-display text-[clamp(13px,3.7vw,14.5px)] leading-[1.32] font-medium tracking-snug text-fg">
          I build clean, responsive and user-focused <span className="text-accent">web experiences</span> with modern
          technologies.
        </p>
        <a
          href="#about"
          aria-label="More about me"
          className="mt-2 inline-flex items-center gap-[5px] border-b border-fg pb-px font-display text-[12px] font-semibold text-fg transition-colors duration-150 hover:border-accent hover:text-accent"
        >
          more <span aria-hidden="true" className="text-[11px]">↗</span>
        </a>
      </div>

      <div className="flex flex-col">
        <CtaRow variant="mobile" number="01" title="View my work" href="#projects" />
        <CtaRow variant="mobile" number="02" title="Read my blogs" href="#blog" />
      </div>
    </div>
  )
}
