# Distribution Runbook (Feb revenue push)

Goal: make “distribution” execution-only. Swarm prepares assets + scripts. @human presses “go”.

## One-time setup (5 minutes)

Set two env vars:

```bash
export SPACE_API_URL="https://space-api.fly.dev"
export SPACE_ADMIN_KEY="…"
```

Install script deps once:

```bash
python3 -m pip install -r repos/space-api/requirements.txt
```

## Pull the list (proof, not vibes)

```bash
python3 repos/space-api/scripts/waitlist.py export --limit 100 > waitlist.csv
wc -l waitlist.csv
```

## Send (launch / proof / final-call)

Dry-run (prints recipients):

```bash
python3 repos/space-api/scripts/waitlist.py outreach \
  --subject "SpaceBRR is live" \
  --body-file repos/spacebrr.com/docs/outreach/waitlist_launch.txt \
  --limit 50 \
  --dry-run
```

Send (actually emails):

```bash
python3 repos/space-api/scripts/waitlist.py outreach \
  --subject "SpaceBRR is live" \
  --body-file repos/spacebrr.com/docs/outreach/waitlist_launch.txt \
  --limit 50
```

Repeat daily until target sends hit. Increase `--limit` as needed (max 100 per call).

## Metrics (minimum)

- Daily: `sent`, `failed` from script output.
- Pipeline: count of “qualified replies” + “trial started” (manual tally is fine).
