import axios from "axios";
import { upsertGithubReadme, upsertGithubRelease, upsertGithubIssue } from "./db";

const GITHUB_API_BASE = "https://api.github.com";

interface GitHubRelease {
  id: number;
  tag_name: string;
  name: string | null;
  body: string | null;
  published_at: string | null;
  draft: boolean;
  prerelease: boolean;
  html_url: string;
}

interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  body: string | null;
  state: string;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  user: {
    login: string;
  };
  html_url: string;
  labels: Array<{ name: string }>;
}

export async function syncGitHubReadme(owner: string, repo: string, token?: string) {
  try {
    const headers = token ? { Authorization: `token ${token}` } : {};
    const response = await axios.get(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/readme`,
      {
        headers: {
          ...headers,
          Accept: "application/vnd.github.v3.raw",
        },
      }
    );

    await upsertGithubReadme({
      owner,
      repo,
      content: response.data,
    });

    console.log(`[GitHub Sync] README synced for ${owner}/${repo}`);
  } catch (error) {
    console.error(`[GitHub Sync] Failed to sync README for ${owner}/${repo}:`, error);
  }
}

export async function syncGitHubReleases(owner: string, repo: string, token?: string) {
  try {
    const headers = token ? { Authorization: `token ${token}` } : {};
    const response = await axios.get<GitHubRelease[]>(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/releases`,
      {
        headers,
        params: { per_page: 30 },
      }
    );

    for (const release of response.data) {
      await upsertGithubRelease({
        owner,
        repo,
        releaseId: release.id.toString(),
        tagName: release.tag_name,
        name: release.name,
        body: release.body,
        publishedAt: release.published_at ? new Date(release.published_at) : null,
        isDraft: release.draft ? 1 : 0,
        isPrerelease: release.prerelease ? 1 : 0,
        downloadUrl: release.html_url,
      });
    }

    console.log(`[GitHub Sync] ${response.data.length} releases synced for ${owner}/${repo}`);
  } catch (error) {
    console.error(`[GitHub Sync] Failed to sync releases for ${owner}/${repo}:`, error);
  }
}

export async function syncGitHubIssues(owner: string, repo: string, token?: string) {
  try {
    const headers = token ? { Authorization: `token ${token}` } : {};
    const response = await axios.get<GitHubIssue[]>(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/issues`,
      {
        headers,
        params: { state: "all", per_page: 100 },
      }
    );

    for (const issue of response.data) {
      await upsertGithubIssue({
        owner,
        repo,
        issueId: issue.id.toString(),
        number: issue.number,
        title: issue.title,
        body: issue.body,
        state: issue.state,
        createdAt: new Date(issue.created_at),
        updatedAt: new Date(issue.updated_at),
        closedAt: issue.closed_at ? new Date(issue.closed_at) : null,
        author: issue.user.login,
        url: issue.html_url,
        labels: JSON.stringify(issue.labels.map((l) => l.name)),
      });
    }

    console.log(`[GitHub Sync] ${response.data.length} issues synced for ${owner}/${repo}`);
  } catch (error) {
    console.error(`[GitHub Sync] Failed to sync issues for ${owner}/${repo}:`, error);
  }
}

export async function syncAllGitHubData(owner: string, repo: string, token?: string) {
  console.log(`[GitHub Sync] Starting sync for ${owner}/${repo}`);
  await Promise.all([
    syncGitHubReadme(owner, repo, token),
    syncGitHubReleases(owner, repo, token),
    syncGitHubIssues(owner, repo, token),
  ]);
  console.log(`[GitHub Sync] Completed sync for ${owner}/${repo}`);
}
