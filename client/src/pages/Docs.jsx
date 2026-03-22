import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import Particles from '../components/Particles'
import {
  IconUser, IconImage, IconUsers, IconPackage, IconGamepad, IconCart,
  IconScan, IconBot, IconActivity, IconSearch, IconHome, IconLink,
  IconCopy, IconPlay, IconX, IconSettings, IconCode, IconChevDown,
  IconCheck, LogoIcon
} from '../components/Icons'
import './Docs.css'

const CATEGORY_ICONS = {
  User: <IconUser size={16} />,
  Avatar: <IconImage size={16} />,
  Social: <IconUsers size={16} />,
  Inventory: <IconPackage size={16} />,
  Game: <IconGamepad size={16} />,
  Catalog: <IconCart size={16} />,
  Scan: <IconScan size={16} />,
  'AI Chat': <IconBot size={16} />,
  Status: <IconActivity size={16} />,
}

function SkeletonLoader() {
  return (
    <div className="skeleton-wrap">
      {[1, 2, 3].map(i => (
        <div key={i} className="skeleton-card">
          <div className="skeleton" style={{ width: '40%', height: 18 }} />
          <div className="skeleton-group">
            <div className="skeleton" style={{ width: '100%', height: 42 }} />
            <div className="skeleton" style={{ width: '100%', height: 42 }} />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function Docs() {
  const [categories, setCategories] = useState([])
  const [search, setSearch] = useState('')
  const [expandedCat, setExpandedCat] = useState(null)
  const [expandedCards, setExpandedCards] = useState({})
  const [modal, setModal] = useState(null)
  const [loading, setLoading] = useState({})
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [copied, setCopied] = useState(null)
  const [fetching, setFetching] = useState(true)
  const [activeSection, setActiveSection] = useState(null)
  const [customParams, setCustomParams] = useState({})
  const searchRef = useRef(null)
  const mainRef = useRef(null)

  useEffect(() => {
    fetch('/api/endpoints')
      .then(r => r.json())
      .then(d => {
        setCategories(d.categories)
        if (d.categories.length > 0) setExpandedCat(d.categories[0].name)
        setFetching(false)
      })
      .catch(() => setFetching(false))
  }, [])

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        searchRef.current?.focus()
      }
      if (e.key === 'Escape' && modal) {
        setModal(null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [modal])

  useEffect(() => {
    if (!mainRef.current || categories.length === 0) return
    const sections = mainRef.current.querySelectorAll('.ep-section')
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      { threshold: 0.3, rootMargin: '-80px 0px -60% 0px' }
    )
    sections.forEach(s => observer.observe(s))
    return () => observer.disconnect()
  }, [categories])

  const filtered = useMemo(() => {
    if (!search.trim()) return categories
    const q = search.toLowerCase()
    return categories.map(cat => ({
      ...cat,
      endpoints: cat.endpoints.filter(ep =>
        ep.path.toLowerCase().includes(q) ||
        ep.description.toLowerCase().includes(q) ||
        cat.name.toLowerCase().includes(q)
      )
    })).filter(cat => cat.endpoints.length > 0)
  }, [categories, search])

  function getParamNames(ep) {
    const matches = ep.path.match(/:([a-zA-Z]+)/g)
    if (!matches) return []
    return matches.map(m => m.slice(1))
  }

  function getParamValue(key, ep, paramName) {
    const customVal = customParams[`${key}-${paramName}`]
    if (customVal !== undefined && customVal !== '') return customVal
    if (ep.defaults && ep.defaults[paramName]) return ep.defaults[paramName]
    return ''
  }

  function buildUrl(ep, key) {
    let p = ep.path
    const paramNames = getParamNames(ep)
    for (const name of paramNames) {
      const val = getParamValue(key, ep, name)
      p = p.replace(`:${name}`, val || name)
    }
    if (ep.defaultQuery) {
      p += '?' + ep.defaultQuery
    }
    return p
  }

  function buildCurl(ep, key) {
    const url = window.location.origin + buildUrl(ep, key)
    if (ep.method === 'POST' && ep.body) {
      return `curl -X POST "${url}" -H "Content-Type: application/json" -d '${JSON.stringify(ep.body)}'`
    }
    return `curl "${url}"`
  }

  async function tryEndpoint(ep, key) {
    setLoading(prev => ({ ...prev, [key]: true }))
    const url = window.location.origin + buildUrl(ep, key)
    const start = Date.now()
    try {
      const opts = { method: ep.method }
      if (ep.method === 'POST' && ep.body) {
        opts.headers = { 'Content-Type': 'application/json' }
        opts.body = JSON.stringify(ep.body)
      }
      const res = await fetch(url, opts)
      const data = await res.json()
      setModal({ data, status: res.status, time: Date.now() - start })
    } catch (e) {
      setModal({ data: { error: e.message }, status: 500, time: Date.now() - start })
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }))
    }
  }

  const copyText = useCallback((text, id) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 1500)
  }, [])

  function highlightJSON(json) {
    return json
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"([^"]+)":/g, '<span class="jk">"$1"</span>:')
      .replace(/: "([^"]*)"/g, ': <span class="js">"$1"</span>')
      .replace(/: (\d+\.?\d*)/g, ': <span class="jn">$1</span>')
      .replace(/: (true|false|null)/g, ': <span class="jn">$1</span>')
  }

  return (
    <div className="docs">
      <Particles density={28000} interactive={false} opacity={0.3} />

      <div className="docs-aurora">
        <div className="da da1" />
        <div className="da da2" />
      </div>

      <nav className="docs-nav">
        <div className="docs-nav-inner">
          <Link to="/" className="docs-logo">
            <div className="d-logo-icon"><LogoIcon size={20} gradientId="dGrad" /></div>
            <span className="d-logo-text">Unix<span className="d-logo-x">X</span></span>
            <span className="docs-badge">docs</span>
          </Link>
          <div className="docs-nav-right">
            <Link to="/" className="docs-nav-link">
              <IconHome />
              <span>Home</span>
            </Link>
            <a href="/status" target="_blank" rel="noreferrer" className="docs-nav-link">
              <IconActivity size={15} />
              <span>Status</span>
            </a>
          </div>
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle sidebar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
      </nav>

      <div className="docs-layout">
        <aside className={`docs-sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-search">
            <IconSearch size={15} />
            <input ref={searchRef} type="text" placeholder="Search endpoints..." value={search} onChange={e => setSearch(e.target.value)} />
            <div className="search-kbd">
              <kbd>Ctrl</kbd><kbd>K</kbd>
            </div>
            {search && (
              <button className="search-clear" onClick={() => setSearch('')}>
                <IconX size={14} />
              </button>
            )}
          </div>
          <nav className="sidebar-nav">
            {filtered.map((cat, ci) => (
              <div className="sidebar-cat" key={ci}>
                <button
                  className={`sidebar-cat-btn ${expandedCat === cat.name ? 'active' : ''} ${activeSection === `section-${cat.name}` ? 'current' : ''}`}
                  onClick={() => setExpandedCat(expandedCat === cat.name ? null : cat.name)}
                >
                  <span className="sidebar-cat-icon">{CATEGORY_ICONS[cat.name] || CATEGORY_ICONS.Status}</span>
                  <span>{cat.name}</span>
                  <span className="sidebar-count">{cat.endpoints.length}</span>
                  <IconChevDown className={`sidebar-chev ${expandedCat === cat.name ? 'open' : ''}`} />
                </button>
                {expandedCat === cat.name && (
                  <div className="sidebar-eps">
                    {cat.endpoints.map((ep, ei) => (
                      <a key={ei} className="sidebar-ep-link" href={`#ep-${ci}-${ei}`} onClick={() => setSidebarOpen(false)}>
                        <span className={`s-tag ${ep.method.toLowerCase()}`}>{ep.method}</span>
                        <span>{ep.path.replace('/roblox/', '/').replace('/api/', '/')}</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </aside>

        <main className="docs-main" ref={mainRef}>
          <div className="docs-header">
            <h1>API <span className="gradient-text">Documentation</span></h1>
            <p>Complete reference for all UnixX Proxy endpoints. Click "Try It" to make live requests.</p>
            <div className="base-url-box">
              <IconLink />
              <code>{window.location.origin}</code>
              <button className={`copy-sm ${copied === 'base' ? 'copied' : ''}`} onClick={() => copyText(window.location.origin, 'base')}>
                {copied === 'base' ? <IconCheck size={13} /> : <IconCopy />}
              </button>
            </div>
          </div>

          {fetching && <SkeletonLoader />}

          {filtered.map((cat, ci) => (
            <div className="ep-section" key={ci} id={`section-${cat.name}`}>
              <div className="cat-head">
                <div className="cat-icon">{CATEGORY_ICONS[cat.name] || CATEGORY_ICONS.Status}</div>
                <h2>{cat.name}</h2>
                <span className="cat-count">{cat.endpoints.length}</span>
              </div>
              {cat.endpoints.map((ep, ei) => {
                const key = `${ci}-${ei}`
                const isOpen = expandedCards[key]
                const curlKey = `curl-${key}`
                const paramNames = getParamNames(ep)
                return (
                  <div className={`ep-card ${isOpen ? 'expanded' : ''}`} key={ei} id={`ep-${ci}-${ei}`}>
                    <div className="ep-card-shine" />
                    <div className="ep-card-top" onClick={() => setExpandedCards(prev => ({ ...prev, [key]: !prev[key] }))}>
                      <div className="ep-route-info">
                        <span className={`ep-method ${ep.method.toLowerCase()}`}>{ep.method}</span>
                        <span className="ep-path">{ep.path}</span>
                      </div>
                      <div className="ep-actions">
                        <button
                          className="try-btn"
                          disabled={loading[key]}
                          onClick={e => { e.stopPropagation(); tryEndpoint(ep, key) }}
                        >
                          {loading[key] ? (
                            <span className="spinner" />
                          ) : (
                            <>
                              <IconPlay />
                              <span>Try It</span>
                            </>
                          )}
                        </button>
                        <IconChevDown size={16} className={`ep-chev ${isOpen ? 'open' : ''}`} />
                      </div>
                    </div>
                    {isOpen && (
                      <div className="ep-details">
                        <p className="ep-desc">{ep.description}</p>
                        {paramNames.length > 0 && (
                          <div className="ep-params-box">
                            <h4>
                              <IconSettings />
                              Path Parameters
                            </h4>
                            <div className="param-inputs">
                              {paramNames.map((pn, pi) => (
                                <div className="param-input-row" key={pi}>
                                  <label className="param-input-label">{pn}</label>
                                  <input
                                    type="text"
                                    className="param-input"
                                    placeholder={ep.defaults?.[pn] || pn}
                                    value={customParams[`${key}-${pn}`] || ''}
                                    onChange={e => setCustomParams(prev => ({ ...prev, [`${key}-${pn}`]: e.target.value }))}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {ep.params && ep.params.length > 0 && (
                          <div className="ep-params-box">
                            <h4>
                              <IconSettings />
                              Query Parameters
                            </h4>
                            <div className="param-tags">
                              {ep.params.map((p, pi) => <span className="param-tag" key={pi}>{p}</span>)}
                            </div>
                          </div>
                        )}
                        <div className="ep-example">
                          <div className="example-bar">
                            <span className="example-label">Preview URL</span>
                            <button className={`copy-sm ${copied === key ? 'copied' : ''}`} onClick={() => copyText(`${ep.method} ${buildUrl(ep, key)}`, key)}>
                              {copied === key ? <IconCheck size={13} /> : <IconCopy />}
                            </button>
                          </div>
                          <div className="example-code">{ep.method} {buildUrl(ep, key)}</div>
                        </div>
                        <div className="ep-example curl-box">
                          <div className="example-bar">
                            <span className="example-label">cURL</span>
                            <button className={`copy-sm ${copied === curlKey ? 'copied' : ''}`} onClick={() => copyText(buildCurl(ep, key), curlKey)}>
                              {copied === curlKey ? <IconCheck size={13} /> : <IconCopy />}
                            </button>
                          </div>
                          <div className="example-code curl-code">{buildCurl(ep, key)}</div>
                        </div>
                        {ep.body && (
                          <div className="ep-example">
                            <div className="example-bar"><span className="example-label">Request Body</span></div>
                            <pre className="example-code" dangerouslySetInnerHTML={{ __html: highlightJSON(JSON.stringify(ep.body, null, 2)) }} />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ))}

          {filtered.length === 0 && categories.length > 0 && (
            <div className="no-results">
              <IconSearch size={40} />
              <p>No endpoints match "<strong>{search}</strong>"</p>
              <button onClick={() => setSearch('')}>Clear search</button>
            </div>
          )}
        </main>
      </div>

      {sidebarOpen && createPortal(
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />,
        document.body
      )}

      {modal && createPortal(
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <div className="modal-title">
                <IconCode size={16} />
                <h3>Response</h3>
              </div>
              <div className="modal-meta">
                <span className={`modal-status ${modal.status < 300 ? 'ok' : 'err'}`}>{modal.status}</span>
                <span className="modal-time">{modal.time}ms</span>
              </div>
              <button className="modal-close" onClick={() => setModal(null)}>
                <IconX />
              </button>
            </div>
            <div className="modal-body">
              <pre dangerouslySetInnerHTML={{ __html: highlightJSON(JSON.stringify(modal.data, null, 2)) }} />
            </div>
            <div className="modal-foot">
              <button className={`copy-btn-modal ${copied === 'modal' ? 'copied' : ''}`} onClick={() => copyText(JSON.stringify(modal.data, null, 2), 'modal')}>
                {copied === 'modal' ? <IconCheck size={14} /> : <IconCopy size={14} />}
                <span>{copied === 'modal' ? 'Copied' : 'Copy Response'}</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
