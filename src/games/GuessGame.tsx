import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { Lightbulb, RotateCcw, Share2, Timer, X } from 'lucide-react'
import type { GameProps } from './types'
import { downloadScoreCard, getBest, saveBest } from './types'

type Difficulty = 'easy' | 'medium' | 'hard'
type Question = { clue: string; answer: string; hint: string; difficulty: Difficulty }
const questions: Question[] = [
  { clue: '🧱⛏️🌳', answer: 'Minecraft', hint: 'Blocks and crafting', difficulty: 'easy' }, { clue: '🍄👨‍🔧⭐', answer: 'Super Mario', hint: 'A famous plumber', difficulty: 'easy' }, { clue: '🏎️🍌🏁', answer: 'Mario Kart', hint: 'Racing with items', difficulty: 'easy' }, { clue: '🟡👻🔵', answer: 'Pac-Man', hint: 'Eat dots, avoid ghosts', difficulty: 'easy' }, { clue: '🐦🏙️🟩', answer: 'Flappy Bird', hint: 'Tap through pipes', difficulty: 'easy' },
  { clue: '🧟‍♂️🌿🔫', answer: 'Plants vs Zombies', hint: 'Garden defense', difficulty: 'medium' }, { clue: '⚔️🗺️🧝', answer: 'The Legend of Zelda', hint: 'Hyrule adventure', difficulty: 'medium' }, { clue: '🚀👽🪐', answer: 'Among Us', hint: 'Find the impostor', difficulty: 'medium' }, { clue: '🏝️⛏️🏠', answer: 'Fortnite', hint: 'Build and battle', difficulty: 'medium' }, { clue: '🐉⚔️🌌', answer: 'Elden Ring', hint: 'A vast dark fantasy', difficulty: 'medium' },
  { clue: '🧠🌀🧩', answer: 'Portal', hint: 'Think with doorways', difficulty: 'hard' }, { clue: '🤖🌆🔫', answer: 'Cyberpunk 2077', hint: 'Night City', difficulty: 'hard' }, { clue: '🕵️‍♂️🏙️🦇', answer: 'Batman Arkham', hint: 'Gotham detective', difficulty: 'hard' }, { clue: '🛸💥👾', answer: 'Space Invaders', hint: 'Classic arcade invasion', difficulty: 'hard' }, { clue: '🧟‍♀️🏚️🔑', answer: 'Resident Evil', hint: 'Survival horror', difficulty: 'hard' },
]
const tr = (language: GameProps['language'], ar: string, en: string) => language === 'ar' ? ar : en
const normalize = (text: string) => text.toLocaleLowerCase().replace(/[^a-z0-9]/g, '')
export default function GuessGame({ onExit, onScore, language }: GameProps) {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy')
  const pool = useMemo(() => questions.filter(q => q.difficulty === difficulty), [difficulty])
  const [index, setIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [seconds, setSeconds] = useState(20)
  const [hint, setHint] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [best, setBest] = useState(() => getBest('guess'))
  const [complete, setComplete] = useState(false)
  const reported = useRef(false)
  const question = pool[index]

  useEffect(() => {
    if (feedback !== null || complete) return
    const interval = window.setInterval(() => setSeconds(value => Math.max(0, value - 1)), 1000)
    return () => clearInterval(interval)
  }, [feedback, complete, index])
  useEffect(() => {
    if (seconds === 0 && feedback === null && !complete) { setFeedback(tr(language, `انتهى الوقت! الإجابة: ${question.answer}`, `Time's up! Answer: ${question.answer}`)); setStreak(0) }
  }, [seconds, feedback, complete, question.answer, language])

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (feedback !== null || complete || !answer.trim() || seconds === 0) return
    const correct = normalize(answer) === normalize(question.answer)
    const earned = correct ? 100 + Math.min(streak, 4) * 25 - (hint ? 20 : 0) : 0
    setScore(value => value + earned)
    setStreak(value => correct ? value + 1 : 0)
    setFeedback(correct ? tr(language,`صح! +${earned} نقطة`,`Correct! +${earned} points`) : tr(language,`الإجابة: ${question.answer}`,`Answer: ${question.answer}`))
  }
  const next = () => {
    if (index === pool.length - 1) {
      setComplete(true)
      if (!reported.current) {
        reported.current = true
        setBest(saveBest('guess', score))
        onScore('guess', score)
      }
    } else {
      setIndex(value => value + 1)
      setAnswer(''); setHint(false); setFeedback(null); setSeconds(20)
    }
  }
  const restart = () => {
    reported.current = false
    setIndex(0); setScore(0); setStreak(0); setFeedback(null); setAnswer(''); setSeconds(20); setHint(false); setComplete(false)
  }
  return <div className="game-shell">
    <div className="game-header"><span className="eyebrow">GUESS THE GAME</span><button className="icon-button" onClick={onExit} aria-label="Close"><X size={17}/></button></div>
    <div className="game-stats"><span>{tr(language,'النقاط','SCORE')} <b>{score}</b></span><span>{tr(language,'الستريك','STREAK')} <b>{streak}</b></span><span>{tr(language,'الأفضل','BEST')} <b>{best}</b></span><span>{index + 1}/{pool.length}</span></div>
    <div className="guess-controls"><select value={difficulty} onChange={event => { setDifficulty(event.target.value as Difficulty); restart() }}><option value="easy">{tr(language,'سهل','Easy')}</option><option value="medium">{tr(language,'متوسط','Medium')}</option><option value="hard">{tr(language,'صعب','Hard')}</option></select><span><Timer size={15}/> {seconds}s</span></div>
    {complete ? <div className="game-feedback"><strong>{tr(language,'أنهيت الجولة!','Round finished!')}</strong><span>{score} {tr(language,'نقطة · تم احتساب XP مرة واحدة','points · XP awarded once')}</span></div> : <>
      <div className="clue-card"><span className="clue">{question.clue}</span><p>{hint ? question.hint : tr(language,'خمن اللعبة من الإيموجيز','Guess the game from emojis')}</p></div>
      {feedback !== null ? <div className="game-feedback"><strong>{feedback}</strong><button className="button button-primary" onClick={next}>{index === pool.length - 1 ? tr(language,'إنهاء الجولة','Finish round') : tr(language,'السؤال التالي','Next clue')}</button></div> : <form className="guess-form" onSubmit={submit}><input aria-label={tr(language,'اسم اللعبة','Game title')} value={answer} onChange={event => setAnswer(event.target.value)} placeholder={tr(language,'اكتب اسم اللعبة','Type the game title')} autoComplete="off"/><button className="button button-secondary" type="button" onClick={() => setHint(true)} disabled={hint}><Lightbulb size={15}/>{tr(language,'تلميح','Hint')}</button><button className="button button-primary" type="submit" disabled={!answer.trim()}>{tr(language,'تأكيد','Submit')}</button></form>}
    </>}
    <div className="game-actions"><button className="button button-ghost" onClick={() => downloadScoreCard('Guess The Game', `${score} points`)}><Share2 size={15}/>{tr(language,'شارك النتيجة','Share score')}</button><button className="button button-ghost" onClick={restart}><RotateCcw size={15}/>{tr(language,'ابدأ من جديد','Restart')}</button></div>
  </div>
}
