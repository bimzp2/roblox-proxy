import { useEffect, useRef, useCallback } from 'react'

const COLORS = [
  [139, 92, 246],
  [6, 182, 212],
  [236, 72, 153],
  [59, 130, 246],
  [99, 102, 241],
  [20, 184, 166]
]

const LAYERS = [
  { speed: 0.15, sizeMin: 0.4, sizeMax: 1.2, alphaMin: 0.05, alphaMax: 0.2 },
  { speed: 0.3, sizeMin: 0.8, sizeMax: 2.0, alphaMin: 0.1, alphaMax: 0.35 },
  { speed: 0.5, sizeMin: 1.2, sizeMax: 2.8, alphaMin: 0.15, alphaMax: 0.5 }
]

function createSpatialGrid(cellSize) {
  const grid = new Map()
  return {
    clear() { grid.clear() },
    insert(p, idx) {
      const key = `${Math.floor(p.x / cellSize)},${Math.floor(p.y / cellSize)}`
      if (!grid.has(key)) grid.set(key, [])
      grid.get(key).push(idx)
    },
    query(x, y, radius) {
      const results = []
      const minX = Math.floor((x - radius) / cellSize)
      const maxX = Math.floor((x + radius) / cellSize)
      const minY = Math.floor((y - radius) / cellSize)
      const maxY = Math.floor((y + radius) / cellSize)
      for (let cx = minX; cx <= maxX; cx++) {
        for (let cy = minY; cy <= maxY; cy++) {
          const cell = grid.get(`${cx},${cy}`)
          if (cell) results.push(...cell)
        }
      }
      return results
    }
  }
}

