import { Link } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import Navbar from '../components/Navbar'
import Particles from '../components/Particles'
import { useScrollReveal, useCounter } from '../hooks/useAnimations'
import {
  IconBolt, IconShield, IconCode, IconBrain, IconScan, IconRocket,
  IconUser, IconImage, IconGamepad, IconUsers, IconSearch, IconBot,
  IconActivity, IconLayers, IconGrid, IconClock, IconGauge, IconTerminal,
  IconArrow, IconPackage, IconServer, IconDatabase, IconGlobe, IconZap,
  LogoIcon
} from '../components/Icons'
import './Landing.css'

function Reveal({ children, className = '', delay = 0 }) {
  const [ref, visible] = useScrollReveal()
  return (
    <div ref={ref} className={`reveal ${visible ? 'visible' : ''} ${className}`} style={{ transitionDelay: `${delay}s` }}>
      {children}
    </div>
  )
}

function StatCard({ target, suffix, label, icon, delay }) {
  const [ref, count] = useCounter(target)
  return (
    <Reveal className="stat-card" delay={delay}>
      <div className="stat-glow" />
      <div className="stat-icon-wrap">{icon}</div>
      <div ref={ref} className="stat-value">
        <span className="stat-number gradient-text">{count}</span>
        {suffix && <span className="stat-suffix">{suffix}</span>}
      </div>
      <div className="stat-label">{label}</div>
    </Reveal>
  )
}

function TypeWriter({ words, speed = 80, pause = 2000 }) {
  const [text, setText] = useState('')
  const [wordIdx, setWordIdx] = useState(0)
  const [charIdx, setCharIdx] = useState(0)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const word = words[wordIdx]
    const timeout = setTimeout(() => {
      if (!deleting) {
        setText(word.slice(0, charIdx + 1))
        if (charIdx + 1 === word.length) {
          setTimeout(() => setDeleting(true), pause)
        } else {
          setCharIdx(c => c + 1)
        }
      } else {
        setText(word.slice(0, charIdx))
        if (charIdx === 0) {
          setDeleting(false)
          setWordIdx(i => (i + 1) % words.length)
        } else {
          setCharIdx(c => c - 1)
        }
      }
    }, deleting ? speed / 2 : speed)
    return () => clearTimeout(timeout)
  }, [charIdx, deleting, wordIdx, words, speed, pause])

  return <span className="typewriter">{text}<span className="cursor">|</span></span>
}

function TiltCard({ children, className = '' }) {
  const cardRef = useRef(null)
  const [transform, setTransform] = useState('')

  const onMove = (e) => {
    const rect = cardRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    setTransform(`perspective(800px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) scale3d(1.02, 1.02, 1.02)`)
  }

  const onLeave = () => {
    setTransform('')
  }

  return (
    <div ref={cardRef} className={`tilt-card ${className}`} onMouseMove={onMove} onMouseLeave={onLeave} style={{ transform }}>
      {children}
    </div>
  )
}

function CodeTab({ tabs, activeTab, onTabChange }) {
  return (
    <div className="code-tabs-wrap">
      <div className="code-bar">
        <div className="code-dots"><span className="cd r" /><span className="cd y" /><span className="cd g" /></div>
        <div className="code-tab-btns">
          {tabs.map((t, i) => (
            <button key={i} className={`code-tab ${activeTab === i ? 'active' : ''}`} onClick={() => onTabChange(i)}>{t.label}</button>
          ))}
        </div>
      </div>
      <pre className="code-body"><code dangerouslySetInnerHTML={{ __html: tabs[activeTab].code }} /></pre>
    </div>
  )
}

const FEATURES = [
  { icon: <IconBolt size={22} />, title: 'Smart Caching', desc: 'Intelligent response caching with configurable TTL reduces latency and API calls automatically.', gradient: 'violet' },
  { icon: <IconShield size={22} />, title: 'Rate Limiting', desc: 'Built-in rate limiter protects your server and Roblox APIs with configurable windows.', gradient: 'cyan' },
  { icon: <IconCode size={22} />, title: 'Unified API', desc: 'Access users, avatars, games, inventory, catalog through one consistent REST interface.', gradient: 'indigo' },
  { icon: <IconBrain size={22} />, title: 'AI Integration', desc: "Powered by Groq's LLaMA 3.3 70B model with full conversation support and temperature control.", gradient: 'rose' },
  { icon: <IconScan size={22} />, title: 'Deep Scanning', desc: 'Comprehensive universe and place scanning. Get everything in one single API call.', gradient: 'teal' },
  { icon: <IconRocket size={22} />, title: 'Easy Deploy', desc: 'Deploy to Vercel with zero configuration. Production-ready with CORS and compression.', gradient: 'amber' },
]

