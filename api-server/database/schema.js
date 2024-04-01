import { pgTable, serial, text, uuid, varchar } from "drizzle-orm/pg-core";

export const projects = pgTable("projects", {
  id: uuid('uuid1').primaryKey(),
  slug: text('slug').unique(undefined, {nulls: 'distinct'}),
  status: text('status'),
});