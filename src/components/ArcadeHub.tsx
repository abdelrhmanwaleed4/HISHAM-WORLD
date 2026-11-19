import { Component, lazy, Suspense, useEffect, useState, type ErrorInfo, type ReactNode } from 'react'
import { Gamepad2 } from 'lucide-react'
import type { GameId, GameProps } from '../games/types'
import type { Language } from '../types'

type HubProps = { onScore: (game: GameId, score: number) => void; language: Language }
const games: { id: GameId; title: string; subtitle: string; subtitleAr: string; icon: string }[] = [
  { id: 'click-rush', title: 'Hisham Click Rush', subtitle: '30 seconds · moving targets', subtitleAr: '30 ثانية · أهداف متحركة', icon: '🎯' },
  { id: 'snake', title: 'Flame Snake', subtitle: 'Grid movement · power-ups', subtitleAr: 'لعبة الثعبان الكلاسيكية', icon: '🐍' },
  { id: 'guess', title: 'Guess The Game', subtitle: 'Emoji clues · streaks', subtitleAr: 'خمن الألعاب من الإيموجيز', icon: '🧠' },
  { id: 'memory', title: 'Memory Clash', subtitle: 'Flip pairs · accuracy', subtitleAr: 'اقلب الكروت وطابق الأزواج', icon: '🃏' },
  { id: 'reflex', title: 'Reflex Arena', subtitle: 'Five rounds · timing', subtitleAr: '5 جولات لاختبار رد الفعل', icon: '⚡' },
]
const imports: Record<GameId, React.LazyExoticComponent<(props: GameProps) => JSX.Element>> = {
  'click-rush': lazy(() => import('../games/ClickRush')), snake: lazy(() => import('../games/Snake')), guess: lazy(() => import('../games/GuessGame')), memory: lazy(() => import('../games/Memory')), reflex: lazy(() => import('../games/Reflex')),
}
class GameBoundary extends Component<{ children: ReactNode }, { error: boolean }> { state = { error: false }; static getDerivedStateFromError() { return { error: true } } componentDidCatch(_error: Error, _info: ErrorInfo) {} render() { return this.state.error ? <div className="game-error"><strong>Game unavailable</strong><button className="button button-ghost" onClick={() => this.setState({ error: false })}>Try again</button></div> : this.props.children } }
export default function ArcadeHub({ onScore, language }: HubProps) {
  const [selected, setSelected] = useState<GameId | null>(null); const Game = selected ? imports[selected] : null
  useEffect(() => {
    if (!selected) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') setSelected(null) }
    window.addEventListener('keydown', onKeyDown)
    return () => { document.body.style.overflow = previous; window.removeEventListener('keydown', onKeyDown) }
  }, [selected])
  return <div className="arcade-hub"><div className="arcade-game-grid">{games.map((game) => <button className="glass arcade-game-card" key={game.id} onClick={() => setSelected(game.id)}><span className="game-emoji">{game.icon}</span><span><strong>{game.title}</strong><small>{language === 'ar' ? game.subtitleAr : game.subtitle}</small></span><Gamepad2 size={17} /></button>)}</div>{selected && Game && <div className="game-modal" role="presentation"><div className="game-modal-backdrop" onClick={() => setSelected(null)} /><div className="glass game-modal-panel" role="dialog" aria-modal="true" aria-label={language === 'ar' ? 'لعبة الأركيد' : 'Arcade game'}><GameBoundary><Suspense fallback={<div className="game-loading">Loading game…</div>}><Game onExit={() => setSelected(null)} onScore={onScore} language={language} /></Suspense></GameBoundary></div></div>}</div>
}
