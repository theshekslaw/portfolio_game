CREATE TYPE "public"."reading_kind" AS ENUM('book', 'paper');--> statement-breakpoint
CREATE TYPE "public"."reading_status" AS ENUM('reading', 'finished', 'want');--> statement-breakpoint
CREATE TABLE "reading_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"kind" "reading_kind" NOT NULL,
	"title" text NOT NULL,
	"authors" text,
	"status" "reading_status" DEFAULT 'reading' NOT NULL,
	"progress" integer,
	"note" text,
	"venue" text,
	"year" integer,
	"identifier" text,
	"url" text,
	"started_at" date,
	"finished_at" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
