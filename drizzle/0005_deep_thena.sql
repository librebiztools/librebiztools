ALTER TABLE "user_workspace_roles" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "user_workspace_roles" ADD COLUMN "created_by" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "name" varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE "user_workspace_roles" ADD CONSTRAINT "user_workspace_roles_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;