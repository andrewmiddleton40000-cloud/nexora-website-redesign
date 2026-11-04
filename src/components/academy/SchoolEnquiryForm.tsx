import { useState, type FormEvent } from 'react'
import { populations, schoolTypes, yearGroups } from '@/data/academy'
import { site } from '@/data/site'
import { submitNetlifyForm } from '@/lib/netlify-form'
import { recordSchoolEnquiry } from '@/server/fns/public'
import { Alert, Field } from './ui'

export function SchoolEnquiryForm() {
  const [state, setState] = useState<'idle' | 'pending' | 'success' | 'error'>('idle')

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (state === 'pending') return
    const form = e.currentTarget
    setState('pending')
    try {
      await submitNetlifyForm(form)
      const f = new FormData(form)
      const g = (k: string) => String(f.get(k) ?? '')
      // Also record the enquiry in the Academy admin pipeline. The Netlify Forms submission above is the confirmed destination.
      await recordSchoolEnquiry({
        data: {
          schoolName: g('school_name'),
          location: g('school_location'),
          schoolType: g('school_type'),
          contactName: g('contact_name'),
          position: g('position'),
          email: g('email'),
          phone: g('phone'),
          studentPopulation: g('student_population'),
          yearGroup: g('year_group'),
          message: g('message') || undefined,
        },
      }).catch((err) => console.error('enquiry pipeline record failed', err))
      form.reset()
      setState('success')
    } catch {
      setState('error')
    }
  }

  if (state === 'success')
    return (
      <div role="status" className="border-t border-ink pt-10">
        <p className="eyebrow">Enquiry received</p>
        <p className="display mt-4 text-4xl">
          Thank you. <span className="serif">We’ll be in touch.</span>
        </p>
        <p className="mt-5 max-w-md leading-relaxed text-muted">
          Your partnership enquiry has been sent to the Nexora Digital Academy team. We will contact you at the official email or phone number you provided to
          arrange an introductory conversation.
        </p>
        <button type="button" className="link mt-8 text-sm" onClick={() => setState('idle')}>
          Send another enquiry
        </button>
      </div>
    )

  return (
    <form name="school-partnership" method="POST" action="/__forms.html" data-netlify="true" netlify-honeypot="bot-field" onSubmit={submit} className="border-t border-ink pt-8">
      <input type="hidden" name="form-name" value="school-partnership" />
      <p hidden>
        <label>
          Leave empty <input name="bot-field" tabIndex={-1} autoComplete="off" />
        </label>
      </p>
      <fieldset disabled={state === 'pending'} className="grid gap-8 disabled:opacity-70 md:grid-cols-2">
        <legend className="sr-only">School partnership enquiry</legend>
        <Field label="School name *" htmlFor="s-name">
          <input id="s-name" name="school_name" className="field" required minLength={2} maxLength={160} autoComplete="organization" />
        </Field>
        <Field label="School location *" htmlFor="s-loc">
          <input id="s-loc" name="school_location" className="field" required minLength={2} maxLength={160} placeholder="Town / city, state" />
        </Field>
        <Field label="School type *" htmlFor="s-type">
          <select id="s-type" name="school_type" className="field cursor-pointer appearance-none" required defaultValue="">
            <option value="" disabled>
              Select a school type
            </option>
            {schoolTypes.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </Field>
        <Field label="Contact person’s name *" htmlFor="s-contact">
          <input id="s-contact" name="contact_name" className="field" required minLength={2} maxLength={120} autoComplete="name" />
        </Field>
        <Field label="Official position *" htmlFor="s-pos">
          <input id="s-pos" name="position" className="field" required minLength={2} maxLength={120} placeholder="e.g. Principal, ICT Coordinator" />
        </Field>
        <Field label="Official email *" htmlFor="s-email">
          <input id="s-email" name="email" type="email" className="field" required maxLength={254} autoComplete="email" />
        </Field>
        <Field label="Phone number *" htmlFor="s-phone">
          <input id="s-phone" name="phone" type="tel" className="field" required maxLength={40} pattern="[0-9+\(\)\-\s]{7,}" title="Use digits, spaces, +, - or brackets" autoComplete="tel" />
        </Field>
        <Field label="Estimated student population *" htmlFor="s-pop">
          <select id="s-pop" name="student_population" className="field cursor-pointer appearance-none" required defaultValue="">
            <option value="" disabled>
              Select a range
            </option>
            {populations.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </Field>
        <Field label="Preferred year group *" htmlFor="s-year" className="md:col-span-2">
          <select id="s-year" name="year_group" className="field cursor-pointer appearance-none" required defaultValue="">
            <option value="" disabled>
              Select a year group
            </option>
            {yearGroups.map((y) => (
              <option key={y}>{y}</option>
            ))}
          </select>
        </Field>
        <Field label="Additional information" htmlFor="s-msg" className="md:col-span-2">
          <textarea id="s-msg" name="message" rows={5} maxLength={3000} className="field resize-y" placeholder="Timetable preferences, computer lab access, questions…" />
        </Field>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between md:col-span-2">
          <p className="max-w-sm text-sm text-muted">We use these details only to respond to your school’s enquiry.</p>
          <button type="submit" className="btn btn-primary justify-center">
            {state === 'pending' ? 'Sending…' : 'Send partnership enquiry'} <span className="arrow" aria-hidden="true">→</span>
          </button>
        </div>
      </fieldset>
      {state === 'error' && (
        <div className="mt-6">
          <Alert>
            Your enquiry could not be confirmed as sent. Your details are still in the form — please try again, or message us on{' '}
            <a href={site.whatsapp.url} target="_blank" rel="noopener noreferrer" className="link">
              WhatsApp
            </a>
            .
          </Alert>
        </div>
      )}
    </form>
  )
}
