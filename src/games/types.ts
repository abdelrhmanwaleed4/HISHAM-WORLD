import { readStored, writeStored } from '../lib/storage'
import type { Language } from '../types'

export type GameId = 'click-rush' | 'snake' | 'guess' | 'memory' | 'reflex'
export type GameProps = { onExit: () => void; onScore: (game: GameId, score: number) => void; language: Language }

const bestKey = (id: GameId) => `hisham:best:${id}`
export const getBest = (id: GameId): number => readStored(bestKey(id), 0, (value): value is number => typeof value === 'number' && Number.isFinite(value) && value >= 0)
export const saveBest = (id: GameId, score: number): number => {
  const best = Math.max(getBest(id), Math.round(score))
  writeStored(bestKey(id), best)
  return best
}

export const downloadScoreCard = (title: string, score: string, accent = '#ff932e') => {
  const canvas = document.createElement('canvas')
  canvas.width = 1200
  canvas.height = 630
  const context = canvas.getContext('2d')
  if (!context) return
  const gradient = context.createLinearGradient(0, 0, 1200, 630)
  gradient.addColorStop(0, '#08090d')
  gradient.addColorStop(1, '#362019')
  context.fillStyle = gradient
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.strokeStyle = accent
  context.lineWidth = 4
  context.strokeRect(36, 36, canvas.width - 72, canvas.height - 72)
  context.fillStyle = '#a9adba'
  context.font = '700 30px Arial'
  context.fillText('HISHAM WORLD · LOCAL ARCADE', 78, 120)
  context.fillStyle = '#f4f5f8'
  context.font = '800 66px Arial'
  context.fillText(title, 78, 220)
  context.fillStyle = accent
  context.font = '800 92px Arial'
  context.fillText(score, 78, 370)
  context.fillStyle = '#a9adba'
  context.font = '500 26px Arial'
  context.fillText('Personal result · saved on this device only', 78, 490)
  const link = document.createElement('a')
  link.download = `hisham-world-${title.toLowerCase().replaceAll(' ', '-')}.png`
  link.href = canvas.toDataURL('image/png')
  link.click()
}

export const playGameAudio = (enabled: boolean) => {
  if (!enabled || typeof window === 'undefined') return
  const AudioContextClass = window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AudioContextClass) return
  const context = new AudioContextClass()
  const oscillator = context.createOscillator()
  const gain = context.createGain()
  oscillator.frequency.value = 520
  gain.gain.setValueAtTime(.035, context.currentTime)
  gain.gain.exponentialRampToValueAtTime(.001, context.currentTime + .09)
  oscillator.connect(gain).connect(context.destination)
  oscillator.start()
  oscillator.stop(context.currentTime + .1)
  window.setTimeout(() => void context.close(), 150)
}
