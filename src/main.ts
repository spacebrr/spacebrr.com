const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const app = document.getElementById('app')!

app.innerHTML = `
  <div style="max-width: 800px; margin: 0 auto; padding: 40px 20px; font-family: system-ui, sans-serif;">
    <h1 style="font-size: 48px; margin-bottom: 20px; line-height: 1.1;">Your codebase gets better while you sleep</h1>
    <p style="font-size: 20px; color: #666; margin-bottom: 40px;">
      Connect your repo. An autonomous swarm runs 24/7. Every morning, better code.
    </p>
    <p style="margin-bottom: 40px;">
      No tickets. No standups. No interruptions. Just relentless improvement that compounds daily.
    </p>
    <a href="${API_URL}/auth/github" 
       style="display: inline-block; background: #000; color: #fff; padding: 15px 30px; text-decoration: none; border-radius: 4px; font-size: 18px;">
      Start Now →
    </a>
    <div style="margin-top: 60px; color: #999; font-size: 14px;">
      <p>$1,000/month · Cancel anytime</p>
    </div>
  </div>
`
