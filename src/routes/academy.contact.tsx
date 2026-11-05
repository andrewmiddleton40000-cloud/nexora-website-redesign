import { useState, type FormEvent } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { site } from '@/data/site'
import { academySeo } from '@/lib/academy-seo'
import { submitNetlifyForm } from '@/lib/netlify-form'
import { WhatsAppIcon } from '@/components/WhatsApp'
import { Alert, Field, PageIntro } from '@/components/academy/ui'

export const Route = createFileRoute('/academy/contact')({
  head: () => academySeo({ title: 'Contact', path: '/academy/contact', description: 'Contact Nexora Digital Academy about courses, enrolment, payments or school partnerships.' }),
  component: AcademyContact,
})

const topics = ['Course information', 'Registration or sign-in help', 'Payment question', 'Parent / guardian question', 'School partnership', 'Safeguarding concern', 'Other']

function AcademyContact() {
  const [state, setState] = useState<'idle' | 'pending' | 'success' | 'error' | 'invalid'>('idle')
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const f = new FormData(form)
    if (!String(f.get('email') ?? '').trim() && !String(f.get('phone') ?? '').trim()) return setState('invalid')
    setState('pending')
    try {
      await submitNetlifyForm(form)
      form.reset()
      setState('success')
    } catch {
      setState('error')
    }
  }
  return (
    <>
      <PageIntro eyebrow="Academy contact" title={<>Questions about learning? <span className="serif text-gradient pr-1">Ask us.</span></>} intro="Learners, parents, guardians and schools can reach the Academy team here. For quick questions, WhatsApp is usually fastest." />
      <section className="wrap grid gap-14 pb-24 md:grid-cols-12">
        <aside className="space-y-8 md:col-span-4">
          <div className="border-t border-ink pt-5">
            <p className="eyebrow">WhatsApp</p>
            <p className="mt-3 text-2xl font-medium tabular-nums">{site.whatsapp.display}</p>
            <a href={site.whatsapp.url} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp mt-5">
              <WhatsAppIcon /> Chat on WhatsApp
            </a>
          </div>
          <div className="border-t border-ink pt-5">
            <p className="eyebrow">Phone</p>
            <a href={`tel:${site.phone.tel}`} className="mt-3 block text-2xl font-medium tabular-nums hover:text-forest">
              {site.phone.display}
            </a>
          </div>
          {site.email && (
            <div className="border-t border-ink pt-5">
              <p className="eyebrow">Email</p>
              <a href={`mailto:${site.email}`} className="link mt-3 inline-block text-lg">{site.email}</a>
            </div>
          )}
          <div className="border-t border-ink pt-5 text-sm leading-relaxed text-muted">
            Representing a school? Use the <Link to="/academy/schools" hash="enquire" className="link">school partnership form</Link>. To report a safeguarding concern,
            choose “Safeguarding concern” — these messages are handled with priority. Never send passwords or payment card details.
          </div>
        </aside>
        <div className="md:col-span-7 md:col-start-6">
          {state === 'success' ? (
            <div role="status" className="border-t border-ink pt-10">
              <p className="eyebrow">Message received</p>
              <p className="display mt-4 text-4xl">Thank you. <span className="serif">We’ll reply soon.</span></p>
              <p className="mt-5 max-w-md leading-relaxed text-muted">Your message has been sent to the Academy team. We will reply using the contact details you provided.</p>
              <button type="button" className="link mt-8 text-sm" onClick={() => setState('idle')}>Send another message</button>
            </div>
          ) : (
            <form name="academy-contact" method="POST" action="/__forms.html" data-netlify="true" netlify-honeypot="bot-field" onSubmit={submit} className="border-t border-ink pt-8">
              <input type="hidden" name="form-name" value="academy-contact" />
              <p hidden><label>Leave empty <input name="bot-field" tabIndex={-1} autoComplete="off" /></label></p>
              <fieldset disabled={state === 'pending'} className="grid gap-8 disabled:opacity-70 md:grid-cols-2">
                <legend className="sr-only">Contact the Academy</legend>
                <Field label="Your name *" htmlFor="c-name"><input id="c-name" name="name" className="field" required maxLength={120} autoComplete="name" /></Field>
                <Field label="I am a… *" htmlFor="c-role">
                  <select id="c-role" name="role" className="field cursor-pointer appearance-none" required defaultValue="">
                    <option value="" disabled>Select</option>
                    {['Learner', 'Parent / guardian', 'School representative', 'Other'].map((r) => <option key={r}>{r}</option>)}
                  </select>
                </Field>
                <Field label="Email" htmlFor="c-email"><input id="c-email" name="email" type="email" className="field" maxLength={254} autoComplete="email" /></Field>
                <Field label="Phone / WhatsApp" htmlFor="c-phone"><input id="c-phone" name="phone" type="tel" className="field" maxLength={40} pattern="[0-9+\(\)\-\s]{7,}" autoComplete="tel" /></Field>
                <p className={`-mt-5 text-sm md:col-span-2 ${state === 'invalid' ? 'text-[#8a3520]' : 'text-muted'}`}>Provide an email, a phone number, or both.</p>
                <Field label="Topic *" htmlFor="c-topic" className="md:col-span-2">
                  <select id="c-topic" name="topic" className="field cursor-pointer appearance-none" required defaultValue="">
                    <option value="" disabled>Select a topic</option>
                    {topics.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </Field>
                <Field label="Message *" htmlFor="c-msg" className="md:col-span-2"><textarea id="c-msg" name="message" rows={6} required minLength={10} maxLength={4000} className="field resize-y" /></Field>
                <div className="md:col-span-2"><button type="submit" className="btn btn-primary">{state === 'pending' ? 'Sending…' : 'Send message'} <span className="arrow" aria-hidden="true">→</span></button></div>
              </fieldset>
              {state === 'error' && <div className="mt-6"><Alert>Your message could not be confirmed as sent. Please try again, or contact us on WhatsApp.</Alert></div>}
            </form>
          )}
        </div>
      </section>
    </>
  )
}
