import { useEffect, useRef, useState } from 'react'
import { Headphones, QrCode, Sparkles, Zap } from 'lucide-react'
import QRCode from 'qrcode'
import type { Language } from '../types'
import { readStored, writeStored } from '../lib/storage'
import { profileConfig } from '../data/profileConfig'

type Props = { language: Language; haptics: boolean }
const copy = (language: Language, ar: string, en: string) => language === 'ar' ? ar : en

function SoundExperience({ language }: { language: Language }) {
  return <div className="phase-card ambient-card">
    <div className="phase-card-heading"><span className="phase-icon"><Headphones size={19}/></span><div><span className="eyebrow">REZK ORIGINAL SOUND</span><h3>{copy(language, 'الموسيقى معاك في كل صفحة', 'Music throughout the experience')}</h3></div></div>
    <p>{copy(language, 'مقطوعة أصلية متكررة تلقائيًا مع مشغّل زجاجي عائم أسفل الموقع. تقدر توقفها أو تقلّل صوتها في أي لحظة، وإعدادك بيتحفظ على الجهاز.', 'An original looping soundtrack controlled by the floating glass player below. Pause, mute, or adjust the volume any time. Your preference is saved locally.')}</p>
    <div className="audio-visualizer ambient-demo" aria-hidden="true"><span/><span/><span/><span/><span/><span/><span/><span/></div>
    <span className="ambient-hint">♫ {copy(language, 'المشغّل موجود فوق شريط التنقل', 'Player is above the navigation dock')}</span>
  </div>
}

function VipPass({ language }: { language: Language }) {
  const [handle, setHandle] = useState('@es_hisham'); const [qr, setQr] = useState('');
  useEffect(() => { void QRCode.toDataURL(profileConfig.links.discord, { width: 220, margin: 1, color: { dark: '#08090d', light: '#f4f5f8' } }).then(setQr).catch(() => setQr('')) }, [])
  const exportPass = () => { const canvas = document.createElement('canvas'); canvas.width = 1200; canvas.height = 720; const context = canvas.getContext('2d'); if (!context) return; const gradient = context.createLinearGradient(0, 0, 1200, 720); gradient.addColorStop(0, '#08090d'); gradient.addColorStop(1, '#362019'); context.fillStyle = gradient; context.fillRect(0, 0, 1200, 720); context.strokeStyle = '#ffd36b'; context.lineWidth = 4; context.strokeRect(34, 34, 1132, 652); context.fillStyle = '#ff922e'; context.font = '800 32px Arial'; context.fillText('HISHAM WORLD', 78, 108); context.fillStyle = '#f4f5f8'; context.font = '800 72px Arial'; context.fillText('VIP SQUAD PASS', 78, 215); context.fillStyle = '#a9adba'; context.font = '500 30px Arial'; context.fillText(handle || '@guest', 78, 285); context.fillText('Discord community access', 78, 350); if (qr) { const image = new Image(); image.onload = () => { context.drawImage(image, 890, 180, 220, 220); context.fillStyle = '#a9adba'; context.font = '500 24px Arial'; context.fillText('Scan to join', 918, 440); const link = document.createElement('a'); link.download = 'hisham-world-vip-pass.png'; link.href = canvas.toDataURL('image/png'); link.click() }; image.src = qr } }
  return <div className="phase-card vip-card"><div className="phase-card-heading"><span className="phase-icon"><QrCode size={19} /></span><div><span className="eyebrow">VIP SQUAD PASS</span><h3>{copy(language, 'بطاقتك للمجموعة', 'Your community pass')}</h3></div></div><p>{copy(language, 'اكتب اسمك وطلّع بطاقة PNG فيها QR للديسكورد.', 'Add your handle and export a PNG pass with a Discord QR code.')}</p><label className="phase-input"><span>{copy(language, 'الاسم الظاهر', 'Display handle')}</span><input value={handle} onChange={(event) => setHandle(event.target.value)} placeholder="@your_handle" /></label><div className="vip-preview"><div><strong>{handle || '@guest'}</strong><span>VIP SQUAD</span></div>{qr && <img src={qr} alt={copy(language, 'رمز QR للديسكورد', 'Discord QR code')} />}</div><button className="button button-secondary" onClick={exportPass}><QrCode size={15} />{copy(language, 'تحميل البطاقة PNG', 'Download PNG pass')}</button></div>
}

function HypeCombo({ language, haptics }: Props) {
  const [combo, setCombo] = useState(0); const [best, setBest] = useState(() => readStored('hisham:best-hype-combo', 0, (value): value is number => typeof value === 'number' && Number.isFinite(value) && value >= 0)); const timer = useRef<number | undefined>()
  const hype = () => { setCombo((current) => { const next = current + 1; setBest((value) => { const updated = Math.max(value, next); writeStored('hisham:best-hype-combo', updated); return updated }); return next }); if (haptics && 'vibrate' in navigator) navigator.vibrate(10); if (timer.current) window.clearTimeout(timer.current); timer.current = window.setTimeout(() => setCombo(0), 1500) }
  useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current) }, [])
  return <div className="phase-card combo-card"><div className="phase-card-heading"><span className="phase-icon"><Zap size={19} /></span><div><span className="eyebrow">HYPE COMBO</span><h3>{copy(language, 'ارفع الطاقة', 'Raise the signal')}</h3></div></div><p>{copy(language, 'اضغط بسرعة وابنِ كومبو محلي. أفضل نتيجة محفوظة على جهازك فقط.', 'Tap quickly to build a local combo. Your best stays on this device only.')}</p><button className={`hype-button ${combo > 0 ? 'hype-active' : ''}`} onClick={hype}><Sparkles size={26} /><strong>{combo || copy(language, 'ابدأ', 'Start')}</strong><span>{combo ? `${combo}x` : copy(language, 'اضغط هنا', 'Tap here')}</span></button><div className="combo-meta"><span>{copy(language, 'أفضل كومبو', 'Best combo')}</span><b>{best}x</b></div></div>
}

export default function Phase4Panel({ language, haptics }: Props) {
  const spotlight = profileConfig.mediaSpotlight
  return <div className="phase4-grid"><SoundExperience language={language} /><VipPass language={language} /><HypeCombo language={language} haptics={haptics} />{spotlight && <a className="phase-card spotlight-card" href={spotlight.url} target="_blank" rel="noopener noreferrer"><span className="eyebrow">{copy(language, 'MEDIA SPOTLIGHT', 'MEDIA SPOTLIGHT')}</span><h3>{spotlight.title[language]}</h3><p>{spotlight.description[language]}</p></a>}</div>
}
