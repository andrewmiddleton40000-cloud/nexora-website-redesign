
import { Link, createFileRoute } from '@tanstack/react-router'
import { site } from '@/data/site'
import { seo } from '@/lib/seo'

export const Route = createFileRoute('/academy')({
  head: () =>
    seo({
      title: 'Digital Academy',
      path: '/academy',
      description:
        'Explore practical digital skills, technology, business and creative learning with Nexora Digital Academy.',
    }),
  component: AcademyPage,
})

const learningAreas = [
  {
    number: '01',
    title: 'Technology & Web Development',
    description:
      'Explore website creation, web technologies, coding fundamentals and the tools behind the digital world.',
    tags: ['Web Development', 'Programming', 'Technology'],
  },
  {
    number: '02',
    title: 'Artificial Intelligence & Digital Tools',
    description:
      'Understand AI, discover useful digital tools and learn how technology can improve everyday productivity.',
    tags: ['AI Tools', 'Prompt Engineering', 'Automation'],
  },
  {
    number: '03',
    title: 'Graphic Design & Creativity',
    description:
      'Develop creative skills and learn to communicate ideas through visual design and digital content.',
    tags: ['Graphic Design', 'Branding', 'Content Creation'],
  },
  {
    number: '04',
    title: 'Digital Business & Entrepreneurship',
    description:
      'Learn about online businesses, digital marketing, entrepreneurship and building opportunities online.',
    tags: ['Digital Marketing', 'Business', 'Entrepreneurship'],
  },
]

function AcademyPage() {
  return (
    <>
      <section className="wrap pt-20 pb-24 md:pt-28 md:pb-32">
        <p className="eyebrow rise">
          Nexora Digital Academy
        </p>

        <h1 className="display rise rise-2 mt-7 max-w-5xl text-[3.2rem] md:text-7xl lg:text-[6rem]">
          Learn practical skills.
          <span className="serif text-forest">
            {' '}Create your next opportunity.
          </span>
        </h1>

        <div className="mt-9 grid gap-8 md:grid-cols-12">
          <p className="text-lg leading-relaxed text-muted md:col-span-7 md:text-xl">
            The digital world is full of opportunities.
            Nexora Digital Academy exists to help people
            understand technology, develop useful skills
            and turn knowledge into practical possibilities.
          </p>

          <div className="flex flex-wrap items-start gap-3 md:col-span-5 md:justify-end">
            <a
              href={site.whatsapp.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              Explore Learning Opportunities →
            </a>
            <Link to="/contact" className="btn btn-ghost">
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-ink py-20 text-paper md:py-28">
        <div className="wrap">
          <p className="eyebrow text-signal">
            Our vision
          </p>

          <div className="mt-7 grid gap-10 md:grid-cols-12">
            <h2 className="display text-4xl md:col-span-7 md:text-6xl">
              Education should create
              <span className="serif text-signal">
                {' '}possibilities.
              </span>
            </h2>

            <p className="text-lg leading-relaxed text-paper/75 md:col-span-4 md:col-start-9">
              We believe learning should be accessible,
              practical and connected to the real world.
              Our goal is to make digital education easier
              to understand for beginners and valuable
              for people looking to grow.
            </p>
          </div>
        </div>
      </section>

      <section className="wrap py-24 md:py-32">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-4">
            <p className="eyebrow">(01) Learning areas</p>
            <h2 className="display mt-6 text-4xl md:text-5xl">
              Discover what
              <span className="serif text-forest">
                {' '}you can learn.
              </span>
            </h2>
            <p className="mt-6 leading-relaxed text-muted">
              Explore different areas of digital education
              and discover skills that can help you move
              forward in today's world.
            </p>
          </div>

          <div className="border-t border-line md:col-span-7 md:col-start-6">
            {learningAreas.map((area) => (
              <article
                key={area.number}
                className="border-b border-line py-8"
              >
                <div className="flex gap-5">
                  <span className="pt-1 text-sm text-forest">
                    {area.number}
                  </span>

                  <div className="flex-1">
                    <h3 className="text-2xl font-medium tracking-tight">
                      {area.title}
                    </h3>

                    <p className="mt-3 max-w-xl leading-relaxed text-muted">
                      {area.description}
                    </p>

                    <div className="mt-5 flex flex-wrap gap-2">
                      {area.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-line px-3 py-1.5 text-xs text-muted"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-paper-deep/50 py-24 md:py-32">
        <div className="wrap">
          <p className="eyebrow">(02) The learning experience</p>

          <h2 className="display mt-6 max-w-4xl text-4xl md:text-6xl">
            Start with curiosity.
            <span className="serif text-forest">
              {' '}Grow with knowledge.
            </span>
          </h2>

          <div className="mt-14 grid gap-10 md:grid-cols-3">
            {[
              {
                number: '01',
                title: 'Learn',
                body: 'Understand new concepts through clear explanations and beginner-friendly learning materials.',
              },
              {
                number: '02',
                title: 'Practise',
                body: 'Build confidence by exploring practical examples and applying what you learn.',
              },
              {
                number: '03',
                title: 'Create',
                body: 'Use your knowledge to develop ideas, solve problems and discover new opportunities.',
              },
            ].map((item) => (
              <article
                key={item.number}
                className="border-t border-ink pt-6"
              >
                <p className="eyebrow text-forest">
                  {item.number}
                </p>
                <h3 className="mt-5 text-3xl font-medium">
                  {item.title}
                </h3>
                <p className="mt-4 leading-relaxed text-muted">
                  {item.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ink py-24 text-paper md:py-32">
        <div className="wrap">
          <p className="eyebrow text-signal">
            (03) Your next step
          </p>

          <h2 className="display mt-6 max-w-4xl text-4xl md:text-7xl">
            The future belongs to those who
            <span className="serif text-signal">
              {' '}keep learning.
            </span>
          </h2>

          <p className="mt-7 max-w-2xl text-lg leading-relaxed text-paper/75">
            Take the first step towards developing
            practical digital skills. Connect with Nexora
            Digital Academy to explore learning opportunities.
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <a
              href={site.whatsapp.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              Get in Touch →
            </a>
            <Link
              to="/"
              className="btn border border-paper/30 text-paper"
            >
              Back to Nexora
            </Link>
          </div>
        </div>
      </section>
    </>
  )
    }
                
