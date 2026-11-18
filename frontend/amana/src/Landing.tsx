// Public landing page at "/". Presentational only: it explains Amana and links into the app.
// Visual style follows Paga's landing page: peach-to-orange hero, pill buttons, a black-to-navy
// gradient section with tilted cards, and a white phone-style card. Motion uses framer-motion
// and respects the user's reduced-motion setting.

import { motion, MotionConfig } from 'framer-motion'
import type { ReactNode } from 'react'
import { getSession } from './auth/session'
import { QuickSignIn } from './pages/QuickSignIn'

const ctaBtn =
  'inline-flex min-h-12 items-center justify-center rounded-full bg-[#f26522] px-7 text-base font-bold text-white no-underline shadow-[0_10px_30px_-8px_rgba(242,101,34,0.7)] hover:bg-[#e0560f]'
const lightBtn =
  'inline-flex min-h-12 items-center justify-center rounded-full bg-white/80 px-7 text-base font-semibold text-[#231f20] no-underline hover:bg-white'
const peachPill =
  'inline-flex min-h-11 items-center justify-center rounded-full bg-[#fde8dc] px-5 text-sm font-bold text-[#c2440b] no-underline hover:bg-[#fbd9c6]'

// Black at the top fading to deep navy, as in Paga's card section.
const navyGradient = 'linear-gradient(180deg, #0b0b0e 0%, #0a1431 40%, #0b2159 100%)'

const press = { whileHover: { scale: 1.05 }, whileTap: { scale: 0.96 } } as const

function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}

function PhoneCard() {
  return (
    <motion.div
      className="mx-auto w-full max-w-sm rounded-t-[2.5rem] border border-white/70 bg-white/60 p-3 pb-0 shadow-xl backdrop-blur"
      initial={{ opacity: 0, y: 60 }}
      animate={{ opacity: 1, y: [0, -10, 0] }}
      transition={{
        opacity: { duration: 0.8, delay: 0.5 },
        y: { duration: 5, delay: 1, repeat: Infinity, ease: 'easeInOut' },
      }}
    >
      <div className="grid gap-3 rounded-t-[2rem] bg-white p-4 text-[#231f20]">
        <div className="flex items-center gap-3 rounded-2xl bg-[#faf9f8] p-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#fff3ed] text-lg font-bold text-[#f26522]" aria-hidden="true">₦</span>
          <div>
            <p className="font-semibold">Funds held safely</p>
            <p className="text-sm text-[#5f5457]">Samsung phone · ₦180,000</p>
          </div>
        </div>
        <ol className="grid gap-2 text-sm">
          {[
            ['Terms accepted by both', true],
            ['Payment confirmed by Paga', true],
            ['Delivered by Chowdeck', true],
            ['Waiting for buyer to confirm', false],
          ].map(([label, done], i) => (
            <motion.li
              key={String(label)}
              className="flex items-center gap-2"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1 + i * 0.25, duration: 0.4 }}
            >
              <span
                className={`grid size-5 place-items-center rounded-full text-xs font-bold ${done ? 'bg-[#f26522] text-white' : 'border-2 border-[#f26522] text-[#f26522]'}`}
                aria-hidden="true"
              >
                {done ? '✓' : '…'}
              </span>
              <span className={done ? '' : 'font-semibold'}>{label}</span>
            </motion.li>
          ))}
        </ol>
        <p className="rounded-xl bg-[#fff3ed] p-3 text-sm font-semibold text-[#c2440b]">Release payment after you confirm</p>
      </div>
    </motion.div>
  )
}

// Cards in Paga's colours (orange and charcoal), slightly tilted. They straighten and lift on hover.
const stepTones = {
  orange: 'bg-[#f26522] text-white',
  charcoal: 'border border-white/15 bg-[#23262f] text-white',
} as const

function DarkStep({
  n,
  title,
  text,
  tone,
  rotate,
  delay,
}: {
  n: number
  title: string
  text: string
  tone: keyof typeof stepTones
  rotate: number
  delay: number
}) {
  return (
    <motion.li
      className={`grid min-h-52 content-start gap-2 rounded-3xl p-6 shadow-2xl ${stepTones[tone]}`}
      initial={{ opacity: 0, y: 60, rotate: 0 }}
      whileInView={{ opacity: 1, y: 0, rotate }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, delay, ease: 'easeOut' }}
      whileHover={{ rotate: 0, y: -12, scale: 1.04 }}
    >
      <span className="grid size-9 place-items-center rounded-full bg-white/20 text-sm font-bold">{n}</span>
      <h3 className="text-2xl font-extrabold">{title}</h3>
      <p className="text-white/85">{text}</p>
    </motion.li>
  )
}

