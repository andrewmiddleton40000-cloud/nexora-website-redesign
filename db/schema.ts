// Nexora Digital Academy — database schema (Netlify Database / Postgres).
//
// CONFIDENTIALITY: `school_agreements`, `school_allocations` and `reconciliation_statements`
// hold the confidential institutional allocation. They must only ever be read from
// `src/server/finance.ts`, which requires the super_admin or finance_admin role.
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core'

const ts = (name: string) => timestamp(name, { withTimezone: true, mode: 'string' })
const created = () => ts('created_at').notNull().defaultNow()

/** Roles: super_admin, academic_admin, finance_admin, instructor, school_partner, student */
export const users = pgTable(
  'users',
  {
    id: serial().primaryKey(),
    identityId: text('identity_id').notNull().unique(),
    email: text().notNull().unique(),
    fullName: text('full_name').notNull().default(''),
    phone: text(),
    country: text(),
    role: text().notNull().default('student'),
    /** 'under_18' | 'adult' — minimal data instead of a full date of birth. */
    ageGroup: text('age_group'),
    schoolId: integer('school_id').references(() => schools.id),
    /** Free-text school name when the learner's school is not a partner. */
    schoolNameOther: text('school_name_other'),
    /** School-approved enrolment: 'none' | 'pending' | 'approved' | 'rejected' */
    schoolLinkStatus: text('school_link_status').notNull().default('none'),
    /** Course the learner selected at registration (slug). */
    intendedCourse: text('intended_course'),
    status: text().notNull().default('active'),
    createdAt: created(),
    updatedAt: ts('updated_at').notNull().defaultNow(),
  },
  (t) => [index('users_school_idx').on(t.schoolId), index('users_role_idx').on(t.role)],
)

export const guardianConsents = pgTable('guardian_consents', {
  id: serial().primaryKey(),
  userId: integer('user_id').notNull().unique().references(() => users.id),
  guardianName: text('guardian_name').notNull(),
  guardianEmail: text('guardian_email'),
  guardianPhone: text('guardian_phone').notNull(),
  relationship: text().notNull(),
  declaredAt: ts('declared_at').notNull().defaultNow(),
  /** 'declared' | 'verified' | 'rejected' */
  status: text().notNull().default('declared'),
  verifiedById: integer('verified_by_id').references(() => users.id),
  verifiedAt: ts('verified_at'),
  notes: text(),
})

export const schools = pgTable('schools', {
  id: serial().primaryKey(),
  /** Public school identifier given to students, e.g. NXS-4F7K2Q */
  code: text().notNull().unique(),
  name: text().notNull(),
  location: text().notNull().default(''),
  country: text().notNull().default('Nigeria'),
  schoolType: text('school_type').notNull().default(''),
  contactName: text('contact_name'),
  contactPosition: text('contact_position'),
  contactEmail: text('contact_email'),
  contactPhone: text('contact_phone'),
  /** 'prospect' | 'active' | 'paused' | 'ended' */
  status: text().notNull().default('prospect'),
  notes: text(),
  createdAt: created(),
})

export const schoolMembers = pgTable(
  'school_members',
  {
    id: serial().primaryKey(),
    schoolId: integer('school_id').notNull().references(() => schools.id),
    userId: integer('user_id').notNull().references(() => users.id),
    position: text(),
    /** Authorised representative for private reconciliation statements. */
    canViewReconciliation: boolean('can_view_reconciliation').notNull().default(false),
    createdAt: created(),
  },
  (t) => [uniqueIndex('school_members_unique').on(t.schoolId, t.userId)],
)

/** CONFIDENTIAL — partnership agreements including the institutional allocation. */
export const schoolAgreements = pgTable('school_agreements', {
  id: serial().primaryKey(),
  schoolId: integer('school_id').notNull().references(() => schools.id),
  // Amount is entered per agreement by Finance — never hard-coded (this repository is public).
  allocationPerEnrolmentKobo: integer('allocation_per_enrolment_kobo').notNull(),
  startsOn: text('starts_on').notNull(),
  endsOn: text('ends_on'),
  /** 'active' | 'ended' */
  status: text().notNull().default('active'),
  documentRef: text('document_ref'),
  notes: text(),
  createdById: integer('created_by_id').references(() => users.id),
  createdAt: created(),
})

