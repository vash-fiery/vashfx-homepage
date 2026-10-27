import { useState } from 'react'
import { fetchApiName } from './api'
import './App.css'

const githubUrl = 'https://github.com/vash-fiery'
const repositoryUrl = `${githubUrl}/vashfx-homepage`

function App() {
  const [name, setName] = useState<string | null>(null)
  const [isLoadingName, setIsLoadingName] = useState(false)

  const loadName = async () => {
    setIsLoadingName(true)

    try {
      setName(await fetchApiName())
    } catch {
      setName('unavailable')
    } finally {
      setIsLoadingName(false)
    }
  }

  const connectionStatus = isLoadingName
    ? 'Checking…'
    : name === null
      ? 'Not checked'
      : name === 'unavailable'
        ? 'unavailable'
        : `Connected · ${name}`

  return (
    <div className="site-shell">
      <a className="skip-link" href="#main">Skip to content</a>

      <header className="site-header">
        <a className="wordmark" href="/" aria-label="VashFX home">
          <img src="/logo-bimi.svg" width="32" height="32" alt="" />
          <span>VASH<span className="wordmark-accent">FX</span></span>
        </a>
        <nav aria-label="Main navigation">
          <a href="#explore">Explore</a>
          <a href={githubUrl}>GitHub <span aria-hidden="true">↗</span></a>
        </nav>
      </header>

      <main id="main">
        <section className="hero" aria-labelledby="hero-title">
          <p className="eyebrow"><span aria-hidden="true">//</span> CUSTOM USERSCRIPTS &amp; BROWSER TOOLS</p>
          <h1 id="hero-title">Your browser.<br /><span>Your rules.</span></h1>
          <p className="hero-description">
            Welcome to VashFX, the home of Vash Fiery’s browser projects.
            Explore the code and follow what’s next on GitHub.
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href={githubUrl}>
              Explore GitHub <span aria-hidden="true">↗</span>
            </a>
            <a className="button button-secondary" href={repositoryUrl}>
              View homepage source <span aria-hidden="true">↗</span>
            </a>
          </div>
          <p className="hero-note">Built by Vash Fiery. Made for the web.</p>
        </section>

        <section className="explore" id="explore" aria-labelledby="explore-title">
          <div className="section-heading">
            <h2 id="explore-title">Explore VashFX</h2>
            <span className="eyebrow">CODE / PROJECTS / FEEDBACK</span>
          </div>
          <div className="project-grid">
            <article className="project-card">
              <div className="card-heading"><span className="card-number">01</span><span>PROJECTS</span></div>
              <div className="card-content">
                <h3>Browse the code</h3>
                <p>Find Vash Fiery’s public repositories and follow development on GitHub.</p>
                <a href={githubUrl}>Browse projects <span aria-hidden="true">↗</span></a>
              </div>
            </article>
            <article className="project-card">
              <div className="card-heading"><span className="card-number">02</span><span>HOMEPAGE</span></div>
              <div className="card-content">
                <h3>Behind this page</h3>
                <p>Explore the source for this website, its documentation, and its development history.</p>
                <a href={repositoryUrl}>View repository <span aria-hidden="true">↗</span></a>
              </div>
            </article>
            <article className="project-card">
              <div className="card-heading"><span className="card-number">03</span><span>FEEDBACK</span></div>
              <div className="card-content">
                <h3>Make it better</h3>
                <p>Found something broken on this website? Share a bug report or a suggestion.</p>
                <a href={`${repositoryUrl}/issues`}>Issues &amp; feedback <span aria-hidden="true">↗</span></a>
              </div>
            </article>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <p><span className="footer-brand">VashFX</span> <span aria-hidden="true">/</span> Vash Fiery</p>
        <details className="connection-check">
          <summary>Connection check</summary>
          <div className="connection-panel">
            <p>Check this website’s connection.</p>
            <button
              className="button button-secondary"
              type="button"
              onClick={() => void loadName()}
              disabled={isLoadingName}
              aria-busy={isLoadingName}
            >
              {isLoadingName ? 'Checking…' : 'Check connection'}
            </button>
            <p className="connection-status" role="status">{connectionStatus}</p>
          </div>
        </details>
      </footer>
    </div>
  )
}

export default App
