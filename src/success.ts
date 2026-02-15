const app = document.getElementById('app')!

const style = document.createElement('style')
style.textContent = `
  body {
    font-family: system-ui, sans-serif;
    background: #000;
    color: #fff;
    margin: 0;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .container {
    text-align: center;
    padding: 40px;
  }
  h1 { font-size: 48px; margin: 0 0 16px 0; }
  p { color: #888; font-size: 18px; margin: 0 0 32px 0; }
  .btn {
    background: #fff;
    color: #000;
    padding: 16px 32px;
    border: none;
    border-radius: 6px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    text-decoration: none;
    display: inline-block;
  }
  .btn:hover { transform: translateY(-1px); }
`
document.head.appendChild(style)

const params = new URLSearchParams(window.location.search)
const projectId = params.get('project_id')
const repoName = params.get('repo')
const sessionId = params.get('session_id')
const API_URL = import.meta.env.VITE_API_URL || 'https://space-api.fly.dev'

async function handleCheckoutSuccess(stripeSessionId: string) {
  try {
    const res = await fetch(`${API_URL}/api/checkout/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: stripeSessionId })
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    
    if (data.success) {
      localStorage.setItem('session_id', data.session_id)
      app.innerHTML = `
        <div class="container">
          <h1>Subscription active</h1>
          <p>Your payment was successful. Redirecting to dashboard...</p>
          <a class="btn" href="https://app.spacebrr.com">Continue →</a>
        </div>
      `
      setTimeout(() => {
        window.location.href = 'https://app.spacebrr.com'
      }, 2000)
    } else {
      throw new Error(data.error || 'Checkout confirmation failed')
    }
  } catch (err) {
    app.innerHTML = `
      <div class="container">
        <h1>Error processing payment</h1>
        <p>${(err as Error).message}</p>
        <a class="btn" href="https://app.spacebrr.com">Back to dashboard →</a>
      </div>
    `
  }
}

app.innerHTML = `
  <div class="container">
    <h1>${projectId ? 'Swarm deployed' : sessionId ? 'Processing payment...' : 'Subscription active'}</h1>
    ${projectId ? `
      <p>Your swarm is running on <strong>${repoName || 'your repo'}</strong></p>
      <pre style="background: #111; padding: 20px; border-radius: 8px; text-align: left; max-width: 600px; margin: 24px auto; overflow-x: auto;">
# Install CLI
curl -fsSL https://spaceos.sh/install.sh | sh

# Watch your swarm
space tail ${projectId}

# View ledger
ledger ls -n 20
      </pre>
      <a class="btn" href="https://github.com/${repoName || ''}" target="_blank">View Repo →</a>
      <a class="btn" href="https://space-web.fly.dev" style="background: #111; color: #fff; border: 1px solid #333; margin-left: 12px;">Dashboard →</a>
    ` : sessionId ? `
      <p>Confirming your subscription...</p>
    ` : `
      <p>Redirecting to dashboard...</p>
      <a class="btn" href="https://app.spacebrr.com">Continue →</a>
    `}
  </div>
`

if (sessionId) {
  handleCheckoutSuccess(sessionId)
} else if (!projectId) {
  setTimeout(() => {
    window.location.href = 'https://app.spacebrr.com'
  }, 2000)
}
