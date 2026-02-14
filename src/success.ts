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

app.innerHTML = `
  <div class="container">
    <h1>${projectId ? 'Swarm deployed' : 'Subscription active'}</h1>
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
    ` : `
      <p>Redirecting to repo selection...</p>
      <a class="btn" href="/select.html">Continue →</a>
    `}
  </div>
`

if (!projectId) {
  setTimeout(() => {
    window.location.href = '/select.html'
  }, 2000)
}
