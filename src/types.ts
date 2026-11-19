export type Language = 'ar' | 'en'

export type Customization = {
  transparency: number
  tint: number
  blur: number
  border: number
  reflection: number
  glow: number
  radius: number
  motion: number
  particles: boolean
  aurora: boolean
  reducedMotion: boolean
  lowPerformance: boolean
  compactUi: boolean
  haptics: boolean
}

export type GuideProgress = {
  kick: boolean[]
  discord: boolean[]
}
