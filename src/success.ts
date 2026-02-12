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

app.innerHTML = `
  <div class="container">
    <h1>Subscription active</h1>
    <p>Redirecting to repo selection...</p>
    <a class="btn" href="/select.html">Continue →</a>
  </div>
`

setTimeout(() => {
  window.location.href = '/select.html'
}, 2000)
