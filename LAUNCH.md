# Launch Checklist (Feb 20, 2026)

## Pre-Launch (Human)

### Stripe Setup (REQUIRED)
- [ ] Create Stripe account (if not exists)
- [ ] Create product "Space Swarm" in Stripe dashboard
- [ ] Create price: $1000/month recurring
- [ ] Note Stripe price ID (starts with `price_`)
- [ ] Create webhook: `https://space-api.fly.dev/api/webhook/stripe`
- [ ] Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
- [ ] Note webhook secret (starts with `whsec_`)
- [ ] Copy test keys (starts with `sk_test_`, `pk_test_`)

### Deploy Secrets to Fly.io
```bash
fly secrets set \
  STRIPE_SECRET_KEY="sk_test_..." \
  STRIPE_PUBLISHABLE_KEY="pk_test_..." \
  STRIPE_PRICE_ID="price_..." \
  STRIPE_WEBHOOK_SECRET="whsec_..."
```

### GitHub OAuth (VERIFY)
- [ ] Confirm GitHub OAuth app keys are in Fly environment
- [ ] Test: `curl https://space-api.fly.dev/api/health`

### Frontend Deploy (spacebrr.com)
- [ ] Enable GitHub Pages: https://github.com/spacebrr/spacebrr.com/settings/pages
- [ ] Branch: main, /
- [ ] Verify spacebrr.com is live

### Space-web Deploy (app.spacebrr.com)
- [ ] Deploy space-web to Vercel or Netlify
- [ ] Or: Enable on fly.io
- [ ] Update API_BASE in space-web to space-api.fly.dev

## Pre-Launch (Swarm — Automated)

- [x] space-api: OAuth, repos, provision, ledger endpoints
- [x] space-web: Dashboard (projects + ledger viewer)
- [x] spacebrr.com: Landing page + galaxy viz

## Launch Tests

### OAuth Flow
- [ ] Visit https://spacebrr.com/select
- [ ] Click "Login with GitHub"
- [ ] Confirm redirect back to select page
- [ ] Session token stored in localStorage

### Provision Flow
- [ ] Select a repo
- [ ] Click "Provision"
- [ ] Confirm project created in space.db
- [ ] Scout agent spawns automatically

### Dashboard Flow (space-web)
- [ ] OAuth → dashboard
- [ ] See projects list
- [ ] See ledger entries
- [ ] No realtime (acceptable for MVP)

### Payment Flow
- [ ] Click "Subscribe"
- [ ] Redirected to Stripe checkout
- [ ] Use test card (4242 4242 4242 4242)
- [ ] Verify subscription active in database

## Post-Launch

### Monitoring
- [ ] Watch space-api logs for errors
- [ ] Monitor Stripe webhook deliveries
- [ ] Track early user feedback

### Polish (Can defer)
- [ ] Add realtime streaming to space-web
- [ ] Improve mobile responsiveness
- [ ] Add visualization (gource-style)

## Rollback Plan

If payment isn't working by Feb 20:
- Deploy without payment enabled
- Launch as "pre-order" → manual invoicing
- Payment goes live as soon as Stripe is configured

## Deployment Commands

```bash
# space-api
cd ~/space/repos/space-api
fly deploy

# space-web (example: Vercel)
cd ~/space/repos/space-web
vercel deploy --prod

# spacebrr.com (enable pages)
# GitHub Pages will auto-deploy on push to main
```

## Contacts & Resources

- Stripe Dashboard: https://dashboard.stripe.com
- Fly.io Dashboard: https://fly.io
- GitHub Pages: https://github.com/spacebrr/spacebrr.com/settings/pages
- API Docs: https://space-api.fly.dev/api/health
