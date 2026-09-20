# MEN201 grading relay

A small Cloudflare Worker that triggers the `grade-attempts` GitHub Actions
workflow the instant a student submits a paper (or a tutor saves manual
grades), instead of waiting for its normal every-5-minutes schedule. See
`.github/workflows/grade-attempts.yml` and `quiz/js/grade-attempts.js` at
the repo root for the actual grading logic — this relay only ever triggers
that workflow, it contains no grading logic of its own.

## Why it exists

Triggering a GitHub Actions `workflow_dispatch` from a student's browser
needs a token with `actions:write` on the repo. Embedding that token
client-side (even narrowly scoped) means it's visible to anyone who opens
dev tools. This Worker holds the real token server-side instead — the
browser only ever calls the Worker's public URL with no credential at all.

```
student's browser --(POST, no credential)--> this Worker --(Bearer token)--> GitHub Actions API
```

## Live URL

`https://men201-grading-relay.wangs5050.workers.dev`

Deployed under the `wangs5050@gmail.com` Cloudflare account (Workers free
tier — 100,000 requests/day, no card required).

## How it's called

`quiz/js/quiz-engine.js` (after a student submits) and
`quiz/js/teacher-grade.js` (after a tutor saves manual grades) both fire:

```js
navigator.sendBeacon("https://men201-grading-relay.wangs5050.workers.dev");
```

`sendBeacon`, not `fetch` — the call happens right before navigating away
(to the result page, or re-rendering the grading queue), and unlike a bare
un-awaited `fetch`, a beacon is guaranteed to actually be sent even though
the page unloads immediately after. Both call sites treat this as
best-effort: if the relay is unreachable, offline, or blocked, the
scheduled workflow run still grades everything within 5 minutes regardless
— nothing depends on the relay for correctness, only for latency.

## Security

- The Worker only accepts `POST` requests whose `Origin` header is one of
  `men201-quiz.web.app`, `men201-quiz.firebaseapp.com`, or
  `wangdiues.github.io` (see `ALLOWED_ORIGINS` in `src/index.js`) — add a
  new hosting domain there if the site ever moves or gains a mirror.
- The GitHub token lives only in the Worker's secret store, set via
  `wrangler secret put` (below). It is never in this repo, never sent to
  the browser, and doesn't appear in Worker logs.
- Worst case if the Worker's URL leaks: someone can spam-trigger our own
  already-free grading workflow. Harmless — grading zero pending attempts
  is a fast no-op, and GitHub Actions minutes are unlimited for public
  repos.
- The token currently in use is the `gh` CLI's own OAuth token (`gh auth
  token`), which has broader scope than strictly necessary (`repo`,
  `gist`, `read:org`, `workflow` — not just `actions:write`). That's an
  accepted tradeoff for setup simplicity, since the token never leaves the
  server side. Swap in a narrower fine-grained PAT (Settings → Developer
  settings → Personal access tokens → Fine-grained tokens, scoped to only
  this repo with only "Actions: Read and write") for tighter hygiene if
  desired — no code change needed, just re-run the `secret put` step below
  with the new token.

## Setup / redeploy

Requires a Cloudflare account and `wrangler` (via `npx`, no global install
needed). One-time login:

```bash
npx wrangler login
```

Deploy (from this directory):

```bash
npx wrangler deploy
```

Set or rotate the GitHub token secret (also from this directory):

```bash
gh auth token | npx wrangler secret put GITHUB_TOKEN
```

`wrangler secret put` reads the value from stdin here, so the token is
never typed into the shell directly or shown on screen.

## Verifying it's working

```bash
# Should print "queued" with HTTP 202:
curl -s -X POST -H "Origin: https://men201-quiz.web.app" -w "\nHTTP:%{http_code}\n" \
  https://men201-grading-relay.wangs5050.workers.dev

# Confirm it actually started a real workflow run:
gh run list --repo wangdiues/men201-forest-mensuration --workflow=grade-attempts.yml --limit 1

# Confirm the secret is present (won't show its value):
npx wrangler secret list
```

A request without an allowed `Origin` header should get `403 Forbidden`;
a GET request should get `405 Method not allowed`; if `GITHUB_TOKEN` isn't
set, GitHub returns `401` and the Worker relays that back as
`github error 401` with HTTP `502`.
