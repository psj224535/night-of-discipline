const SESSION_KEY = 'night-of-discipline:squad-session:v2'

export type AccountRole = 'admin' | 'member'

export interface AccountSession {
  username: string
  participantId: string
  name: string
  role: AccountRole
}

interface AccountRecord extends AccountSession {
  salt: string
  passwordHash: string
}

const accounts: AccountRecord[] = [
  {
    username: 'seongjun', participantId: 'seongjun', name: '박성준', role: 'admin',
    salt: '2de83e8c25663de5f5e57d84d5a1476c',
    passwordHash: '98263b9566adc58da32c2fd61fa9591ea78475030cf8035a228fb33ee686719b',
  },
  {
    username: 'jaewoo', participantId: 'jaewoo', name: '김재우', role: 'member',
    salt: 'a8cbf7f5a09977d19e0daf7d92e800ba',
    passwordHash: '1393cacac0fbb197bae4e95716c81ba63150340ca9b3df8327dabb27d1ebcc9c',
  },
  {
    username: 'hyunjae', participantId: 'hyunjae', name: '조현재', role: 'member',
    salt: 'c20c86101ac5f8b835f79b328e6b14f4',
    passwordHash: '1de796d3ae5f5999d59696137d376a15daf24ff5ca8bab266550ebd4639a738d',
  },
  {
    username: 'taemin', participantId: 'taemin', name: '안태민', role: 'member',
    salt: 'fc08efd31db6fa537633bb2f7d9f6c47',
    passwordHash: 'dc6e9323517a4f3c5496ed1665ce951a3a0efa0af1b2d8c5834f32251db6fc53',
  },
  {
    username: 'yuchan', participantId: 'yuchan', name: '정유찬', role: 'member',
    salt: 'f55ac89aa4875b7f876a9cef30bb0792',
    passwordHash: '75d07e72a130ad71ef3f3082bc3e8f5a95cb4c5af953ca7e75b5d3af174c88e5',
  },
]

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

async function hashPassword(password: string, salt: string) {
  const payload = new TextEncoder().encode(`${salt}:${password}`)
  const digest = await crypto.subtle.digest('SHA-256', payload)
  return bytesToHex(new Uint8Array(digest))
}

function isSession(value: unknown): value is AccountSession {
  if (!value || typeof value !== 'object') return false
  const session = value as AccountSession
  return typeof session.username === 'string'
    && typeof session.participantId === 'string'
    && typeof session.name === 'string'
    && (session.role === 'admin' || session.role === 'member')
}

export function getActiveSession(): AccountSession | null {
  for (const storage of [sessionStorage, localStorage]) {
    try {
      const parsed = JSON.parse(storage.getItem(SESSION_KEY) ?? 'null') as unknown
      if (isSession(parsed)) return parsed
    } catch {
      // Ignore malformed or legacy local sessions.
    }
  }
  return null
}

export async function signInAccount(username: string, password: string, remember: boolean): Promise<AccountSession | null> {
  const normalized = username.trim().toLowerCase()
  const account = accounts.find((candidate) => candidate.username === normalized)
  if (!account) return null
  const candidateHash = await hashPassword(password, account.salt)
  if (candidateHash !== account.passwordHash) return null
  const session: AccountSession = {
    username: account.username,
    participantId: account.participantId,
    name: account.name,
    role: account.role,
  }
  setSession(session, remember)
  return session
}

function setSession(session: AccountSession, remember: boolean) {
  const serialized = JSON.stringify(session)
  sessionStorage.setItem(SESSION_KEY, serialized)
  if (remember) localStorage.setItem(SESSION_KEY, serialized)
  else localStorage.removeItem(SESSION_KEY)
}

export function signOutAccount() {
  sessionStorage.removeItem(SESSION_KEY)
  localStorage.removeItem(SESSION_KEY)
}
