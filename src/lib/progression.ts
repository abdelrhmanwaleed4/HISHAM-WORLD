import { readStored, writeStored } from './storage'
import type { GameId } from '../games/types'

export const PROGRESSION_VERSION = 1
export const progressionStorageKey = 'hisham:progression'

export type AchievementId = 'first-score' | 'arcade-rookie' | 'all-rounder' | 'xp-1000' | 'click-master' | 'snake-charmer' | 'memory-mind' | 'reflex-ready' | 'daily-player'
export type ProgressState = {
  version: number
  totalXp: number
  gamesPlayed: number
  scores: Record<GameId, number>
  gamesSeen: GameId[]
  achievements: AchievementId[]
  daily: { date: string; gamesPlayed: number; xpEarned: number; score: number; claimed: string[] }
  updatedAt: string
}

const emptyScores = (): Record<GameId, number> => ({ 'click-rush': 0, snake: 0, guess: 0, memory: 0, reflex: 0 })
export const todayKey = () => { const date = new Date(); return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` }
export const xpForLevel = (level: number) => Math.round(120 * Math.pow(Math.max(0, level - 1), 1.35))
export const levelForXp = (xp: number) => {
  if (!Number.isFinite(xp) || xp <= 0) return 1
  let level = Math.max(1, Math.floor(Math.pow(xp / 120, 1 / 1.35)) + 1)
  while (level > 1 && xp < xpForLevel(level)) level -= 1
  while (xp >= xpForLevel(level + 1)) level += 1
  return level
}
export const rankForLevel = (level: number) => level >= 15 ? 'Signal Legend' : level >= 10 ? 'World Boss' : level >= 7 ? 'Squad Captain' : level >= 4 ? 'Arcade Regular' : 'New Signal'
export const dailyChallenges = (date = todayKey()) => {
  const day = Number(date.replaceAll('-', ''))
  const target = day % 2 === 0 ? 'Play 2 arcade rounds' : 'Earn 100 XP from the arcade'
  return [
    { id: day % 2 === 0 ? 'daily-arcade' : 'daily-xp', label: target, target: day % 2 === 0 ? 2 : 100, kind: day % 2 === 0 ? 'games' as const : 'xp' as const },
    { id: 'daily-score', label: `Score ${500 + (day % 4) * 100} total points`, target: 500 + (day % 4) * 100, kind: 'score' as const },
  ]
}

export const defaultProgress = (): ProgressState => ({
  version: PROGRESSION_VERSION,
  totalXp: 0,
  gamesPlayed: 0,
  scores: emptyScores(),
  gamesSeen: [],
  achievements: [],
  daily: { date: todayKey(), gamesPlayed: 0, xpEarned: 0, score: 0, claimed: [] },
  updatedAt: new Date().toISOString(),
})

const gameIds: GameId[] = ['click-rush', 'snake', 'guess', 'memory', 'reflex']
export const isProgressState = (value: unknown): value is ProgressState => {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<ProgressState>
  const scores = candidate.scores as Partial<Record<GameId, unknown>> | undefined
  const daily = candidate.daily
  const validIds = ['first-score', 'arcade-rookie', 'all-rounder', 'xp-1000', 'click-master', 'snake-charmer', 'memory-mind', 'reflex-ready', 'daily-player']
  const validClaimed = ['daily-arcade', 'daily-xp', 'daily-score']
  const validDate = typeof daily?.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(daily.date)
  return candidate.version === PROGRESSION_VERSION && typeof candidate.totalXp === 'number' && Number.isFinite(candidate.totalXp) && candidate.totalXp >= 0 && candidate.totalXp <= 100_000_000
    && typeof candidate.gamesPlayed === 'number' && Number.isInteger(candidate.gamesPlayed) && candidate.gamesPlayed >= 0
    && !!scores && gameIds.every((id) => typeof scores[id] === 'number' && Number.isFinite(scores[id]) && (scores[id] ?? 0) >= 0)
    && Array.isArray(candidate.gamesSeen) && candidate.gamesSeen.every((id) => gameIds.includes(id))
    && Array.isArray(candidate.achievements) && new Set(candidate.achievements).size === candidate.achievements.length && candidate.achievements.every((id) => validIds.includes(id))
    && !!daily && validDate && typeof daily.gamesPlayed === 'number' && Number.isInteger(daily.gamesPlayed) && daily.gamesPlayed >= 0 && typeof daily.xpEarned === 'number' && Number.isFinite(daily.xpEarned) && daily.xpEarned >= 0 && typeof daily.score === 'number' && Number.isFinite(daily.score) && daily.score >= 0 && Array.isArray(daily.claimed) && new Set(daily.claimed).size === daily.claimed.length && daily.claimed.every((id) => validClaimed.includes(id))
}

export const loadProgress = () => {
  const stored = readStored(progressionStorageKey, defaultProgress(), isProgressState)
  return stored.daily.date === todayKey() ? stored : { ...stored, daily: { date: todayKey(), gamesPlayed: 0, xpEarned: 0, score: 0, claimed: [] } }
}

const achievementRules = (state: ProgressState, game: GameId): AchievementId[] => {
  const rules: Array<[AchievementId, boolean]> = [
    ['first-score', state.gamesPlayed >= 1],
    ['arcade-rookie', state.gamesPlayed >= 3],
    ['all-rounder', state.gamesSeen.length >= 5],
    ['xp-1000', state.totalXp >= 1000],
    ['click-master', state.scores['click-rush'] >= 100],
    ['snake-charmer', state.scores.snake >= 50],
    ['memory-mind', state.scores.memory >= 700],
    ['reflex-ready', state.scores.reflex >= 500],
    ['daily-player', state.daily.claimed.length >= 2],
  ]
  return rules.filter(([, unlocked]) => unlocked).map(([id]) => id)
}

export const recordGameScore = (current: ProgressState, game: GameId, score: number) => {
  const safeScore = Number.isFinite(score) ? Math.max(0, Math.min(100_000, Math.round(score))) : 0
  // Cap XP per finished run so unusually high scores cannot inflate progression.
  const award = safeScore === 0 ? 0 : Math.min(150, Math.max(1, Math.round(safeScore / 10)))
  const daily = current.daily.date === todayKey() ? current.daily : { date: todayKey(), gamesPlayed: 0, xpEarned: 0, score: 0, claimed: [] }
  const next: ProgressState = {
    ...current,
    totalXp: current.totalXp + award,
    gamesPlayed: current.gamesPlayed + 1,
    scores: { ...current.scores, [game]: Math.max(current.scores[game], safeScore) },
    gamesSeen: current.gamesSeen.includes(game) ? current.gamesSeen : [...current.gamesSeen, game],
    daily: { ...daily, gamesPlayed: daily.gamesPlayed + 1, xpEarned: daily.xpEarned + award, score: daily.score + safeScore },
    updatedAt: new Date().toISOString(),
  }
  const challenges = dailyChallenges(next.daily.date)
  const claimed = new Set(next.daily.claimed)
  for (const challenge of challenges) {
    const progress = challenge.kind === 'games' ? next.daily.gamesPlayed : challenge.kind === 'xp' ? next.daily.xpEarned : next.daily.score
    if (progress >= challenge.target) claimed.add(challenge.id)
  }
  next.daily.claimed = [...claimed]
  next.achievements = [...new Set([...current.achievements, ...achievementRules(next, game)])]
  writeStored(progressionStorageKey, next)
  return { state: next, award, newAchievements: next.achievements.filter((id) => !current.achievements.includes(id)) }
}

export const persistProgress = (state: ProgressState) => writeStored(progressionStorageKey, state)
export const serializeProgress = (state: ProgressState) => JSON.stringify({ app: 'hisham-world', exportedAt: new Date().toISOString(), progression: state }, null, 2)
export const parseProgressExport = (text: string): ProgressState | null => {
  try {
    const parsed: unknown = JSON.parse(text)
    if (!parsed || typeof parsed !== 'object') return null
    const candidate = parsed as { progression?: unknown }
    return isProgressState(candidate.progression) ? candidate.progression : null
  } catch { return null }
}
