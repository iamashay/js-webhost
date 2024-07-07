DO $$ BEGIN
 CREATE TYPE "deploymentstatus" AS ENUM('Initial', 'Queue', 'Building', 'Built', 'Deploying', 'Deployed', 'Stopped', 'Error', 'Redeploying');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "projecttype" AS ENUM('Static', 'React');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "deployment_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"deploymentid" uuid,
	"outputlog" text,
	"errorlog" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "deployments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"projectid" uuid,
	"status" "deploymentstatus" DEFAULT 'Initial',
	"created_at" timestamp DEFAULT now(),
	"buildScript" text DEFAULT null,
	"buildfolder" text DEFAULT null
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "session" (
	"sid" text PRIMARY KEY NOT NULL,
	"sess" json,
	"expire" timestamp
);
--> statement-breakpoint
ALTER TABLE "external_providers" DROP CONSTRAINT "external_providers_userId_users_id_fk";
--> statement-breakpoint
ALTER TABLE "external_providers" ALTER COLUMN "userId" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "external_providers" ADD COLUMN "iat" timestamp;--> statement-breakpoint
ALTER TABLE "external_providers" ADD COLUMN "expireAt" timestamp;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "userid" uuid;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "giturl" text NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "buildScript" text DEFAULT null;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "buildfolder" text DEFAULT null;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "projectype" "projecttype" DEFAULT 'React';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "password" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "email" text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "external_providers" ADD CONSTRAINT "external_providers_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "projects" ADD CONSTRAINT "projects_userid_users_id_fk" FOREIGN KEY ("userid") REFERENCES "users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "projects" DROP COLUMN IF EXISTS "status";--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "deployment_logs" ADD CONSTRAINT "deployment_logs_deploymentid_deployments_id_fk" FOREIGN KEY ("deploymentid") REFERENCES "deployments"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "deployments" ADD CONSTRAINT "deployments_projectid_projects_id_fk" FOREIGN KEY ("projectid") REFERENCES "projects"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
