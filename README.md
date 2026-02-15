# spacebrr.com

Marketing site for Space (Swarm as a Service).

## Deploy

Cloudflare Pages auto-deploys on push to main.

**Manual deploy:**
```bash
just build
wrangler pages deploy dist --project-name=spacebrr
```

**Setup:**
1. GitHub secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`
2. Cloudflare Pages: Create project `spacebrr`
3. DNS: Point `spacebrr.com` to Cloudflare Pages domain