const ENDPOINT_CATS = [
  { icon: <IconUser size={18} />, name: 'User', routes: ['/roblox/user/:id', '/roblox/user/:id/complete', '/roblox/username/:name'] },
  { icon: <IconImage size={18} />, name: 'Avatar', routes: ['/roblox/avatar/:id', '/roblox/avatar-headshot/:id'] },
  { icon: <IconGamepad size={18} />, name: 'Game', routes: ['/roblox/game/:placeId', '/roblox/game/:placeId/servers', '/roblox/universe/:id/gamepasses'] },
  { icon: <IconUsers size={18} />, name: 'Social', routes: ['/roblox/friends/:id', '/roblox/groups/:id', '/roblox/badges/:id'] },
  { icon: <IconSearch size={18} />, name: 'Scan', routes: ['/roblox/scan/universe/:id', '/roblox/scan/place/:placeId'] },
  { icon: <IconBot size={18} />, name: 'AI Chat', routes: ['/api/chat/ai', '/api/chat/ai/:msg'] },
]

function getCodeTabs() {
  const d = window.location.origin
  return [
    {
      label: 'cURL',
      code: `<span class="hl-m">curl</span> <span class="hl-u">${d}/roblox/user/1/complete</span>\n\n<span class="hl-b">{</span>\n  <span class="hl-k">"user"</span>: <span class="hl-b">{</span> <span class="hl-k">"name"</span>: <span class="hl-s">"Roblox"</span>, <span class="hl-k">"id"</span>: <span class="hl-n">1</span> <span class="hl-b">}</span>,\n  <span class="hl-k">"presence"</span>: <span class="hl-b">{</span> <span class="hl-k">"type"</span>: <span class="hl-n">0</span> <span class="hl-b">}</span>,\n  <span class="hl-k">"followers"</span>: <span class="hl-b">{</span> <span class="hl-k">"count"</span>: <span class="hl-n">5843291</span> <span class="hl-b">}</span>\n<span class="hl-b">}</span>`
    },
    {
      label: 'JavaScript',
      code: `<span class="hl-m">const</span> <span class="hl-k">res</span> = <span class="hl-m">await</span> <span class="hl-u">fetch</span>(<span class="hl-s">'${d}/roblox/user/1/complete'</span>)\n<span class="hl-m">const</span> <span class="hl-k">data</span> = <span class="hl-m">await</span> res.<span class="hl-u">json</span>()\n\nconsole.<span class="hl-u">log</span>(data.<span class="hl-k">user</span>.<span class="hl-k">name</span>)  <span class="hl-c">// "Roblox"</span>\nconsole.<span class="hl-u">log</span>(data.<span class="hl-k">followers</span>.<span class="hl-k">count</span>)  <span class="hl-c">// 5843291</span>`
    },
    {
      label: 'Python',
      code: `<span class="hl-m">import</span> <span class="hl-k">requests</span>\n\n<span class="hl-k">res</span> = requests.<span class="hl-u">get</span>(<span class="hl-s">'${d}/roblox/user/1/complete'</span>)\n<span class="hl-k">data</span> = res.<span class="hl-u">json</span>()\n\n<span class="hl-u">print</span>(data[<span class="hl-s">'user'</span>][<span class="hl-s">'name'</span>])  <span class="hl-c"># "Roblox"</span>`
    }
  ]
}

const TECH_STACK = [
  { icon: <IconServer size={18} />, name: 'Node.js', desc: 'Runtime' },
  { icon: <IconZap size={18} />, name: 'Express', desc: 'Framework' },
  { icon: <IconDatabase size={18} />, name: 'NodeCache', desc: 'Caching' },
  { icon: <IconGlobe size={18} />, name: 'Roblox API', desc: 'Data Source' },
  { icon: <IconShield size={18} />, name: 'Rate Limit', desc: 'Protection' },
  { icon: <IconBrain size={18} />, name: 'Groq AI', desc: 'Intelligence' },
]

