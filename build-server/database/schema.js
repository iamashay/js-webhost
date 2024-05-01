import { sql } from "drizzle-orm";
import { pgTable, text, uuid, timestamp, boolean, json } from "drizzle-orm/pg-core";

export const projects = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("userid").references(() => users.id, {
    'onDelete': 'set null'
  }),
  gitURL: text("giturl").notNull(),
  slug: text("slug").unique(undefined, { nulls: "distinct" }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const deployments = pgTable("deployments", {
  id: uuid("id").defaultRandom().primaryKey(),
  project: uuid("projectid").references(() => projects.id, {
    'onDelete': 'set null'
  }),
  status: text("status", {
    enum: ["Initial", "Queue", "Building", "Built", "Deploying", "Deployed", "Stopped", "Error", "Redeploying"],
  }).default("Initial"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  username: text("slug").unique().notNull(),
  firstName: text("firstName"),
  lastName: text("lastName"),
  password: text("password"),
  email: text("email"),
  avatar: text("avatar"),
  verifyToken: text("emailToken"),
  verifyTokenTime: timestamp("verifyTokenTime"),
  isVerified: boolean("isVerified"),
  forgotPassToken: text("forgotPassToken"),
  forgotPassTokenTime: timestamp("forgotPassTokenTime"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const external_provider = pgTable("external_providers", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("userId")
    .references(() => users.id, {
      onDelete: "cascade",
    })
    .notNull(),
  providerName: text("providerName"),
  token: text("token"),
  iat: timestamp("iat"),
  expireAt: timestamp("expireAt"),
});

export const session = pgTable("session", {
  sid: text('sid').primaryKey(),
  sess: json('sess'),
  expire: timestamp('expire')
});

export const deploymentLogs = pgTable("deployment_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  deployment: uuid("deploymentid").references(() => deployments.id, {
    'onDelete': 'set null'
  }),
  outputLog: text("outputlog"),
  errorLog: text("errorlog"),
  createdAt: timestamp("created_at").defaultNow(),
});