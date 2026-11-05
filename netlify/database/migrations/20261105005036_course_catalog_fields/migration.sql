ALTER TABLE "courses" DROP CONSTRAINT "courses_level_key";--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "category" text;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "skills" jsonb DEFAULT '[]' NOT NULL;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "instructor_name" text;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "instructor_bio" text;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "faqs" jsonb DEFAULT '[]' NOT NULL;--> statement-breakpoint
ALTER TABLE "lessons" ADD COLUMN "is_preview" boolean DEFAULT false NOT NULL;--> statement-breakpoint
UPDATE "courses" SET "category" = 'Artificial Intelligence', "skills" = '["Prompt writing", "AI literacy", "Fact-checking", "Responsible AI use", "Research with AI"]'::jsonb WHERE "slug" = 'ai-prompt-engineering' AND "category" IS NULL;
--> statement-breakpoint
UPDATE "courses" SET "category" = 'Productivity & Creativity', "skills" = '["AI productivity", "Digital content", "Documents & spreadsheets", "Presentations"]'::jsonb WHERE "slug" = 'ai-productivity-digital-creativity' AND "category" IS NULL;
--> statement-breakpoint
UPDATE "courses" SET "category" = 'Coding & Web', "skills" = '["HTML", "CSS", "JavaScript basics", "Web publishing"]'::jsonb WHERE "slug" = 'coding-web-development' AND "category" IS NULL;
--> statement-breakpoint
UPDATE "courses" SET "category" = 'Automation', "skills" = '["Process mapping", "No-code automation", "AI-assisted tools", "Digital risk assessment"]'::jsonb WHERE "slug" = 'ai-automation-digital-solutions' AND "category" IS NULL;
--> statement-breakpoint
UPDATE "courses" SET "category" = 'Innovation & Projects', "skills" = '["Problem research", "Project planning", "Prototyping", "Presenting"]'::jsonb WHERE "slug" = 'digital-innovation-project-development' AND "category" IS NULL;
--> statement-breakpoint
UPDATE "lessons" SET "is_preview" = true WHERE "id" = (SELECT l."id" FROM "lessons" l JOIN "courses" c ON c."id" = l."course_id" WHERE c."slug" = 'ai-prompt-engineering' AND l."published" = true ORDER BY l."sort_order" LIMIT 1);
