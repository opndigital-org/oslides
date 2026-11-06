# Contributing

> This project does not support the use of AI generated code.
Any issues submitted or contributions that is suspected of using AI for development will be closed, rejected and NOT merged. 

- [First contribution](#first-contribution)
- [Development Setup](#development-setup) 
- [Working on the code](#working-on-the-code)
  - [Pull Requests](#pull-requests)
  - [Branches](#branches)
  - [Commit Messages](#commit-messages)
- [Reporting Bugs](#reporting-bugs)
- [Security Issues](#security-issues)

## First contribution
1. Find an [approved and unassigned issue](https://github.com/opndigital-org/oslides/issues?q=is%3Aissue+state%3Aopen+label%3Astatus%3Aapproved+no%3Aassignee). For first time contributors, check issues labelled:
    - [`tag:good-first-issue`](https://github.com/opndigital-org/oslides/issues?q=is%3Aissue+state%3Aopen+label%3Astatus%3Aapproved+no%3Aassignee+label%3Atag%3Agood-first-issue)
    - [`tag:help-wanted`](https://github.com/opndigital-org/oslides/issues?q=is%3Aissue+state%3Aopen+label%3Astatus%3Aapproved+no%3Aassignee+label%3Atag%3Ahelp-wanted)
2. Comment on it ***"I'd like to take this"***.
    - A maintainer will assign you within 48 hours
3. Follow [Development Setup](#development-setup) to get started and [Working on the code](#working-on-the-code) on naming conventions for PRs, branches, commit messages (and signing off commits).
4. Open a PR early and keep it in ***Draft***. When you think its ready mark it as ***Ready for Review*** so we know to review it.

## Development Setup

1. Fork the repository to your own GitHub account, then run the following commands in your terminal.

```bash
git clone https://github.com/<your-username>/oslides.git
cd oslides
pnpm install
```

2. Start Supabase:

```bash
pnpm supabase:start
```

3. Copy the example env files and fill in the values the CLI printed:

```bash
cp api/.dev.vars.example api/.dev.vars
cp app/.env.example app/.env
```

4. Start the backend (api) and frontend (app):

```bash
pnpm dev:api      # Workers dev server  http://localhost:8600
pnpm dev:app      # Vite dev server     http://localhost:5173
```

API docs available at: `http://localhost:8600/docs`

## Working on the code
### Pull Requests

Keep PRs focused - The maintainers's job gets exponentially harder as scope grows.

1. Fork the repo see [Development Setup](#development-setup)
2. Make changes on a feature branch (see [Branches](#branches) and [Commit Messages](#commit-messages)).
3. Push and open a PR against `main` (see the following section for naming PRs).

```
<type>(<scope>):<short description>
```

Where `<type>` is one of:
- `feat`
- `fix`
- `docs`
- `refactor`
- `chore`
- `test`
- `ci`

And the short description matches the issue title where possible

Examples:

- `feat(app): add decks page`
- `fix(api): add register route`
- `docs: update database diagram`

4. Complete the PR template (provide a BRIEF description of the changes made and complete the relevant checkboxes). 
5. Mark as ***Draft*** if you're still working on it. Move to ***Ready for Review*** when it's ready to be reviewed by a maintainer.
6. Link the issue: ***"Closes #10"*** in the summary so it auto-closes the issue on merge.
7. The maintainer will review the PR as soon as possible and will leave a comment.
They may request changes, move your PR back to ***Draft*** while you work on it.
When it is ready move it back into ***Ready for Review***.

### Branches
```
<type>/<short-kebab-description>
```

Where `<type>` is one of:
- `feat`
- `fix`
- `docs`
- `refactor`
- `chore`
- `test`
- `ci`

Examples:

- `feat/add-settings-page`
- `fix/auth-redirect`
- `docs/architecture-diagram-update`

### Commit Messages

We loosely follow [Conventional Commits](https://www.conventionalcommits.org/).

```
<type>(<scope>): <imperative summary, 70 chars>

Signed-off-by: Your Name <you@example.com>
```

Good commit messages:
- `fix(app): add error message for failed save`
- `docs: add new step in github issues workflow`
- `feat(api): add error handling email when registering`

Bad commit messages:
- `wip`
- `fixed registration bug`
- `updated stuff`

## Reporting Bugs
1. Search [open]() and [closed]() issues before raising a bug (the bug may have already been reported/fixed).
2. Use the **Bug report** issue template and complete all fields.

**DO NOT REPORT SECURITY VUNERABILITIES as a GitHub issue.**
For more information of security vunerabilities see [Security Issues](#security-issues)

## Security Issues
Open a report at: https://github.com/opndigital-org/oslides/security/advisories/new

Provide the following:
- Title - a brief explanation of the issue
- Summary - A short clear description of the issue, its impact and severity
- Details - Further details if needed.
- Proof of concept - Steps to reproduce
- Impact - What kind of vulnerability is it? Who is impacted?
- The affected version, branch, or commit where possible
