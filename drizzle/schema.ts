import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * GitHub README content
 */
export const githubReadme = mysqlTable("github_readme", {
  id: int("id").autoincrement().primaryKey(),
  owner: varchar("owner", { length: 255 }).notNull(),
  repo: varchar("repo", { length: 255 }).notNull(),
  content: text("content").notNull(),
  lastUpdated: timestamp("lastUpdated").defaultNow().notNull(),
});

export type GithubReadme = typeof githubReadme.$inferSelect;
export type InsertGithubReadme = typeof githubReadme.$inferInsert;

/**
 * GitHub Releases
 */
export const githubReleases = mysqlTable("github_releases", {
  id: int("id").autoincrement().primaryKey(),
  owner: varchar("owner", { length: 255 }).notNull(),
  repo: varchar("repo", { length: 255 }).notNull(),
  releaseId: varchar("releaseId", { length: 255 }).notNull().unique(),
  tagName: varchar("tagName", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }),
  body: text("body"),
  publishedAt: timestamp("publishedAt"),
  isDraft: int("isDraft").default(0),
  isPrerelease: int("isPrerelease").default(0),
  downloadUrl: varchar("downloadUrl", { length: 1024 }),
  lastUpdated: timestamp("lastUpdated").defaultNow().notNull(),
});

export type GithubRelease = typeof githubReleases.$inferSelect;
export type InsertGithubRelease = typeof githubReleases.$inferInsert;

/**
 * GitHub Issues
 */
export const githubIssues = mysqlTable("github_issues", {
  id: int("id").autoincrement().primaryKey(),
  owner: varchar("owner", { length: 255 }).notNull(),
  repo: varchar("repo", { length: 255 }).notNull(),
  issueId: varchar("issueId", { length: 255 }).notNull().unique(),
  number: int("number").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  body: text("body"),
  state: varchar("state", { length: 50 }).notNull(),
  createdAt: timestamp("createdAt"),
  updatedAt: timestamp("updatedAt"),
  closedAt: timestamp("closedAt"),
  author: varchar("author", { length: 255 }),
  url: varchar("url", { length: 1024 }),
  labels: text("labels"),
  lastSyncedAt: timestamp("lastSyncedAt").defaultNow().notNull(),
});

export type GithubIssue = typeof githubIssues.$inferSelect;
export type InsertGithubIssue = typeof githubIssues.$inferInsert;
