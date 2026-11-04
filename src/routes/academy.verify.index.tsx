import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { academySeo } from '@/lib/academy-seo'
import { Field, PageIntro } from '@/components/academy/ui'

export const Route = createFileRoute('/academy/verify/')({
  head: () => academySeo({ title: 'Verify a certificate', path: '/academy/verify' }),
  component: VerifyForm,
})

function VerifyForm() {
  const [code, setCode] = useState('')
  const nav = useNavigate()
  return (
    <>
      <PageIntro eyebrow="Certificate verification" title={<>Check a Nexora <span className="serif text-forest">certificate.</span></>} intro="Enter the verification code or certificate number printed on the certificate." />
      <section className="wrap pb-24">
        <form className="flex max-w-xl flex-col gap-6 border-t border-ink pt-8 sm:flex-row sm:items-end" onSubmit={(e) => { e.preventDefault(); if (code.trim()) nav({ to: '/academy/verify/$code', params: { code: code.trim().toUpperCase() } }) }}>
          <Field label="Verification code or certificate number" htmlFor="v-code" className="flex-1">
            <input id="v-code" className="field uppercase" value={code} onChange={(e) => setCode(e.target.value)} required minLength={4} maxLength={40} />
          </Field>
          <button className="btn btn-primary">Verify</button>
        </form>
      </section>
    </>
  )
}
