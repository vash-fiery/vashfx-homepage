import { useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'

type ScanDepth = 'Quick' | 'Standard' | 'Deep'

type SubmittedScan = {
  id: string
  target: string
  depth: ScanDepth
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3 4.5 6v5.2c0 4.8 3.2 8.2 7.5 9.8 4.3-1.6 7.5-5 7.5-9.8V6L12 3Z" />
      <path d="m8.7 12 2.1 2.1 4.6-4.6" />
    </svg>
  )
}

function App() {
  const [target, setTarget] = useState('')
  const [depth, setDepth] = useState<ScanDepth>('Standard')
  const [submittedScan, setSubmittedScan] = useState<SubmittedScan | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const startScan = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setSubmitError('')

    try {
      const response = await fetch('/api/scans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: target.trim(), depth }),
      })

      if (!response.ok) {
        throw new Error('The scan could not be started. Please try again.')
      }

      const scan = await response.json() as SubmittedScan
      setSubmittedScan(scan)
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : 'The scan could not be started. Please try again.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="scan-page">
      <nav className="topbar" aria-label="Primary navigation">
        <a className="brand" href="#top" aria-label="Sentry home">
          <span className="brand-mark"><ShieldIcon /></span>
          <span>Sentry</span>
        </a>
        <div className="nav-links">
          <a href="#scans">Scans</a>
          <a href="#reports">Reports</a>
          <a href="#settings">Settings</a>
        </div>
        <button className="avatar" type="button" aria-label="Open profile menu">
          AD
        </button>
      </nav>

      <section className="scan-shell" id="top">
        <header className="page-heading">
          <a className="back-link" href="#scans">
            <span aria-hidden="true">←</span> Back to scans
          </a>
          <div className="eyebrow">Security scanner</div>
          <h1>Start a new scan</h1>
          <p>
            Enter a public website or IP address. We’ll inspect it for common
            vulnerabilities and misconfigurations.
          </p>
        </header>

        {submittedScan ? (
          <section className="success-card" aria-live="polite">
            <span className="success-icon"><ShieldIcon /></span>
            <div>
              <span className="status-label">Scan started</span>
              <h2>{submittedScan.target}</h2>
              <p>
                Your {submittedScan.depth.toLowerCase()} scan is now running.
                Results will appear in your scans dashboard shortly.
              </p>
            </div>
            <button type="button" onClick={() => setSubmittedScan(null)}>
              Scan another target
            </button>
          </section>
        ) : (
          <form className="scan-card" onSubmit={startScan}>
            <div className="form-section">
              <span className="step">01</span>
              <div className="field-content">
                <label htmlFor="target">What would you like to scan?</label>
                <p className="helper">Use a full URL or a public IP address.</p>
                <div className="target-input">
                  <span aria-hidden="true">⌁</span>
                  <input
                    id="target"
                    name="target"
                    type="text"
                    value={target}
                    onChange={(event) => setTarget(event.target.value)}
                    placeholder="https://example.com"
                    autoComplete="url"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <span className="step">02</span>
              <fieldset className="field-content">
                <legend>Choose scan depth</legend>
                <p className="helper">You can keep working while the scan runs.</p>
                <div className="depth-grid">
                  {([
                    ['Quick', '2–3 min', 'Essential checks'],
                    ['Standard', '8–12 min', 'Recommended coverage'],
                    ['Deep', '25–35 min', 'Full vulnerability scan'],
                  ] as const).map(([name, time, description]) => (
                    <label className="depth-option" key={name}>
                      <input
                        type="radio"
                        name="depth"
                        value={name}
                        checked={depth === name}
                        onChange={() => setDepth(name)}
                      />
                      <span className="radio-dot" aria-hidden="true" />
                      <strong>{name}</strong>
                      <small>{description}</small>
                      <span className="scan-time">{time}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>

            <footer className="form-footer">
              <div>
                <div className="privacy-note">
                  <ShieldIcon /> Only scan systems you have permission to test.
                </div>
                {submitError && (
                  <p className="submit-error" role="alert">{submitError}</p>
                )}
              </div>
              <button
                className="start-button"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Starting scan…' : 'Start scan'}
                {!isSubmitting && <span aria-hidden="true">→</span>}
              </button>
            </footer>
          </form>
        )}
      </section>

      <footer className="site-footer">
        <span>© 2026 Sentry Security</span>
        <div><a href="#help">Help center</a><a href="#privacy">Privacy</a></div>
      </footer>
    </main>
  )
}

export default App
