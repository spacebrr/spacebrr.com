# E2E Flow Trace: Failure Modes

Manual trace of signup → payment → provision → spawn → ledger flow. Documents what breaks at each step.

## Step 1: Landing Page (/)

**Expected**: Headline, metrics, waitlist form, "Get Started" CTA  
**Failure Modes**:
- API stats fetch fails → fallback to static numbers (metrics still render)
- Waitlist submit without email → HTML5 validation blocks
- "Get Started" → redirects to `/select.html` (Step 2)

**Breaking Points**: None critical. Page is static HTML + CSS.

---

## Step 2: OAuth Redirect (/select.html without session)

**Expected**: Redirect to landing if no `session_id` in localStorage  
**Flow**: Click "Login with GitHub" → `https://space-api.fly.dev/auth/github` → GitHub OAuth consent → callback sets session → redirect to `/select.html`

**Failure Modes**:
- GitHub OAuth app not configured → 404 on `/auth/github`
- Callback URL mismatch → OAuth error page
- Session not stored in localStorage → infinite redirect to `/`
- CORS issues → auth endpoint unreachable from browser

**Breaking Points**:
1. **GitHub OAuth app credentials missing** → Cannot initiate OAuth flow
2. **Callback URL wrong** → User stuck on GitHub error page
3. **Cookie/localStorage disabled** → Session not persisted, redirect loop

---

## Step 3: Subscription Check (/select.html with session)

**Expected**: `GET /api/subscription` returns `{status: "active"}` or `{status: "none"}`  
**Flow**: 
- If `status: "none"` → Show subscribe box with "Subscribe" button
- If `status: "active"` → Fetch repos (Step 4)

**Failure Modes**:
- API returns 401 → Session invalid, redirect to `/`
- API returns 500 → "Error loading subscription" message
- API returns 404 → Endpoint not deployed
- Stripe not configured → `GET /api/subscription` returns 503 (space-api/server.ts checks for Stripe keys)

**Breaking Points**:
1. **Stripe secrets missing** → 503 on `/api/subscription`, cannot determine subscription status
2. **Session expired** → 401, forces re-auth
3. **No subscription record in DB** → Returns `{status: "none"}`, shows subscribe box

---

## Step 4: Payment Flow (Subscribe)

**Expected**: Click "Subscribe" → `POST /api/checkout` → Redirect to Stripe Checkout → Complete payment → Webhook updates DB → Return to `/select.html`

**Failure Modes**:
- `POST /api/checkout` returns 503 → Stripe not configured (d/b407dd9b blocker)
- Stripe checkout fails → User abandons payment
- Webhook delivery fails → Payment succeeds but subscription not activated in DB
- Webhook signature mismatch → Subscription update rejected

**Breaking Points**:
1. **Stripe price ID wrong** → Checkout creates subscription with wrong plan
2. **Webhook secret wrong** → Signature validation fails, DB not updated
3. **User abandons payment** → No subscription, stuck on subscribe box
4. **Webhook not received** → Payment succeeded but DB out of sync, manual reconciliation required

**Current State**: Stripe not configured (d/b407dd9b). Flow blocked here unless `DISABLE_PAYMENT=true` deployed.

---

## Step 5: Repository Selection (/api/repos)

**Expected**: `GET /api/repos` returns GitHub repos for authenticated user  
**Flow**: User has active subscription → Fetch repos → Render repo list → Click repo → Fetch templates (Step 6)

**Failure Modes**:
- GitHub token missing → 503 or empty array
- GitHub API rate limit → 403, cannot fetch repos
- User has no repos → Empty state, no provision possible
- Token lacks `repo` scope → Repos hidden

**Breaking Points**:
1. **GitHub token not stored** → 503 on `/api/repos` (auth bridge incomplete per i/1791aa78)
2. **Token expired** → 401 from GitHub API, re-auth required
3. **User has 0 repos** → Cannot provision, show "no repos" message

**Current State**: Auth bridge incomplete (i/1791aa78, i/96421186). Supabase JWTs validated but no GitHub token bridge. `/api/repos` returns 503.

---

## Step 6: Template Selection (/api/templates)

**Expected**: `GET /api/templates` returns available agent templates  
**Flow**: Fetch templates → Render template options → Click template → Provision (Step 7)

**Failure Modes**:
- API returns 500 → Template loading fails
- No templates defined → Empty state, cannot proceed
- Template data malformed → Render error

**Breaking Points**:
1. **Templates not seeded in DB** → Empty array, no provision path
2. **Template validation fails** → Provision rejects invalid template

---

## Step 7: Provision (/api/provision)

**Expected**: `POST /api/provision {repo_name, repo_url, template}` → Clone repo → Create project in DB → Spawn scout agent → Return `{project_id}`

**Failure Modes**:
- Repo URL validation fails → 400 (non-GitHub URL rejected per E2E_TESTS.md:74)
- Path traversal in repo name → 400 (security validation per E2E_TESTS.md:75)
- Git clone fails → 500, repo inaccessible or private without token
- Database insert fails → 500, project not created
- Scout spawn fails → Project created but no agent work starts

**Breaking Points**:
1. **GitHub token missing** → Cannot clone private repos, provision fails with git error
2. **Repo URL not whitelisted** → Validation rejects non-GitHub repos (security enforcement)
3. **Database constraint violation** → Duplicate project_id or foreign key error
4. **Spawn daemon not running** → Project created but no scout agent spawns

---

## Step 8: Scout Agent Spawn

**Expected**: Daemon reads `projects` table → Spawns scout agent for new project → Scout explores repo → Writes insights to ledger

**Failure Modes**:
- Daemon not monitoring `projects` table → No spawn triggered
- Scout spawn fails → Exits early, no insights created
- Ledger write fails → Scout runs but insights not persisted
- Git clone in agent workspace fails → Scout cannot read code

**Breaking Points**:
1. **Daemon spawn logic broken** → Projects created but never processed
2. **Agent workspace isolation fails** → Dirty git state or file conflicts
3. **Ledger DB locked** → Scout cannot write insights, exits with error

---

## Step 9: Ledger Population

**Expected**: Scout agent writes insights → Tagged with project_id → Viewable in dashboard

**Failure Modes**:
- Insights written without project tag → Not associated with customer project
- Dashboard fetch filters by wrong project_id → Insights exist but not displayed
- Ledger DB performance degrades → Slow queries, dashboard times out

**Breaking Points**:
1. **Project tagging broken** → Insights written to global ledger, not customer-scoped
2. **Dashboard query inefficient** → Timeout on large ledger, no insights shown

---

## Critical Blockers (Pre-Launch)

| Step | Blocker | Status | Reference |
|------|---------|--------|-----------|
| 4 | Stripe secrets not configured | @human | d/b407dd9b |
| 5 | GitHub token bridge incomplete | Unresolved | i/1791aa78 |

## Non-Critical Failures (Degraded UX, not blocking)

- Metrics API down → Static fallback renders
- Waitlist submit fails → User can still OAuth
- Template fetch slow → Loading state shows

## Rollback Path (d/310d1e7b)

If Stripe not ready by 2026-02-20:
1. Deploy with `DISABLE_PAYMENT=true`
2. Skip subscription check (Step 3)
3. Allow provision without payment (Step 7)
4. Manual invoicing post-provision
5. Payment enforcement D+1 when Stripe configured
