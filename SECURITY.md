# Security Policy — Babel Origin Site

## Project status: proprietary, not open source

The Babel Origin Site is proprietary software. The source is published for source visibility and transparency only. The repository [LICENSE](LICENSE) is a proprietary license notice that grants no permission to copy, modify, redistribute, or build derivative works. The [README](README.md) states this in its opening banner and describes the repository as a public-safe static front door, not a production agent surface.

Because no permission to use the code has been granted, a defect in it is not a "vulnerability" in the open-source sense. It is a question about unauthorized use of unlicensed software, and that question belongs to the owner of the code, not to a public disclosure process. This file exists so the boundary is stated plainly instead of left to inference.

## What this repository does not offer

- **No security support.** The maintainer does not triage, investigate, or remediate security reports for this site.
- **No coordinated disclosure program.** There is no embargo, no safe harbor, and no private disclosure window.
- **No bug bounty.** No reward is offered.
- **No response-time commitment.** There is no SLA and no support window.
- **No supported versions.** No release is a supported security-fix channel.

## Scope of this site

This is deliberately the smallest possible attack surface, and the constraints are documented in the [README](README.md) rather than asserted here.

- **Static assets only.** The Vercel build has no framework preset beyond "Other", a `npm run build` build command, `public` as the output directory, and **no environment variables**. There is no server-side runtime, no database, and no credential in the repository.
- **Not a production agent surface.** The repository exists to host a public site and a bounded demo preview route. It is not an agent endpoint, and it should not be treated as one.
- **Claims are bounded by evidence.** The README's link policy requires that production readiness, autonomous agent reliability, catalog counts, and provider governance not be claimed without fresh public evidence. That discipline applies to security claims here too: this site makes none beyond what is stated in this file.

## Scope boundary

The [Babel](https://github.com/gthgomez/Babel) project is a separate repository with its own documentation and its own terms. Nothing in this file extends to it, and this site neither hosts nor proxies it. A concern about the agent harness belongs to that project.

## Reporting a genuine concern

If you believe you have found a genuine security concern, the honest position is that the maintainer has not accepted a support obligation, so there is no guaranteed response. If you choose to raise it anyway:

- Prefer GitHub's private vulnerability reporting for this repository (the **Security** tab → **Report a vulnerability**), if it is available to you.
- Otherwise contact the repository owner through their public profile at <https://github.com/gthgomez>.
- Do not open a public issue, and do not include working exploit code or third-party personal data in a public report.
- You receive no service commitment, no bounty, and no assurance of a fix.

## Visibility is not permission

The repository being public creates no support obligation. Publishing source does not grant a license, does not create a support contract, and does not make the maintainer a vendor to you. Opening an issue or submitting a pull request grants you no rights and creates no partnership; contributions are not accepted for reuse, and no license is granted over anything you send here.
