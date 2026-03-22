import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react'
import Landing from './pages/Landing'
import Docs from './pages/Docs'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function PageTransition({ children }) {
  const location = useLocation()
  const [displayLocation, setDisplayLocation] = useState(location)
  const [transitionStage, setTransitionStage] = useState('enter')
  const timeoutRef = useRef(null)

  useEffect(() => {
    if (location.pathname !== displayLocation.pathname) {
      setTransitionStage('exit')
      timeoutRef.current = setTimeout(() => {
        setDisplayLocation(location)
        setTransitionStage('enter')
      }, 300)
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [location, displayLocation])

  return (
    <div className={`page-transition page-${transitionStage}`}>
      <Routes location={displayLocation}>
        {children}
      </Routes>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <PageTransition>
        <Route path="/" element={<Landing />} />
        <Route path="/docs" element={<Docs />} />
      </PageTransition>
    </BrowserRouter>
  )
}
