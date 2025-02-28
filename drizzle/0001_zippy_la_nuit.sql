ALTER TABLE "users" ALTER COLUMN "password_hash" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "email_templates" ADD COLUMN "workspace_id" integer;--> statement-breakpoint
ALTER TABLE "user_workspace_roles" ADD COLUMN "accepted" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "email_templates" ADD CONSTRAINT "email_templates_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE no action ON UPDATE no action;