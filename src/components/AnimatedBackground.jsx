import { useEffect, useRef } from 'react'
import { useTema } from '../context/ThemeContext'

export default function AnimatedBackground() {
  const canvasRef = useRef(null)
  const { tema } = useTema()

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animationId
    let mouse = { x: null, y: null }

    const CULOARE_NOD_LIGHT = '#1a73e8'
    const CULOARE_LINIE_LIGHT = '#1a73e8'
    const CULOARE_NOD_DARK = '#4299e1'
    const CULOARE_LINIE_DARK = '#4299e1'

    function resize() {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    function handleMouseMove(e) {
      mouse.x = e.clientX
      mouse.y = e.clientY
    }
    function handleMouseLeave() {
      mouse.x = null
      mouse.y = null
    }
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseleave', handleMouseLeave)


    const NR_NODURI = 60
    const noduri = Array.from({ length: NR_NODURI }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      r: Math.random() * 2.5 + 1.5
    }))

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const culoareNod = tema === 'dark' ? CULOARE_NOD_DARK : CULOARE_NOD_LIGHT
      const culoareLinie = tema === 'dark' ? CULOARE_LINIE_DARK : CULOARE_LINIE_LIGHT


      noduri.forEach(nod => {
        nod.x += nod.vx
        nod.y += nod.vy

        if (nod.x < 0 || nod.x > canvas.width) nod.vx *= -1
        if (nod.y < 0 || nod.y > canvas.height) nod.vy *= -1


        if (mouse.x !== null) {
          const dx = mouse.x - nod.x
          const dy = mouse.y - nod.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 120) {
            nod.x -= dx * 0.02
            nod.y -= dy * 0.02
          }
        }
      })

      for (let i = 0; i < noduri.length; i++) {
        for (let j = i + 1; j < noduri.length; j++) {
          const dx = noduri[i].x - noduri[j].x
          const dy = noduri[i].y - noduri[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          const DIST_MAX = 130

          if (dist < DIST_MAX) {
            const opacitate = (1 - dist / DIST_MAX) * 0.5
            ctx.beginPath()
            ctx.moveTo(noduri[i].x, noduri[i].y)
            ctx.lineTo(noduri[j].x, noduri[j].y)
            ctx.strokeStyle = culoareLinie
            ctx.globalAlpha = opacitate
            ctx.lineWidth = 0.8
            ctx.stroke()
          }
        }
      }

      if (mouse.x !== null) {
        noduri.forEach(nod => {
          const dx = mouse.x - nod.x
          const dy = mouse.y - nod.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 180) {
            const opacitate = (1 - dist / 180) * 0.8
            ctx.beginPath()
            ctx.moveTo(nod.x, nod.y)
            ctx.lineTo(mouse.x, mouse.y)
            ctx.strokeStyle = culoareLinie
            ctx.globalAlpha = opacitate
            ctx.lineWidth = 1
            ctx.stroke()
          }
        })
      }


      ctx.globalAlpha = 1
      noduri.forEach(nod => {
        ctx.beginPath()
        ctx.arc(nod.x, nod.y, nod.r, 0, Math.PI * 2)
        ctx.fillStyle = culoareNod
        ctx.globalAlpha = 0.7
        ctx.fill()
      })

      ctx.globalAlpha = 1
      animationId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [tema])

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
        pointerEvents: 'none'
      }}
    />
  )
}