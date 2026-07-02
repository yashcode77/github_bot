import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import { GitHubApiError } from "../lib/errors.js";

const GITHUB_API = "https://api.github.com";
const WEBHOOK_EVENTS = ["issues", "pull_request", "push"];

async function parseResponseBody(response) {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

function mapGitHubStatus(status) {
  if (status === 401 || status === 403) {
    return 403;
  }

  if (status === 404) {
    return 404;
  }

  if (status >= 500) {
    return 502;
  }

  return 400;
}

async function githubRequest(path, accessToken, options = {}) {
  const response = await fetch(`${GITHUB_API}${path}`, {
    ...options,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${accessToken}`,
      "X-GitHub-Api-Version": "2022-11-28",
      ...(options.body && { "Content-Type": "application/json" }),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const body = await parseResponseBody(response);

    logger.error(
      {
        status: response.status,
        path,
        githubMessage: body?.message,
      },
      "GitHub API request failed",
    );

    throw new GitHubApiError(
      body?.message || "GitHub API request failed",
      mapGitHubStatus(response.status),
    );
  }

  if (response.status === 204) {
    return null;
  }

  return parseResponseBody(response);
}

function toRepositorySummary(repo) {
  return {
    id: repo.id,
    name: repo.name,
    owner: repo.owner.login,
    fullName: repo.full_name,
    isPrivate: repo.private,
  };
}

export const githubService = {
  async listOwnedRepositories(accessToken) {
    const repositories = [];
    let page = 1;

    while (true) {
      const pageRepos = await githubRequest(
        `/user/repos?affiliation=owner&per_page=100&page=${page}&sort=updated`,
        accessToken,
      );

      if (!pageRepos?.length) {
        break;
      }

      repositories.push(...pageRepos.map(toRepositorySummary));

      if (pageRepos.length < 100) {
        break;
      }

      page += 1;
    }

    return repositories;
  },

  async getRepository(accessToken, owner, name) {
    const repo = await githubRequest(`/repos/${owner}/${name}`, accessToken);
    return toRepositorySummary(repo);
  },

  async createWebhook(accessToken, owner, name) {
    const hook = await githubRequest(`/repos/${owner}/${name}/hooks`, accessToken, {
      method: "POST",
      body: JSON.stringify({
        name: "web",
        active: true,
        events: WEBHOOK_EVENTS,
        config: {
          url: `${env.BACKEND_URL}/webhooks/github`,
          content_type: "json",
          secret: env.GITHUB_WEBHOOK_SECRET,
          insecure_ssl: "0",
        },
      }),
    });

    return hook.id;
  },

  async deleteWebhook(accessToken, owner, name, webhookId) {
    await githubRequest(`/repos/${owner}/${name}/hooks/${webhookId}`, accessToken, {
      method: "DELETE",
    });
  },
};
