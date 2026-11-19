import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { ChevronDown, ChevronUp, Headphones, Music2, Pause, Play, Volume2, VolumeX } from 'lucide-react'
import { profileConfig } from '../data/profileConfig'
import { readStored, writeStored } from '../lib/storage'
import type { Language } from '../types'

export type FloatingMusicDockHandle = { startFromGesture: () => void }
const musicEnabledKey = 'hisham:music-enabled'
const musicVolumeKey = 'hisham:music-volume'
const isBoolean = (v: unknown): v is boolean => typeof v === 'boolean'
const isVolume = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= 1
const translate = (lang: Language, ar: string, en: string) => lang === 'ar' ? ar : en
const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`
}

const FloatingMusicDock = forwardRef<FloatingMusicDockHandle, { language: Language }>(({ language }, ref) => {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [enabled, setEnabled] = useState(() => readStored(musicEnabledKey, true, isBoolean))
  const [playing, setPlaying] = useState(false)
  const [autoplayBlocked, setAutoplayBlocked] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [volume, setVolume] = useState(() => readStored(musicVolumeKey, 0.32, isVolume))
  const [muted, setMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [error, setError] = useState(false)
  const enabledRef = useRef(enabled)
  enabledRef.current = enabled

  const playNow = useCallback(() => {
    const audio = audioRef.current
    if (!audio || !enabledRef.current) return
    const result = audio.play()
    if (result) void result.then(() => {
      setAutoplayBlocked(false)
      setError(false)
    }).catch(() => setAutoplayBlocked(true))
  }, [])

  useImperativeHandle(ref, () => ({ startFromGesture: playNow }), [playNow])

  useEffect(() => {
    if (enabled) playNow() // Browsers may reject autoplay with sound. The first gesture retries below.
  }, [enabled, playNow])

  useEffect(() => {
    if (!enabled || playing || error) return
    const unlock = (event: Event) => {
      // Clicking the music dock itself must not be interpreted as an unrelated
      // gesture: otherwise pointerdown can start audio right before Play/Pause.
      if (event.target instanceof Element && event.target.closest('.floating-music')) return
      if (enabledRef.current) playNow()
    }
    document.addEventListener('pointerdown', unlock)
    document.addEventListener('keydown', unlock)
    return () => {
      document.removeEventListener('pointerdown', unlock)
      document.removeEventListener('keydown', unlock)
    }
  }, [enabled, playing, error, playNow])

  useEffect(() => { if (audioRef.current) audioRef.current.volume = volume }, [volume])
  useEffect(() => { if (audioRef.current) audioRef.current.muted = muted }, [muted])
  const togglePlayback = () => {
    const audio = audioRef.current
    if (!audio) return
    if (!audio.paused) {
      audio.pause()
      setEnabled(false)
      enabledRef.current = false
      writeStored(musicEnabledKey, false)
    } else {
      setEnabled(true)
      enabledRef.current = true
      writeStored(musicEnabledKey, true)
      playNow() // Within real click gesture, so browsers allow it.
    }
  }
  const updateVolume = (value: number) => {
    setVolume(value)
    if (value > 0) setMuted(false)
    writeStored(musicVolumeKey, value)
  }
  const seek = (percent: number) => {
    const audio = audioRef.current
    if (!audio || !Number.isFinite(audio.duration) || audio.duration <= 0) return
    audio.currentTime = (percent / 100) * audio.duration
    setCurrentTime(audio.currentTime)
  }
  const progress = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0

  return (
    <aside className={`floating-music glass ${collapsed ? 'is-collapsed' : ''} ${playing ? 'is-playing' : ''}`} role="region" aria-label={translate(language, 'مشغل الموسيقى', 'Music player')} dir="ltr">
      <audio
        ref={audioRef}
        preload="auto"
        loop
        onPlay={() => { setPlaying(true); setAutoplayBlocked(false) }}
        onPause={() => setPlaying(false)}
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onError={() => { setError(true); setPlaying(false) }}
      >
        <source src={profileConfig.music.src} type="audio/mpeg" />
        <source src={profileConfig.music.fallbackSrc} type="audio/ogg" />
      </audio>
      <div className="music-primary">
        <div className="music-cover" aria-hidden="true"><img src="/hisham-world/images/rezk-portrait.webp" alt="" /><span className="music-disc"><Music2 size={13}/></span></div>
        {!collapsed && <div className="music-details"><span className="music-label">HISHAM WORLD • NOW PLAYING</span><strong>{profileConfig.music.title}</strong><span className="music-subtitle">{error ? translate(language, 'ملف الصوت غير متاح', 'Audio file unavailable') : autoplayBlocked && !playing && enabled ? translate(language, 'اضغط تشغيل لبدء الصوت', 'Tap play to enable sound') : playing ? translate(language, 'شغّال دلوقتي', 'Now playing') : translate(language, 'متوقف', 'Paused')}</span></div>}
        <div className="music-buttons">
          <button type="button" className="music-play" onClick={togglePlayback} aria-label={playing ? translate(language, 'إيقاف الموسيقى', 'Pause music') : translate(language, 'تشغيل الموسيقى', 'Play music')} disabled={error}>{playing ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}</button>
          <button type="button" className="music-toggle-size" onClick={() => setCollapsed((value) => !value)} aria-label={collapsed ? translate(language, 'توسيع المشغل', 'Expand music player') : translate(language, 'تصغير المشغل', 'Minimize music player')}>{collapsed ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</button>
        </div>
      </div>
      {!collapsed && <div className="music-bottom">
        <span className="music-time" aria-label={translate(language, 'الوقت الحالي', 'Current time')}>{formatTime(currentTime)}</span>
        <input className="music-seek" aria-label={translate(language, 'تقدم الموسيقى', 'Track progress')} type="range" min="0" max="100" step="0.1" value={progress} onChange={(event) => seek(Number(event.target.value))} style={{ '--seek': `${progress}%` } as React.CSSProperties} />
        <span className="music-time">{formatTime(duration)}</span>
        <button type="button" className="music-mute" aria-label={muted || volume === 0 ? translate(language, 'إلغاء الكتم', 'Unmute') : translate(language, 'كتم', 'Mute')} onClick={() => { if (muted || volume === 0) { if (volume === 0) updateVolume(0.32); setMuted(false) } else setMuted(true) }}>{muted || volume === 0 ? <VolumeX size={16}/> : <Volume2 size={16}/>}</button>
        <input className="music-volume" type="range" min="0" max="1" step="0.02" aria-label={translate(language, 'مستوى الصوت', 'Music volume')} value={volume} onChange={(event) => updateVolume(Number(event.target.value))} />
      </div>}
    </aside>
  )
})
FloatingMusicDock.displayName = 'FloatingMusicDock'

export default FloatingMusicDock
