const STORAGE_VERSION = 1

type StoredEnvelope<T> = {
  version: number
  value: T
}

const memoryStore = new Map<string, string>()

const getStore = (): Storage | null => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null
    const probe = '__hisham_storage_probe__'
    window.localStorage.setItem(probe, '1')
    window.localStorage.removeItem(probe)
    return window.localStorage
  } catch {
    return null
  }
}

const readRaw = (key: string): string | null => getStore()?.getItem(key) ?? memoryStore.get(key) ?? null
const writeRaw = (key: string, value: string): void => {
  try {
    const store = getStore()
    if (store) store.setItem(key, value)
    else memoryStore.set(key, value)
  } catch {
    memoryStore.set(key, value)
  }
}

export const readStored = <T>(key: string, fallback: T, validate: (value: unknown) => value is T): T => {
  try {
    const raw = readRaw(key)
    if (!raw) return fallback
    const parsed = JSON.parse(raw) as Partial<StoredEnvelope<unknown>>
    if (parsed.version !== STORAGE_VERSION || !validate(parsed.value)) return fallback
    return parsed.value
  } catch {
    return fallback
  }
}

export const writeStored = <T>(key: string, value: T): void => {
  const envelope: StoredEnvelope<T> = { version: STORAGE_VERSION, value }
  writeRaw(key, JSON.stringify(envelope))
}

export const removeStored = (key: string): void => {
  try {
    const store = getStore()
    if (store) store.removeItem(key)
    else memoryStore.delete(key)
  } catch {
    memoryStore.delete(key)
  }
}

export const storageKeys = {
  introSeen: 'hisham:intro-seen',
  customization: 'hisham:customization',
  guideProgress: 'hisham:guide-progress',
} as const
