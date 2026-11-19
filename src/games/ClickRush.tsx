import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react'
import { Pause, Play, RotateCcw, Share2, Target, X } from 'lucide-react'
import type { GameProps } from './types'
import { downloadScoreCard, getBest, playGameAudio, saveBest } from './types'

type TargetPoint = { x: number; y: number; r: number }
const ROUND_MS = 30_000
const tr = (language: GameProps['language'], ar: string, en: string) => language === 'ar' ? ar : en

export default function ClickRush({ onExit, onScore, language }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawFrame = useRef(0)
  const timerFrame = useRef(0)
  const lastTick = useRef(0)
  const remaining = useRef(ROUND_MS)
  const scoreRef = useRef(0)
  const hitsRef = useRef(0)
  const reported = useRef(false)
  const target = useRef<TargetPoint>({ x: 310, y: 180, r: 27 })
  const [running, setRunning] = useState(false)
  const [paused, setPaused] = useState(false)
  const [seconds, setSeconds] = useState(30)
  const [score, setScore] = useState(0)
  const [hits, setHits] = useState(0)
  const [best, setBest] = useState(() => getBest('click-rush'))
  const [gameOver, setGameOver] = useState(false)
  const [sound, setSound] = useState(false)

  const spawn = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const r = Math.max(17, 27 - hitsRef.current * .25)
    target.current = { x: r + 5 + Math.random() * (canvas.width - 2 * r - 10), y: r + 5 + Math.random() * (canvas.height - 2 * r - 10), r }
  }, [])

  const start = () => {
    reported.current = false
    scoreRef.current = 0
    hitsRef.current = 0
    remaining.current = ROUND_MS
    lastTick.current = 0
    setScore(0); setHits(0); setSeconds(30); setGameOver(false); setPaused(false)
    spawn()
    setRunning(true)
  }

  useEffect(() => {
    const onVisibility = () => { if (document.hidden) setPaused(true) }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  useEffect(() => {
    if (!running || paused || gameOver) { lastTick.current = 0; return }
    const tick = (now: number) => {
      if (!lastTick.current) lastTick.current = now
      remaining.current = Math.max(0, remaining.current - (now - lastTick.current))
      lastTick.current = now
      setSeconds(Math.ceil(remaining.current / 1000))
      if (remaining.current <= 0) {
        setRunning(false); setGameOver(true)
        if (!reported.current) {
          reported.current = true
          const result = scoreRef.current
          setBest(saveBest('click-rush', result))
          onScore('click-rush', result)
        }
        return
      }
      timerFrame.current = requestAnimationFrame(tick)
    }
    timerFrame.current = requestAnimationFrame(tick)
    return () => { cancelAnimationFrame(timerFrame.current); lastTick.current = 0 }
  }, [running, paused, gameOver, onScore])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx || !canvas) return
    const draw = (now: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const t = target.current
      const pulse = 1.45 + .12 * Math.sin(now / 230)
      const glow = ctx.createRadialGradient(t.x, t.y, 1, t.x, t.y, t.r * 2.5)
      glow.addColorStop(0, 'rgba(255,194,75,.36)')
      glow.addColorStop(1, 'rgba(255,112,23,0)')
      ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(t.x, t.y, t.r * 2.5, 0, Math.PI * 2); ctx.fill()
      ctx.strokeStyle = '#ff9c36'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(t.x, t.y, t.r * pulse, 0, Math.PI * 2); ctx.stroke()
      ctx.fillStyle = '#ffbb50'; ctx.beginPath(); ctx.arc(t.x, t.y, t.r, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = '#39200b'; ctx.beginPath(); ctx.arc(t.x, t.y, t.r * .52, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = '#ffe1a1'; ctx.beginPath(); ctx.arc(t.x, t.y, t.r * .2, 0, Math.PI * 2); ctx.fill()
      drawFrame.current = requestAnimationFrame(draw)
    }
    drawFrame.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(drawFrame.current)
  }, [])

  const hit = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!running || paused || gameOver) return
    const rect = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - rect.left) * event.currentTarget.width / rect.width
    const y = (event.clientY - rect.top) * event.currentTarget.height / rect.height
    if (Math.hypot(x - target.current.x, y - target.current.y) <= target.current.r) {
      const gained = 10 + Math.min(50, hitsRef.current * 2)
      hitsRef.current += 1
      scoreRef.current += gained
      setHits(hitsRef.current); setScore(scoreRef.current)
      spawn(); playGameAudio(sound)
    }
  }

  return <div className="game-shell">
    <div className="game-header"><span className="eyebrow"><Target size={14} /> CLICK RUSH</span><button className="icon-button" onClick={onExit} aria-label="Close"><X size={17} /></button></div>
    <div className="game-stats"><span>{tr(language,'الوقت','TIME')} <b>{seconds}s</b></span><span>{tr(language,'النقاط','SCORE')} <b>{score}</b></span><span>{tr(language,'الأفضل','BEST')} <b>{best}</b></span></div>
    <canvas ref={canvasRef} className="game-canvas" width={620} height={360} onPointerDown={hit} aria-label="Tap the glowing targets" />
    {gameOver && <div className="game-over"><strong>{tr(language,'خلصت الجولة!','Round complete!')}</strong><span>{score} {tr(language,'نقطة','points')} · {hits} {tr(language,'إصابة','hits')}</span><button className="button button-primary" onClick={start}><RotateCcw size={15}/>{tr(language,'العب تاني','Restart')}</button><button className="button button-ghost" onClick={() => downloadScoreCard('Click Rush', `${score} points`)}><Share2 size={15}/>{tr(language,'شارك النتيجة','Share score')}</button></div>}
    <div className="game-actions">{!running && !gameOver && <button className="button button-primary" onClick={start}><Play size={15}/>{tr(language,'ابدأ جولة 30 ثانية','Start 30s round')}</button>}{running && <button className="button button-secondary" onClick={() => setPaused(value => !value)}>{paused ? <Play size={15}/> : <Pause size={15}/>} {paused ? tr(language,'كمّل','Resume') : tr(language,'إيقاف مؤقت','Pause')}</button>}<button className="button button-ghost" onClick={() => setSound(value => !value)}>{sound ? tr(language,'الصوت شغال','Sound on') : tr(language,'الصوت مقفول','Sound off')}</button></div>
  </div>
}