const FLOW_STEPS = [
  { label: 'Your App', icon: <IconCode size={18} /> },
  { label: 'UnixX Proxy', icon: <IconServer size={18} /> },
  { label: 'Smart Cache', icon: <IconDatabase size={18} /> },
  { label: 'Roblox API', icon: <IconGlobe size={18} /> },
]

export default function Landing() {
  const [activeTab, setActiveTab] = useState(0)

  return (
    <div className="landing">
      <Particles />
      <Navbar />

      <div className="aurora">
        <div className="aurora-blob a1" />
        <div className="aurora-blob a2" />
        <div className="aurora-blob a3" />
      </div>

      <section className="hero" id="hero">
        <div className="hero-grid" />
        <div className="hero-orb" />
        <div className="hero-content">
          <Reveal>
            <div className="hero-badge">
              <div className="badge-pulse" />
              <span>v2.0 Released</span>
              <IconArrow size={12} />
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="hero-title">
              <span className="gradient-text">UnixX Proxy</span>
              <br />
              <TypeWriter words={['API Gateway', 'Roblox Proxy', 'Fast & Secure', 'AI Powered']} />
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="hero-desc">
              High-performance proxy for Roblox APIs with intelligent caching,
              rate limiting, and AI-powered chat. One unified endpoint for everything.
            </p>
          </Reveal>
          <Reveal delay={0.24}>
            <div className="hero-actions">
              <Link to="/docs" className="btn btn-glow magnetic">
                <span>Explore Docs</span>
                <IconArrow size={16} />
              </Link>
              <a href="#endpoints" className="btn btn-glass magnetic">
                <IconCode size={16} />
                <span>View API</span>
              </a>
            </div>
          </Reveal>
          <Reveal delay={0.32}>
            <CodeTab tabs={getCodeTabs()} activeTab={activeTab} onTabChange={setActiveTab} />
          </Reveal>
        </div>
        <div className="scroll-hint">
          <div className="scroll-dot" />
        </div>
      </section>

      <section className="features" id="features">
        <div className="container">
          <Reveal>
            <div className="sec-head">
              <span className="sec-tag"><IconLayers size={14} /> Features</span>
              <h2>Built for <span className="gradient-text">Performance</span></h2>
              <p>Everything you need to interact with Roblox APIs, wrapped in a blazing-fast proxy layer.</p>
            </div>
          </Reveal>
          <div className="features-grid">
            {FEATURES.map((f, i) => (
              <Reveal key={i} delay={i * 0.06}>
                <TiltCard className={`feature-card fg-${f.gradient}`}>
                  <div className="feature-shine" />
                  <div className="feature-glow" />
                  <div className="feature-icon">{f.icon}</div>
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="flow-section" id="how-it-works">
        <div className="container">
          <Reveal>
            <div className="sec-head">
              <span className="sec-tag"><IconArrow size={14} /> How It Works</span>
              <h2>Request <span className="gradient-text">Pipeline</span></h2>
              <p>See how your requests flow through the proxy with intelligent caching and optimization.</p>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="flow-diagram">
              {FLOW_STEPS.map((step, i) => (
                <div className="flow-item" key={i}>
                  <div className="flow-node">
                    <div className="flow-node-icon">{step.icon}</div>
                    <span className="flow-node-label">{step.label}</span>
                  </div>
                  {i < FLOW_STEPS.length - 1 && (
                    <div className="flow-connector">
                      <div className="flow-line" />
                      <div className="flow-pulse" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="tech-section" id="tech">
        <div className="container">
          <Reveal>
            <div className="sec-head">
              <span className="sec-tag"><IconPackage size={14} /> Tech Stack</span>
              <h2>Powered by <span className="gradient-text">Modern Tools</span></h2>
            </div>
          </Reveal>
          <div className="tech-grid">
            {TECH_STACK.map((t, i) => (
              <Reveal key={i} delay={i * 0.05}>
                <div className="tech-card">
                  <div className="tech-icon">{t.icon}</div>
                  <div className="tech-info">
                    <span className="tech-name">{t.name}</span>
                    <span className="tech-desc">{t.desc}</span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="endpoints" id="endpoints">
        <div className="container">
          <Reveal>
            <div className="sec-head">
              <span className="sec-tag"><IconCode size={14} /> API Reference</span>
              <h2>Powerful <span className="gradient-text">Endpoints</span></h2>
              <p>Access the full Roblox ecosystem through our streamlined API routes.</p>
            </div>
          </Reveal>
          <div className="ep-grid">
            {ENDPOINT_CATS.map((cat, i) => (
              <Reveal key={i} delay={i * 0.05}>
                <div className="ep-cat">
                  <div className="ep-cat-shine" />
                  <div className="ep-top">
                    <div className="ep-cat-icon">{cat.icon}</div>
                    <h3>{cat.name}</h3>
                    <span className="ep-cat-count">{cat.routes.length}</span>
                  </div>
                  <div className="ep-routes">
                    {cat.routes.map((r, j) => (
                      <div className="ep-route" key={j}>
                        <span className={`method ${r.startsWith('/api') && !r.includes(':') ? 'post' : 'get'}`}>
                          {r.startsWith('/api') && !r.includes(':') ? 'POST' : 'GET'}
                        </span>
                        <code>{r}</code>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal>
            <div className="ep-cta">
              <Link to="/docs" className="btn btn-glow btn-lg magnetic">
                <span>Full Documentation</span>
                <IconArrow size={16} />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="stats" id="stats">
        <div className="container">
          <Reveal>
            <div className="sec-head">
              <span className="sec-tag"><IconActivity size={14} /> Metrics</span>
              <h2>Proxy <span className="gradient-text">Overview</span></h2>
            </div>
          </Reveal>
          <div className="stats-grid">
            <StatCard target={25} label="Endpoints" icon={<IconLayers size={18} />} delay={0} />
            <StatCard target={9} label="Categories" icon={<IconGrid size={18} />} delay={0.06} />
            <StatCard target={300} suffix="s" label="Cache TTL" icon={<IconClock size={18} />} delay={0.12} />
            <StatCard target={200} suffix="/min" label="Rate Limit" icon={<IconGauge size={18} />} delay={0.18} />
          </div>
        </div>
      </section>

      <section className="quickstart" id="quickstart">
        <div className="container">
          <Reveal>
            <div className="sec-head">
              <span className="sec-tag"><IconTerminal size={14} /> Quick Start</span>
              <h2>Up & Running in <span className="gradient-text">Seconds</span></h2>
            </div>
          </Reveal>
          <div className="steps">
            {[
              { num: '01', title: 'Clone & Install', cmd: 'git clone <repo> && cd unixx-proxy && npm install' },
              { num: '02', title: 'Configure', cmd: 'cp .env.example .env' },
              { num: '03', title: 'Launch', cmd: 'npm start' },
            ].map((s, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <div className="step-card">
                  <div className="step-num gradient-text">{s.num}</div>
                  <div className="step-body">
                    <h3>{s.title}</h3>
                    <div className="step-code">
                      <code><IconTerminal size={14} /> {s.cmd}</code>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-gradient-line" />
        <div className="container">
          <div className="footer-top">
            <div className="footer-brand">
              <Link to="/" className="nav-logo">
                <div className="logo-mark">
                  <LogoIcon size={22} gradientId="fGrad" />
                </div>
                <span className="logo-text">Unix<span className="logo-x">X</span> Proxy</span>
              </Link>
              <p>High-performance Roblox API proxy with caching, rate limiting, and AI integration.</p>
            </div>
            <div className="footer-cols">
              <div className="footer-col">
                <h4>Resources</h4>
                <Link to="/docs">Documentation</Link>
                <a href="#endpoints">API Reference</a>
                <a href="#quickstart">Quick Start</a>
              </div>
              <div className="footer-col">
                <h4>Project</h4>
                <a href="#features">Features</a>
                <a href="#stats">Statistics</a>
                <a href="/status" target="_blank" rel="noreferrer">Health Check</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>2026 UnixX Proxy. Built with performance in mind.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
