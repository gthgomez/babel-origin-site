/**
 * Site-repository links. "Edit this page" targets must resolve on whatever
 * deployment a visitor is reading: on Vercel preview builds the branch name is
 * injected via VERCEL_GIT_COMMIT_REF (no secrets involved), so links point at
 * the campaign branch while the new site lives only there; after merge /
 * production builds they resolve to main. Locally and in other CI, main.
 */
export const SITE_REPO_URL = "https://github.com/gthgomez/babel-origin-site";
export const SITE_REPO_BRANCH =
  process.env.VERCEL_GIT_COMMIT_REF ??
  process.env.GITHUB_REF_NAME ??
  "main";

export function siteRepoUrl(path: string): string {
  const clean = path.replace(/^\//, "");
  return clean
    ? `${SITE_REPO_URL}/${clean}/${SITE_REPO_BRANCH}`
    : `${SITE_REPO_URL}`;
}