export default function Particles({ density = 12000, interactive = true, opacity = 1 }) {
  const canvasRef = useRef(null)
  const mouseRef = useRef({ x: -1000, y: -1000 })
  const particlesRef = useRef([])
  const shootingStarsRef = useRef([])
  const nebulasRef = useRef([])
  const frameRef = useRef(null)
  const fpsRef = useRef({ lastTime: 0, frames: 0, fps: 60 })

  const init = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })
    let w = canvas.width = window.innerWidth
    let h = canvas.height = window.innerHeight
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = w * dpr
    canvas.height = h * dpr
    ctx.scale(dpr, dpr)
    canvas.style.width = w + 'px'
    canvas.style.height = h + 'px'

    const totalCount = Math.min(Math.floor((w * h) / density), 120)
    const CONNECTION_DIST = 120
    const spatialGrid = createSpatialGrid(CONNECTION_DIST)

    particlesRef.current = []
    for (let layerIdx = 0; layerIdx < LAYERS.length; layerIdx++) {
      const layer = LAYERS[layerIdx]
      const count = Math.floor(totalCount * (layerIdx === 1 ? 0.4 : 0.3))
      for (let i = 0; i < count; i++) {
        const color = COLORS[Math.floor(Math.random() * COLORS.length)]
        particlesRef.current.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * layer.speed,
          vy: (Math.random() - 0.5) * layer.speed,
          r: Math.random() * (layer.sizeMax - layer.sizeMin) + layer.sizeMin,
          alpha: Math.random() * (layer.alphaMax - layer.alphaMin) + layer.alphaMin,
          baseAlpha: 0,
          color,
          layer: layerIdx,
          pulseOffset: Math.random() * Math.PI * 2,
          pulseSpeed: 0.005 + Math.random() * 0.01
        })
        particlesRef.current[particlesRef.current.length - 1].baseAlpha = particlesRef.current[particlesRef.current.length - 1].alpha
      }
    }

    nebulasRef.current = Array.from({ length: 3 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: 80 + Math.random() * 120,
      alpha: 0,
      maxAlpha: 0.03 + Math.random() * 0.04,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      phase: Math.random() * Math.PI * 2,
      speed: 0.003 + Math.random() * 0.005,
      vx: (Math.random() - 0.5) * 0.1,
      vy: (Math.random() - 0.5) * 0.1
    }))

    const spawnShootingStar = () => {
      if (shootingStarsRef.current.length >= 2) return
      const side = Math.random()
      let sx, sy, angle
      if (side < 0.5) {
        sx = Math.random() * w
        sy = -10
        angle = Math.PI / 4 + Math.random() * (Math.PI / 4)
      } else {
        sx = -10
        sy = Math.random() * h * 0.5
        angle = Math.random() * (Math.PI / 6)
      }
      const speed = 4 + Math.random() * 6
      const color = COLORS[Math.floor(Math.random() * COLORS.length)]
      shootingStarsRef.current.push({
        x: sx, y: sy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        length: 30 + Math.random() * 50,
        alpha: 0.6 + Math.random() * 0.4,
        color,
        life: 1.0,
        decay: 0.008 + Math.random() * 0.012
      })
    }

    let shootingTimer = setInterval(() => {
      if (Math.random() < 0.4) spawnShootingStar()
    }, 3000)

    const onResize = () => {
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.scale(dpr, dpr)
      canvas.style.width = w + 'px'
      canvas.style.height = h + 'px'
    }

    const onMouse = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }

    const onLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 }
    }

    window.addEventListener('resize', onResize, { passive: true })
    if (interactive) {
      document.addEventListener('mousemove', onMouse, { passive: true })
      document.addEventListener('mouseleave', onLeave)
    }

    let time = 0
    const animate = (timestamp) => {
      fpsRef.current.frames++
      if (timestamp - fpsRef.current.lastTime >= 1000) {
        fpsRef.current.fps = fpsRef.current.frames
        fpsRef.current.frames = 0
        fpsRef.current.lastTime = timestamp
      }

      time += 0.016
      ctx.clearRect(0, 0, w, h)

      const nbs = nebulasRef.current
      for (let i = 0; i < nbs.length; i++) {
        const n = nbs[i]
        n.phase += n.speed
        n.alpha = n.maxAlpha * (0.5 + 0.5 * Math.sin(n.phase))
        n.x += n.vx
        n.y += n.vy
        if (n.x < -n.r) n.x = w + n.r
        if (n.x > w + n.r) n.x = -n.r
        if (n.y < -n.r) n.y = h + n.r
        if (n.y > h + n.r) n.y = -n.r

        const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r)
        grad.addColorStop(0, `rgba(${n.color[0]},${n.color[1]},${n.color[2]},${n.alpha})`)
        grad.addColorStop(1, 'transparent')
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2)
        ctx.fill()
      }

      const pts = particlesRef.current
      const m = mouseRef.current

      spatialGrid.clear()
      for (let i = 0; i < pts.length; i++) {
        spatialGrid.insert(pts[i], i)
      }

      for (let i = 0; i < pts.length; i++) {
        const p = pts[i]

        p.alpha = p.baseAlpha * (0.7 + 0.3 * Math.sin(time * p.pulseSpeed * 60 + p.pulseOffset))

        if (interactive) {
          const dx = m.x - p.x
          const dy = m.y - p.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 200 && dist > 1) {
            const force = (200 - dist) / 200
            const angle = Math.atan2(dy, dx)
            const orbitAngle = angle + Math.PI / 2
            p.vx += (Math.cos(orbitAngle) * force * 0.02 + dx / dist * force * 0.008)
            p.vy += (Math.sin(orbitAngle) * force * 0.02 + dy / dist * force * 0.008)
          }
        }

        p.x += p.vx
        p.y += p.vy
        p.vx *= 0.994
        p.vy *= 0.994

        if (p.x < -10) p.x = w + 10
        if (p.x > w + 10) p.x = -10
        if (p.y < -10) p.y = h + 10
        if (p.y > h + 10) p.y = -10

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${p.color[0]},${p.color[1]},${p.color[2]},${p.alpha})`
        ctx.fill()

        if (p.r > 1.5) {
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(${p.color[0]},${p.color[1]},${p.color[2]},${p.alpha * 0.1})`
          ctx.fill()
        }

        if (p.layer >= 1) {
          const neighbors = spatialGrid.query(p.x, p.y, CONNECTION_DIST)
          for (let k = 0; k < neighbors.length; k++) {
            const j = neighbors[k]
            if (j <= i) continue
            const p2 = pts[j]
            if (p2.layer < 1) continue
            const ddx = p.x - p2.x
            const ddy = p.y - p2.y
            const d = Math.sqrt(ddx * ddx + ddy * ddy)
            if (d < CONNECTION_DIST) {
              const lineAlpha = (1 - d / CONNECTION_DIST) * 0.08
              const grad = ctx.createLinearGradient(p.x, p.y, p2.x, p2.y)
              grad.addColorStop(0, `rgba(${p.color[0]},${p.color[1]},${p.color[2]},${lineAlpha})`)
              grad.addColorStop(1, `rgba(${p2.color[0]},${p2.color[1]},${p2.color[2]},${lineAlpha})`)
              ctx.beginPath()
              ctx.moveTo(p.x, p.y)
              ctx.lineTo(p2.x, p2.y)
              ctx.strokeStyle = grad
              ctx.lineWidth = 0.5
              ctx.stroke()
            }
          }
        }
      }

      const stars = shootingStarsRef.current
      for (let i = stars.length - 1; i >= 0; i--) {
        const s = stars[i]
        s.x += s.vx
        s.y += s.vy
        s.life -= s.decay

        if (s.life <= 0 || s.x > w + 50 || s.y > h + 50) {
          stars.splice(i, 1)
          continue
        }

        const tailX = s.x - (s.vx / Math.sqrt(s.vx * s.vx + s.vy * s.vy)) * s.length * s.life
        const tailY = s.y - (s.vy / Math.sqrt(s.vx * s.vx + s.vy * s.vy)) * s.length * s.life

        const grad = ctx.createLinearGradient(tailX, tailY, s.x, s.y)
        grad.addColorStop(0, 'transparent')
        grad.addColorStop(0.6, `rgba(${s.color[0]},${s.color[1]},${s.color[2]},${s.alpha * s.life * 0.3})`)
        grad.addColorStop(1, `rgba(${s.color[0]},${s.color[1]},${s.color[2]},${s.alpha * s.life})`)

        ctx.beginPath()
        ctx.moveTo(tailX, tailY)
        ctx.lineTo(s.x, s.y)
        ctx.strokeStyle = grad
        ctx.lineWidth = 1.5
        ctx.lineCap = 'round'
        ctx.stroke()

        ctx.beginPath()
        ctx.arc(s.x, s.y, 2, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${s.life * 0.8})`
        ctx.fill()
      }

      frameRef.current = requestAnimationFrame(animate)
    }

    frameRef.current = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(frameRef.current)
      clearInterval(shootingTimer)
      window.removeEventListener('resize', onResize)
      document.removeEventListener('mousemove', onMouse)
      document.removeEventListener('mouseleave', onLeave)
    }
  }, [density, interactive])

  useEffect(() => {
    const cleanup = init()
    return cleanup
  }, [init])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
        opacity
      }}
    />
  )
}
