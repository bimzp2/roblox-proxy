import { useEffect, useRef, useState } from 'react'

export default function useMousePosition() {
  const position = useRef({ x: 0, y: 0 })
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const raf = useRef(null)

  useEffect(() => {
    const update = () => {
      setPos({ ...position.current })
      raf.current = null
    }

    const onMove = (e) => {
      position.current = { x: e.clientX, y: e.clientY }
      if (!raf.current) {
        raf.current = requestAnimationFrame(update)
      }
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    return () => {
      window.removeEventListener('mousemove', onMove)
      if (raf.current) cancelAnimationFrame(raf.current)
    }
  }, [])

  return pos
}
