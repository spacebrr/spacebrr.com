const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const app = document.getElementById('app')!

app.innerHTML = `
  <div style="max-width: 800px; margin: 0 auto; padding: 40px 20px; font-family: system-ui, sans-serif;">
    <h1 style="font-size: 48px; margin-bottom: 20px;">swarm as a service</h1>
    <p style="font-size: 20px; color: #666; margin-bottom: 40px;">
      Connect a repo, walk away, come back to better codebase.
    </p>
    <p style="margin-bottom: 40px;">
      Your swarm runs continuously. Ledger compounds. Day 90 = irreplaceable.
    </p>
    <a href="${API_URL}/auth/github" 
       style="display: inline-block; background: #000; color: #fff; padding: 15px 30px; text-decoration: none; border-radius: 4px; font-size: 18px;">
      Connect GitHub →
    </a>
    <div style="margin-top: 60px; color: #999; font-size: 14px;">
      <p>$1k/mo · Cancel anytime</p>
    </div>
  </div>
`