function DealCard({ title, who, steps, delay }: { title: string; who: string; steps: string[]; delay: number }) {
  return (
    <Reveal delay={delay}>
      <motion.div
        className="grid h-full content-start gap-4 rounded-3xl border border-line bg-surface p-6 shadow-sm"
        whileHover={{ y: -6, boxShadow: '0 18px 40px -16px rgba(242,101,34,0.35)' }}
      >
        <div>
          <h3 className="text-xl font-bold">{title}</h3>
          <p className="text-muted">{who}</p>
        </div>
        <ol className="grid gap-2">
          {steps.map((s, i) => (
            <li key={s} className="flex gap-3 text-sm">
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-brand-soft text-xs font-bold text-brand-strong">{i + 1}</span>
              <span>{s}</span>
            </li>
          ))}
        </ol>
      </motion.div>
    </Reveal>
  )
}

function Section({ id, title, intro, children }: { id?: string; title: string; intro?: string; children: ReactNode }) {
  return (
    <section id={id} className="mx-auto grid w-full max-w-5xl gap-6 px-4 py-14">
      <Reveal className="grid gap-2">
        <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h2>
        {intro && <p className="max-w-2xl text-lg text-muted">{intro}</p>}
      </Reveal>
      {children}
    </section>
  )
}

const trustPoints = [
  ['The buyer holds the release', 'Delivery is only evidence. Money moves after the buyer confirms, or after an agreed window with no dispute.'],
  ['Payment is verified', 'A payment only counts after Paga confirms it. Saying "I paid" never moves a deal forward.'],
  ['One payout, never two', 'Each payout has a unique key, so a retry can never pay twice.'],
  ['Disputes pause the money', 'Either side can open a dispute before release. Payout is locked until an admin reviews the evidence.'],
  ['AI suggests, people decide', 'AI-written terms are labelled and never take effect until both parties approve.'],
  ['Everything is on the record', 'Every step is written to an audit log you can read on the agreement page.'],
]

