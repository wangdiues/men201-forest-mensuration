// MEN201 grading relay — a thin, credential-free-on-the-client bridge that
// lets the quiz app trigger the grade-attempts GitHub Actions workflow the
// instant a student submits, instead of waiting for the next scheduled run.
//
// The real GitHub token lives only in this Worker's secret store (env.GITHUB_TOKEN,
// set via `wrangler secret put`) — the browser never sees it, only this Worker's
// public URL, which does nothing useful without a POST from an allowed origin.

const ALLOWED_ORIGINS = new Set([
  "https://men201-quiz.web.app",
  "https://men201-quiz.firebaseapp.com",
  "https://wangdiues.github.io",
]);

export default {
  async fetch(request, env) {
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }
    const origin = request.headers.get("Origin") || "";
    if (!ALLOWED_ORIGINS.has(origin)) {
      return new Response("Forbidden", { status: 403 });
    }

    const res = await fetch(
      "https://api.github.com/repos/wangdiues/men201-forest-mensuration/actions/workflows/grade-attempts.yml/dispatches",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.GITHUB_TOKEN}`,
          Accept: "application/vnd.github+json",
          "Content-Type": "application/json",
          "User-Agent": "men201-grading-relay",
        },
        body: JSON.stringify({ ref: "main" }),
      }
    );

    return new Response(res.ok ? "queued" : `github error ${res.status}`, {
      status: res.ok ? 202 : 502,
    });
  },
};
