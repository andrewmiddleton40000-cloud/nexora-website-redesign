import { seedCourses } from '@/data/academy'
import { listCourses } from '@/server/fns/public'
import type { CourseSummary } from '@/components/academy/CourseCard'

/** Loads the live catalogue; falls back to the published curriculum outline if the database is unreachable. */
export async function loadCatalogue(): Promise<{ courses: CourseSummary[]; live: boolean }> {
  try {
    return { courses: await listCourses(), live: true }
  } catch (e) {
    console.error('catalogue unavailable', e)
    return {
      live: false,
      courses: seedCourses.map((c) => ({
        slug: c.slug,
        level: c.level,
        title: c.title,
        levelLabel: c.levelLabel,
        category: c.category,
        skills: c.skills,
        summary: c.summary,
        description: c.description,
        outcomes: c.outcomes,
        durationLabel: c.durationLabel,
        delivery: c.delivery,
        prerequisitesText: c.prerequisitesText,
        priceKobo: c.priceKobo,
        status: c.status,
        image: c.image,
        availability: null,
      })),
    }
  }
}