export const schoolEnquiries = pgTable('school_enquiries', {
  id: serial().primaryKey(),
  schoolName: text('school_name').notNull(),
  location: text().notNull(),
  schoolType: text('school_type').notNull(),
  contactName: text('contact_name').notNull(),
  position: text().notNull(),
  email: text().notNull(),
  phone: text().notNull(),
  studentPopulation: text('student_population').notNull(),
  yearGroup: text('year_group').notNull(),
  message: text(),
  /** 'new' | 'contacted' | 'converted' | 'closed' */
  status: text().notNull().default('new'),
  createdAt: created(),
})

export const courses = pgTable('courses', {
  id: serial().primaryKey(),
  slug: text().notNull().unique(),
  /** Position in the catalogue / difficulty step. No longer unique: several subjects can share a level. */
  level: integer().notNull(),
  title: text().notNull(),
  /** Catalogue subject, e.g. "Artificial Intelligence". */
  category: text(),
  /** Short skill tags shown on cards and course pages. */
  skills: jsonb().$type<string[]>().notNull().default([]),
  /** Staff-entered instructor details. Shown only when set — never invented. */
  instructorName: text('instructor_name'),
  instructorBio: text('instructor_bio'),
  /** Staff-entered course FAQs. */
  faqs: jsonb().$type<Array<{ q: string; a: string }>>().notNull().default([]),
  /** Beginner | Intermediate | Advanced */
  levelLabel: text('level_label').notNull(),
  summary: text().notNull(),
  description: text().notNull(),
  outcomes: jsonb().$type<string[]>().notNull().default([]),
  durationLabel: text('duration_label'),
  delivery: text(),
  audience: text(),
  prerequisitesText: text('prerequisites_text'),
  prerequisiteCourseId: integer('prerequisite_course_id'),
  /** Student-facing price in kobo. NULL = not yet configured. */
  priceKobo: integer('price_kobo'),
  currency: text().notNull().default('NGN'),
  /** 'available' | 'locked' | 'draft' | 'archived' */
  status: text().notNull().default('locked'),
  passMarkPercent: integer('pass_mark_percent').notNull().default(60),
  /** Share of live sessions that must be attended live or completed as a recording. */
  attendanceRequirementPercent: integer('attendance_requirement_percent').notNull().default(75),
  image: text(),
  createdAt: created(),
  updatedAt: ts('updated_at').notNull().defaultNow(),
})

export const courseModules = pgTable(
  'course_modules',
  {
    id: serial().primaryKey(),
    courseId: integer('course_id').notNull().references(() => courses.id),
    week: integer().notNull(),
    title: text().notNull(),
    summary: text().notNull().default(''),
  },
  (t) => [uniqueIndex('modules_unique').on(t.courseId, t.week)],
)

export const lessons = pgTable(
  'lessons',
  {
    id: serial().primaryKey(),
    courseId: integer('course_id').notNull().references(() => courses.id),
    moduleId: integer('module_id').references(() => courseModules.id),
    sortOrder: integer('sort_order').notNull().default(0),
    title: text().notNull(),
    /** 'live' | 'recorded' | 'reading' */
    kind: text().notNull().default('reading'),
    summary: text().notNull().default(''),
    /** Lesson body. Paragraphs separated by blank lines; lines starting with "- " are list items. */
    content: text().notNull().default(''),
    /** Guidance adapting the lesson for secondary-school learners. */
    secondaryNote: text('secondary_note'),
    /** Recording URL (YouTube unlisted / Vimeo / Drive) — only revealed to enrolled learners. */
    videoUrl: text('video_url'),
    durationMinutes: integer('duration_minutes'),
    isRequired: boolean('is_required').notNull().default(true),
    /** Counts towards the attendance / recorded-learning requirement. */
    isLiveSession: boolean('is_live_session').notNull().default(false),
    published: boolean().notNull().default(true),
    /** Free preview: readable by anyone from the course page, without enrolling. */
    isPreview: boolean('is_preview').notNull().default(false),
  },
  (t) => [uniqueIndex('lessons_order_unique').on(t.courseId, t.sortOrder)],
)

