import { initGalaxy } from "./lib/galaxy"

const API_URL = import.meta.env.VITE_API_URL || 'https://space-api.fly.dev'

const track = (event: string) => {
  fetch(`${API_URL}/api/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event, page: location.pathname, referrer: document.referrer }),
  }).catch(() => {})
}
track('pageview')

const app = document.getElementById('app')!

const style = document.createElement('style')
style.textContent = `
  body { margin: 0; background: #000; color: #fff; font-family: system-ui, sans-serif; overflow-x: hidden; }
  #galaxy-canvas { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 0; }
  .container { max-width: 900px; margin: 0 auto; padding: 80px 20px; position: relative; z-index: 10; }
  h1 { font-size: 56px; font-weight: 600; margin: 0 0 24px 0; line-height: 1.1; letter-spacing: -0.02em; }
  .metric { font-size: 20px; color: #888; margin-bottom: 48px; line-height: 1.6; }
  .value { color: #fff; font-weight: 500; }
  .claim { font-size: 18px; margin-bottom: 48px; line-height: 1.6; color: #aaa; }
  form { display: flex; gap: 12px; margin-bottom: 24px; flex-wrap: wrap; }
  input { padding: 16px 20px; font-size: 16px; background: #111; border: 1px solid #333; color: #fff; border-radius: 6px; width: 300px; max-width: 100%; }
  input:focus { outline: none; border-color: #666; }
  input::placeholder { color: #555; }
  button { background: #fff; color: #000; padding: 16px 32px; border: none; border-radius: 6px; font-size: 16px; font-weight: 500; cursor: pointer; transition: transform 0.1s; }
  button:hover { transform: translateY(-1px); }
  button:active { transform: translateY(0); }
  .pricing { color: #666; font-size: 14px; line-height: 1.6; }
  .dot { display: inline-block; margin: 0 8px; opacity: 0.3; }
`
document.head.appendChild(style)

interface Stats {
  spawns: number
  tasks: number
  projects: number
  daysActive: number
  timestamp: string
}

async function loadStats(): Promise<Stats | null> {
  try {
    const res = await fetch(`${API_URL}/api/stats`)
    if (!res.ok) throw new Error('Stats fetch failed')
    return await res.json()
  } catch {
    return null
  }
}

loadStats().then(stats => {
  const metricsHTML = stats
    ? `
      <span class="value">${stats.spawns.toLocaleString()}</span> spawns <span class="dot">·</span>
      <span class="value">${stats.tasks.toLocaleString()}</span> tasks <span class="dot">·</span>
      <span class="value">${stats.daysActive} days</span> runtime<br>
      <span style="font-size: 14px; color: #666;">metrics updated hourly</span>
    `
    : `
      <span class="value">6,808</span> spawns <span class="dot">·</span>
      <span class="value">3,723</span> tasks <span class="dot">·</span>
      <span class="value">38 days</span> runtime<br>
      <span style="font-size: 14px; color: #666;">as of Feb 14, 2026</span>
    `

  app.innerHTML = `
    <canvas id="galaxy-canvas"></canvas>
    <div class="container">
      <h1>Your team can't scale fast enough.<br>Ours already did.</h1>
      <p class="metric">${metricsHTML}</p>
      <p class="claim">
        AI agents that live in your codebase.<br>
        They learn your patterns, ship while you sleep, and never need onboarding.
      </p>
      <form id="waitlist-form">
        <input type="email" name="email" placeholder="your@email.com" required>
        <button type="submit">Join Waitlist →</button>
      </form>
      <div style="margin-top: 24px;">
        <button id="get-started" style="background: transparent; color: #fff; border: 1px solid #333; padding: 16px 32px; border-radius: 6px; font-size: 16px; cursor: pointer;">Get Started →</button>
      </div>
      <div id="form-message" style="margin-top: 12px; font-size: 14px;"></div>
      <div class="pricing">
        $1,000/month per repo <span class="dot">·</span> 30-day money-back guarantee <span class="dot">·</span> Cancel anytime
      </div>
    </div>
  `

  const canvas = document.getElementById('galaxy-canvas') as HTMLCanvasElement
  initGalaxy(canvas, {
    showPlanets: true,
    showComets: true,
    showNebula: true,
    showVignette: true,
    showSpawns: false,
  })

  const form = document.getElementById('waitlist-form') as HTMLFormElement
  const message = document.getElementById('form-message')!

  const getStarted = document.getElementById('get-started')!
  getStarted.addEventListener('click', () => {
    track('cta_get_started')
    window.location.href = 'https://app.spacebrr.com'
  })

  const params = new URLSearchParams(window.location.search)
  const error = params.get('error')
  
  if (error) {
    const message = document.querySelector('.metric') as HTMLElement
    if (message) {
      message.innerHTML = `<span style="color: #f44;">OAuth error: ${error}. Please try again.</span>`
    }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    track('waitlist_submit')
    const formData = new FormData(form)
    const email = formData.get('email') as string
    
    message.style.color = '#888'
    message.textContent = 'Submitting...'
    
    try {
      const res = await fetch(`${API_URL}/api/waitlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      
      if (res.ok) {
        message.style.color = '#4ade80'
        message.textContent = 'Added to waitlist ✓'
        form.reset()
      } else {
        message.style.color = '#f87171'
        message.textContent = 'Failed to submit - try again'
      }
    } catch {
      message.style.color = '#f87171'
      message.textContent = 'Network error - try again'
    }
  })
})
