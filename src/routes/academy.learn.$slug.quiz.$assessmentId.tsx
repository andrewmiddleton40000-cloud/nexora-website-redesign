import { useState } from 'react'
import { Link, createFileRoute, notFound, useRouter } from '@tanstack/react-router'
import { academySeo } from '@/lib/academy-seo'
import { requireSession } from '@/lib/guards'
import { getQuiz, submitQuiz } from '@/server/fns/student'
import { RouteError } from '@/components/academy/RouteError'
import { Alert, useAction } from '@/components/academy/ui'

export const Route = createFileRoute('/academy/learn/$slug/quiz/$assessmentId')({
  beforeLoad: requireSession,
  loader: ({ params }) => {
    const id = Number(params.assessmentId)
    if (!Number.isInteger(id) || id <= 0) throw notFound()
    return getQuiz({ data: { assessmentId: id } })
  },
  head: () => academySeo({ title: 'Assessment', path: '/academy/learn', noindex: true }),
  errorComponent: RouteError,
  component: QuizPage,
})

function QuizPage() {
  const { slug } = Route.useParams()
  const q = Route.useLoaderData()
  const router = useRouter()
  const [answers, setAnswers] = useState<number[]>(() => q.questions.map(() => -1))
  const [result, setResult] = useState<Awaited<ReturnType<typeof submitQuiz>> | null>(null)
  const { pending, error, setError, run } = useAction()
  const best = q.results.length ? Math.max(...q.results.map((r) => r.scorePercent)) : null

  async function submit() {
    if (answers.some((a) => a < 0)) return setError('Please answer every question before submitting.')
    const r = await run(() => submitQuiz({ data: { assessmentId: q.assessment.id, answers } }))
    if (r) {
      setResult(r)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      router.invalidate()
    }
  }

  return (
    <section className="wrap max-w-4xl py-12 md:py-16">
      <Link to="/academy/learn/$slug" params={{ slug }} className="text-sm text-muted hover:text-ink">← {q.course.title}</Link>
      <h1 className="display mt-8 text-4xl md:text-5xl">{q.assessment.title}</h1>
      <p className="mt-3 text-muted">{q.assessment.description} · Attempts used: {q.results.length}/{q.assessment.maxAttempts}{best != null ? ` · Best score ${best}%` : ''}</p>

      {result && (
        <div className="mt-8">
          <Alert tone={result.scorePercent >= q.course.passMarkPercent ? 'success' : 'info'}>
            You scored <strong>{result.scorePercent}%</strong> ({result.correct} of {result.total} correct). {result.attemptsLeft > 0 ? `You have ${result.attemptsLeft} attempt${result.attemptsLeft > 1 ? 's' : ''} left; your best score counts.` : 'You have used all attempts; your best score counts.'}
          </Alert>
          <div className="mt-6 flex gap-3">
            <Link to="/academy/learn/$slug" params={{ slug }} className="btn btn-primary">Back to course</Link>
            {result.attemptsLeft > 0 && <button type="button" className="btn btn-ghost" onClick={() => { setResult(null); setAnswers(q.questions.map(() => -1)) }}>Try again</button>}
          </div>
        </div>
      )}

      {!result && (q.canAttempt ? (
        <form className="mt-10" onSubmit={(e) => { e.preventDefault(); submit() }}>
          <ol className="space-y-10 border-t border-ink pt-8">
            {q.questions.map((qq, i) => (
              <li key={i}>
                <fieldset>
                  <legend className="text-lg font-medium"><span className="mr-3 text-sm tabular-nums text-muted">{i + 1}.</span>{qq.q}</legend>
                  <div className="mt-4 grid gap-2">
                    {qq.options.map((o, j) => (
                      <label key={j} className={`flex cursor-pointer items-start gap-3 border px-4 py-3 transition-colors ${answers[i] === j ? 'border-forest bg-forest-tint/60' : 'border-line hover:border-ink'}`}>
                        <input type="radio" name={`q${i}`} className="mt-1" checked={answers[i] === j} onChange={() => setAnswers((a) => a.map((x, k) => (k === i ? j : x)))} />
                        <span>{o}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              </li>
            ))}
          </ol>
          {error && <div className="mt-8"><Alert>{error}</Alert></div>}
          <button className="btn btn-primary mt-10" disabled={pending}>{pending ? 'Marking…' : 'Submit answers'}</button>
        </form>
      ) : (
        <div className="mt-10"><Alert tone="info">{q.results.length >= q.assessment.maxAttempts ? 'You have used all attempts for this assessment.' : 'Assessments are available to learners with an active enrolment.'}</Alert></div>
      ))}
    </section>
  )
}
