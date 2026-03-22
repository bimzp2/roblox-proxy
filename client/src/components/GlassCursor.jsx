import { useEffect, useRef, useState } from 'react'

export default function GlassCursor() {
  const outerRef = useRef(null)
  const innerRef = useRef(null)
  const pos = useRef({ x: -100, y: -100 })
  const target = useRef({ x: -100, y: -100 })
  const [hovering, setHovering] = useState(false)
  const [visible, setVisible] = useState(false)
  const [isTouch, setIsTouch] = useState(false)
  const frameRef = useRef(null)

  useEffect(() => {
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      setIsTouch(true)
      return
    }

    const onMove = (e) => {
      target.current = { x: e.clientX, y: e.clientY }
      if (!visible) setVisible(true)
    }

    const onLeave = () => {
      setVisible(false)
      target.current = { x: -100, y: -100 }
      pos.current = { x: -100, y: -100 }
    }

    const onOver = (e) => {
      const t = e.target
      const interactive = t.closest('a, button, [role="button"], input, textarea, select, .ep-card-top, .feature-card, .stat-card, .ep-cat, .step-card')
      setHovering(!!interactive)
    }

    document.addEventListener('mousemove', onMove, { passive: true })
    document.addEventListener('mouseleave', onLeave)
    document.addEventListener('mouseover', onOver, { passive: true })

    const lerp = (a, b, n) => a + (b - a) * n

    const animate = () => {
      pos.current.x = lerp(pos.current.x, target.current.x, 0.12)
      pos.current.y = lerp(pos.current.y, target.current.y, 0.12)

      if (outerRef.current) {
        outerRef.current.style.transform = `translate(${pos.current.x - 20}px, ${pos.current.y - 20}px)`
      }
      if (innerRef.current) {
        const ix = lerp(parseFloat(innerRef.current.dataset.x || -100), target.current.x, 0.25)
        const iy = lerp(parseFloat(innerRef.current.dataset.y || -100), target.current.y, 0.25)
        innerRef.current.dataset.x = ix
        innerRef.current.dataset.y = iy
        innerRef.current.style.transform = `translate(${ix - 4}px, ${iy - 4}px)`
      }

      frameRef.current = requestAnimationFrame(animate)
    }

    frameRef.current = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(frameRef.current)
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseleave', onLeave)
      document.removeEventListener('mouseover', onOver)
    }
  }, [visible])

  if (isTouch) return null

  return (
    <>
      <div
        ref={outerRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 40,
          height: 40,
          borderRadius: '50%',
          border: '1.5px solid rgba(124, 58, 237, 0.35)',
          background: 'radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 70%)',
          backdropFilter: 'blur(1px)',
          pointerEvents: 'none',
          zIndex: 9999,
          transition: `width 0.35s cubic-bezier(0.16,1,0.3,1), height 0.35s cubic-bezier(0.16,1,0.3,1), border-color 0.35s ease, opacity 0.3s ease`,
          opacity: visible ? 1 : 0,
          ...(hovering ? {
            width: 56,
            height: 56,
            borderColor: 'rgba(34, 211, 238, 0.5)',
            background: 'radial-gradient(circle, rgba(34,211,238,0.08) 0%, transparent 70%)',
            transform: `translate(${pos.current.x - 28}px, ${pos.current.y - 28}px)`
          } : {})
        }}
      />
      <div
        ref={innerRef}
        data-x="-100"
        data-y="-100"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #7c3aed, #22d3ee)',
          pointerEvents: 'none',
          zIndex: 9999,
          opacity: visible ? 1 : 0,
          transition: `width 0.3s ease, height 0.3s ease, opacity 0.3s ease`,
          boxShadow: '0 0 12px rgba(124, 58, 237, 0.4)',
          ...(hovering ? {
            width: 6,
            height: 6,
            opacity: visible ? 0.6 : 0
          } : {})
        }}
      />
    </>
  )
}
