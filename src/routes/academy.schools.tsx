import { createFileRoute } from '@tanstack/react-router'
import { schoolModel } from '@/data/academy'
import { img, imgSet } from '@/data/site'
import { academySeo } from '@/lib/academy-seo'
import { SectionHead } from '@/components/Sections'
import { SchoolEnquiryForm } from '@/components/academy/SchoolEnquiryForm'

export const Route = createFileRoute('/academy/schools')({
  head: () =>
    academySeo({
      title: 'School Partnerships',
      path: '/academy/schools',
      description: 'Partner with Nexora Digital Academy to deliver organised online AI and digital skills classes to your secondary-school students.',
    }),
  component: SchoolsPage,
})

const steps = [
  { n: '01', t: 'Introductory conversation', b: 'We discuss your students, timetable, facilities and goals.' },
  { n: '02', t: 'Partnership agreement', b: 'We agree the programme, class schedule and responsibilities in writing.' },
  { n: '03', t: 'Parent & guardian information', b: 'Your school shares programme details; families decide whether their child takes part.' },
  { n: '04', t: 'Registration', b: 'Participating students register with your school code and guardian consent.' },
  { n: '05', t: 'Online classes', b: 'Nexora instructors teach live online classes, organised through your school.' },
  { n: '06', t: 'Reports & certificates', b: 'Your school receives approved progress reports; successful learners receive certificates.' },
]

function SchoolsPage() {
  return (
    <>
      <section className="bg-ink text-paper">
        <div className="wrap grid gap-12 pt-16 pb-20 md:grid-cols-12 md:pt-24 md:pb-28">
          <div className="md:col-span-7">
            <p className="eyebrow rise !text-signal">School partnership programme</p>
            <h1 className="display rise rise-2 mt-6 text-[2.8rem] md:text-7xl">
              Partner With Nexora. <span className="serif text-signal">Prepare Your Students for the Digital Future.</span>
            </h1>
            <p className="rise rise-3 mt-8 max-w-xl text-lg leading-relaxed text-paper/75">
              We work with secondary schools to deliver organised, online digital education — so your students gain practical AI and technology skills without
              your school having to build a programme from scratch.
            </p>
            <a href="#enquire" className="btn btn-signal rise rise-3 mt-10">
              Make a partnership enquiry <span className="arrow" aria-hidden="true">→</span>
            </a>
          </div>
          <div className="rise rise-2 md:col-span-5">
            <div className="aspect-[4/5] overflow-hidden bg-ink-soft">
              <img src={img('academy/classroom.jpg', 900)} srcSet={imgSet('academy/classroom.jpg', [480, 800, 1200])} sizes="(min-width: 768px) 40vw, 100vw" alt="Students working at computers in a school computer lab" className="h-full w-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      <section className="wrap py-24 md:py-32">
        <SectionHead index="01" label="Partnership model" title={<>Clear roles. <span className="serif text-forest">Shared purpose.</span></>} />
        <div className="mt-16 grid gap-12 md:grid-cols-2">
          <div className="border-t border-ink pt-6">
            <p className="eyebrow">Nexora provides</p>
            <ul className="mt-5 divide-y divide-line">
              {schoolModel.nexora.map((x) => (
                <li key={x} className="py-4 text-lg">{x}</li>
              ))}
            </ul>
          </div>
          <div className="border-t border-ink pt-6">
            <p className="eyebrow">Your school</p>
            <ul className="mt-5 divide-y divide-line">
              {schoolModel.school.map((x) => (
                <li key={x} className="py-4 text-lg">{x}</li>
              ))}
            </ul>
          </div>
        </div>
        <ul className="mt-16 grid gap-px bg-line md:grid-cols-4">
          {[
            ['Online, organised through your school', 'Classes run live online at agreed times. Your school chooses where students join — the computer lab, a classroom or at home.'],
            ['Whole year groups or school-wide', 'Offer the programme to an entire eligible year group, several year groups or your whole school population.'],
            ['Always voluntary', 'Participation is a choice for each student and family. No student is required to enrol.'],
            ['Families involved', 'Every learner under 18 needs parent or guardian consent before their enrolment is activated.'],
          ].map(([t, b]) => (
            <li key={t} className="bg-paper p-7">
              <h3 className="text-lg font-medium leading-snug">{t}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{b}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-t border-line bg-white">
        <div className="wrap py-24 md:py-32">
          <SectionHead index="02" label="How it works" title={<>From first call to <span className="serif">first class.</span></>} />
          <ol className="mt-16 grid border-t border-ink sm:grid-cols-2 md:grid-cols-3">
            {steps.map((s) => (
              <li key={s.n} className="border-b border-line py-8 sm:pr-8">
                <span className="display text-4xl text-forest">{s.n}</span>
                <h3 className="mt-5 text-lg font-medium">{s.t}</h3>
                <p className="mt-2 leading-relaxed text-muted">{s.b}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="wrap grid gap-12 py-24 md:grid-cols-12 md:py-32">
        <div className="md:col-span-5">
          <p className="eyebrow">(03) For school leaders</p>
          <h2 className="display mt-5 text-4xl md:text-5xl">
            What your school <span className="serif text-forest">receives.</span>
          </h2>
          <ul className="mt-8 space-y-4 border-t border-ink pt-6 leading-relaxed">
            <li>A private school dashboard showing registrations, enrolments, cohorts and progress for your own students only.</li>
            <li>Approved academic reports for each cohort.</li>
            <li>A unique school code so your students are correctly linked to your school.</li>
            <li>A named Nexora contact for coordination and safeguarding questions.</li>
          </ul>
          <p className="mt-8 text-sm leading-relaxed text-muted">
            Commercial terms are agreed privately with each partner school as part of the written partnership agreement.
          </p>
        </div>
        <div className="md:col-span-6 md:col-start-7">
          <div className="aspect-[3/2] overflow-hidden bg-paper-deep">
            <img src={img('academy/project.jpg', 900)} srcSet={imgSet('academy/project.jpg', [480, 800, 1200])} sizes="(min-width: 768px) 45vw, 100vw" alt="Two students presenting a project from a laptop to classmates" loading="lazy" className="h-full w-full object-cover" />
          </div>
        </div>
      </section>

      <section id="enquire" className="border-t border-line bg-white">
        <div className="wrap grid gap-12 py-24 md:grid-cols-12 md:py-32">
          <div className="md:col-span-4">
            <p className="eyebrow">(04) Enquire</p>
            <h2 className="display mt-5 text-4xl md:text-5xl">
              Start a <span className="serif text-forest">conversation.</span>
            </h2>
            <p className="mt-6 leading-relaxed text-muted">Tell us about your school. We reply to every enquiry from a school representative.</p>
          </div>
          <div className="md:col-span-8">
            <SchoolEnquiryForm />
          </div>
        </div>
      </section>
    </>
  )
}