export function Landing() {
  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-dvh bg-page">
        <motion.header
          className="sticky top-0 z-10 bg-surface/80 backdrop-blur"
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
            <span className="text-2xl font-extrabold tracking-tight text-brand">amana</span>
            <nav className="hidden items-center gap-8 text-base font-medium sm:flex" aria-label="Sections">
              <a href="#how" className="text-ink no-underline hover:text-brand">How it works</a>
              <a href="#deals" className="text-ink no-underline hover:text-brand">Deals</a>
              <a href="#trust" className="text-ink no-underline hover:text-brand">Why trust it</a>
            </nav>
            <div className="flex items-center gap-2">
              {getSession() ? (
                <motion.a href="/agreements" className={peachPill} {...press}>My agreements</motion.a>
              ) : (
                <>
                  <a href="/signin" className="px-3 py-2 text-base font-medium text-ink no-underline hover:text-brand">Log in</a>
                  <motion.a href="/signin" className={peachPill} {...press}>Sign up</motion.a>
                </>
              )}
            </div>
          </div>
        </motion.header>

        <section className="mx-auto w-full max-w-6xl px-3 pt-2">
          <div className="grid gap-8 overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#fde8dc] via-[#fbcdb1] to-[#f9b88f] px-5 pt-14 text-[#231f20] sm:px-12">
            <div className="mx-auto grid max-w-3xl justify-items-center gap-5 text-center">
              <motion.p
                className="rounded-full bg-white/60 px-4 py-1 text-sm font-bold uppercase tracking-wider text-[#c2440b]"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                Agree. Verify. Pay.
              </motion.p>
              <motion.h1
                className="text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-7xl"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
              >
                Money moves instantly. Trust should too.
              </motion.h1>
              <motion.p
                className="max-w-xl text-lg text-[#3d3638]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.35 }}
              >
                Amana holds the payment while two people complete a deal, and releases it only when the agreed outcome is
                verified. No one can move the money alone.
              </motion.p>
              <motion.div
                className="flex flex-wrap justify-center gap-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.5 }}
              >
                <motion.a href="/orders/new" className={ctaBtn} {...press}>Create a protected order</motion.a>
                <motion.a href="/contracts/new" className={lightBtn} {...press}>Start a contract</motion.a>
              </motion.div>
            </div>
            <PhoneCard />
          </div>
        </section>

        <QuickSignIn />

        <section id="how" className="mt-14 overflow-hidden text-white" style={{ background: navyGradient }}>
          <div className="mx-auto grid max-w-5xl gap-12 px-4 py-24">
            <Reveal className="grid gap-3 text-center">
              <h2 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl">A deal built for trust</h2>
              <p className="mx-auto max-w-2xl text-lg text-white/70">
                Every deal, from a phone sale to a website project, follows the same four steps.
              </p>
            </Reveal>
            <ol className="grid gap-5 py-4 sm:grid-cols-2 lg:grid-cols-4">
              <DarkStep n={1} tone="orange" rotate={-4} delay={0} title="Agree" text="Both people review the terms in plain language and each approves. Nothing starts until both say yes." />
              <DarkStep n={2} tone="charcoal" rotate={0} delay={0.12} title="Fund" text="The payer pays through Paga. Amana confirms the payment with Paga before the money counts as held." />
              <DarkStep n={3} tone="orange" rotate={3} delay={0.24} title="Verify" text="Delivery, test results or the buyer's confirmation prove the outcome. Evidence cannot be changed." />
              <DarkStep n={4} tone="charcoal" rotate={-2} delay={0.36} title="Pay" text="Once every condition is met, the payout is released one time only. Both sides get a receipt." />
            </ol>
            <Reveal className="text-center">
              <p className="font-semibold text-[#f9b88f]">Hover over a card</p>
            </Reveal>
          </div>
        </section>

        <Section
          id="deals"
          title="Two kinds of deal, one engine"
          intro="The same agreement record, status flow and payment rules power both. Quick orders can also start from WhatsApp."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <DealCard
              delay={0}
              title="TradeProof"
              who="A buyer pays a seller. A delivery partner brings the item."
              steps={[
                'The seller creates a protected order and shares the link.',
                'The buyer accepts the terms and pays. The money is held.',
                'The item is handed to Chowdeck for delivery.',
                'The buyer confirms they received it.',
                'Amana pays the seller.',
              ]}
            />
            <DealCard
              delay={0.12}
              title="Milestone contract"
              who="A client hires a freelancer and pays per milestone."
              steps={[
                'The client describes the project. AI suggests milestones and amounts.',
                'Both people review, edit and approve the terms.',
                'The client funds the full contract.',
                'The freelancer submits evidence, such as a GitHub pull request.',
                'Each milestone is paid when its conditions are met.',
              ]}
            />
          </div>
        </Section>

        <Section id="trust" title="Built so nobody has to just trust" intro="These rules are enforced by the backend, not by promises.">
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {trustPoints.map(([t, d], i) => (
              <motion.li
                key={t}
                className="grid content-start gap-1 rounded-3xl border border-line bg-surface p-5"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: (i % 3) * 0.1 }}
                whileHover={{ y: -4 }}
              >
                <h3 className="font-bold">{t}</h3>
                <p className="text-sm text-muted">{d}</p>
              </motion.li>
            ))}
          </ul>
        </Section>

        <section className="mx-auto w-full max-w-6xl px-3 pb-14">
          <Reveal>
            <div className="grid justify-items-center gap-4 rounded-[2rem] bg-gradient-to-br from-[#fde8dc] via-[#fbcdb1] to-[#f9b88f] px-6 py-14 text-center text-[#231f20]">
              <h2 className="max-w-xl text-3xl font-extrabold tracking-tight sm:text-5xl">Ready to try a protected deal?</h2>
              <p className="max-w-md text-[#3d3638]">Sign in with your phone number. It takes under two minutes to create an order.</p>
              <div className="flex flex-wrap justify-center gap-3">
                <motion.a href="/signin" className={ctaBtn} {...press}>Sign in with phone</motion.a>
                <motion.a href="/agreements" className={lightBtn} {...press}>My agreements</motion.a>
              </div>
            </div>
          </Reveal>
        </section>

        <footer className="text-white/70" style={{ background: '#0b2159' }}>
          <div className="mx-auto grid max-w-5xl gap-2 px-4 py-8 text-sm">
            <p>Amana. Agree. Verify. Pay.</p>
          </div>
        </footer>
      </div>
    </MotionConfig>
  )
}
