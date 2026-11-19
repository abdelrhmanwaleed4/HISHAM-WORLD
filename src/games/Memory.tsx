import { useEffect, useRef, useState } from 'react'
import { RotateCcw, Share2, Timer, X } from 'lucide-react'
import type { GameProps } from './types'
import { downloadScoreCard, getBest, saveBest } from './types'

const icons = ['🎮', '👾', '⚡', '🏆', '🐍', '🎯', '🧠', '💎']
type Difficulty = 'easy' | 'medium' | 'hard'
type Card = { id: number; icon: string; matched: boolean }
const tr = (language: GameProps['language'], ar: string, en: string) => language === 'ar' ? ar : en
function makeDeck(count: number): Card[] {
  const deck = [...icons.slice(0, count), ...icons.slice(0, count)].map((icon, id) => ({ icon, id, matched: false }))
  for (let i = deck.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [deck[i], deck[j]] = [deck[j], deck[i]] }
  return deck
}

export default function Memory({ onExit, onScore, language }: GameProps) {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy')
  const pairs = difficulty === 'easy' ? 4 : difficulty === 'medium' ? 6 : 8
  const [cards, setCards] = useState<Card[]>([])
  const [opened, setOpened] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [seconds, setSeconds] = useState(0)
  const [started, setStarted] = useState(false)
  const [best, setBest] = useState(() => getBest('memory'))
  const [finalScore, setFinalScore] = useState<number | null>(null)
  const reported = useRef(false)
  const complete = started && cards.length > 0 && cards.every(card => card.matched)

  const newGame = () => {
    reported.current = false
    setCards(makeDeck(pairs)); setOpened([]); setMoves(0); setSeconds(0); setStarted(true); setFinalScore(null)
  }

  useEffect(() => {
    if (!started || complete) return
    const interval = window.setInterval(() => setSeconds(value => value + 1), 1000)
    return () => clearInterval(interval)
  }, [started, complete])

  useEffect(() => {
    if (opened.length !== 2) return
    const [first, second] = opened
    const isMatch = cards[first]?.icon === cards[second]?.icon
    const timer = window.setTimeout(() => {
      if (isMatch) setCards(current => current.map((card, index) => index === first || index === second ? { ...card, matched: true } : card))
      setOpened([])
    }, isMatch ? 380 : 760)
    return () => window.clearTimeout(timer)
  }, [opened, cards])

  useEffect(() => {
    if (!complete || reported.current) return
    reported.current = true
    const accuracy = pairs / Math.max(moves, 1)
    const result = Math.max(10, Math.round(1000 * accuracy - seconds * 1.5))
    setFinalScore(result)
    setBest(saveBest('memory', result))
    onScore('memory', result)
  }, [complete, moves, pairs, seconds, onScore])

  const flip = (index: number) => {
    if (!started || complete || opened.length === 2 || opened.includes(index) || cards[index]?.matched) return
    setOpened(current => [...current, index])
    if (opened.length === 1) setMoves(current => current + 1)
  }
  return <div className="game-shell">
    <div className="game-header"><span className="eyebrow">MEMORY CLASH</span><button className="icon-button" onClick={onExit} aria-label="Close"><X size={17} /></button></div>
    <div className="game-stats"><span>{tr(language,'المحاولات','MOVES')} <b>{moves}</b></span><span><Timer size={14}/> {seconds}s</span><span>{tr(language,'الأفضل','BEST')} <b>{best}</b></span></div>
    <div className="guess-controls"><select value={difficulty} onChange={event => { setDifficulty(event.target.value as Difficulty); setStarted(false); setCards([]); setOpened([]); setFinalScore(null) }}><option value="easy">{tr(language,'سهل · 4 أزواج','Easy · 4 pairs')}</option><option value="medium">{tr(language,'متوسط · 6 أزواج','Medium · 6 pairs')}</option><option value="hard">{tr(language,'صعب · 8 أزواج','Hard · 8 pairs')}</option></select><button className="button button-primary" onClick={newGame}>{started ? tr(language,'إعادة','Restart') : tr(language,'ابدأ','Start')}</button></div>
    {complete && <div className="game-feedback"><strong>{tr(language,'كسبت! خلّصت اللوحة','Board cleared!')}</strong><span>{tr(language,'النقاط','Score')}: {finalScore ?? '…'}</span></div>}
    <div className={`memory-grid memory-${difficulty}`}>{cards.map((card, index) => {
      const visible = card.matched || opened.includes(index)
      return <button type="button" className={`memory-card ${visible ? 'is-flipped' : ''}`} key={card.id} disabled={card.matched || opened.length === 2} onClick={() => flip(index)} aria-label={visible ? card.icon : tr(language,'كارت مخفي','Hidden card')} aria-pressed={visible}><span>{visible ? card.icon : '?'}</span></button>
    })}</div>
    <div className="game-actions"><button className="button button-ghost" onClick={() => downloadScoreCard('Memory Clash', `${finalScore ?? best} points`)}><Share2 size={15}/>{tr(language,'شارك النتيجة','Share score')}</button><button className="button button-ghost" onClick={newGame}><RotateCcw size={15}/>{tr(language,'العب تاني','Replay')}</button></div>
  </div>
}
