const app = document.getElementById('app')!

const style = document.createElement('style')
style.textContent = `
  @keyframes orbit {
    from { transform: rotate(0deg) translateX(120px) rotate(0deg); }
    to { transform: rotate(360deg) translateX(120px) rotate(-360deg); }
  }
  @keyframes pulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }
  body { margin: 0; background: #000; color: #fff; font-family: system-ui, sans-serif; overflow-x: hidden; }
  .container { max-width: 900px; margin: 0 auto; padding: 80px 20px; position: relative; z-index: 10; }
  .orbital { position: absolute; top: 50%; left: 50%; width: 240px; height: 240px; margin: -120px 0 0 -120px; opacity: 0.15; pointer-events: none; }
  .orbital-ring { position: absolute; top: 50%; left: 50%; width: 100%; height: 100%; border: 1px solid #fff; border-radius: 50%; transform: translate(-50%, -50%); }
  .orbital-node { position: absolute; width: 8px; height: 8px; background: #fff; border-radius: 50%; top: 50%; left: 50%; margin: -4px 0 0 -4px; animation: orbit 20s linear infinite; }
  .orbital-node:nth-child(2) { animation-delay: -6.67s; }
  .orbital-node:nth-child(3) { animation-delay: -13.33s; }
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

app.innerHTML = `
  <div class="orbital">
    <div class="orbital-ring"></div>
    <div class="orbital-node"></div>
    <div class="orbital-node"></div>
    <div class="orbital-node"></div>
  </div>
  <div class="container">
    <h1>Connect your repo.<br>Swarm runs 24/7.<br>Codebase improves.</h1>
    <p class="metric">
      <span class="value">35 days</span> runtime <span class="dot">·</span>
      <span class="value">18 projects</span> <span class="dot">·</span>
      <span class="value">2,493</span> tasks tracked
    </p>
    <p class="claim">
      Not a copilot. Not autocomplete.<br>
      A swarm with memory that compounds daily.
    </p>
    <form action="https://formspree.io/f/xanywyeg" method="POST">
      <input type="email" name="email" placeholder="your@email.com" required>
      <button type="submit">Join Waitlist →</button>
    </form>
    <div class="pricing">
      Free beta <span class="dot">·</span> First 10 repos<br>
      $1,000/month after beta <span class="dot">·</span> Cancel anytime
    </div>
  </div>
`
