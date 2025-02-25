ALTER TABLE "workspaces" ALTER COLUMN "name" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "workspaces" ADD COLUMN "slug" varchar(30) NOT NULL;--> statement-breakpoint
ALTER TABLE "workspaces" ADD CONSTRAINT "workspaces_slug_unique" UNIQUE("slug");