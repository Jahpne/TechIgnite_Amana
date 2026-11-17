import { useState } from 'react'
import { screens } from './screens/registry'
import './ui/ui.css'

// Dev-only preview gallery. The logic workstream will replace this with real routing.

type Viewport = 'phone' | 'full'

function App() {
  const [screenId, setScreenId] = useState(screens[0].id)
  const [viewport, setViewport] = useState<Viewport>('phone')
  const screen = screens.find((s) => s.id === screenId) ?? screens[0]

  return (
    <div style={{ minHeight: '100dvh' }}>
      <header className="app-header" style={{ gap: 12, flexWrap: 'wrap' }}>
        <div className="brand">
          Amana <small>UI preview</small>
        </div>
        <div className="row">
          <label className="muted" htmlFor="screen-select">Screen</label>
          <select
            id="screen-select"
            className="input"
            style={{ width: 'auto' }}
            value={screen.id}
            onChange={(e) => setScreenId(e.target.value)}
          >
            {screens.map((s) => (
              <option key={s.id} value={s.id}>{s.id} {s.title}</option>
            ))}
          </select>
          <div className="filters" role="group" aria-label="Viewport">
            <button type="button" className="chip" aria-pressed={viewport === 'phone'} onClick={() => setViewport('phone')}>
              360px phone
            </button>
            <button type="button" className="chip" aria-pressed={viewport === 'full'} onClick={() => setViewport('full')}>
              Full width
            </button>
          </div>
        </div>
      </header>
      <div
        style={{
          width: viewport === 'phone' ? 360 : '100%',
          maxWidth: '100%',
          margin: viewport === 'phone' ? '16px auto' : 0,
          border: viewport === 'phone' ? '1px solid var(--border)' : 0,
          borderRadius: viewport === 'phone' ? 16 : 0,
          overflow: 'hidden',
          background: 'var(--bg)',
        }}
      >
        <main className={`app-main${screen.wide ? ' wide' : ''}`}>{screen.render()}</main>
      </div>
    </div>
  )
}

export default App
