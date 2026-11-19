import { useCallback, useEffect, useRef, useState, type TouchEvent } from 'react'
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Pause, Play, RotateCcw, Share2, X } from 'lucide-react'
import type { GameProps } from './types'
import { downloadScoreCard, getBest, playGameAudio, saveBest } from './types'

type Cell = { x: number; y: number }
const size = 18
const cellSize = 20
const tr = (language: GameProps['language'], ar: string, en: string) => language === 'ar' ? ar : en
const equal = (a: Cell, b: Cell) => a.x === b.x && a.y === b.y

export default function Snake({ onExit, onScore, language }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const direction = useRef<Cell>({ x: 1, y: 0 })
  const queued = useRef<Cell | null>(null)
  const snake = useRef<Cell[]>([{ x: 8, y: 8 }, { x: 7, y: 8 }])
  const food = useRef<Cell>({ x: 13, y: 8 })
  const scoreRef = useRef(0)
  const reported = useRef(false)
  const swipeStart = useRef<{ x: number; y: number } | null>(null)
  const [running, setRunning] = useState(false)
  const [paused, setPaused] = useState(false)
  const [score, setScore] = useState(0)
  const [best, setBest] = useState(() => getBest('snake'))
  const [difficulty, setDifficulty] = useState('normal')
  const [sound, setSound] = useState(false)
  const [over, setOver] = useState(false)

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
      ctx.fillStyle = (x + y) % 2 ? 'rgba(255,255,255,.021)' : 'rgba(255,255,255,.048)'
      ctx.fillRect(x * cellSize, y * cellSize, 19, 19)
    }
    snake.current.forEach((cell, index) => {
      ctx.fillStyle = index === 0 ? '#ffd36b' : '#ff922e'
      ctx.beginPath(); ctx.roundRect(cell.x * cellSize + 2, cell.y * cellSize + 2, 16, 16, 4); ctx.fill()
    })
    ctx.fillStyle = '#fff0bf'; ctx.shadowColor = '#ff9b28'; ctx.shadowBlur = 17
    ctx.beginPath(); ctx.arc(food.current.x * cellSize + 10, food.current.y * cellSize + 10, 7, 0, Math.PI * 2); ctx.fill()
    ctx.shadowBlur = 0
  }, [])

  const placeFood = () => {
    const spaces: Cell[] = []
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
      const cell = { x, y }
      if (!snake.current.some(part => equal(part, cell))) spaces.push(cell)
    }
    if (spaces.length) food.current = spaces[Math.floor(Math.random() * spaces.length)]
  }

  const reset = () => {
    snake.current = [{ x: 8, y: 8 }, { x: 7, y: 8 }]
    direction.current = { x: 1, y: 0 }; queued.current = null
    food.current = { x: 13, y: 8 }
    scoreRef.current = 0; reported.current = false
    setScore(0); setOver(false); setPaused(false); setRunning(false)
    draw()
  }
  const start = () => { reset(); setRunning(true) }
  const setDir = useCallback((next: Cell) => {
    if (queued.current || (next.x === -direction.current.x && next.y === -direction.current.y)) return
    queued.current = next
  }, [])

  useEffect(() => { draw() }, [draw])
  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if (!running || over) return
      const dirs: Record<string, Cell> = { ArrowUp: { x: 0, y: -1 }, w: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 }, s: { x: 0, y: 1 }, ArrowLeft: { x: -1, y: 0 }, a: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 }, d: { x: 1, y: 0 } }
      const next = dirs[event.key]
      if (next) { event.preventDefault(); setDir(next) }
      if (event.key === ' ') { event.preventDefault(); setPaused(value => !value) }
    }
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  }, [setDir, running, over])
  useEffect(() => {
    const onVisibility = () => { if (document.hidden) setPaused(true) }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])
  useEffect(() => {
    if (!running || paused || over) return
    const speed = difficulty === 'easy' ? 190 : difficulty === 'hard' ? 90 : 135
    const loop = window.setInterval(() => {
      if (queued.current) { direction.current = queued.current; queued.current = null }
      const head = snake.current[0]
      const next = { x: (head.x + direction.current.x + size) % size, y: (head.y + direction.current.y + size) % size }
      const eating = equal(next, food.current)
      const body = eating ? snake.current : snake.current.slice(0, -1)
      if (body.some(cell => equal(cell, next))) {
        setRunning(false); setOver(true)
        if (!reported.current) {
          reported.current = true
          setBest(saveBest('snake', scoreRef.current)); onScore('snake', scoreRef.current)
        }
        return
      }
      snake.current = [next, ...snake.current.slice(0, eating ? undefined : -1)]
      if (eating) {
        scoreRef.current += 10
        setScore(scoreRef.current)
        placeFood(); playGameAudio(sound)
      }
      draw()
    }, speed)
    return () => window.clearInterval(loop)
  }, [running, paused, over, difficulty, sound, onScore, draw])

  const swipe = (event: TouchEvent<HTMLCanvasElement>) => {
    const touch = event.changedTouches[0]
    if (!swipeStart.current || !touch) return
    const dx = touch.clientX - swipeStart.current.x
    const dy = touch.clientY - swipeStart.current.y
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 12) return
    setDir(Math.abs(dx) > Math.abs(dy) ? { x: dx > 0 ? 1 : -1, y: 0 } : { x: 0, y: dy > 0 ? 1 : -1 })
    swipeStart.current = null
  }

  return <div className="game-shell">
    <div className="game-header"><span className="eyebrow">FLAME SNAKE</span><button className="icon-button" onClick={onExit} aria-label="Close"><X size={17} /></button></div>
    <div className="game-stats"><span>{tr(language,'النقاط','SCORE')} <b>{score}</b></span><span>{tr(language,'الأفضل','BEST')} <b>{best}</b></span><label>{tr(language,'المستوى','LEVEL')} <select value={difficulty} disabled={running} onChange={event => setDifficulty(event.target.value)}><option value="easy">Easy</option><option value="normal">Normal</option><option value="hard">Hard</option></select></label></div>
    <canvas ref={canvasRef} className="snake-canvas" width={360} height={360} aria-label="Snake game board" onTouchStart={event => { const touch = event.touches[0]; if (touch) swipeStart.current = { x: touch.clientX, y: touch.clientY } }} onTouchEnd={swipe} />
    <div className="dpad"><button aria-label="Up" onClick={() => setDir({x:0,y:-1})}><ArrowUp/></button><button aria-label="Left" onClick={() => setDir({x:-1,y:0})}><ArrowLeft/></button><button aria-label="Down" onClick={() => setDir({x:0,y:1})}><ArrowDown/></button><button aria-label="Right" onClick={() => setDir({x:1,y:0})}><ArrowRight/></button></div>
    {over && <div className="game-over"><strong>{tr(language,'انتهت اللعبة','Game over')}</strong><span>{score} {tr(language,'نقطة','points')}</span><button className="button button-primary" onClick={start}><RotateCcw size={15}/>{tr(language,'العب تاني','Restart')}</button><button className="button button-ghost" onClick={() => downloadScoreCard('Flame Snake', `${score} points`)}><Share2 size={15}/>{tr(language,'شارك','Share')}</button></div>}
    <div className="game-actions">{!running && !over && <button className="button button-primary" onClick={start}><Play size={15}/>{tr(language,'ابدأ','Start')}</button>}{running && <button className="button button-secondary" onClick={() => setPaused(value => !value)}>{paused ? <Play size={15}/> : <Pause size={15}/>} {paused ? tr(language,'كمّل','Resume') : tr(language,'وقف','Pause')}</button>}<button className="button button-ghost" onClick={() => setSound(value => !value)}>{sound ? tr(language,'الصوت شغال','Sound on') : tr(language,'الصوت مقفول','Sound off')}</button></div>
  </div>
}
