import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, githubReadme, githubReleases, githubIssues, InsertGithubReadme, InsertGithubRelease, InsertGithubIssue } from "../drizzle/schema";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === process.env.OWNER_OPEN_ID) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// GitHub README queries
export async function upsertGithubReadme(data: InsertGithubReadme) {
  const db = await getDb();
  if (!db) return;

  await db.insert(githubReadme).values(data).onDuplicateKeyUpdate({
    set: {
      content: data.content,
      lastUpdated: new Date(),
    },
  });
}

export async function getGithubReadme(owner: string, repo: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(githubReadme)
    .where(and(eq(githubReadme.owner, owner), eq(githubReadme.repo, repo)))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

// GitHub Releases queries
export async function upsertGithubRelease(data: InsertGithubRelease) {
  const db = await getDb();
  if (!db) return;

  await db.insert(githubReleases).values(data).onDuplicateKeyUpdate({
    set: {
      name: data.name,
      body: data.body,
      publishedAt: data.publishedAt,
      isDraft: data.isDraft,
      isPrerelease: data.isPrerelease,
      downloadUrl: data.downloadUrl,
      lastUpdated: new Date(),
    },
  });
}

export async function getGithubReleases(owner: string, repo: string) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(githubReleases)
    .where(and(eq(githubReleases.owner, owner), eq(githubReleases.repo, repo)))
    .orderBy(githubReleases.publishedAt);
}

// GitHub Issues queries
export async function upsertGithubIssue(data: InsertGithubIssue) {
  const db = await getDb();
  if (!db) return;

  await db.insert(githubIssues).values(data).onDuplicateKeyUpdate({
    set: {
      title: data.title,
      body: data.body,
      state: data.state,
      updatedAt: data.updatedAt,
      closedAt: data.closedAt,
      labels: data.labels,
      lastSyncedAt: new Date(),
    },
  });
}

export async function getGithubIssues(owner: string, repo: string, state?: string) {
  const db = await getDb();
  if (!db) return [];

  if (state) {
    return await db
      .select()
      .from(githubIssues)
      .where(and(eq(githubIssues.owner, owner), eq(githubIssues.repo, repo), eq(githubIssues.state, state)))
      .orderBy(githubIssues.updatedAt);
  }

  return await db
    .select()
    .from(githubIssues)
    .where(and(eq(githubIssues.owner, owner), eq(githubIssues.repo, repo)))
    .orderBy(githubIssues.updatedAt);
}
