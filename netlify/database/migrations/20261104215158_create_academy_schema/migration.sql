CREATE TABLE "assessment_results" (
	"id" serial PRIMARY KEY,
	"assessment_id" integer NOT NULL,
	"enrolment_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"score_percent" integer NOT NULL,
	"attempt" integer DEFAULT 1 NOT NULL,
	"answers" jsonb,
	"recorded_by_id" integer,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assessments" (
	"id" serial PRIMARY KEY,
	"course_id" integer NOT NULL,
	"title" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"kind" text DEFAULT 'quiz' NOT NULL,
	"weight" integer DEFAULT 1 NOT NULL,
	"questions" jsonb DEFAULT '[]' NOT NULL,
	"max_attempts" integer DEFAULT 3 NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"published" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assignment_submissions" (
	"id" serial PRIMARY KEY,
	"assignment_id" integer NOT NULL,
	"enrolment_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"content" text NOT NULL,
	"link_url" text,
	"status" text DEFAULT 'submitted' NOT NULL,
	"score" integer,
	"feedback" text,
	"reviewed_by_id" integer,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"reviewed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "assignments" (
	"id" serial PRIMARY KEY,
	"course_id" integer NOT NULL,
	"lesson_id" integer,
	"title" text NOT NULL,
	"instructions" text NOT NULL,
	"kind" text DEFAULT 'assignment' NOT NULL,
	"max_score" integer DEFAULT 100 NOT NULL,
	"is_required" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "attendance" (
	"id" serial PRIMARY KEY,
	"live_session_id" integer NOT NULL,
	"enrolment_id" integer NOT NULL,
	"status" text NOT NULL,
	"marked_by_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" serial PRIMARY KEY,
	"actor_user_id" integer,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text,
	"details" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "certificates" (
	"id" serial PRIMARY KEY,
	"number" text NOT NULL UNIQUE,
	"verification_code" text NOT NULL UNIQUE,
	"user_id" integer NOT NULL,
	"course_id" integer NOT NULL,
	"completion_id" integer NOT NULL UNIQUE,
	"student_name" text NOT NULL,
	"course_title" text NOT NULL,
	"completed_on" text NOT NULL,
	"issued_by_id" integer,
	"issued_at" timestamp with time zone DEFAULT now() NOT NULL,
	"revoked_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "cohorts" (
	"id" serial PRIMARY KEY,
	"course_id" integer NOT NULL,
	"name" text NOT NULL,
	"school_id" integer,
	"instructor_id" integer,
	"starts_on" text,
	"ends_on" text,
	"status" text DEFAULT 'planned' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "course_completions" (
	"id" serial PRIMARY KEY,
	"enrolment_id" integer NOT NULL UNIQUE,
	"user_id" integer NOT NULL,
	"course_id" integer NOT NULL,
	"overall_score" integer NOT NULL,
	"verified_by_id" integer NOT NULL,
	"verified_at" timestamp with time zone DEFAULT now() NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "course_modules" (
	"id" serial PRIMARY KEY,
	"course_id" integer NOT NULL,
	"week" integer NOT NULL,
	"title" text NOT NULL,
	"summary" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "courses" (
	"id" serial PRIMARY KEY,
	"slug" text NOT NULL UNIQUE,
	"level" integer NOT NULL UNIQUE,
	"title" text NOT NULL,
	"level_label" text NOT NULL,
	"summary" text NOT NULL,
	"description" text NOT NULL,
	"outcomes" jsonb DEFAULT '[]' NOT NULL,
	"duration_label" text,
	"delivery" text,
	"audience" text,
	"prerequisites_text" text,
	"prerequisite_course_id" integer,
	"price_kobo" integer,
	"currency" text DEFAULT 'NGN' NOT NULL,
	"status" text DEFAULT 'locked' NOT NULL,
	"pass_mark_percent" integer DEFAULT 60 NOT NULL,
	"attendance_requirement_percent" integer DEFAULT 75 NOT NULL,
	"image" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "enrolments" (
	"id" serial PRIMARY KEY,
	"user_id" integer NOT NULL,
	"course_id" integer NOT NULL,
	"cohort_id" integer,
	"school_id" integer,
	"payment_id" integer,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "guardian_consents" (
	"id" serial PRIMARY KEY,
	"user_id" integer NOT NULL UNIQUE,
	"guardian_name" text NOT NULL,
	"guardian_email" text,
	"guardian_phone" text NOT NULL,
	"relationship" text NOT NULL,
	"declared_at" timestamp with time zone DEFAULT now() NOT NULL,
	"status" text DEFAULT 'declared' NOT NULL,
	"verified_by_id" integer,
	"verified_at" timestamp with time zone,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "lesson_progress" (
	"id" serial PRIMARY KEY,
	"enrolment_id" integer NOT NULL,
	"lesson_id" integer NOT NULL,
	"completed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lessons" (
	"id" serial PRIMARY KEY,
	"course_id" integer NOT NULL,
	"module_id" integer,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"title" text NOT NULL,
	"kind" text DEFAULT 'reading' NOT NULL,
	"summary" text DEFAULT '' NOT NULL,
	"content" text DEFAULT '' NOT NULL,
	"secondary_note" text,
	"video_url" text,
	"duration_minutes" integer,
	"is_required" boolean DEFAULT true NOT NULL,
	"is_live_session" boolean DEFAULT false NOT NULL,
	"published" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "live_sessions" (
	"id" serial PRIMARY KEY,
	"cohort_id" integer NOT NULL,
	"lesson_id" integer,
	"title" text NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"duration_minutes" integer DEFAULT 60 NOT NULL,
	"meeting_url" text
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" serial PRIMARY KEY,
	"reference" text NOT NULL UNIQUE,
	"user_id" integer NOT NULL,
	"course_id" integer NOT NULL,
	"amount_kobo" integer NOT NULL,
	"currency" text DEFAULT 'NGN' NOT NULL,
	"provider" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"provider_transaction_id" text UNIQUE,
	"payer_name" text,
	"transfer_note" text,
	"verified_by_id" integer,
	"verified_at" timestamp with time zone,
	"failure_reason" text,
	"refunded_at" timestamp with time zone,
	"refund_reference" text,
	"refund_reason" text,
	"refunded_by_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reconciliation_statements" (
	"id" serial PRIMARY KEY,
	"school_id" integer NOT NULL,
	"period_start" text NOT NULL,
	"period_end" text NOT NULL,
	"enrolment_count" integer NOT NULL,
	"total_kobo" integer NOT NULL,
	"paid_kobo" integer NOT NULL,
	"outstanding_kobo" integer NOT NULL,
	"lines" jsonb DEFAULT '[]' NOT NULL,
	"released_to_school" boolean DEFAULT false NOT NULL,
	"released_at" timestamp with time zone,
	"generated_by_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "school_agreements" (
	"id" serial PRIMARY KEY,
	"school_id" integer NOT NULL,
	"allocation_per_enrolment_kobo" integer NOT NULL,
	"starts_on" text NOT NULL,
	"ends_on" text,
	"status" text DEFAULT 'active' NOT NULL,
	"document_ref" text,
	"notes" text,
	"created_by_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "school_allocations" (
	"id" serial PRIMARY KEY,
	"school_id" integer NOT NULL,
	"agreement_id" integer,
	"payment_id" integer NOT NULL UNIQUE,
	"enrolment_id" integer,
	"amount_kobo" integer NOT NULL,
	"status" text DEFAULT 'outstanding' NOT NULL,
	"payout_reference" text,
	"paid_at" timestamp with time zone,
	"note" text,
	"recorded_by_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "school_enquiries" (
	"id" serial PRIMARY KEY,
	"school_name" text NOT NULL,
	"location" text NOT NULL,
	"school_type" text NOT NULL,
	"contact_name" text NOT NULL,
	"position" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"student_population" text NOT NULL,
	"year_group" text NOT NULL,
	"message" text,
	"status" text DEFAULT 'new' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "school_members" (
	"id" serial PRIMARY KEY,
	"school_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"position" text,
	"can_view_reconciliation" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "school_reports" (
	"id" serial PRIMARY KEY,
	"school_id" integer NOT NULL,
	"cohort_id" integer,
	"title" text NOT NULL,
	"summary" text NOT NULL,
	"stats" jsonb DEFAULT '{}' NOT NULL,
	"approved_by_id" integer,
	"approved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "schools" (
	"id" serial PRIMARY KEY,
	"code" text NOT NULL UNIQUE,
	"name" text NOT NULL,
	"location" text DEFAULT '' NOT NULL,
	"country" text DEFAULT 'Nigeria' NOT NULL,
	"school_type" text DEFAULT '' NOT NULL,
	"contact_name" text,
	"contact_position" text,
	"contact_email" text,
	"contact_phone" text,
	"status" text DEFAULT 'prospect' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"key" text PRIMARY KEY,
	"value" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "testimonials" (
	"id" serial PRIMARY KEY,
	"name" text NOT NULL,
	"context" text DEFAULT '' NOT NULL,
	"quote" text NOT NULL,
	"consent_confirmed" boolean DEFAULT false NOT NULL,
	"published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY,
	"identity_id" text NOT NULL UNIQUE,
	"email" text NOT NULL UNIQUE,
	"full_name" text DEFAULT '' NOT NULL,
	"phone" text,
	"country" text,
	"role" text DEFAULT 'student' NOT NULL,
	"age_group" text,
	"school_id" integer,
	"school_name_other" text,
	"school_link_status" text DEFAULT 'none' NOT NULL,
	"intended_course" text,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "results_enrolment_idx" ON "assessment_results" ("enrolment_id");--> statement-breakpoint
CREATE UNIQUE INDEX "assessments_order_unique" ON "assessments" ("course_id","sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "submissions_unique" ON "assignment_submissions" ("assignment_id","enrolment_id");--> statement-breakpoint
CREATE UNIQUE INDEX "assignments_order_unique" ON "assignments" ("course_id","sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "attendance_unique" ON "attendance" ("live_session_id","enrolment_id");--> statement-breakpoint
CREATE INDEX "audit_created_idx" ON "audit_logs" ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "modules_unique" ON "course_modules" ("course_id","week");--> statement-breakpoint
CREATE UNIQUE INDEX "enrolments_unique" ON "enrolments" ("user_id","course_id");--> statement-breakpoint
CREATE INDEX "enrolments_school_idx" ON "enrolments" ("school_id");--> statement-breakpoint
CREATE UNIQUE INDEX "progress_unique" ON "lesson_progress" ("enrolment_id","lesson_id");--> statement-breakpoint
CREATE UNIQUE INDEX "lessons_order_unique" ON "lessons" ("course_id","sort_order");--> statement-breakpoint
CREATE INDEX "payments_user_idx" ON "payments" ("user_id");--> statement-breakpoint
CREATE INDEX "payments_status_idx" ON "payments" ("status");--> statement-breakpoint
CREATE INDEX "allocations_school_idx" ON "school_allocations" ("school_id");--> statement-breakpoint
CREATE UNIQUE INDEX "school_members_unique" ON "school_members" ("school_id","user_id");--> statement-breakpoint
CREATE INDEX "users_school_idx" ON "users" ("school_id");--> statement-breakpoint
CREATE INDEX "users_role_idx" ON "users" ("role");--> statement-breakpoint
ALTER TABLE "assessment_results" ADD CONSTRAINT "assessment_results_assessment_id_assessments_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "assessments"("id");--> statement-breakpoint
ALTER TABLE "assessment_results" ADD CONSTRAINT "assessment_results_enrolment_id_enrolments_id_fkey" FOREIGN KEY ("enrolment_id") REFERENCES "enrolments"("id");--> statement-breakpoint
ALTER TABLE "assessment_results" ADD CONSTRAINT "assessment_results_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "assessment_results" ADD CONSTRAINT "assessment_results_recorded_by_id_users_id_fkey" FOREIGN KEY ("recorded_by_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_course_id_courses_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id");--> statement-breakpoint
ALTER TABLE "assignment_submissions" ADD CONSTRAINT "assignment_submissions_assignment_id_assignments_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "assignments"("id");--> statement-breakpoint
ALTER TABLE "assignment_submissions" ADD CONSTRAINT "assignment_submissions_enrolment_id_enrolments_id_fkey" FOREIGN KEY ("enrolment_id") REFERENCES "enrolments"("id");--> statement-breakpoint
ALTER TABLE "assignment_submissions" ADD CONSTRAINT "assignment_submissions_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "assignment_submissions" ADD CONSTRAINT "assignment_submissions_reviewed_by_id_users_id_fkey" FOREIGN KEY ("reviewed_by_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_course_id_courses_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id");--> statement-breakpoint
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_lesson_id_lessons_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id");--> statement-breakpoint
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_live_session_id_live_sessions_id_fkey" FOREIGN KEY ("live_session_id") REFERENCES "live_sessions"("id");--> statement-breakpoint
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_enrolment_id_enrolments_id_fkey" FOREIGN KEY ("enrolment_id") REFERENCES "enrolments"("id");--> statement-breakpoint
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_marked_by_id_users_id_fkey" FOREIGN KEY ("marked_by_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_course_id_courses_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id");--> statement-breakpoint
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_completion_id_course_completions_id_fkey" FOREIGN KEY ("completion_id") REFERENCES "course_completions"("id");--> statement-breakpoint
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_issued_by_id_users_id_fkey" FOREIGN KEY ("issued_by_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "cohorts" ADD CONSTRAINT "cohorts_course_id_courses_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id");--> statement-breakpoint
ALTER TABLE "cohorts" ADD CONSTRAINT "cohorts_school_id_schools_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id");--> statement-breakpoint
ALTER TABLE "cohorts" ADD CONSTRAINT "cohorts_instructor_id_users_id_fkey" FOREIGN KEY ("instructor_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "course_completions" ADD CONSTRAINT "course_completions_enrolment_id_enrolments_id_fkey" FOREIGN KEY ("enrolment_id") REFERENCES "enrolments"("id");--> statement-breakpoint
ALTER TABLE "course_completions" ADD CONSTRAINT "course_completions_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "course_completions" ADD CONSTRAINT "course_completions_course_id_courses_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id");--> statement-breakpoint
ALTER TABLE "course_completions" ADD CONSTRAINT "course_completions_verified_by_id_users_id_fkey" FOREIGN KEY ("verified_by_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "course_modules" ADD CONSTRAINT "course_modules_course_id_courses_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id");--> statement-breakpoint
ALTER TABLE "enrolments" ADD CONSTRAINT "enrolments_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "enrolments" ADD CONSTRAINT "enrolments_course_id_courses_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id");--> statement-breakpoint
ALTER TABLE "enrolments" ADD CONSTRAINT "enrolments_cohort_id_cohorts_id_fkey" FOREIGN KEY ("cohort_id") REFERENCES "cohorts"("id");--> statement-breakpoint
ALTER TABLE "enrolments" ADD CONSTRAINT "enrolments_school_id_schools_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id");--> statement-breakpoint
ALTER TABLE "guardian_consents" ADD CONSTRAINT "guardian_consents_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "guardian_consents" ADD CONSTRAINT "guardian_consents_verified_by_id_users_id_fkey" FOREIGN KEY ("verified_by_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_enrolment_id_enrolments_id_fkey" FOREIGN KEY ("enrolment_id") REFERENCES "enrolments"("id");--> statement-breakpoint
ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_lesson_id_lessons_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id");--> statement-breakpoint
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_course_id_courses_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id");--> statement-breakpoint
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_module_id_course_modules_id_fkey" FOREIGN KEY ("module_id") REFERENCES "course_modules"("id");--> statement-breakpoint
ALTER TABLE "live_sessions" ADD CONSTRAINT "live_sessions_cohort_id_cohorts_id_fkey" FOREIGN KEY ("cohort_id") REFERENCES "cohorts"("id");--> statement-breakpoint
ALTER TABLE "live_sessions" ADD CONSTRAINT "live_sessions_lesson_id_lessons_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id");--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_course_id_courses_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id");--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_verified_by_id_users_id_fkey" FOREIGN KEY ("verified_by_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_refunded_by_id_users_id_fkey" FOREIGN KEY ("refunded_by_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "reconciliation_statements" ADD CONSTRAINT "reconciliation_statements_school_id_schools_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id");--> statement-breakpoint
ALTER TABLE "reconciliation_statements" ADD CONSTRAINT "reconciliation_statements_generated_by_id_users_id_fkey" FOREIGN KEY ("generated_by_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "school_agreements" ADD CONSTRAINT "school_agreements_school_id_schools_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id");--> statement-breakpoint
ALTER TABLE "school_agreements" ADD CONSTRAINT "school_agreements_created_by_id_users_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "school_allocations" ADD CONSTRAINT "school_allocations_school_id_schools_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id");--> statement-breakpoint
ALTER TABLE "school_allocations" ADD CONSTRAINT "school_allocations_agreement_id_school_agreements_id_fkey" FOREIGN KEY ("agreement_id") REFERENCES "school_agreements"("id");--> statement-breakpoint
ALTER TABLE "school_allocations" ADD CONSTRAINT "school_allocations_payment_id_payments_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id");--> statement-breakpoint
ALTER TABLE "school_allocations" ADD CONSTRAINT "school_allocations_enrolment_id_enrolments_id_fkey" FOREIGN KEY ("enrolment_id") REFERENCES "enrolments"("id");--> statement-breakpoint
ALTER TABLE "school_allocations" ADD CONSTRAINT "school_allocations_recorded_by_id_users_id_fkey" FOREIGN KEY ("recorded_by_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "school_members" ADD CONSTRAINT "school_members_school_id_schools_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id");--> statement-breakpoint
ALTER TABLE "school_members" ADD CONSTRAINT "school_members_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "school_reports" ADD CONSTRAINT "school_reports_school_id_schools_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id");--> statement-breakpoint
ALTER TABLE "school_reports" ADD CONSTRAINT "school_reports_cohort_id_cohorts_id_fkey" FOREIGN KEY ("cohort_id") REFERENCES "cohorts"("id");--> statement-breakpoint
ALTER TABLE "school_reports" ADD CONSTRAINT "school_reports_approved_by_id_users_id_fkey" FOREIGN KEY ("approved_by_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_school_id_schools_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id");