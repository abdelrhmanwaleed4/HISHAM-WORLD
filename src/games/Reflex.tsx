import { useEffect, useRef, useState } from 'react'
import { RotateCcw, Share2, Timer, X } from 'lucide-react'
import type { GameProps } from './types'
import { downloadScoreCard, getBest, saveBest } from './types'

type Phase = 'idle' | 'waiting' | 'go' | 'result' | 'done'
const tr = (language: GameProps['language'], ar: string, en: string) => language === 'ar' ? ar : en
const averageOf = (times: number[]) => times.length ? Math.round(times.reduce((total, time) => total + time, 0) / times.length) : 0
export default function Reflex({ onExit, onScore, language }: GameProps) {
  const [phase, setPhase] = useState<Phase>('idle')
  const [times, setTimes] = useState<number[]>([])
  const [best, setBest] = useState(() => getBest('reflex'))
  const signalAt = useRef(0)
  const timer = useRef<number | undefined>(undefined)
  const reported = useRef(false)
  const average = averageOf(times)

  const start = () => {
    if (timer.current !== undefined) window.clearTimeout(timer.current)
    setPhase('waiting')
    timer.current = window.setTimeout(() => {
      signalAt.current = performance.now()
      setPhase('go')
      timer.current = undefined
    }, 1000 + Math.random() * 2500)
  }
  const click = () => {
    if (phase === 'idle') { reported.current = false; start(); return }
    if (phase === 'result' && times.length < 5) { start(); return }
    if (phase === 'waiting') {
      if (timer.current !== undefined) window.clearTimeout(timer.current)
      timer.current = undefined
      setTimes(current => [...current, 999]); setPhase('result')
    } else if (phase === 'go') {
      setTimes(current => [...current, Math.max(1, Math.round(performance.now() - signalAt.current))]); setPhase('result')
    }
  }
  useEffect(() => {
    if (phase !== 'result' || times.length !== 5 || reported.current) return
    reported.current = true
    const result = Math.max(0, 1000 - averageOf(times))
    setBest(saveBest('reflex', result))
    onScore('reflex', result)
    setPhase('done')
  }, [phase, times, onScore])
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden && timer.current !== undefined) {
        clearTimeout(timer.current); timer.current = undefined
        setPhase('idle'); setTimes([]); reported.current = false
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => { if (timer.current !== undefined) clearTimeout(timer.current); document.removeEventListener('visibilitychange', onVisibility) }
  }, [])
  const reset = () => {
    if (timer.current !== undefined) clearTimeout(timer.current)
    timer.current = undefined; reported.current = false
    setPhase('idle'); setTimes([])
  }
  return <div className="game-shell">
    <div className="game-header"><span className="eyebrow"><Timer size={14}/> REFLEX ARENA</span><button className="icon-button" onClick={onExit} aria-label="Close"><X size={17}/></button></div>
    <div className="game-stats"><span>{tr(language,'الجولة','ROUND')} <b>{Math.min(times.length + (phase === 'waiting' || phase === 'go' ? 1 : 0), 5)}/5</b></span><span>{tr(language,'المتوسط','AVERAGE')} <b>{times.length ? `${average}ms` : '—'}</b></span><span>{tr(language,'الأفضل','BEST')} <b>{best || '—'}</b></span></div>
    <button className={`reflex-board reflex-${phase}`} onClick={click} disabled={phase === 'done'}>{phase === 'idle' && tr(language,'اضغط للبدء','Tap to start')}{phase === 'waiting' && tr(language,'استنى اللون البرتقالي!','Wait for orange!')}{phase === 'go' && tr(language,'اضغط دلوقتي!','TAP NOW!')}{phase === 'result' && `${times[times.length - 1] === 999 ? tr(language,'ضغطت بدري!','False start!') : `${times[times.length - 1]}ms`} · ${times.length < 5 ? tr(language,'اضغط للمرحلة التالية','tap for next') : tr(language,'تم','done')}`}{phase === 'done' && `${tr(language,'انتهت الجولة','Finished')} · ${average}ms`}</button>
    <div className="game-actions">{phase === 'result' && times.length < 5 && <button className="button button-primary" onClick={start}>{tr(language,'الجولة التالية','Next round')}</button>}{phase === 'done' && <button className="button button-ghost" onClick={() => downloadScoreCard('Reflex Arena', `${average}ms average`)}><Share2 size={15}/>{tr(language,'شارك','Share')}</button>}<button className="button button-ghost" onClick={reset}><RotateCcw size={15}/>{tr(language,'إعادة','Restart')}</button></div>
  </div>
}
