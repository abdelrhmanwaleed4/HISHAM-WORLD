import { useEffect, useMemo, useState } from 'react'
import QRCode from 'qrcode'
import { Check, Copy, Download, ExternalLink, QrCode, ScanLine } from 'lucide-react'
import { profileConfig, externalLinkProps } from '../data/profileConfig'
import type { Language } from '../types'
import { copyToClipboard } from '../lib/share'

const i18n = (language: Language, ar: string, en: string) => language === 'ar' ? ar : en

/** All codes encode actual destinations from the single shared site config, never demo URLs. */
export default function QRHub({ language }: { language: Language }) {
  const socials = useMemo(() => [
    ...profileConfig.social.map((item) => ({
      id: item.id,
      name: item.label,
      url: item.url,
      color: item.accent,
      handle: item.handle,
    })),
    {
      id: 'creator',
      name: 'ABDELRHMAN',
      url: profileConfig.creatorDiscordUrl,
      color: '#ffc46d',
      handle: i18n(language, 'صانع الموقع', 'Website creator'),
    },
  ].filter((item) => {
    try { return new URL(item.url).protocol === 'https:' } catch { return false }
  }), [language])

  const [codes, setCodes] = useState<Record<string, string>>({})
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    let canceled = false
    void Promise.all(socials.map(async (item) => {
      try {
        const dataUrl = await QRCode.toDataURL(item.url, {
          errorCorrectionLevel: 'H', width: 420, margin: 3,
          color: { dark: '#171014', light: '#fffaf3' },
        })
        return [item.id, dataUrl] as const
      } catch { return [item.id, ''] as const }
    })).then((entries) => {
      if (!canceled) setCodes(Object.fromEntries(entries))
    })
    return () => { canceled = true }
  }, [socials])

  const copy = async (id: string, url: string) => {
    if (await copyToClipboard(url)) {
      setCopied(id)
      window.setTimeout(() => setCopied((current) => current === id ? null : current), 1800)
    }
  }

  const download = (id: string, dataUrl: string) => {
    const anchor = document.createElement('a')
    anchor.download = `hisham-world-${id}-qr.png`
    anchor.href = dataUrl
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
  }

  return (
    <div className="qr-hub">
      <div className="qr-hub-intro glass">
        <span className="qr-scan-icon"><ScanLine size={22} /></span>
        <div>
          <h3>{i18n(language, 'كل الروابط، بكود حقيقي', 'Every link, a real QR code')}</h3>
          <p>{i18n(language, 'امسح الكود بالموبايل، أو نزّله PNG، أو انسخ الرابط مباشرة. الأكواد بتتكوّن من روابط الحسابات الموجودة في الموقع، مش أكواد تجريبية.', 'Scan with your phone, download a PNG, or copy the exact link. Codes are generated from the site’s configured destinations, not placeholders.')}</p>
        </div>
        <span className="qr-count"><QrCode size={15} /> {socials.length} QR</span>
      </div>
      <div className="qr-grid">
        {socials.map((item) => (
          <article className="glass qr-card" key={item.id} style={{ '--qr-accent': item.color } as React.CSSProperties}>
            <div className="qr-card-heading"><span className="qr-dot" /> <span>{item.name}</span><ExternalLink size={14} /></div>
            <div className="qr-image-frame">
              {codes[item.id]
                ? <img src={codes[item.id]} alt={i18n(language, `QR لرابط ${item.name}`, `QR code for ${item.name}`)} loading="lazy" />
                : <div className="qr-loading"><QrCode size={40} /><span>{i18n(language, 'جاري إنشاء الرمز...', 'Creating code...')}</span></div>}
            </div>
            <strong className="qr-handle" dir="ltr">{item.handle}</strong>
            <a className="qr-address" href={item.url} {...externalLinkProps} dir="ltr" title={item.url}>{item.url.replace(/^https:\/\//, '')}</a>
            <div className="qr-actions">
              <a href={item.url} {...externalLinkProps} className="qr-action primary" aria-label={`${i18n(language, 'فتح', 'Open')} ${item.name}`}><ExternalLink size={16} /><span>{i18n(language, 'فتح', 'Open')}</span></a>
              <button type="button" className="qr-action" onClick={() => void copy(item.id, item.url)} aria-label={`${i18n(language, 'نسخ رابط', 'Copy link')} ${item.name}`}>{copied === item.id ? <Check size={16}/> : <Copy size={16}/>}<span>{copied === item.id ? i18n(language, 'اتنسخ', 'Copied') : i18n(language, 'نسخ', 'Copy')}</span></button>
              <button type="button" className="qr-action" disabled={!codes[item.id]} onClick={() => download(item.id, codes[item.id])} aria-label={`${i18n(language, 'تحميل QR', 'Download QR')} ${item.name}`}><Download size={16}/><span>PNG</span></button>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
