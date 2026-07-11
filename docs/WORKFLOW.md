# Development and Preview Workflow

## Deployment structure

- `main` is the protected source of the production website.
- `agent/*` branches contain isolated tasks.
- `gh-pages` is generated state containing production plus active previews; never edit it manually.
- Production URL: `https://jruei.github.io/5dai-learning-quest/`
- Preview URL: `https://jruei.github.io/5dai-learning-quest/previews/pr-N/`

## Work lanes

### Independent content lane

These tasks may run in parallel when they own different files:

- one Day and one material page;
- material-specific assets;
- isolated content manifests or source inspection artifacts.

The task must list its owned paths before editing and must not adjust shared navigation, labels, CSS, JavaScript, validation, or deployment files as a side effect.

### Sequential platform lane

Only one platform task runs at a time. This lane owns:

- shared `js/` progress, reader, Firebase, and dashboard behavior;
- shared `css/` files;
- home page and global navigation;
- `.github/workflows/` and `scripts/validate-site.mjs`;
- shared contracts that another active task is also changing.

If two proposed tasks overlap any owned path, combine them into one branch or run them sequentially.

## Task lifecycle

1. Start from current `main` in a separate worktree and `agent/*` branch.
2. Declare owned paths and reread `AGENTS.md` plus the relevant `docs/mcp/` contract.
3. Implement and run `node scripts/validate-site.mjs`.
4. Commit only owned files, push the branch, and open a draft pull request.
5. Wait for both `validate` and `publish` checks.
6. Give the user the `/previews/pr-N/` URL for desktop and mobile review.
7. When approved, update the branch from current `main`, rerun checks, and merge through the integration workstream.
8. Update every remaining open branch from the new `main` before its next review or merge.

## User-facing review

- For visual website changes, a passing validation is the point to update the requested working-tree files and provide the webpage preview directly; do not pause for code-diff approval.
- The webpage or browser preview is the primary review surface. Code diffs are implementation detail unless the user asks for them.
- Ask the user to choose only when the choice changes the design direction. After the choice, apply the selected direction, validate it, and hand back the updated webpage view.

Closing or merging a pull request removes its preview automatically. Historical failed Actions remain visible, but only the latest checks determine whether a branch is ready.
