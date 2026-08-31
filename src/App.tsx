import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import cloudflareLogo from './assets/cloudflare.svg'
import heroImg from './assets/hero.png'
import './App.css'

type ApiResponse = {
  name?: unknown
}

function App() {
  const [count, setCount] = useState(0)
  const [name, setName] = useState('unknown')
  const [isLoadingName, setIsLoadingName] = useState(false)

  const loadName = async () => {
    setIsLoadingName(true)

    try {
      const response = await fetch('/api/')
      if (!response.ok) throw new Error(`API request failed: ${response.status}`)

      const data = await response.json() as ApiResponse
      if (typeof data.name !== 'string') throw new Error('Invalid API response')

      setName(data.name)
    } catch {
      setName('unavailable')
    } finally {
      setIsLoadingName(false)
    }
  }

  return (
    <>
      <section id="center">
        <div className="hero">
          <img src={heroImg} className="base" width="170" height="179" alt="" />
          <img src={reactLogo} className="framework" alt="React logo" />
          <img src={viteLogo} className="vite" alt="Vite logo" />
        </div>
        <div>
          <h1>Get started with Cloudflare</h1>
          <p>
            Edit <code>src/App.tsx</code> or <code>worker/index.ts</code> and save to test <code>HMR</code>
          </p>
        </div>
        <ul style={{ display: 'flex', gap: '1rem', listStyle: 'none', padding: 0 }}>
          <li>
            <button
              className="counter"
              onClick={() => setCount((count) => count + 1)}
            >
              Count is {count}
            </button>
          </li>
          <li>
            <button
              className="counter"
              type="button"
              onClick={() => void loadName()}
              disabled={isLoadingName}
              aria-label="Get name from API"
            >
              Name from API is: {isLoadingName ? 'loading…' : name}
            </button>
          </li>
        </ul>
      </section>

      <div className="ticks"></div>

      <section id="next-steps">
        <div id="docs">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#documentation-icon"></use>
          </svg>
          <h2>Documentation</h2>
          <p>Your questions, answered</p>
          <ul>
            <li>
              <a href="https://vite.dev/" target="_blank" rel="noreferrer">
                <img className="logo" src={viteLogo} alt="" />
                Explore Vite
              </a>
            </li>
            <li>
              <a href="https://react.dev/" target="_blank" rel="noreferrer">
                <img className="button-icon" src={reactLogo} alt="" />
                Learn more
              </a>
            </li>
            <li>
              <a href="https://workers.cloudflare.com/" target="_blank" rel="noreferrer">
                <img className="button-icon" src={cloudflareLogo} alt="" />
                Workers Docs
              </a>
            </li>
          </ul>
        </div>
        <div id="social">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#social-icon"></use>
          </svg>
          <h2>Connect with us</h2>
          <p>Join the Vite community</p>
          <ul>
            <li>
              <a href="https://github.com/vitejs/vite" target="_blank" rel="noreferrer">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#github-icon"></use>
                </svg>
                GitHub
              </a>
            </li>
            <li>
              <a href="https://chat.vite.dev/" target="_blank" rel="noreferrer">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#discord-icon"></use>
                </svg>
                Discord
              </a>
            </li>
            <li>
              <a href="https://x.com/vite_js" target="_blank" rel="noreferrer">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#x-icon"></use>
                </svg>
                X.com
              </a>
            </li>
            <li>
              <a href="https://bsky.app/profile/vite.dev" target="_blank" rel="noreferrer">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#bluesky-icon"></use>
                </svg>
                Bluesky
              </a>
            </li>
          </ul>
        </div>
      </section>

      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  )
}

export default App
