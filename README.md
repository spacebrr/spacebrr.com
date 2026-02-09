# spacebrr.com

## Deploy

GitHub Pages via GitHub Actions.

### Namecheap DNS (Advanced DNS)

Add these records:

| Type  | Host | Value              | TTL  |
|-------|------|--------------------|------|
| CNAME | www  | spacebrr.github.io | Auto |
| A     | @    | 185.199.108.153    | Auto |
| A     | @    | 185.199.109.153    | Auto |
| A     | @    | 185.199.110.153    | Auto |
| A     | @    | 185.199.111.153    | Auto |

### GitHub Settings

1. Go to repo Settings → Pages
2. Source: GitHub Actions
3. Custom domain: `spacebrr.com`
4. Enforce HTTPS
