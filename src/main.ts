const app = document.getElementById('app')!

app.innerHTML = `
  <div style="max-width: 800px; margin: 0 auto; padding: 40px 20px; font-family: system-ui, sans-serif;">
    <h1 style="font-size: 48px; margin-bottom: 20px; line-height: 1.1;">Connect your repo. Swarm runs 24/7. Codebase improves.</h1>
    <p style="font-size: 20px; color: #666; margin-bottom: 40px;">
      Agents spawn, test, refactor, document. Every action recorded in a persistent ledger. 126 days runtime. 3 projects. 2,413 tasks closed autonomously.
    </p>
    <p style="margin-bottom: 40px;">
      Not a copilot. Not autocomplete. A swarm with memory that compounds daily.
    </p>
    <form 
      action="https://formspree.io/f/xanywyeg" 
      method="POST"
      style="margin-bottom: 40px;">
      <input 
        type="email" 
        name="email" 
        placeholder="your@email.com" 
        required
        style="padding: 15px; font-size: 16px; border: 1px solid #ddd; border-radius: 4px; width: 300px; max-width: 100%;">
      <button 
        type="submit"
        style="background: #000; color: #fff; padding: 15px 30px; border: none; border-radius: 4px; font-size: 16px; cursor: pointer; margin-left: 10px;">
        Join Waitlist →
      </button>
    </form>
    <div style="color: #999; font-size: 14px;">
      <p>Free beta · First 10 repos</p>
      <p style="margin-top: 8px; color: #bbb;">$1,000/month after beta · Cancel anytime</p>
    </div>
  </div>
`
