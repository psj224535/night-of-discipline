const OWNER_KEY = 'night-of-discipline:owner:v1'
const SESSION_KEY = 'night-of-discipline:session:v1'

interface OwnerRecord {
  email: string
  salt: string
  passwordHash: string
  createdAt: string
}

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

async function hashPassword(password: string, salt: string) {
  const payload = new TextEncoder().encode(`${salt}:${password}`)
  const digest = await crypto.subtle.digest('SHA-256', payload)
  return bytesToHex(new Uint8Array(digest))
}

export function getOwnerEmail(): string | null {
  try {
    const record = JSON.parse(localStorage.getItem(OWNER_KEY) ?? 'null') as OwnerRecord | null
    return record?.email ?? null
  } catch {
    return null
  }
}

export function hasOwnerAccount() {
  return getOwnerEmail() !== null
}

export function hasActiveSession() {
  return sessionStorage.getItem(SESSION_KEY) === 'active' || localStorage.getItem(SESSION_KEY) === 'active'
}

export async function createOwnerAccount(email: string, password: string, remember: boolean) {
  if (hasOwnerAccount()) throw new Error('이 기기에는 이미 관리자 계정이 있습니다.')
  const saltBytes = crypto.getRandomValues(new Uint8Array(16))
  const salt = bytesToHex(saltBytes)
  const record: OwnerRecord = {
    email: email.trim().toLowerCase(),
    salt,
    passwordHash: await hashPassword(password, salt),
    createdAt: new Date().toISOString(),
  }
  localStorage.setItem(OWNER_KEY, JSON.stringify(record))
  setSession(remember)
}

export async function signInOwner(email: string, password: string, remember: boolean) {
  const record = JSON.parse(localStorage.getItem(OWNER_KEY) ?? 'null') as OwnerRecord | null
  if (!record) return false
  const candidate = await hashPassword(password, record.salt)
  const valid = record.email === email.trim().toLowerCase() && record.passwordHash === candidate
  if (valid) setSession(remember)
  return valid
}

function setSession(remember: boolean) {
  sessionStorage.setItem(SESSION_KEY, 'active')
  if (remember) localStorage.setItem(SESSION_KEY, 'active')
  else localStorage.removeItem(SESSION_KEY)
}

export function signOutOwner() {
  sessionStorage.removeItem(SESSION_KEY)
  localStorage.removeItem(SESSION_KEY)
}