export const assignments = pgTable(
  'assignments',
  {
  id: serial().primaryKey(),
  courseId: integer('course_id').notNull().references(() => courses.id),
  lessonId: integer('lesson_id').references(() => lessons.id),
  title: text().notNull(),
  instructions: text().notNull(),
  /** 'assignment' | 'final_project' */
  kind: text().notNull().default('assignment'),
  maxScore: integer('max_score').notNull().default(100),
  isRequired: boolean('is_required').notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
  },
  (t) => [uniqueIndex('assignments_order_unique').on(t.courseId, t.sortOrder)],
)

export const assignmentSubmissions = pgTable(
  'assignment_submissions',
  {
    id: serial().primaryKey(),
    assignmentId: integer('assignment_id').notNull().references(() => assignments.id),
    enrolmentId: integer('enrolment_id').notNull().references(() => enrolments.id),
    userId: integer('user_id').notNull().references(() => users.id),
    content: text().notNull(),
    linkUrl: text('link_url'),
    /** 'submitted' | 'returned' | 'approved' */
    status: text().notNull().default('submitted'),
    score: integer(),
    feedback: text(),
    reviewedById: integer('reviewed_by_id').references(() => users.id),
    submittedAt: ts('submitted_at').notNull().defaultNow(),
    reviewedAt: ts('reviewed_at'),
  },
  (t) => [uniqueIndex('submissions_unique').on(t.assignmentId, t.enrolmentId)],
)

export type QuizQuestion = { q: string; options: string[]; answer: number }

export const assessments = pgTable(
  'assessments',
  {
  id: serial().primaryKey(),
  courseId: integer('course_id').notNull().references(() => courses.id),
  title: text().notNull(),
  description: text().notNull().default(''),
  /** 'quiz' (auto-marked) | 'instructor' (score recorded by staff) */
  kind: text().notNull().default('quiz'),
  /** Relative weight in the overall score. */
  weight: integer().notNull().default(1),
  /** Quiz questions with answer keys — NEVER send `answer` to the browser. */
  questions: jsonb().$type<QuizQuestion[]>().notNull().default([]),
  maxAttempts: integer('max_attempts').notNull().default(3),
  sortOrder: integer('sort_order').notNull().default(0),
  published: boolean().notNull().default(true),
  },
  (t) => [uniqueIndex('assessments_order_unique').on(t.courseId, t.sortOrder)],
)

export const assessmentResults = pgTable(
  'assessment_results',
  {
    id: serial().primaryKey(),
    assessmentId: integer('assessment_id').notNull().references(() => assessments.id),
    enrolmentId: integer('enrolment_id').notNull().references(() => enrolments.id),
    userId: integer('user_id').notNull().references(() => users.id),
    scorePercent: integer('score_percent').notNull(),
    attempt: integer().notNull().default(1),
    answers: jsonb().$type<number[]>(),
    recordedById: integer('recorded_by_id').references(() => users.id),
    note: text(),
    createdAt: created(),
  },
  (t) => [index('results_enrolment_idx').on(t.enrolmentId)],
)

export const cohorts = pgTable('cohorts', {
  id: serial().primaryKey(),
  courseId: integer('course_id').notNull().references(() => courses.id),
  name: text().notNull(),
  schoolId: integer('school_id').references(() => schools.id),
  instructorId: integer('instructor_id').references(() => users.id),
  startsOn: text('starts_on'),
  endsOn: text('ends_on'),
  /** 'planned' | 'running' | 'finished' */
  status: text().notNull().default('planned'),
  createdAt: created(),
})

