import { AnimatePresence, motion } from 'framer-motion'
import {
  AtSign,
  Check,
  ChevronDown,
  Copy,
  ExternalLink,
  Gamepad2,
  Globe2,
  Home,
  MessageCircle,
  Music2,
  RotateCcw,
  QrCode,
  Settings2,
  Share2,
  Sparkles,
  Trophy,
  Youtube,
  Zap,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { t, type MessageKey } from './data/i18n'
import { externalLinkProps, profileConfig, type SocialProfile } from './data/profileConfig'
import ArcadeHub from './components/ArcadeHub'
import ProgressionPanel from './components/ProgressionPanel'
import Phase4Panel from './components/Phase4Panel'
import QRHub from './components/QRHub'
import FloatingMusicDock, { type FloatingMusicDockHandle } from './components/FloatingMusicDock'
import type { GameId } from './games/types'
import { useMediaQuery } from './hooks'
import { copyToClipboard, shareLink } from './lib/share'
import { readStored, storageKeys, writeStored } from './lib/storage'
import { levelForXp, loadProgress, persistProgress, recordGameScore, todayKey, xpForLevel, type ProgressState } from './lib/progression'
import type { Customization, GuideProgress, Language } from './types'

type Toast = { id: number; text: string }
type GuideId = keyof GuideProgress

type Preset = {
  id: string
  label: MessageKey
  values: Partial<Customization>
}

const defaultCustomization: Customization = {
  transparency: 55,
  tint: 12,
  blur: 18,
  border: 24,
  reflection: 13,
  glow: 22,
  radius: 26,
  motion: 100,
  particles: true,
  aurora: true,
  reducedMotion: false,
  lowPerformance: false,
  compactUi: false,
  haptics: false,
}

const presets: Preset[] = [
  { id: 'obsidian', label: 'obsidianEmerald', values: { tint: 12, blur: 18, border: 24, reflection: 13, glow: 22, radius: 26, motion: 100 } },
  { id: 'champagne', label: 'royalChampagne', values: { tint: 17, blur: 20, border: 30, reflection: 20, glow: 20, radius: 30, motion: 82 } },
  { id: 'violet', label: 'midnightViolet', values: { tint: 22, blur: 24, border: 21, reflection: 12, glow: 28, radius: 22, motion: 90 } },
  { id: 'frost', label: 'crystalFrost', values: { transparency: 38, tint: 7, blur: 28, border: 35, reflection: 24, glow: 14, radius: 34, motion: 72 } },
  { id: 'cyber', label: 'cyberNeon', values: { tint: 18, blur: 16, border: 34, reflection: 17, glow: 38, radius: 18, motion: 120 } },
]

const fallbackProgress: GuideProgress = { kick: [false, false, false], discord: [false, false, false] }
const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean'
const isGuideProgress = (value: unknown): value is GuideProgress => {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<GuideProgress>
  return Array.isArray(candidate.kick) && candidate.kick.length === 3 && candidate.kick.every(isBoolean)
    && Array.isArray(candidate.discord) && candidate.discord.length === 3 && candidate.discord.every(isBoolean)
}
const isCustomization = (value: unknown): value is Customization => {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<Customization>
  const numericKeys: (keyof Customization)[] = ['transparency', 'tint', 'blur', 'border', 'reflection', 'glow', 'radius', 'motion']
  const booleanKeys: (keyof Customization)[] = ['particles', 'aurora', 'reducedMotion', 'lowPerformance', 'compactUi', 'haptics']
  const ranges: Partial<Record<keyof Customization, [number, number]>> = {
    transparency: [20, 80], tint: [0, 35], blur: [4, 34], border: [8, 50], reflection: [0, 35], glow: [0, 55], radius: [12, 42], motion: [0, 120],
  }
  return numericKeys.every((key) => typeof candidate[key] === 'number' && Number.isFinite(candidate[key]) && candidate[key] >= (ranges[key]?.[0] ?? -Infinity) && candidate[key] <= (ranges[key]?.[1] ?? Infinity))
    && booleanKeys.every((key) => typeof candidate[key] === 'boolean')
}

const iconForSocial = (icon: SocialProfile['icon']) => {
  if (icon === 'kick') return <Zap size={19} strokeWidth={2.4} />
  if (icon === 'discord') return <MessageCircle size={19} />
  if (icon === 'youtube') return <Youtube size={19} />
  if (icon === 'tiktok') return <Music2 size={19} />
  return <AtSign size={19} />
}

const safeHaptics = (enabled: boolean) => {
  if (enabled && 'vibrate' in navigator) navigator.vibrate(8)
}

function IntroScreen({ language, onEnter, reducedMotion }: { language: Language; onEnter: () => void; reducedMotion: boolean }) {
  const enterRef = useRef<HTMLButtonElement>(null)
  useEffect(() => { enterRef.current?.focus() }, [])
  const copy = (key: MessageKey) => t(language, key)
  return (
    <motion.div className="intro-screen" role="dialog" aria-modal="true" aria-labelledby="intro-title" initial={{ opacity: 1 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reducedMotion ? 0 : .55 }}>
      <motion.div className="intro-content" initial={{ opacity: 0, y: reducedMotion ? 0 : 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reducedMotion ? 0 : .75, ease: 'easeOut' }}>
        <div className="intro-art" aria-hidden="true"><img src="/hisham-world/images/rezk-portrait.webp" alt="" /></div>
        <span className="eyebrow">{copy('introEyebrow')}</span>
        <h1 className="intro-title" id="intro-title">{copy('introTitle')}</h1>
        <p className="intro-note">{copy('introNote')}</p>
        <div className="intro-actions">
          <button className="button button-primary" type="button" ref={enterRef} onClick={onEnter}>{copy('enter')} <ExternalLink size={16} /></button>
        </div>
        <button className="intro-skip" type="button" onClick={onEnter}>{copy('skip')}</button>
      </motion.div>
    </motion.div>
  )
}

function ToastRegion({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="toast-region" aria-live="polite" aria-atomic="true">
      <AnimatePresence initial={false}>
        {toasts.map((toast) => (
          <motion.div className="toast" key={toast.id} initial={{ opacity: 0, y: 12, scale: .96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8 }}>
            <Check size={15} color="var(--emerald)" />
            {toast.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

function GuidePanel({
  language,
  id,
  progress,
  onToggleStep,
  onReset,
  onToast,
}: {
  language: Language
  id: GuideId
  progress: boolean[]
  onToggleStep: (index: number) => void
  onReset: () => void
  onToast: (text: string) => void
}) {
  const [expanded, setExpanded] = useState(id === 'kick')
  const copy = (key: MessageKey) => t(language, key)
  const isKick = id === 'kick'
  const steps: MessageKey[] = isKick
    ? ['stepOpenKick', 'stepFollowKick', 'stepNotificationsKick']
    : ['stepOpenDiscord', 'stepVerifyDiscord', 'stepExploreDiscord']
  const completed = progress.filter(Boolean).length
  const url = isKick ? profileConfig.links.kick : profileConfig.links.discord
  const copyInvite = async () => {
    const copied = await copyToClipboard(url)
    onToast(copied ? copy('copied') : copy('toastError'))
  }

  return (
    <motion.article className={`glass guide-card ${expanded ? 'is-open' : ''}`} layout>
      <button className="guide-summary" type="button" aria-expanded={expanded} aria-controls={`guide-${id}-body`} onClick={() => setExpanded((current) => !current)}>
        <span className="guide-title">
          <span className="guide-title-icon">{isKick ? <Zap size={19} /> : <MessageCircle size={19} />}</span>
          <span><span className="guide-heading" role="heading" aria-level={3}>{copy(isKick ? 'kickGuideTitle' : 'discordGuideTitle')}</span><span>{copy(isKick ? 'kickGuideEn' : 'discordGuideEn')}</span></span>
        </span>
        <ChevronDown size={19} className="muted" />
      </button>
      <AnimatePresence initial={false}>
        {expanded && <motion.div className="guide-body" id={`guide-${id}-body`} initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: .28 }}>
          <div className="guide-progress-head"><span>{copy('guideProgress')}</span><strong>{completed}/{steps.length}</strong></div>
          <div className="progress-track" role="progressbar" aria-label={copy('guideProgress')} aria-valuemin={0} aria-valuemax={steps.length} aria-valuenow={completed}><motion.div className="progress-fill" initial={false} animate={{ width: `${(completed / steps.length) * 100}%` }} /></div>
          <div className="checklist">
            {steps.map((step, index) => (
              <label className={`check-item ${progress[index] ? 'checked' : ''}`} key={step}>
                <input type="checkbox" checked={progress[index]} onChange={() => onToggleStep(index)} />
                <span>{copy(step)}</span>
              </label>
            ))}
          </div>
          <div className="guide-actions">
            <a className="button button-primary" href={url} {...externalLinkProps}>{copy(isKick ? 'openKick' : 'openDiscord')} <ExternalLink size={15} /></a>
            <button className="button button-ghost" type="button" onClick={copyInvite}><Copy size={15} />{copy(isKick ? 'copyHandle' : 'copyInvite')}</button>
            <button className="button button-ghost" type="button" onClick={onReset}><RotateCcw size={15} />{copy('resetGuide')}</button>
          </div>
        </motion.div>}
      </AnimatePresence>
    </motion.article>
  )
}

function SettingsPanel({
  language,
  value,
  onChange,
  onReset,
  onClose,
}: {
  language: Language
  value: Customization
  onChange: (next: Customization) => void
  onReset: () => void
  onClose: () => void
}) {
  const closeRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    closeRef.current?.focus()
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }
      if (event.key !== 'Tab') return
      const focusable = Array.from(document.querySelectorAll<HTMLElement>('.settings-panel button, .settings-panel input, .settings-panel a')).filter((element) => !element.hasAttribute('disabled'))
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])
  const copy = (key: MessageKey) => t(language, key)
  const rangeItems: { key: keyof Customization; label: MessageKey; min: number; max: number; suffix: string }[] = [
    { key: 'transparency', label: 'transparency', min: 20, max: 80, suffix: '%' },
    { key: 'tint', label: 'tint', min: 0, max: 35, suffix: '%' },
    { key: 'blur', label: 'blur', min: 4, max: 34, suffix: 'px' },
    { key: 'border', label: 'border', min: 8, max: 50, suffix: '%' },
    { key: 'reflection', label: 'reflection', min: 0, max: 35, suffix: '%' },
    { key: 'glow', label: 'glow', min: 0, max: 55, suffix: '%' },
    { key: 'radius', label: 'radius', min: 12, max: 42, suffix: 'px' },
    { key: 'motion', label: 'motion', min: 0, max: 120, suffix: '%' },
  ]
  const toggles: { key: keyof Customization; label: MessageKey }[] = [
    { key: 'particles', label: 'particles' }, { key: 'aurora', label: 'aurora' }, { key: 'reducedMotion', label: 'reducedMotion' },
    { key: 'lowPerformance', label: 'lowPerformance' }, { key: 'compactUi', label: 'compactUi' }, { key: 'haptics', label: 'haptics' },
  ]
  const applyPreset = (preset: Preset) => onChange({ ...value, ...preset.values })

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <motion.section className="glass settings-panel" role="dialog" aria-modal="true" aria-labelledby="settings-title" initial={{ opacity: 0, y: 24, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 14, scale: .98 }}>
        <div className="settings-header">
          <div><span className="eyebrow">{copy('navCustomize')}</span><h2 id="settings-title">{copy('customizeTitle')}</h2><p className="section-copy">{copy('customizeCopy')}</p></div>
          <button className="icon-button" type="button" ref={closeRef} aria-label={copy('close')} onClick={onClose}><X size={19} /></button>
        </div>
        <div className="settings-section">
          <span className="eyebrow">{copy('preset')}</span>
          <div className="preset-row">
            {presets.map((preset) => <button className="preset-button" type="button" key={preset.id} onClick={() => applyPreset(preset)}>{copy(preset.label)}</button>)}
          </div>
          <div className="range-grid">
            {rangeItems.map((item) => (
              <div className="range-control" key={item.key}>
                <label htmlFor={`setting-${item.key}`}><span>{copy(item.label)}</span><output>{value[item.key]}{item.suffix}</output></label>
                <input id={`setting-${item.key}`} type="range" min={item.min} max={item.max} value={value[item.key] as number} onChange={(event) => onChange({ ...value, [item.key]: Number(event.target.value) })} />
              </div>
            ))}
          </div>
          <div className="toggle-grid">
            {toggles.map((item) => <label className="toggle" key={item.key}><span>{copy(item.label)}</span><input type="checkbox" checked={value[item.key] as boolean} onChange={(event) => onChange({ ...value, [item.key]: event.target.checked })} /></label>)}
          </div>
        </div>
        <div className="settings-footer"><span className="muted" style={{ fontSize: '.7rem' }}>{copy('saveLocally')}</span><button className="button button-ghost" type="button" onClick={onReset}><RotateCcw size={15} />{copy('resetDefaults')}</button></div>
      </motion.section>
    </div>
  )
}

function App() {
  const systemReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const [language, setLanguage] = useState<Language>('ar')
  const [showIntro, setShowIntro] = useState(() => !readStored(storageKeys.introSeen, false, isBoolean))
  const [customization, setCustomization] = useState<Customization>(() => readStored(storageKeys.customization, defaultCustomization, isCustomization))
  const [guideProgress, setGuideProgress] = useState<GuideProgress>(() => readStored(storageKeys.guideProgress, fallbackProgress, isGuideProgress))
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('home')
  const [toasts, setToasts] = useState<Toast[]>([])
  const [progression, setProgression] = useState<ProgressState>(() => loadProgress())
  const [scrollPercent, setScrollPercent] = useState(0)
  const musicDockRef = useRef<FloatingMusicDockHandle>(null)
  const level = levelForXp(progression.totalXp)
  const currentLevelXp = xpForLevel(level)
  const nextLevelXp = xpForLevel(level + 1)
  const levelPercent = Math.min(100, Math.round(((progression.totalXp - currentLevelXp) / Math.max(1, nextLevelXp - currentLevelXp)) * 100))
  const copy = (key: MessageKey) => t(language, key)
  const prefersReduced = systemReducedMotion || customization.reducedMotion

  useEffect(() => {
    document.documentElement.lang = language
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr'
  }, [language])

  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--glass-alpha', String(customization.transparency / 100))
    root.style.setProperty('--tint', String(customization.tint / 100))
    root.style.setProperty('--blur', `${customization.lowPerformance ? Math.min(customization.blur, 12) : customization.blur}px`)
    root.style.setProperty('--border-alpha', String(customization.border / 100))
    root.style.setProperty('--reflection-alpha', String(customization.reflection / 100))
    root.style.setProperty('--glow-alpha', String(customization.glow / 100))
    root.style.setProperty('--radius', `${customization.radius}px`)
    root.style.setProperty('--motion-scale', String(customization.motion / 100))
    writeStored(storageKeys.customization, customization)
  }, [customization])

  useEffect(() => {
    writeStored(storageKeys.guideProgress, guideProgress)
  }, [guideProgress])

  useEffect(() => {
    document.body.style.overflow = showIntro ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [showIntro])

  useEffect(() => {
    let frame = 0
    const updateScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const scrollable = document.documentElement.scrollHeight - window.innerHeight
        setScrollPercent(scrollable > 0 ? Math.min(100, Math.max(0, Math.round(window.scrollY / scrollable * 100))) : 100)
      })
    }
    updateScroll()
    window.addEventListener('scroll', updateScroll, { passive: true })
    window.addEventListener('resize', updateScroll)
    return () => { cancelAnimationFrame(frame); window.removeEventListener('scroll', updateScroll); window.removeEventListener('resize', updateScroll) }
  }, [])

  useEffect(() => {
    const ids = ['home', 'socials', 'qr-codes', 'arcade', 'achievements']
    const sections = ids.map((id) => document.getElementById(id)).filter((section): section is HTMLElement => Boolean(section))
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
      if (visible) setActiveSection(visible.target.id)
    }, { rootMargin: '-28% 0px -58% 0px', threshold: [0, .25, .5] })
    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  const showToast = (text: string) => {
    const id = Date.now() + Math.random()
    setToasts((current) => [...current, { id, text }])
    window.setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), 2800)
  }

  const enterWorld = () => {
    musicDockRef.current?.startFromGesture()
    setShowIntro(false)
    writeStored(storageKeys.introSeen, true)
  }

  const updateGuide = (id: GuideId, index: number) => {
    setGuideProgress((current) => ({ ...current, [id]: current[id].map((checked, step) => step === index ? !checked : checked) }))
    safeHaptics(customization.haptics)
  }

  const resetGuide = (id: GuideId) => setGuideProgress((current) => ({ ...current, [id]: current[id].map(() => false) }))
  const handleArcadeScore = (game: GameId, score: number) => {
    const result = recordGameScore(progression, game, score)
    setProgression(result.state)
    showToast(`${game.replace('-', ' ')} · +${result.award} XP · ${copy('localOnly')}`)
    result.newAchievements.forEach((id) => showToast(`Achievement unlocked · ${id.replaceAll('-', ' ')}`))
  }
  const resetProgression = () => {
    if (!window.confirm(language === 'ar' ? 'تمسح كل تقدم الأركيد والإنجازات من هذا الجهاز؟' : 'Reset all arcade progress and achievements on this device?')) return
    const fresh = loadProgress(); fresh.totalXp = 0; fresh.gamesPlayed = 0; fresh.scores = { 'click-rush': 0, snake: 0, guess: 0, memory: 0, reflex: 0 }; fresh.gamesSeen = []; fresh.achievements = []; fresh.daily = { date: todayKey(), gamesPlayed: 0, xpEarned: 0, score: 0, claimed: [] }; persistProgress(fresh); setProgression(fresh)
    showToast(language === 'ar' ? 'تم مسح التقدم المحلي' : 'Local progress reset')
  }
  const closeSettings = useCallback(() => {
    setSettingsOpen(false)
    window.requestAnimationFrame(() => document.getElementById('settings-trigger')?.focus())
  }, [])
  const motionFactor = customization.motion / 100

  const navItems = useMemo(() => [
    { id: 'home', label: 'navHome' as const, icon: <Home size={17} /> },
    { id: 'socials', label: 'navSocials' as const, icon: <Globe2 size={17} /> },
    { id: 'qr-codes', label: 'navSocials' as const, icon: <QrCode size={17} /> },
    { id: 'arcade', label: 'navArcade' as const, icon: <Gamepad2 size={17} /> },
    { id: 'achievements', label: 'navAchievements' as const, icon: <Trophy size={17} /> },
  ], [])

  const navigate = (id: string) => {
    setActiveSection(id)
    document.getElementById(id)?.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' })
  }

  const handleSocialAction = async (social: SocialProfile, action: 'copy' | 'share') => {
    if (action === 'copy') {
      const copied = await copyToClipboard(social.handle)
      showToast(copied ? copy('copied') : copy('toastError'))
    } else {
      const result = await shareLink(`HISHAM WORLD · ${social.label}`, social.url)
      showToast(result === 'shared' ? copy('shared') : result === 'copied' ? copy('shareFallback') : copy('toastError'))
    }
    safeHaptics(customization.haptics)
  }

  return (
    <div className={`app-shell ${customization.aurora ? '' : 'no-aurora'} ${customization.particles ? '' : 'no-particles'} ${customization.compactUi ? 'compact-ui' : ''}`}>
      <div className="scroll-meter" role="progressbar" aria-label={language === 'ar' ? 'تقدم تصفح الصفحة' : 'Page reading progress'} aria-valuenow={scrollPercent} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${scrollPercent}%` }} /></div>
      <div className="aurora" aria-hidden="true" />
      <div className="particle-field" aria-hidden="true" />
      <header className="topbar" aria-hidden={settingsOpen || undefined}>
        <button className="glass brand-lockup" type="button" onClick={() => navigate('home')} aria-label={`${copy('introTitle')} ${copy('navHome')}`}><span className="brand-emblem"><img src="/hisham-world/images/rezk-portrait.webp" alt="" /></span><span className="brand-name">HISHAM WORLD<small>THE GAMING UNIVERSE</small></span></button>
        <div className="top-actions">
          <button className="glass level-quick" type="button" aria-label={language === 'ar' ? `المستوى ${level}، تقدم ${levelPercent} بالمئة` : `Level ${level}, ${levelPercent} percent progress`} onClick={() => navigate('achievements')}>
            <span className="level-quick-icon"><Trophy size={15}/></span><span className="level-quick-label"><strong>LVL {level}</strong><small>{progression.totalXp} XP</small></span><span className="level-quick-track"><i style={{width: `${levelPercent}%`}} /></span>
          </button>
          <button className="glass button button-ghost" type="button" onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')} aria-label={copy('language')}><Globe2 size={15} />{copy('language')}</button>
          <button className="glass icon-button" id="settings-trigger" type="button" aria-label={copy('navCustomize')} onClick={() => setSettingsOpen(true)}><Settings2 size={17} /></button>
        </div>
      </header>

      <main className="site-main" aria-hidden={settingsOpen || undefined}>
        <section className="section hero" id="home">
          <motion.div className="hero-copy" initial={{ opacity: 0, y: prefersReduced ? 0 : 20 * motionFactor }} animate={{ opacity: 1, y: 0 }} transition={{ duration: prefersReduced ? 0 : .7 * Math.max(.45, motionFactor), delay: .05 }}>
            <span className="eyebrow">{copy('heroEyebrow')}</span>
            <h1 className="hero-title">{language === 'ar' ? <><span>هشام</span> هنا.<br />والروقان <span>كله</span> هنا.</> : <>Hisham is here.<br /><span>The good vibe</span> is too.</>}</h1>
            <p className="hero-copy-text">{copy('heroCopy')}</p>
            <div className="handle-row"><span className="handle">{profileConfig.handles[0]}</span><span className="handle">{profileConfig.handles[1]}</span></div>
            <div className="hero-actions">
              <a className="button button-primary" href={profileConfig.links.kick} {...externalLinkProps}>{copy('watchKick')} <Zap size={17} /></a>
              <a className="button button-secondary" href={profileConfig.links.discord} {...externalLinkProps}>{copy('joinDiscord')} <MessageCircle size={17} /></a>
            </div>
            <span className="hero-local"><span className="pulse-dot" />{copy('localOnly')}</span>
          </motion.div>
          <motion.div className="hero-visual" initial={{ opacity: 0, scale: prefersReduced ? 1 : .95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: prefersReduced ? 0 : .8, delay: .2 }}>
            <div className="hero-halo" aria-hidden="true" />
            <div className="glass portrait-frame"><img className="hero-portrait" src={profileConfig.portraitPaths[0]} alt={language === 'ar' ? 'الهوية الفنية لـ REZK: رسم شخصية بقميص أزرق وخلفية نارية ذهبية' : 'REZK artwork with a blue shirt and fiery gold background'} fetchPriority="high" /><div className="portrait-shine" aria-hidden="true"/><span className="portrait-identity">CREATOR / GAMER <strong>HISHAM</strong></span></div>
            <div className="glass signal-chip"><Sparkles size={14} />{copy('signal')}</div>
          </motion.div>
        </section>

        <section className="section featured-section" aria-label={language === 'ar' ? 'بانر المجتمع' : 'Community banner'}>
          <div className="featured-rezk glass">
            <img src={profileConfig.portraitPaths[1]} alt={language === 'ar' ? 'بانر REZK الناري الأصلي' : 'Original REZK fiery banner artwork'} loading="lazy" />
            <div className="featured-overlay">
              <span className="eyebrow"><Sparkles size={14}/> THE ORIGINAL ENERGY</span>
              <h2>{language === 'ar' ? <>كل حكاية ليها <em>شرارة.</em></> : <>Every story starts with <em>a spark.</em></>}</h2>
              <p>{language === 'ar' ? 'عالم فيه جيمينج، ضحك، ولحظات ما بتتنسيش. مكانك وسطنا.' : 'Gaming, laughter, and moments worth remembering. Your place is here.'}</p>
              <a className="button button-primary" href={profileConfig.links.kick} {...externalLinkProps}>{copy('watchKick')} <ExternalLink size={16}/></a>
            </div>
          </div>
        </section>

        <section className="section" id="socials">
          <div className="section-heading"><div><span className="eyebrow">{copy('socialsEyebrow')}</span><h2 className="section-title">{copy('socialsTitle')}</h2></div><p className="section-copy">{copy('socialsCopy')}</p></div>
          <div className="social-grid">
            {profileConfig.social.map((social, index) => (
              <motion.article className="glass social-card" key={social.id} style={{ '--card-accent': social.accent } as CSSProperties} initial={{ opacity: 0, y: prefersReduced ? 0 : 18 * motionFactor }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .2 }} transition={{ duration: prefersReduced ? 0 : .45 * Math.max(.45, motionFactor), delay: index * .05 }}>
                <div className="card-topline"><span className="social-icon">{iconForSocial(social.icon)}</span><span className="social-label">{social.id === 'kick' ? 'PRIMARY CHANNEL' : social.id.toUpperCase()}</span></div>
                <h3>{social.label}</h3><p>{social.id === 'kick' ? copy('checkKick') : social.handle}</p>
                <div className="social-meta"><span>{social.handle}</span><ExternalLink size={15} /></div>
                <div className="card-actions"><button className="button button-ghost" type="button" onClick={() => handleSocialAction(social, 'copy')}><Copy size={14} />{copy('copyHandle')}</button><button className="button button-ghost" type="button" onClick={() => handleSocialAction(social, 'share')}><Share2 size={14} />{copy('share')}</button><a className="button button-ghost" href={social.url} {...externalLinkProps} aria-label={`${copy('openLink')} ${social.label}`}><ExternalLink size={14} /></a></div>
              </motion.article>
            ))}
          </div>
        </section>

        <section className="section qr-section" id="qr-codes">
          <div className="section-heading"><div><span className="eyebrow">SCAN • CONNECT • EXPLORE</span><h2 className="section-title">{language === 'ar' ? 'باركودز الحسابات' : 'Account QR Codes'}</h2></div><p className="section-copy">{language === 'ar' ? 'كل كود بيودّيك للرابط الموجود في الموقع نفسه. احفظه أو امسحه أو ابعته لصحابك.' : 'Real QR codes that encode the same destinations used across the site. Scan, save, or share.'}</p></div>
          <QRHub language={language} />
        </section>

        <section className="section" id="guides">
          <div className="section-heading"><div><span className="eyebrow">{copy('guideEyebrow')}</span><h2 className="section-title">{copy('guideTitle')}</h2></div><p className="section-copy">{copy('guideCopy')}</p></div>
          <div className="guides">
            <GuidePanel language={language} id="kick" progress={guideProgress.kick} onToggleStep={(index) => updateGuide('kick', index)} onReset={() => resetGuide('kick')} onToast={showToast} />
            <GuidePanel language={language} id="discord" progress={guideProgress.discord} onToggleStep={(index) => updateGuide('discord', index)} onReset={() => resetGuide('discord')} onToast={showToast} />
          </div>
        </section>

        <section className="section" id="arcade">
          <div className="section-heading"><div><span className="eyebrow">{copy('arcadeEyebrow')}</span><h2 className="section-title">{copy('arcadeTitle')}</h2></div><p className="section-copy">{copy('arcadeCopy')}</p></div>
          <ArcadeHub onScore={handleArcadeScore} language={language} />
          <p className="arcade-xp-note"><Sparkles size={14} /> +{progression.totalXp} XP total · {copy('localOnly')}</p>
        </section>

        <section className="section" id="achievements">
          <div className="section-heading"><div><span className="eyebrow">{copy('achievementsEyebrow')}</span><h2 className="section-title">{copy('achievementsTitle')}</h2></div><p className="section-copy">{copy('achievementsCopy')}</p></div>
          <ProgressionPanel language={language} state={progression} onImport={setProgression} onReset={resetProgression} />
        </section>

        <section className="section" id="polish">
          <div className="section-heading"><div><span className="eyebrow">{language === 'ar' ? 'اللمسة الأخيرة' : 'THE FINAL SIGNAL'}</span><h2 className="section-title">{language === 'ar' ? 'صوت، بطاقة، وطاقة.' : 'Sound, pass, and signal.'}</h2></div><p className="section-copy">{language === 'ar' ? 'أدوات اختيارية مولّدة محليًا، بدون حسابات أو خدمات خارجية.' : 'Optional local-first tools with no accounts or external services.'}</p></div>
          <Phase4Panel language={language} haptics={customization.haptics} />
        </section>

        <footer className="footer">
          <div className="footer-info"><span className="footer-brand">HISHAM <b>WORLD</b></span><span>{copy('footerNote')}</span></div>
          <div className="footer-signature" dir="ltr"><span>Mabe By</span> <a href={profileConfig.creatorDiscordUrl || '#creator-discord'} target={profileConfig.creatorDiscordUrl ? '_blank' : undefined} rel={profileConfig.creatorDiscordUrl ? 'noopener noreferrer' : undefined} onClick={(event) => { if (!profileConfig.creatorDiscordUrl) { event.preventDefault(); showToast(language === 'ar' ? 'أضف رابط حسابك في creatorDiscordUrl داخل profileConfig.ts' : 'Add your Discord profile link in profileConfig.ts') } }} aria-label="ABDELRHMAN Discord profile">ABDELRHMAN <ExternalLink size={14}/></a></div>
        </footer>
      </main>

      <nav className="glass dock" aria-label="Primary navigation" aria-hidden={settingsOpen || undefined}>
        {navItems.map((item) => <button className={`dock-link ${activeSection === item.id ? 'active' : ''}`} type="button" key={item.id} aria-current={activeSection === item.id ? 'page' : undefined} onClick={() => navigate(item.id)}>{item.icon}<span>{item.id === 'qr-codes' ? (language === 'ar' ? 'الأكواد' : 'QR Codes') : copy(item.label)}</span></button>)}
        <button className={`dock-link ${settingsOpen ? 'active' : ''}`} type="button" onClick={() => setSettingsOpen(true)}><Settings2 size={17} /><span>{copy('navCustomize')}</span></button>
      </nav>

      <FloatingMusicDock ref={musicDockRef} language={language} />
      <ToastRegion toasts={toasts} />
      <AnimatePresence>{showIntro && <IntroScreen language={language} onEnter={enterWorld} reducedMotion={prefersReduced} />}</AnimatePresence>
      <AnimatePresence>{settingsOpen && <SettingsPanel language={language} value={customization} onChange={setCustomization} onReset={() => setCustomization(defaultCustomization)} onClose={closeSettings} />}</AnimatePresence>
    </div>
  )
}

export default App
