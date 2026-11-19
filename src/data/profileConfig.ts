export type SocialId = 'kick' | 'discord' | 'youtube' | 'tiktok' | 'x'

export type SocialProfile = {
  id: SocialId
  label: string
  handle: string
  url: string
  accent: string
  icon: 'kick' | 'discord' | 'youtube' | 'tiktok' | 'x'
}

export const profileConfig = {
  siteUrl: 'https://abdelrhmanwaleed4.github.io/hisham-world/',
  nameArabic: 'هشام',
  nameEnglish: 'Hisham',
  handles: ['@es_hisham', '@Etsh1991'],
  portraitPaths: ['/hisham-world/images/rezk-portrait.webp', '/hisham-world/images/rezk-banner.webp'] as string[],
  // The uploaded track is served locally so the player works without third-party music APIs.
  music: { src: '/hisham-world/audio/hisham-song.mp3', fallbackSrc: '/hisham-world/audio/hisham-song.ogg', title: 'حبيبي مستمع' },
  // Discord profile linked from the ABDELRHMAN footer signature.
  creatorDiscordUrl: 'https://discord.com/users/1492553762009776280',
  mediaSpotlight: {
    title: { ar: 'من قلب عالم هشام', en: 'Inside Hisham’s World' },
    description: { ar: 'مجتمع الجيمينج والضحك واللحظات اللي تستاهل تتحكي. ادخل وشوف بنفسك.', en: 'Gaming, good vibes, and moments worth sharing. Jump into the action.' },
    url: 'https://kick.com/es_hisham',
  } as { title: { ar: string; en: string }; description: { ar: string; en: string }; url: string } | null,
  bio: {
    ar: 'استريمر مصري طموح 🎮 بفتح استريمات للترفيه عن نفسي والمتعة والضحك.. مكانك لو بتدور على روقان، جيمينج، وصحبة حلوة بدون تصنّع ✨',
    en: 'Ambitious Egyptian Streamer 🎮 Streaming for pure fun, good vibes, and self-entertainment. Pull up for chill gaming, laughs, and real community energy ✨',
  },
  links: {
    kick: 'https://kick.com/es_hisham',
    discord: 'https://discord.gg/VxgkBCYC9e',
    youtube: 'https://youtube.com/@Etsh1991',
    tiktok: 'https://tiktok.com/@etsh1991',
    x: 'https://x.com/Hishamelhanfy12',
  },
  colors: {
    obsidian: '#08090D',
    secondary: '#101218',
    emerald: '#FF932E',
    champagne: '#FFD26B',
    violet: '#362019',
    white: '#F4F5F8',
    silver: '#A9ADBA',
  },
  social: [
    { id: 'kick', label: 'Kick', handle: '@es_hisham', url: 'https://kick.com/es_hisham', accent: '#53FC18', icon: 'kick' },
    { id: 'discord', label: 'Discord', handle: 'VxgkBCYC9e', url: 'https://discord.gg/VxgkBCYC9e', accent: '#9b8cff', icon: 'discord' },
    { id: 'youtube', label: 'YouTube', handle: '@Etsh1991', url: 'https://youtube.com/@Etsh1991', accent: '#ff6b74', icon: 'youtube' },
    { id: 'tiktok', label: 'TikTok', handle: '@etsh1991', url: 'https://tiktok.com/@etsh1991', accent: '#79e7e5', icon: 'tiktok' },
    { id: 'x', label: 'X', handle: '@Hishamelhanfy12', url: 'https://x.com/Hishamelhanfy12', accent: '#e9edf5', icon: 'x' },
  ] satisfies SocialProfile[],
} as const

export const externalLinkProps = {
  target: '_blank',
  rel: 'noopener noreferrer',
} as const