export const liveSessions = pgTable('live_sessions', {
  id: serial().primaryKey(),
  cohortId: integer('cohort_id').notNull().references(() => cohorts.id),
  lessonId: integer('lesson_id').references(() => lessons.id),
  title: text().notNull(),
  startsAt: ts('starts_at').notNull(),
  durationMinutes: integer('duration_minutes').notNull().default(60),
  /** Meeting link — only shown to learners enrolled in the cohort. */
  meetingUrl: text('meeting_url'),
})

export const enrolments = pgTable(
  'enrolments',
  {
    id: serial().primaryKey(),
    userId: integer('user_id').notNull().references(() => users.id),
    courseId: integer('course_id').notNull().references(() => courses.id),
    cohortId: integer('cohort_id').references(() => cohorts.id),
    /** School attribution snapshot at the time of enrolment. */
    schoolId: integer('school_id').references(() => schools.id),
    paymentId: integer('payment_id'),
    /** 'active' | 'completed' | 'revoked' */
    status: text().notNull().default('active'),
    createdAt: created(),
  },
  (t) => [uniqueIndex('enrolments_unique').on(t.userId, t.courseId), index('enrolments_school_idx').on(t.schoolId)],
)

export const attendance = pgTable(
  'attendance',
  {
    id: serial().primaryKey(),
    liveSessionId: integer('live_session_id').notNull().references(() => liveSessions.id),
    enrolmentId: integer('enrolment_id').notNull().references(() => enrolments.id),
    /** 'present' | 'absent' | 'excused' */
    status: text().notNull(),
    markedById: integer('marked_by_id').references(() => users.id),
    createdAt: created(),
  },
  (t) => [uniqueIndex('attendance_unique').on(t.liveSessionId, t.enrolmentId)],
)

export const lessonProgress = pgTable(
  'lesson_progress',
  {
    id: serial().primaryKey(),
    enrolmentId: integer('enrolment_id').notNull().references(() => enrolments.id),
    lessonId: integer('lesson_id').notNull().references(() => lessons.id),
    completedAt: ts('completed_at').notNull().defaultNow(),
  },
  (t) => [uniqueIndex('progress_unique').on(t.enrolmentId, t.lessonId)],
)

export const payments = pgTable(
  'payments',
  {
    id: serial().primaryKey(),
    reference: text().notNull().unique(),
    userId: integer('user_id').notNull().references(() => users.id),
    courseId: integer('course_id').notNull().references(() => courses.id),
    amountKobo: integer('amount_kobo').notNull(),
    currency: text().notNull().default('NGN'),
    /** 'paystack' | 'flutterwave' | 'bank_transfer' */
    provider: text().notNull(),
    /** 'pending' | 'awaiting_verification' | 'success' | 'failed' | 'abandoned' | 'refunded' */
    status: text().notNull().default('pending'),
    /** Gateway transaction id, or the bank transaction reference for manual transfers. Unique to block reuse. */
    providerTransactionId: text('provider_transaction_id').unique(),
    payerName: text('payer_name'),
    transferNote: text('transfer_note'),
    verifiedById: integer('verified_by_id').references(() => users.id),
    verifiedAt: ts('verified_at'),
    failureReason: text('failure_reason'),
    refundedAt: ts('refunded_at'),
    refundReference: text('refund_reference'),
    refundReason: text('refund_reason'),
    refundedById: integer('refunded_by_id').references(() => users.id),
    createdAt: created(),
    updatedAt: ts('updated_at').notNull().defaultNow(),
  },
  (t) => [index('payments_user_idx').on(t.userId), index('payments_status_idx').on(t.status)],
)

export const courseCompletions = pgTable('course_completions', {
  id: serial().primaryKey(),
  enrolmentId: integer('enrolment_id').notNull().unique().references(() => enrolments.id),
  userId: integer('user_id').notNull().references(() => users.id),
  courseId: integer('course_id').notNull().references(() => courses.id),
  overallScore: integer('overall_score').notNull(),
  verifiedById: integer('verified_by_id').notNull().references(() => users.id),
  verifiedAt: ts('verified_at').notNull().defaultNow(),
  notes: text(),
})

