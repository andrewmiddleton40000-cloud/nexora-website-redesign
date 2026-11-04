import { useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { academy, academyFaqs, approach, howItWorks, reasons, schoolModel } from '@/data/academy'
import { img, imgSet } from '@/data/site'
import { academySeo } from '@/lib/academy-seo'
import { loadCatalogue } from '@/lib/academy-catalogue'
import { publishedTestimonials } from '@/server/fns/public'
import { SectionHead } from '@/components/Sections'
import { CourseAction, availabilityLabel } from '@/components/academy/CourseCard'
import { Badge, Price } from '@/components/academy/ui'

export const Route = createFileRoute('/academy/')({
  loader: async () => {
    const [{ courses }, testimonials] = await Promise.all([loadCatalogue(), publishedTestimonials().catch(() => [])])
    return { courses, testimonials }
  },
  head: () =>
    academySeo({
      path: '/academy',
      description:
        'Learn practical artificial intelligence, coding and digital innovation skills with Nexora Digital Academy — live online classes, recorded lessons and real projects for beginners and secondary-school students.',
    }),
  component: AcademyHome,
})

function AcademyHome() {
  const { courses, testimonials } = Route.useLoaderData()
  const featured = courses.slice(0, 5)
  return (
    <>
      {/* 1 — Hero */}
      <section className="relative overflow-hidden bg-ink text-paper">
        <div className="wrap grid gap-12 pt-16 pb-16 md:grid-cols-12 md:pt-24 md:pb-24">
          <div className="md:col-span-7 md:self-center">
            <p className="eyebrow rise !text-signal">{academy.tagline}</p>
            <h1 className="display rise rise-2 mt-6 text-[3rem] leading-[0.95] md:text-7xl lg:text-[5.6rem]">
              Learn the digital skills <span className="serif text-signal">shaping tomorrow.</span>
            </h1>
            <p className="rise rise-3 mt-8 max-w-xl text-lg leading-relaxed text-paper/75">
              Develop practical skills in artificial intelligence, coding and digital innovation through structured learning, expert instruction and
              real-world projects.
            </p>
            <div className="rise rise-3 mt-10 flex flex-wrap gap-3">
              <Link to="/academy/courses" className="btn btn-signal">
                Explore Courses <span className="arrow" aria-hidden="true">→</span>
              </Link>
              <Link to="/academy/schools" className="btn btn-ghost hover:!border-paper hover:!bg-paper hover:!text-ink">
                Partner With Us
              </Link>
            </div>
          </div>
          <div className="rise rise-2 md:col-span-5">
            <div className="aspect-[4/5] overflow-hidden bg-ink-soft md:aspect-[4/5]">
              <img
                src={img('academy/hero.jpg', 900)}
                srcSet={imgSet('academy/hero.jpg', [480, 720, 960, 1260])}
                sizes="(min-width: 768px) 40vw, 100vw"
                alt="Secondary-school students gathered around a laptop in a classroom"
                fetchPriority="high"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
        <div className="border-t border-line-dark">
          <dl className="wrap grid grid-cols-2 gap-6 py-8 text-sm md:grid-cols-4">
            {[
              ['5', 'progressive levels'],
              ['Live', 'online classes + recordings'],
              ['Projects', 'in every course'],
              ['Verifiable', 'certificates of completion'],
            ].map(([a, b]) => (
              <div key={b}>
                <dt className="text-2xl font-medium tracking-[-0.02em] text-paper">{a}</dt>
                <dd className="mt-1 text-paper/60">{b}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* 2 — Introduction */}
      <section className="wrap py-24 md:py-32">
        <SectionHead
          index="01"
          label="The Academy"
          title={
            <>
              A practical school for the <span className="serif text-forest">digital age.</span>
            </>
          }
          intro={`${academy.name} is the education arm of Nexora Technologies. We bring the same practical, problem-first thinking we use to build digital systems for businesses into structured courses for learners — starting with complete beginners.`}
        />
        <div className="mt-16 grid gap-10 md:grid-cols-12">
          <div className="aspect-[3/2] overflow-hidden bg-paper-deep md:col-span-7">
            <img
              src={img('academy/instructor.jpg', 1000)}
              srcSet={imgSet('academy/instructor.jpg', [480, 800, 1200])}
              sizes="(min-width: 768px) 55vw, 100vw"
              alt="An instructor guiding teenagers working on laptops"
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="space-y-6 text-lg leading-relaxed text-ink-soft md:col-span-4 md:col-start-9 md:self-end">
            <p>
              Our courses are taught live online by instructors and supported by recorded lessons, so learners can attend at home, at school or catch
              up later.
            </p>
            <p>Every level ends with a real project. Learners leave with skills they can use — and work they can show.</p>
            <Link to="/academy/courses" className="link inline-block text-base">
              See the five-level pathway →
            </Link>
          </div>
        </div>
      </section>

      {/* 3 — Why Nexora */}
      <section className="border-t border-line bg-white">
        <div className="wrap py-24 md:py-32">
          <SectionHead index="02" label="Why learn with Nexora" title={<>Serious about learning. <span className="serif">Welcoming to beginners.</span></>} />
          <ol className="mt-16 grid border-t border-ink md:grid-cols-3">
            {reasons.map((r, i) => (
              <li key={r.title} className="border-b border-line py-8 md:px-8 md:[&:nth-child(3n+1)]:pl-0 md:[&:not(:nth-child(3n))]:border-r">
                <span className="text-sm tabular-nums text-muted">0{i + 1}</span>
                <h3 className="mt-4 text-xl font-medium tracking-[-0.01em]">{r.title}</h3>
                <p className="mt-3 leading-relaxed text-muted">{r.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 4 — Featured courses */}
      <section className="wrap py-24 md:py-32">
        <SectionHead
          index="03"
          label="Courses"
          title={
            <>
              Five levels. <span className="serif text-forest">One clear path.</span>
            </>
          }
          intro="Start with AI & Prompt Engineering. Each later level opens once your completion of the previous level has been verified, and is enrolled separately."
        />
        <ol className="mt-16 border-t border-ink">
          {featured.map((c) => {
            const label = availabilityLabel(c)
            return (
              <li key={c.slug} className="group border-b border-line">
                <div className="grid gap-4 py-8 md:grid-cols-12 md:items-center md:gap-10">
                  <span className="text-sm tabular-nums text-muted md:col-span-1">L{c.level}</span>
                  <div className="md:col-span-6">
                    <Link to="/academy/courses/$slug" params={{ slug: c.slug }} className="display text-[1.9rem] transition-colors group-hover:text-forest md:text-4xl">
                      {c.title}
                    </Link>
                    <p className="mt-2 leading-relaxed text-muted">{c.summary}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 md:col-span-2">
                    <Badge tone={label.tone}>{label.text}</Badge>
                    <span className="text-xs uppercase tracking-[0.14em] text-muted">{c.levelLabel}</span>
                  </div>
                  <div className="md:col-span-3 md:text-right">
                    {c.priceKobo ? (
                      <p className="mb-3 text-xl font-medium">
                        <Price kobo={c.priceKobo} />
                        {c.durationLabel && <span className="ml-2 text-sm font-normal text-muted">· {c.durationLabel}</span>}
                      </p>
                    ) : null}
                    <CourseAction c={c} />
                  </div>
                </div>
              </li>
            )
          })}
        </ol>
      </section>

      {/* 5 — Learning approach */}
      <section className="bg-ink text-paper">
        <div className="wrap py-24 md:py-32">
          <SectionHead tone="dark" index="04" label="Our learning approach" title={<>Learn it. Practise it. <span className="serif text-signal">Build with it.</span></>} />
          <div className="mt-16 grid gap-12 md:grid-cols-12">
            <ol className="grid gap-px bg-line-dark sm:grid-cols-2 md:col-span-7">
              {approach.map((a, i) => (
                <li key={a.title} className="bg-ink p-8">
                  <span className="text-sm text-signal">0{i + 1}</span>
                  <h3 className="mt-6 text-2xl font-medium">{a.title}</h3>
                  <p className="mt-3 leading-relaxed text-paper/65">{a.body}</p>
                </li>
              ))}
            </ol>
            <div className="md:col-span-5">
              <div className="aspect-[4/5] overflow-hidden bg-ink-soft">
                <img
                  src={img('academy/online-class.jpg', 800)}
                  srcSet={imgSet('academy/online-class.jpg', [480, 800, 1000])}
                  sizes="(min-width: 768px) 38vw, 100vw"
                  alt="A student wearing headphones attending a live online class on a laptop at home"
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6 — How learning works */}
      <section className="wrap py-24 md:py-32">
        <SectionHead index="05" label="How learning works" title={<>From registration to <span className="serif text-forest">certificate.</span></>} />
        <ol className="mt-16 grid gap-0 border-t border-ink md:grid-cols-5">
          {howItWorks.map((s) => (
            <li key={s.number} className="border-b border-line py-8 md:border-r md:px-6 md:first:pl-0 md:last:border-r-0">
              <span className="display text-5xl text-forest">{s.number}</span>
              <h3 className="mt-6 text-lg font-medium">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* 7 — School partnerships */}
      <section className="border-t border-line bg-forest text-paper">
        <div className="wrap grid gap-12 py-24 md:grid-cols-12 md:py-32">
          <div className="md:col-span-6">
            <p className="eyebrow !text-paper/60">(06) For schools</p>
            <h2 className="display mt-6 text-[2.6rem] md:text-6xl">
              Bring digital skills to your <span className="serif text-signal">whole year group.</span>
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-paper/75">
              We partner with secondary schools to deliver organised online classes. Nexora provides the teaching; your school coordinates participation.
              Participation is always voluntary, with parent or guardian involvement for every minor.
            </p>
            <Link to="/academy/schools" className="btn btn-signal mt-10">
              Explore school partnerships <span className="arrow" aria-hidden="true">→</span>
            </Link>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 md:col-span-5 md:col-start-8">
            <div>
              <p className="eyebrow !text-signal">Nexora provides</p>
              <ul className="mt-4 space-y-3 text-paper/85">
                {schoolModel.nexora.map((x) => (
                  <li key={x} className="border-b border-paper/15 pb-3">{x}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="eyebrow !text-signal">Your school</p>
              <ul className="mt-4 space-y-3 text-paper/85">
                {schoolModel.school.map((x) => (
                  <li key={x} className="border-b border-paper/15 pb-3">{x}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 8 — Testimonials */}
      <section className="wrap py-24 md:py-32">
        <SectionHead index="07" label="Learner voices" title={<>In their <span className="serif text-forest">own words.</span></>} />
        {testimonials.length ? (
          <ul className="mt-16 grid gap-10 md:grid-cols-3">
            {testimonials.map((t) => (
              <li key={t.id} className="border-t border-ink pt-6">
                <blockquote className="serif text-2xl leading-snug">“{t.quote}”</blockquote>
                <p className="mt-6 text-sm font-medium">{t.name}</p>
                {t.context && <p className="text-sm text-muted">{t.context}</p>}
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-16 grid gap-8 border-t border-ink pt-8 md:grid-cols-12">
            <p className="serif text-3xl leading-snug md:col-span-7">Our first cohorts are getting started.</p>
            <p className="leading-relaxed text-muted md:col-span-5">
              We publish learner and parent feedback only with their written permission, so this space will fill with real stories as our first learners
              complete their courses. We will never use invented testimonials.
            </p>
          </div>
        )}
      </section>

      {/* 9 — FAQ */}
      <section className="border-t border-line bg-white" id="faq">
        <div className="wrap py-24 md:py-32">
          <SectionHead index="08" label="Questions" title={<>Frequently asked <span className="serif">questions.</span></>} />
          <Faq />
        </div>
      </section>

      {/* 10 — Final CTA */}
      <section className="bg-ink text-paper">
        <div className="wrap grid gap-12 py-24 md:grid-cols-12 md:py-32">
          <div className="md:col-span-8">
            <p className="eyebrow !text-paper/55">Start learning</p>
            <h2 className="display mt-6 text-[2.9rem] md:text-7xl">
              Your first level starts with <span className="serif text-signal">one good prompt.</span>
            </h2>
          </div>
          <div className="md:col-span-4 md:self-end">
            <p className="text-lg leading-relaxed text-paper/70">Create your account, choose your course and join the next cohort.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/academy/register" className="btn btn-signal">
                Register now <span className="arrow" aria-hidden="true">→</span>
              </Link>
              <Link to="/academy/schools" className="btn btn-ghost hover:!border-paper hover:!bg-paper hover:!text-ink">
                Partner With Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

function Faq() {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <dl className="mt-16 border-t border-ink md:ml-[25%]">
      {academyFaqs.map((f, i) => (
        <div key={f.q} className="border-b border-line">
          <dt>
            <button
              type="button"
              className="flex w-full items-baseline justify-between gap-6 py-6 text-left text-xl font-medium tracking-[-0.01em]"
              aria-expanded={open === i}
              aria-controls={`faq-${i}`}
              onClick={() => setOpen(open === i ? null : i)}
            >
              {f.q}
              <span className="text-muted" aria-hidden="true">
                {open === i ? '−' : '+'}
              </span>
            </button>
          </dt>
          <dd id={`faq-${i}`} hidden={open !== i} className="max-w-2xl pb-8 leading-relaxed text-ink-soft">
            {f.a}
          </dd>
        </div>
      ))}
    </dl>
  )
}
