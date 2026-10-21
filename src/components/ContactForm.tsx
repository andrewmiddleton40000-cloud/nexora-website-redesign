import { useState, type FormEvent } from 'react'
import { site } from '@/data/site'
import { categories, formatPrice } from '@/data/pricing'

type State = 'idle' | 'pending' | 'success' | 'error' | 'invalid'

const labelCls = 'block text-xs uppercase tracking-[0.14em] text-muted'

export const budgets = [
  'Under ₦500,000',
  '₦500,000 – ₦1,000,000',
  '₦1,000,000 – ₦2,500,000',
  '₦2,500,000 – ₦5,000,000',
  '₦5,000,000 – ₦10,000,000',
  'Above ₦10,000,000',
  'Not sure yet',
]

export const timelines = ['As soon as possible', 'Within 1 month', '1–3 months', '3–6 months', 'Flexible / not sure']

/** Value submitted for a service, e.g. "Landing Page Design (₦350,000)". */
export function serviceOption(s: { name: string; price: number; monthly?: boolean }) {
  return `${s.name} (${formatPrice(s)})`
}

export function ContactForm({ defaultService = '' }: { defaultService?: string }) {
  const [state, setState] = useState<State>('idle')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (state === 'pending') return
    const form = event.currentTarget
    const data = new FormData(form)
    // Either an email or a phone/WhatsApp number is enough to reply.
    if (!String(data.get('email') ?? '').trim() && !String(data.get('phone') ?? '').trim()) {
      setState('invalid')
      form.querySelector<HTMLInputElement>('#f-email')?.focus()
      return
    }
    const body = new URLSearchParams()
    data.forEach((value, key) => body.append(key, String(value)))
    setState('pending')
    try {
      // Post to the static registration file — the SSR handler owns "/".
      const response = await fetch('/__forms.html', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
        signal: AbortSignal.timeout(15000),
      })
      if (!response.ok) throw new Error('Submission failed')
      if (/\bdata-netlify\s*=/i.test(await response.text())) throw new Error('Form handling unavailable')
      form.reset()
      setState('success')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch {
      setState('error')
    }
  }

  if (state === 'success') {
    return (
      <div role="status" className="border-t border-ink pt-10">
        <p className="eyebrow">Enquiry received</p>
        <p className="display mt-4 text-4xl md:text-5xl">
          Thank you. <span className="serif">We’ll be in touch.</span>
        </p>
        <p className="mt-5 max-w-md text-muted leading-relaxed">
          Your project enquiry has been sent. We review every enquiry personally and will reply using the email or
          phone number you provided to discuss your requirements and next steps.
        </p>
        <button type="button" className="link mt-8 text-sm" onClick={() => setState('idle')}>
          Send another enquiry
        </button>
      </div>
    )
  }

  return (
    <form
      name="enquiry"
      method="POST"
      action="/__forms.html"
      data-netlify="true"
      netlify-honeypot="bot-field"
      onSubmit={submit}
      onChange={() => (state === 'error' || state === 'invalid') && setState('idle')}
      className="border-t border-ink pt-8"
    >
      <input type="hidden" name="form-name" value="enquiry" />
      <p hidden>
        <label>
          Leave empty <input name="bot-field" tabIndex={-1} autoComplete="off" />
        </label>
      </p>
      <fieldset disabled={state === 'pending'} className="grid gap-8 md:grid-cols-2 disabled:opacity-70">
        <legend className="sr-only">Project enquiry</legend>
        <div>
          <label htmlFor="f-name" className={labelCls}>Your name *</label>
          <input id="f-name" name="name" className="field" autoComplete="name" required maxLength={100} />
        </div>
        <div>
          <label htmlFor="f-company" className={labelCls}>Business name</label>
          <input id="f-company" name="company" className="field" autoComplete="organization" maxLength={120} />
        </div>
        <div>
          <label htmlFor="f-email" className={labelCls}>Email</label>
          <input
            id="f-email"
            name="email"
            type="email"
            className="field"
            autoComplete="email"
            maxLength={254}
            aria-describedby="f-contact-hint"
            aria-invalid={state === 'invalid' || undefined}
          />
        </div>
        <div>
          <label htmlFor="f-phone" className={labelCls}>Phone / WhatsApp</label>
          <input
            id="f-phone"
            name="phone"
            type="tel"
            className="field"
            autoComplete="tel"
            maxLength={40}
            pattern="[0-9+\(\)\-\s]{7,}"
            title="Use digits, spaces, +, - or brackets"
            aria-describedby="f-contact-hint"
            aria-invalid={state === 'invalid' || undefined}
          />
        </div>
        <p id="f-contact-hint" className={`-mt-5 text-sm md:col-span-2 ${state === 'invalid' ? 'text-[#8a3520]' : 'text-muted'}`}>
          {state === 'invalid'
            ? 'Please add an email address or a phone/WhatsApp number so we can reply.'
            : 'Provide an email, a phone/WhatsApp number, or both. At least one is required.'}
        </p>
        <div className="md:col-span-2">
          <label htmlFor="f-service" className={labelCls}>Service required *</label>
          <select
            id="f-service"
            name="service"
            className="field appearance-none cursor-pointer"
            defaultValue={defaultService}
            required
          >
            <option value="" disabled>Select a service</option>
            <option value="Not sure yet">Not sure yet — I’d like advice</option>
            {categories.map((c) => (
              <optgroup key={c.id} label={c.title}>
                {c.services.map((s) => (
                  <option key={s.id} value={serviceOption(s)}>
                    {serviceOption(s)}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="f-budget" className={labelCls}>Approximate budget *</label>
          <select id="f-budget" name="budget" className="field appearance-none cursor-pointer" defaultValue="" required>
            <option value="" disabled>Select a range</option>
            {budgets.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="f-timeline" className={labelCls}>Preferred timeline *</label>
          <select id="f-timeline" name="timeline" className="field appearance-none cursor-pointer" defaultValue="" required>
            <option value="" disabled>Select a timeline</option>
            {timelines.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2">
          <label htmlFor="f-website" className={labelCls}>Existing website (if any)</label>
          <input
            id="f-website"
            name="website"
            className="field"
            inputMode="url"
            autoComplete="url"
            maxLength={300}
            placeholder="e.g. yourbusiness.com"
          />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="f-message" className={labelCls}>Project description and required features *</label>
          <textarea
            id="f-message"
            name="message"
            rows={6}
            required
            minLength={20}
            maxLength={5000}
            className="field resize-y"
            placeholder="What are you looking to build or improve? List any pages, features or integrations you need."
          />
        </div>
        <div className="md:col-span-2 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted max-w-sm">We use your details only to respond to this enquiry.</p>
          <button type="submit" className="btn btn-primary justify-center">
            {state === 'pending' ? 'Sending…' : 'Send Project Enquiry'}
            <span className="arrow" aria-hidden="true">→</span>
          </button>
        </div>
      </fieldset>
      {state === 'error' && (
        <p role="alert" className="mt-6 border-l-2 border-[#b4472c] pl-4 text-sm text-[#8a3520]">
          Your enquiry could not be confirmed as sent. Your details are still here — please try again in a moment, or
          message us on{' '}
          <a href={site.whatsapp.url} target="_blank" rel="noopener noreferrer" className="link">
            WhatsApp
          </a>
          .
        </p>
      )}
    </form>
  )
}