export const certificates = pgTable('certificates', {
  id: serial().primaryKey(),
  number: text().notNull().unique(),
  verificationCode: text('verification_code').notNull().unique(),
  userId: integer('user_id').notNull().references(() => users.id),
  courseId: integer('course_id').notNull().references(() => courses.id),
  completionId: integer('completion_id').notNull().unique().references(() => courseCompletions.id),
  studentName: text('student_name').notNull(),
  courseTitle: text('course_title').notNull(),
  completedOn: text('completed_on').notNull(),
  issuedById: integer('issued_by_id').references(() => users.id),
  issuedAt: ts('issued_at').notNull().defaultNow(),
  revokedAt: ts('revoked_at'),
})

/** CONFIDENTIAL — one allocation per successful paid enrolment attributed to a partner school. */
export const schoolAllocations = pgTable(
  'school_allocations',
  {
    id: serial().primaryKey(),
    schoolId: integer('school_id').notNull().references(() => schools.id),
    agreementId: integer('agreement_id').references(() => schoolAgreements.id),
    paymentId: integer('payment_id').notNull().unique().references(() => payments.id),
    enrolmentId: integer('enrolment_id').references(() => enrolments.id),
    amountKobo: integer('amount_kobo').notNull(),
    /** 'outstanding' | 'paid' | 'void' */
    status: text().notNull().default('outstanding'),
    payoutReference: text('payout_reference'),
    paidAt: ts('paid_at'),
    note: text(),
    recordedById: integer('recorded_by_id').references(() => users.id),
    createdAt: created(),
  },
  (t) => [index('allocations_school_idx').on(t.schoolId)],
)

/** CONFIDENTIAL — private reconciliation statements. */
export const reconciliationStatements = pgTable('reconciliation_statements', {
  id: serial().primaryKey(),
  schoolId: integer('school_id').notNull().references(() => schools.id),
  periodStart: text('period_start').notNull(),
  periodEnd: text('period_end').notNull(),
  enrolmentCount: integer('enrolment_count').notNull(),
  totalKobo: integer('total_kobo').notNull(),
  paidKobo: integer('paid_kobo').notNull(),
  outstandingKobo: integer('outstanding_kobo').notNull(),
  lines: jsonb().$type<Array<{ date: string; course: string; amountKobo: number; status: string }>>().notNull().default([]),
  releasedToSchool: boolean('released_to_school').notNull().default(false),
  releasedAt: ts('released_at'),
  generatedById: integer('generated_by_id').references(() => users.id),
  createdAt: created(),
})

/** Approved academic reports shared with a partner school (no financial data). */
export const schoolReports = pgTable('school_reports', {
  id: serial().primaryKey(),
  schoolId: integer('school_id').notNull().references(() => schools.id),
  cohortId: integer('cohort_id').references(() => cohorts.id),
  title: text().notNull(),
  summary: text().notNull(),
  stats: jsonb().$type<Record<string, number>>().notNull().default({}),
  approvedById: integer('approved_by_id').references(() => users.id),
  approvedAt: ts('approved_at'),
  createdAt: created(),
})

/** Real learner testimonials, published only with consent. */
export const testimonials = pgTable('testimonials', {
  id: serial().primaryKey(),
  name: text().notNull(),
  context: text().notNull().default(''),
  quote: text().notNull(),
  consentConfirmed: boolean('consent_confirmed').notNull().default(false),
  published: boolean().notNull().default(false),
  createdAt: created(),
})

export const auditLogs = pgTable(
  'audit_logs',
  {
    id: serial().primaryKey(),
    actorUserId: integer('actor_user_id'),
    action: text().notNull(),
    entityType: text('entity_type').notNull(),
    entityId: text('entity_id'),
    details: jsonb().$type<Record<string, unknown>>(),
    createdAt: created(),
  },
  (t) => [index('audit_created_idx').on(t.createdAt)],
)

/** Admin-editable settings, e.g. bank transfer instructions. */
export const settings = pgTable('settings', {
  key: text().primaryKey(),
  value: jsonb().$type<Record<string, unknown>>().notNull(),
  updatedAt: ts('updated_at').notNull().defaultNow(),
})
