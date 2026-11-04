import { Link, createFileRoute } from '@tanstack/react-router'
import { safeguarding } from '@/data/academy'
import { academySeo } from '@/lib/academy-seo'
import { PageIntro } from '@/components/academy/ui'

export const Route = createFileRoute('/academy/safeguarding')({
  head: () => academySeo({ title: 'Safeguarding & Privacy', path: '/academy/safeguarding', description: 'How Nexora Digital Academy protects learners, including minors: guardian consent, minimal data, restricted access and safe communication.' }),
  component: Safeguarding,
})

function Safeguarding() {
  return (
    <>
      <PageIntro eyebrow="Safeguarding & privacy" title={<>Safe learning, <span className="serif text-forest">by design.</span></>} intro="Many of our learners are secondary-school students. These are the commitments we make to them, their families and their schools." />
      <section className="wrap pb-20">
        <ol className="border-t border-ink">
          {safeguarding.map((s, i) => (
            <li key={s.title} className="grid gap-4 border-b border-line py-8 md:grid-cols-12 md:gap-10">
              <span className="text-sm tabular-nums text-muted md:col-span-1">0{i + 1}</span>
              <h2 className="text-2xl font-medium tracking-[-0.01em] md:col-span-4">{s.title}</h2>
              <p className="text-lg leading-relaxed text-ink-soft md:col-span-7">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>
      <section className="border-t border-line bg-white">
        <div className="wrap grid gap-12 py-20 md:grid-cols-12">
          <div className="md:col-span-4"><p className="eyebrow">Your data</p></div>
          <div className="space-y-5 text-lg leading-relaxed text-ink-soft md:col-span-8">
            <p><strong className="font-medium text-ink">What we collect:</strong> name, email, phone number, country, school (optional), course choice, age group (under 18 or adult) and, for minors, a parent or guardian’s name, relationship and contact details. We also store your course activity — lessons completed, submissions, assessment results and attendance — to run the course and issue certificates.</p>
            <p><strong className="font-medium text-ink">Who can see it:</strong> you; authorised Nexora staff; your instructor (for learners in their class); and, if you joined through a partner school, that school’s representatives can see your name, course and progress — never your contact details or payments.</p>
            <p><strong className="font-medium text-ink">Payments:</strong> card payments are handled by our payment provider. We never see or store card numbers.</p>
            <p><strong className="font-medium text-ink">Your choices:</strong> you, or your parent or guardian, can ask us to correct or delete your information at any time through the <Link to="/academy/contact" className="link">Academy contact page</Link>.</p>
            <p><strong className="font-medium text-ink">Reporting a concern:</strong> if you are worried about the safety or wellbeing of a learner, contact us and choose “Safeguarding concern”. If someone is in immediate danger, contact the emergency services first.</p>
          </div>
        </div>
      </section>
    </>
  )
}
