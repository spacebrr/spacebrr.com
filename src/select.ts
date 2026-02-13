const API_URL = import.meta.env.VITE_API_URL || 'https://space-api.fly.dev'

const track = (event: string) => {
  fetch(`${API_URL}/api/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event, page: location.pathname, referrer: document.referrer }),
  }).catch(() => {})
}
track('pageview_select')

const app = document.getElementById('app')!

const style = document.createElement('style')
style.textContent = `
  body {
    font-family: system-ui, sans-serif;
    background: #000;
    color: #fff;
    margin: 0;
    min-height: 100vh;
  }
  .container {
    max-width: 800px;
    margin: 50px auto;
    padding: 20px;
  }
  h1 { margin-bottom: 30px; font-weight: 600; }
  .repo {
    border: 1px solid #333;
    padding: 15px;
    margin: 10px 0;
    border-radius: 6px;
    cursor: pointer;
    transition: border-color 0.1s;
  }
  .repo:hover {
    border-color: #666;
  }
  .repo-name { font-weight: bold; }
  .repo-desc { color: #888; font-size: 0.9em; margin-top: 4px; }
  .status { margin-top: 20px; color: #888; }
  .subscribe-box {
    border: 1px solid #333;
    padding: 32px;
    border-radius: 6px;
    text-align: center;
  }
  .subscribe-box h2 { margin: 0 0 12px 0; font-size: 24px; }
  .subscribe-box p { color: #888; margin: 0 0 24px 0; }
  .subscribe-btn {
    background: #fff;
    color: #000;
    padding: 16px 32px;
    border: none;
    border-radius: 6px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: transform 0.1s;
  }
  .subscribe-btn:hover { transform: translateY(-1px); }
`
document.head.appendChild(style)

const sessionId = localStorage.getItem('session_id')
if (!sessionId) {
  window.location.href = '/'
}

interface Repo {
  name: string
  full_name: string
  clone_url: string
  description: string | null
}

interface Template {
  id: string
  name: string
}

let selectedRepo: Repo | null = null

app.innerHTML = `
  <div class="container">
    <h1 id="heading">Loading...</h1>
    <div id="subscribe" style="display: none;"></div>
    <div id="repos" style="display: none;"></div>
    <div id="templates" style="display: none;"></div>
    <div class="status" id="status"></div>
  </div>
`

const subscribeDiv = document.getElementById('subscribe')!
const reposDiv = document.getElementById('repos')!
const templatesDiv = document.getElementById('templates')!
const statusDiv = document.getElementById('status')!
const heading = document.getElementById('heading')!

async function checkSubscription() {
  try {
    const res = await fetch(`${API_URL}/api/subscription`, {
      headers: { Authorization: `Bearer ${sessionId}` }
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    
    if (data.status === 'active') {
      showRepos()
    } else {
      showSubscribe()
    }
  } catch (err) {
    statusDiv.textContent = `Error: ${(err as Error).message}`
  }
}

function showSubscribe() {
  heading.textContent = 'Subscribe to continue'
  subscribeDiv.style.display = 'block'
  subscribeDiv.innerHTML = `
    <div class="subscribe-box">
      <h2>$1,000/month per repo</h2>
      <p>Cancel anytime. Swarm runs 24/7 on your codebase.</p>
      <button class="subscribe-btn" id="checkout-btn">Subscribe →</button>
    </div>
  `
  document.getElementById('checkout-btn')!.onclick = startCheckout
}

async function startCheckout() {
  track('checkout_initiated')
  statusDiv.textContent = 'Redirecting to checkout...'
  try {
    const res = await fetch(`${API_URL}/api/checkout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${sessionId}` }
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    if (data.url) {
      window.location.href = data.url
    } else {
      statusDiv.textContent = `Error: ${data.error || 'Failed to create checkout'}`
    }
  } catch (err) {
    statusDiv.textContent = `Error: ${(err as Error).message}`
  }
}

async function showRepos() {
  heading.textContent = 'Select a repository'
  reposDiv.style.display = 'block'
  
  try {
    const res = await fetch(`${API_URL}/api/repos`, {
      headers: { Authorization: `Bearer ${sessionId}` }
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const repos: Repo[] = await res.json()
    
    repos.forEach(repo => {
      const div = document.createElement('div')
      div.className = 'repo'
      div.innerHTML = `
        <div class="repo-name">${repo.full_name}</div>
        <div class="repo-desc">${repo.description || 'No description'}</div>
      `
      div.onclick = () => selectRepo(repo)
      reposDiv.appendChild(div)
    })
  } catch (err) {
    statusDiv.textContent = `Error: ${(err as Error).message}`
  }
}

async function selectRepo(repo: Repo) {
  track('repo_selected')
  selectedRepo = repo
  reposDiv.style.display = 'none'
  templatesDiv.style.display = 'block'
  heading.textContent = 'Choose your goal'

  try {
    const res = await fetch(`${API_URL}/api/templates`, {
      headers: { Authorization: `Bearer ${sessionId}` }
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const templates: Template[] = await res.json()
    
    templates.forEach(template => {
      const div = document.createElement('div')
      div.className = 'repo'
      div.innerHTML = `<div class="repo-name">${template.name}</div>`
      div.onclick = () => provision(template.id)
      templatesDiv.appendChild(div)
    })
  } catch (err) {
    statusDiv.textContent = `Error: ${(err as Error).message}`
  }
}

let provisioning = false

async function provision(template: string) {
  if (!selectedRepo || provisioning) return
  provisioning = true
  track('provision_started')
  
  statusDiv.textContent = `Provisioning ${selectedRepo.name}...`
  const templateDivs = document.querySelectorAll<HTMLDivElement>('.repo')
  templateDivs.forEach(div => div.style.pointerEvents = 'none')
  try {
    const res = await fetch(`${API_URL}/api/provision`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionId}`
      },
      body: JSON.stringify({
        clone_url: selectedRepo.clone_url,
        name: selectedRepo.name,
        full_name: selectedRepo.full_name,
        template: template
      })
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    if (data.error) {
      statusDiv.textContent = `Error: ${data.error}`
      provisioning = false
      const templateDivs = document.querySelectorAll<HTMLDivElement>('.repo')
      templateDivs.forEach(div => div.style.pointerEvents = 'auto')
    } else {
      window.location.href = `/success.html?project_id=${data.project_id}&repo=${encodeURIComponent(selectedRepo.full_name)}`
    }
  } catch (err) {
    statusDiv.textContent = `Error: ${(err as Error).message}`
    provisioning = false
    const templateDivs = document.querySelectorAll<HTMLDivElement>('.repo')
    templateDivs.forEach(div => div.style.pointerEvents = 'auto')
  }
}

checkSubscription()
