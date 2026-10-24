import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import {
  Activity, ArrowRight, Award, CalendarDays, Check, CheckCircle2, ChevronDown,
  Clock3, Dumbbell, Eye, EyeOff, Flame, Home, KeyRound, LineChart, Lock, LogOut,
  Menu, Minus, Pencil, Plus, RotateCcw, Save, Scale, ShieldCheck, Target, TrendingDown,
  TrendingUp, Trophy, UserRound, X,
} from 'lucide-react'
import { demoState } from './data/demo'
import { createOwnerAccount, getOwnerEmail, hasActiveSession, hasOwnerAccount, signInOwner, signOutOwner } from './lib/auth'
import { displayProgress, goalKindLabel, progressLabel } from './lib/progress'
import type { AppState, BodyRecord, Challenge, ChallengeStatus, Goal, Participant, PlanGoal, View } from './types'

const STORAGE_KEY = 'night-of-discipline:v2'

function cloneDemo(): AppState {
  return JSON.parse(JSON.stringify(demoState)) as AppState
}

function loadState(): AppState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) as AppState : cloneDemo()
  } catch {
    return cloneDemo()
  }
}

const metricLabels = {
  weight: 'Weight',
  skeletalMuscle: 'Skeletal muscle',
  bodyFat: 'Body fat',
} as const

const metricUnits = { weight: 'kg', skeletalMuscle: 'kg', bodyFat: '%' } as const

function formatDate(date: string, withYear = false) {
  const parsed = new Date(`${date}T12:00:00`)
  return new Intl.DateTimeFormat('en-US', {
    ...(withYear ? { year: 'numeric' as const } : {}),
    month: 'short', day: 'numeric',
  }).format(parsed)
}

function signed(value: number, unit: string) {
  const rounded = Math.round(value * 10) / 10
  return `${rounded > 0 ? '+' : ''}${rounded}${unit}`
}

function clampProgress(value: number) {
  return Math.min(100, Math.max(0, value))
}

function App() {
  const [authenticated, setAuthenticated] = useState(hasActiveSession)

  if (!authenticated) return <OwnerAccess onAuthenticated={() => setAuthenticated(true)} />

  return <Dashboard onSignOut={() => { signOutOwner(); setAuthenticated(false) }} />
}

function OwnerAccess({ onAuthenticated }: { onAuthenticated: () => void }) {
  const [setup] = useState(() => !hasOwnerAccount())
  const [email, setEmail] = useState(() => getOwnerEmail() ?? '')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault()
    setError('')
    if (setup && password.length < 8) return setError('Use at least 8 characters for your password.')
    if (setup && password !== confirmPassword) return setError('The passwords do not match.')
    setBusy(true)
    try {
      if (setup) await createOwnerAccount(email, password, remember)
      else if (!await signInOwner(email, password, remember)) return setError('Email or password is incorrect.')
      onAuthenticated()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Something went wrong. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="auth-shell">
      <div className="auth-art">
        <div className="auth-brand"><span className="brand-mark"><span>N</span></span><span className="brand-type"><strong>NIGHT OF</strong><strong>DISCIPLINE</strong></span></div>
        <div className="auth-art-copy"><span className="eyebrow">OWNER ACCESS · PRIVATE LOG</span><h1>Discipline<br />leaves <em>evidence.</em></h1><p>Your body data, challenges, and long-game progress — kept in one private training log.</p></div>
        <div className="auth-grid-word">NOD</div>
      </div>
      <section className="auth-panel">
        <div className="auth-card">
          <span className="auth-icon"><ShieldCheck /></span>
          <span className="eyebrow">{setup ? 'FIRST-TIME SETUP' : 'OWNER SIGN IN'}</span>
          <h2>{setup ? 'Create your owner account' : 'Welcome back, Seongjun'}</h2>
          <p>{setup ? 'This is the only account that can open this training log on this device.' : 'Sign in to open your private discipline log.'}</p>
          <form onSubmit={submit}>
            <label className="form-field full"><span>Owner email</span><input type="email" autoComplete="email" required placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
            <label className="form-field full"><span>Password</span><div className="password-field"><input type={showPassword ? 'text' : 'password'} autoComplete={setup ? 'new-password' : 'current-password'} required value={password} onChange={(event) => setPassword(event.target.value)} /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff /> : <Eye />}</button></div></label>
            {setup && <label className="form-field full"><span>Confirm password</span><input type={showPassword ? 'text' : 'password'} autoComplete="new-password" required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} /></label>}
            <label className="remember-row"><input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} /><span>Keep me signed in on this device</span></label>
            {error && <p className="auth-error" role="alert">{error}</p>}
            <button className="button button-primary auth-submit" disabled={busy}>{busy ? 'Securing access…' : setup ? 'Create owner account' : 'Enter the log'} <ArrowRight size={17} /></button>
          </form>
          <div className="auth-security"><KeyRound size={15} /><p>Your password is salted and hashed before it is stored. It is never saved as plain text.</p></div>
          <small className="auth-caveat">Local MVP protection only. Server authentication is required before public deployment.</small>
        </div>
      </section>
    </main>
  )
}

function Dashboard({ onSignOut }: { onSignOut: () => void }) {
  const [state, setState] = useState<AppState>(loadState)
  const [view, setView] = useState<View>('squad')
  const [selectedChallengeId, setSelectedChallengeId] = useState('oct-26')
  const [recordOpen, setRecordOpen] = useState(false)
  const [goalOpen, setGoalOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(''), 2400)
    return () => window.clearTimeout(timer)
  }, [toast])

  const activeProfile = state.participants.find((person) => person.id === state.activeProfileId) ?? state.participants[0]

  function showView(next: View) {
    setView(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function updateParticipant(id: string, updater: (person: Participant) => Participant) {
    setState((current) => ({
      ...current,
      participants: current.participants.map((person) => person.id === id ? updater(person) : person),
    }))
  }

  function addRecord(record: BodyRecord) {
    updateParticipant(activeProfile.id, (person) => {
      let goal = person.goal
      if (goal.type === 'numeric') {
        goal = { ...goal, current: record[goal.metric] }
      }
      return {
        ...person,
        goal,
        records: [...person.records, record].sort((a, b) => a.date.localeCompare(b.date)),
        lastUpdate: 'Just now',
        updateText: `Added a body scan for ${formatDate(record.date)}.`,
      }
    })
    setRecordOpen(false)
    setToast('Body record saved on this device.')
  }

  function updateGoal(title: string, goal: Goal) {
    updateParticipant(activeProfile.id, (person) => ({
      ...person,
      goalTitle: title,
      goal,
      lastUpdate: 'Just now',
      updateText: 'Updated current goal progress.',
    }))
    setGoalOpen(false)
    setToast('Goal progress updated.')
  }

  function updatePlans(shortTerm: PlanGoal, longTerm: PlanGoal) {
    updateParticipant(activeProfile.id, (person) => ({ ...person, plans: { shortTerm, longTerm } }))
    setToast('Short- and long-term goals saved.')
  }

  function resetDemo() {
    setState(cloneDemo())
    setMenuOpen(false)
    setToast('Demo data restored to its starting point.')
  }

  function openChallenge(id: string) {
    setSelectedChallengeId(id)
    showView('challenges')
  }

  return (
    <div className="app-shell">
      <Header
        view={view}
        activeProfile={activeProfile}
        onNavigate={showView}
        onOpenRecord={() => setRecordOpen(true)}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        onReset={resetDemo}
        onSignOut={onSignOut}
      />

      <main>
        {view === 'squad' && (
          <SquadPage
            participants={state.participants}
            challenges={state.challenges}
            onOpenProfile={(id) => {
              setState((current) => ({ ...current, activeProfileId: id }))
              showView('journey')
            }}
            onOpenChallenge={openChallenge}
          />
        )}
        {view === 'journey' && (
          <JourneyPage
            participant={activeProfile}
            challenges={state.challenges}
            onAddRecord={() => setRecordOpen(true)}
            onEditGoal={() => setGoalOpen(true)}
            onUpdatePlans={updatePlans}
          />
        )}
        {view === 'challenges' && (
          <ChallengesPage challenges={state.challenges} participants={state.participants} selectedChallengeId={selectedChallengeId} />
        )}
      </main>

      <BottomNav view={view} onNavigate={showView} onAdd={() => setRecordOpen(true)} />

      {recordOpen && <RecordModal participant={activeProfile} onClose={() => setRecordOpen(false)} onSave={addRecord} />}
      {goalOpen && <GoalModal participant={activeProfile} onClose={() => setGoalOpen(false)} onSave={updateGoal} />}
      {toast && <div className="toast" role="status"><CheckCircle2 size={18} />{toast}</div>}
    </div>
  )
}

function Header({
  view, activeProfile, onNavigate, onOpenRecord, menuOpen, setMenuOpen, onReset, onSignOut,
}: {
  view: View
  activeProfile: Participant
  onNavigate: (view: View) => void
  onOpenRecord: () => void
  menuOpen: boolean
  setMenuOpen: (open: boolean) => void
  onReset: () => void
  onSignOut: () => void
}) {
  return (
    <header className="topbar">
      <button className="brand" onClick={() => onNavigate('squad')} aria-label="Squad home">
        <span className="brand-mark"><span>N</span></span>
        <span className="brand-type"><strong>NIGHT OF</strong><strong>DISCIPLINE</strong></span>
      </button>
      <nav className="desktop-nav" aria-label="Primary navigation">
        <NavButton active={view === 'squad'} onClick={() => onNavigate('squad')}>Squad</NavButton>
        <NavButton active={view === 'journey'} onClick={() => onNavigate('journey')}>My Log</NavButton>
        <NavButton active={view === 'challenges'} onClick={() => onNavigate('challenges')}>Challenges</NavButton>
      </nav>
      <div className="top-actions">
        <span className="local-badge"><Lock size={13} /> Private on this device</span>
        <button className="button button-primary desktop-only" onClick={onOpenRecord}><Plus size={17} /> Add record</button>
        <button className="avatar-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Profile menu" aria-expanded={menuOpen}>
          <Avatar person={activeProfile} size="small" />
          <ChevronDown size={15} />
        </button>
        {menuOpen && (
          <div className="profile-menu">
            <div><strong>{activeProfile.name}</strong><span>{activeProfile.handle}</span></div>
            <button onClick={onReset}><RotateCcw size={15} /> Reset demo data</button>
            <button onClick={onSignOut}><LogOut size={15} /> Sign out</button>
          </div>
        )}
      </div>
    </header>
  )
}

function NavButton({ active, children, onClick }: { active: boolean, children: ReactNode, onClick: () => void }) {
  return <button className={active ? 'active' : ''} onClick={onClick}>{children}</button>
}

function SquadPage({ participants, challenges, onOpenProfile, onOpenChallenge }: {
  participants: Participant[]
  challenges: Challenge[]
  onOpenProfile: (id: string) => void
  onOpenChallenge: (id: string) => void
}) {
  const active = challenges.find((challenge) => challenge.status === 'active')!
  const remaining = Math.max(0, Math.ceil((new Date(`${active.endDate}T23:59:59`).getTime() - new Date('2026-10-24T12:00:00').getTime()) / 86400000))

  return (
    <div className="page squad-page">
      <section className="squad-intro">
        <div>
          <div className="eyebrow"><span className="live-dot" /> PRIVATE SQUAD BOARD · WEEK 4</div>
          <h1>This week,<br /><em>move the line.</em></h1>
          <p>One clear target. One honest update. Every challenge becomes another point in the long game.</p>
        </div>
        <aside className="round-snapshot">
          <span>{active.edition} · ACTIVE</span>
          <strong>{active.title}</strong>
          <p>{remaining} days left to close the month.</p>
          <button onClick={() => onOpenChallenge(active.id)}>Open challenge <ArrowRight size={16} /></button>
        </aside>
      </section>

      <section className="content-section weekly-board-section">
        <SectionHeading eyebrow="THIS WEEK'S BOARD" title="The target in front of us" description="Every person keeps a distinct color as the squad grows." />
        <div className="weekly-goal-board">
          {participants.map((person) => <WeeklyGoalCard key={person.id} person={person} onOpen={() => onOpenProfile(person.id)} />)}
          <div className="future-member-slot"><Plus size={20} /><div><strong>Next squad member</strong><span>A new color and weekly target will appear here.</span></div></div>
        </div>
      </section>

      <section className="content-section performance-section">
        <SectionHeading eyebrow="THE LONG GAME" title="Challenge performance" description="Successful months push the line upward. Hover a node for the result; select it for the full record." />
        <PerformanceGraph challenges={challenges} participant={participants[0]} onOpenChallenge={onOpenChallenge} />
      </section>

      <section className="content-section squad-bottom-grid">
        <article className="activity-focus">
          <span className="eyebrow">LATEST CHECK-IN</span>
          <div><Avatar person={participants[0]} /><div><strong>{participants[0].name}</strong><p>{participants[0].updateText}</p><span>{participants[0].lastUpdate}</span></div></div>
        </article>
        <aside className="manifesto-card compact-manifesto"><span className="eyebrow">OWNER RULE #01</span><blockquote>“No performance.<br />Just proof.”</blockquote></aside>
      </section>
    </div>
  )
}

function WeeklyGoalCard({ person, onOpen }: { person: Participant, onOpen: () => void }) {
  const progress = displayProgress(person.goal)
  return (
    <button className="weekly-goal-card" style={{ '--accent': person.accent } as React.CSSProperties} onClick={onOpen}>
      <span className="weekly-color" />
      <Avatar person={person} />
      <div className="weekly-person"><span>{person.name}</span><strong>{person.goalTitle}</strong><small>{progressLabel(person.goal)}</small></div>
      <div className="weekly-progress"><strong>{progress}%</strong><div><span style={{ width: `${clampProgress(progress)}%` }} /></div></div>
      <ArrowRight size={19} />
    </button>
  )
}

function PerformanceGraph({ challenges, participant, onOpenChallenge }: { challenges: Challenge[], participant: Participant, onOpenChallenge: (id: string) => void }) {
  let score = 0
  const scored = challenges.filter((challenge) => challenge.status !== 'upcoming').map((challenge) => {
    const result = challenge.goals.find((goal) => goal.participantId === participant.id)?.result
    const contribution = challenge.status === 'active' ? displayProgress(participant.goal) : result ? 100 : -25
    score = Math.max(0, score + contribution)
    return { challenge, score, contribution, result }
  })
  const maxScore = Math.max(100, Math.ceil(Math.max(...scored.map((point) => point.score)) / 50) * 50)
  const chartMax = maxScore + 25
  const points = scored.map((point, index) => ({
    ...point,
    x: scored.length === 1 ? 50 : 10 + (index / (scored.length - 1)) * 80,
    y: 84 - (point.score / chartMax) * 68,
  }))
  const path = points.map((point, index) => `${index ? 'L' : 'M'} ${point.x} ${point.y}`).join(' ')
  const area = `${path} L ${points.at(-1)?.x ?? 90} 84 L ${points[0]?.x ?? 10} 84 Z`

  return (
    <article className="performance-graph-card">
      <div className="performance-legend"><span><i /> Cumulative momentum</span><span>Baseline: Sep 30, 2026</span></div>
      <div className="performance-canvas">
        <div className="y-axis"><span>{maxScore}</span><span>{Math.round(maxScore / 2)}</span><span>0</span></div>
        <svg viewBox="0 0 100 92" preserveAspectRatio="none" role="img" aria-label="Cumulative challenge performance over time">
          <defs><linearGradient id="performance-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#d9ff62" stopOpacity=".22" /><stop offset="1" stopColor="#d9ff62" stopOpacity="0" /></linearGradient></defs>
          {[16, 50, 84].map((y) => <line key={y} x1="6" x2="96" y1={y} y2={y} className="grid-line" />)}
          <path d={area} fill="url(#performance-fill)" />
          <path d={path} fill="none" stroke="#d9ff62" strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
        </svg>
        {points.map((point) => (
          <button className={`performance-node ${point.challenge.status}`} style={{ left: `${point.x}%`, top: `${point.y}%` }} onClick={() => onOpenChallenge(point.challenge.id)} key={point.challenge.id} aria-label={`Open ${point.challenge.title} details`}>
            <span />
            <div className="node-tooltip"><small>{point.challenge.edition} · {formatDate(point.challenge.endDate)}</small><strong>{point.challenge.title}</strong><p>{point.challenge.status === 'active' ? `${point.contribution}% in progress` : point.result ? 'Goal achieved · +100 momentum' : 'Goal missed · -25 momentum'}</p></div>
          </button>
        ))}
        <div className="x-axis">{points.map((point) => <span style={{ left: `${point.x}%` }} key={point.challenge.id}>{formatDate(point.challenge.endDate)}</span>)}</div>
      </div>
      <div className="performance-footer"><div><span>Current momentum</span><strong>{score}</strong></div><div><span>Completed rounds</span><strong>{challenges.filter((item) => item.status === 'completed').length}</strong></div><div><span>Active target</span><strong>{participant.goalTitle}</strong></div></div>
    </article>
  )
}

function SectionHeading({ eyebrow, title, description, compact = false }: { eyebrow: string, title: string, description?: string, compact?: boolean }) {
  return (
    <div className={`section-heading ${compact ? 'compact' : ''}`}>
      <span className="eyebrow">{eyebrow}</span>
      <div><h2>{title}</h2>{description && <p>{description}</p>}</div>
    </div>
  )
}

function JourneyPage({ participant, challenges, onAddRecord, onEditGoal, onUpdatePlans }: {
  participant: Participant
  challenges: Challenge[]
  onAddRecord: () => void
  onEditGoal: () => void
  onUpdatePlans: (shortTerm: PlanGoal, longTerm: PlanGoal) => void
}) {
  const latest = participant.records.at(-1)!
  const first = participant.records[0]
  const progress = displayProgress(participant.goal)
  const checkpointGoal = participant.goal.type === 'checkpoint' ? participant.goal : null
  const [editingPlans, setEditingPlans] = useState(false)
  const [draftPlans, setDraftPlans] = useState(participant.plans)

  useEffect(() => setDraftPlans(participant.plans), [participant])

  function savePlans(event: FormEvent) {
    event.preventDefault()
    onUpdatePlans(draftPlans.shortTerm, draftPlans.longTerm)
    setEditingPlans(false)
  }

  return (
    <div className="page journey-page">
      <section className="profile-hero" style={{ '--accent': participant.accent } as React.CSSProperties}>
        <div className="profile-person">
          <Avatar person={participant} size="large" />
          <div>
            <span className="eyebrow">MY DISCIPLINE</span>
            <h1>{participant.name}</h1>
            <p>{participant.role} · <Flame size={15} /> {participant.streak}-day logging streak</p>
          </div>
        </div>
        <span className="owner-profile-badge"><ShieldCheck size={15} /> Owner profile</span>
      </section>

      <section className={`goal-plans-panel ${editingPlans ? 'editing' : ''}`}>
        <div className="goal-plans-head"><div><span className="eyebrow">DIRECTION OF TRAVEL</span><h2>Short game. Long game.</h2><p>Set the target close enough to act on, and the one far enough to guide you.</p></div><button className="button button-secondary" onClick={() => { setDraftPlans(participant.plans); setEditingPlans(!editingPlans) }}>{editingPlans ? <X size={16} /> : <Pencil size={16} />}{editingPlans ? 'Cancel' : 'Edit mode'}</button></div>
        {editingPlans ? (
          <form className="plan-edit-grid" onSubmit={savePlans}>
            <PlanGoalEditor label="Short-term goal" value={draftPlans.shortTerm} onChange={(shortTerm) => setDraftPlans({ ...draftPlans, shortTerm })} />
            <PlanGoalEditor label="Long-term goal" value={draftPlans.longTerm} onChange={(longTerm) => setDraftPlans({ ...draftPlans, longTerm })} />
            <div className="plan-save-row"><button className="button button-primary"><Save size={16} /> Save both goals</button></div>
          </form>
        ) : (
          <div className="plan-card-grid"><PlanGoalCard label="NEXT CHECKPOINT" goal={participant.plans.shortTerm} index="01" /><PlanGoalCard label="NORTH STAR" goal={participant.plans.longTerm} index="02" /></div>
        )}
      </section>

      <section className="body-stat-grid">
        <BodyStat label="Weight" value={latest.weight} unit="kg" change={latest.weight - first.weight} icon={<Scale />} desired="decrease" />
        <BodyStat label="Skeletal muscle" value={latest.skeletalMuscle} unit="kg" change={latest.skeletalMuscle - first.skeletalMuscle} icon={<Dumbbell />} desired="increase" />
        <BodyStat label="Body fat" value={latest.bodyFat} unit="%" change={latest.bodyFat - first.bodyFat} icon={<Activity />} desired="decrease" />
        <button className="add-stat-card" onClick={onAddRecord}><Plus size={23} /><span>Add body record</span><small>Log a new measurement</small></button>
      </section>

      <section className="journey-grid">
        <article className="panel goal-panel">
          <div className="panel-header"><div><span className="eyebrow">CURRENT TARGET</span><h2>October target</h2></div><button className="text-button" onClick={onEditGoal}>Edit progress</button></div>
          <div className="goal-ring-wrap">
            <ProgressRing value={progress} accent={participant.accent} />
            <div><span>{goalKindLabel(participant.goal)}</span><h3>{participant.goalTitle}</h3><p>{progressLabel(participant.goal)}</p></div>
          </div>
          {participant.goal.type === 'numeric' && (
            <div className="goal-scale">
              <span>Start <strong>{participant.goal.start}{participant.goal.unit}</strong></span>
              <span>Current <strong>{participant.goal.current}{participant.goal.unit}</strong></span>
              <span>Target <strong>{participant.goal.target}{participant.goal.unit}</strong></span>
            </div>
          )}
          {checkpointGoal && (
            <ol className="checkpoint-list">
              {checkpointGoal.checkpoints.map((point, index) => <li className={index < checkpointGoal.completedCount ? 'done' : ''} key={point}><span>{index < checkpointGoal.completedCount ? <Check size={13} /> : index + 1}</span>{point}</li>)}
            </ol>
          )}
          {participant.goal.type === 'completion' && (
            <div className={`completion-status ${participant.goal.completed ? 'done' : ''}`}><Award size={24} /><div><strong>{participant.goal.completed ? 'Mission complete' : 'Preparing for the event'}</strong><span>{participant.goal.completed ? 'The commitment was completed.' : 'Completion takes this goal to 100%.'}</span></div></div>
          )}
        </article>

        <article className="panel chart-panel">
          <div className="panel-header chart-heading"><div><span className="eyebrow">BODY CHANGE</span><h2>All metrics, one graph</h2></div><span className="normalized-label">% CHANGE FROM BASELINE</span></div>
          <CombinedBodyChart records={participant.records} />
        </article>
      </section>

      <section className="content-section timeline-section">
        <SectionHeading eyebrow="THE LONG GAME" title="Progress timeline" description="Body measurements and monthly challenges in one continuous record." />
        <JourneyTimeline participant={participant} challenges={challenges} />
      </section>
    </div>
  )
}

function PlanGoalCard({ label, goal, index }: { label: string, goal: PlanGoal, index: string }) {
  return <article className="plan-goal-card"><span className="plan-index">{index}</span><span className="eyebrow">{label}</span><h3>{goal.title}</h3><p>{goal.note}</p><time><CalendarDays size={14} /> Target · {formatDate(goal.targetDate, true)}</time></article>
}

function PlanGoalEditor({ label, value, onChange }: { label: string, value: PlanGoal, onChange: (goal: PlanGoal) => void }) {
  return (
    <fieldset className="plan-goal-editor">
      <legend>{label}</legend>
      <label className="form-field"><span>Goal</span><input required value={value.title} onChange={(event) => onChange({ ...value, title: event.target.value })} /></label>
      <label className="form-field"><span>Target date</span><input type="date" required value={value.targetDate} onChange={(event) => onChange({ ...value, targetDate: event.target.value })} /></label>
      <label className="form-field"><span>Execution note</span><textarea required value={value.note} onChange={(event) => onChange({ ...value, note: event.target.value })} /></label>
    </fieldset>
  )
}

function BodyStat({ label, value, unit, change, icon, desired }: { label: string, value: number, unit: string, change: number, icon: ReactNode, desired: 'increase' | 'decrease' }) {
  const positive = desired === 'increase' ? change >= 0 : change <= 0
  return (
    <article className="body-stat-card">
      <div className="body-stat-label"><span>{icon}</span>{label}</div>
      <div className="body-stat-value"><strong>{value}</strong><span>{unit}</span></div>
      <div className={`body-stat-change ${positive ? 'positive' : 'negative'}`}>{change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />} {signed(change, unit)} <span>from baseline</span></div>
    </article>
  )
}

function ProgressRing({ value, accent }: { value: number, accent: string }) {
  const radius = 44
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - clampProgress(value) / 100)
  return (
    <div className="progress-ring">
      <svg viewBox="0 0 104 104" aria-label={`Goal progress ${value}%`}><circle className="ring-bg" cx="52" cy="52" r={radius} /><circle className="ring-value" cx="52" cy="52" r={radius} style={{ stroke: accent, strokeDasharray: circumference, strokeDashoffset: offset }} /></svg>
      <strong>{value}<small>%</small></strong>
    </div>
  )
}

function CombinedBodyChart({ records }: { records: BodyRecord[] }) {
  const data = records.slice(-7)
  const keys = Object.keys(metricLabels) as Array<keyof typeof metricLabels>
  const colors: Record<(typeof keys)[number], string> = { weight: '#ffbd66', skeletalMuscle: '#d9ff62', bodyFat: '#83d9ff' }
  const normalized = keys.flatMap((metric) => data.map((record) => ((record[metric] - data[0][metric]) / data[0][metric]) * 100))
  const minValue = Math.min(-1, ...normalized)
  const maxValue = Math.max(1, ...normalized)
  const range = maxValue - minValue || 1
  const xFor = (index: number) => data.length === 1 ? 50 : 8 + (index / (data.length - 1)) * 84
  const yFor = (value: number) => 76 - ((value - minValue) / range) * 54

  return (
    <div className="chart-wrap combined-chart">
      <div className="metric-legend">{keys.map((metric) => <span key={metric}><i style={{ background: colors[metric] }} /><strong>{metricLabels[metric]}</strong><em>{data.at(-1)?.[metric]}{metricUnits[metric]}</em></span>)}</div>
      <svg className="line-chart" viewBox="0 0 100 92" preserveAspectRatio="none" role="img" aria-label="Weight, skeletal muscle, and body fat change graph">
        {[22, 49, 76].map((y) => <line key={y} x1="4" y1={y} x2="96" y2={y} className="grid-line" />)}
        {keys.map((metric) => {
          const points = data.map((record, index) => {
            const change = ((record[metric] - data[0][metric]) / data[0][metric]) * 100
            return { x: xFor(index), y: yFor(change), value: record[metric], change }
          })
          const line = points.map((point, index) => `${index ? 'L' : 'M'} ${point.x} ${point.y}`).join(' ')
          return <g key={metric}><path d={line} fill="none" stroke={colors[metric]} strokeWidth="1.45" vectorEffect="non-scaling-stroke" />{points.map((point, index) => <circle key={data[index].id} cx={point.x} cy={point.y} r="1.5" fill="#191a16" stroke={colors[metric]} strokeWidth="1.1" vectorEffect="non-scaling-stroke"><title>{formatDate(data[index].date)} · {metricLabels[metric]} {point.value}{metricUnits[metric]} · {point.change.toFixed(1)}%</title></circle>)}</g>
        })}
      </svg>
      <div className="chart-labels">{data.map((record) => <span key={record.id}>{formatDate(record.date)}</span>)}</div>
      <p className="chart-note">Each line is normalized to its Sep 30 baseline so different units can be read together.</p>
    </div>
  )
}

function JourneyTimeline({ participant, challenges }: { participant: Participant, challenges: Challenge[] }) {
  const events = [
    ...participant.records.map((record) => ({ type: 'record' as const, date: record.date, record })),
    ...challenges.filter((challenge) => challenge.participantIds.includes(participant.id)).map((challenge) => ({ type: 'challenge' as const, date: challenge.endDate, challenge })),
  ].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 7)

  return (
    <div className="journey-timeline">
      {events.map((event, index) => event.type === 'record' ? (
        <article className="timeline-event" key={`r-${event.record.id}`}>
          <div className="timeline-rail"><span className="timeline-node record-node"><LineChart size={15} /></span>{index < events.length - 1 && <i />}</div>
          <time>{formatDate(event.date, true)}</time>
          <div className="timeline-card"><span className="event-type">BODY CHECK</span><h3>{event.record.note || 'Body record updated'}</h3><div className="record-values"><span>{event.record.weight}<small>kg weight</small></span><span>{event.record.skeletalMuscle}<small>kg muscle</small></span><span>{event.record.bodyFat}<small>% body fat</small></span></div></div>
        </article>
      ) : (
        <article className="timeline-event" key={`c-${event.challenge.id}`}>
          <div className="timeline-rail"><span className={`timeline-node challenge-node ${event.challenge.status}`}><Trophy size={15} /></span>{index < events.length - 1 && <i />}</div>
          <time>{formatDate(event.date, true)}</time>
          <div className="timeline-card challenge-event"><span className="event-type">{event.challenge.edition} · MONTHLY PACT</span><h3>{event.challenge.title}</h3><p>{event.challenge.subtitle}</p><ChallengeResult challenge={event.challenge} participantId={participant.id} /></div>
        </article>
      ))}
    </div>
  )
}

function ChallengeResult({ challenge, participantId }: { challenge: Challenge, participantId: string }) {
  const goal = challenge.goals.find((item) => item.participantId === participantId)
  if (!goal) return null
  if (challenge.status !== 'completed') return <span className="result-pill active"><Clock3 size={13} /> {goal.title}</span>
  return <span className={`result-pill ${goal.result ? 'success' : 'missed'}`}>{goal.result ? <CheckCircle2 size={13} /> : <X size={13} />}{goal.result ? 'Goal achieved' : 'Goal missed'} · {goal.title}</span>
}

function ChallengesPage({ challenges, participants, selectedChallengeId }: { challenges: Challenge[], participants: Participant[], selectedChallengeId: string }) {
  const [filter, setFilter] = useState<'all' | ChallengeStatus>('all')
  const [selectedId, setSelectedId] = useState(selectedChallengeId)
  const visible = filter === 'all' ? challenges : challenges.filter((challenge) => challenge.status === filter)
  const selected = challenges.find((challenge) => challenge.id === selectedId) ?? challenges[0]

  useEffect(() => setSelectedId(selectedChallengeId), [selectedChallengeId])

  return (
    <div className="page challenges-page">
      <section className="page-intro">
        <div><span className="eyebrow">MONTHLY PACTS</span><h1>Every month<br /><em>leaves a mark.</em></h1></div>
        <p>Set the next challenge, work the current one,<br />and keep an honest record of every result.</p>
      </section>
      <div className="challenge-filters segmented-control">
        {([['all', 'All'], ['upcoming', 'Upcoming'], ['active', 'Active'], ['completed', 'Complete']] as const).map(([value, label]) => <button className={filter === value ? 'active' : ''} onClick={() => setFilter(value)} key={value}>{label}</button>)}
      </div>
      <section className="challenge-layout">
        <div className="challenge-list">
          {visible.map((challenge) => <ChallengeListCard challenge={challenge} selected={challenge.id === selected.id} onClick={() => setSelectedId(challenge.id)} key={challenge.id} />)}
        </div>
        <ChallengeDetail challenge={selected} participants={participants} />
      </section>
    </div>
  )
}

function ChallengeListCard({ challenge, selected, onClick }: { challenge: Challenge, selected: boolean, onClick: () => void }) {
  return (
    <button className={`challenge-list-card ${selected ? 'selected' : ''}`} onClick={onClick}>
      <div className="challenge-list-top"><span>{challenge.edition}</span><StatusBadge status={challenge.status} /></div>
      <h2>{challenge.title}</h2><p>{challenge.subtitle}</p>
      <div className="challenge-meta"><span><CalendarDays size={14} /> {formatDate(challenge.startDate)} — {formatDate(challenge.endDate)}</span><span><UserRound size={14} /> {challenge.participantIds.length} owner</span></div>
    </button>
  )
}

function ChallengeDetail({ challenge, participants }: { challenge: Challenge, participants: Participant[] }) {
  return (
    <article className="challenge-detail">
      <div className="detail-head"><div><span className="eyebrow">{challenge.edition}</span><h2>{challenge.title}</h2><p>{challenge.subtitle}</p></div><StatusBadge status={challenge.status} /></div>
      <div className="detail-rule"><Trophy size={20} /><div><span>THE STAKE</span><strong>{challenge.reward}</strong></div></div>
      <h3 className="detail-subtitle">OWNER AND TARGET</h3>
      <div className="challenge-goals">
        {challenge.goals.map((item) => {
          const person = participants.find((candidate) => candidate.id === item.participantId)!
          const currentProgress = displayProgress(person.goal)
          return (
            <div className="challenge-goal-row" key={item.participantId}>
              <Avatar person={person} size="small" />
              <div><strong>{person.name}</strong><span>{item.title}</span></div>
              {challenge.status === 'completed' ? <span className={`outcome ${item.result ? 'success' : 'missed'}`}>{item.result ? <Check size={14} /> : <Minus size={14} />}{item.result ? 'Achieved' : 'Missed'}</span> : challenge.status === 'active' ? <span className="outcome progress">{currentProgress}%</span> : <span className="outcome pending">Planned</span>}
            </div>
          )
        })}
      </div>
      <div className="date-range"><span>{formatDate(challenge.startDate, true)}</span><div><i /></div><span>{formatDate(challenge.endDate, true)}</span></div>
    </article>
  )
}

function StatusBadge({ status }: { status: ChallengeStatus }) {
  const labels = { upcoming: 'Upcoming', active: 'Active', completed: 'Complete' }
  return <span className={`status-badge ${status}`}>{status === 'active' && <span className="live-dot" />}{labels[status]}</span>
}

function Avatar({ person, size = 'default' }: { person: Participant, size?: 'small' | 'default' | 'large' }) {
  return <span className={`avatar avatar-${size}`} style={{ '--accent': person.accent } as React.CSSProperties}>{person.initials}</span>
}

function BottomNav({ view, onNavigate, onAdd }: { view: View, onNavigate: (view: View) => void, onAdd: () => void }) {
  return (
    <nav className="bottom-nav" aria-label="Mobile navigation">
      <button className={view === 'squad' ? 'active' : ''} onClick={() => onNavigate('squad')}><Home /><span>Squad</span></button>
      <button className={view === 'journey' ? 'active' : ''} onClick={() => onNavigate('journey')}><UserRound /><span>My Log</span></button>
      <button className="add-button" onClick={onAdd} aria-label="Add record"><Plus /></button>
      <button className={view === 'challenges' ? 'active' : ''} onClick={() => onNavigate('challenges')}><Trophy /><span>Challenges</span></button>
      <button onClick={() => onNavigate('squad')}><Menu /><span>More</span></button>
    </nav>
  )
}

function Modal({ title, eyebrow, onClose, children }: { title: string, eyebrow: string, onClose: () => void, children: ReactNode }) {
  useEffect(() => {
    const listener = (event: KeyboardEvent) => event.key === 'Escape' && onClose()
    document.addEventListener('keydown', listener)
    document.body.classList.add('modal-open')
    return () => { document.removeEventListener('keydown', listener); document.body.classList.remove('modal-open') }
  }, [onClose])
  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="modal" role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-header"><div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2></div><button className="icon-button" onClick={onClose} aria-label="Close"><X /></button></div>
        {children}
      </section>
    </div>
  )
}

function RecordModal({ participant, onClose, onSave }: { participant: Participant, onClose: () => void, onSave: (record: BodyRecord) => void }) {
  const latest = participant.records.at(-1)!
  const [form, setForm] = useState({ date: '2026-10-24', weight: `${latest.weight}`, skeletalMuscle: `${latest.skeletalMuscle}`, bodyFat: `${latest.bodyFat}`, note: '' })

  function submit(event: FormEvent) {
    event.preventDefault()
    onSave({ id: `record-${Date.now()}`, date: form.date, weight: Number(form.weight), skeletalMuscle: Number(form.skeletalMuscle), bodyFat: Number(form.bodyFat), note: form.note.trim() || 'New body scan' })
  }

  return (
    <Modal title="Add body record" eyebrow={`${participant.name} · BODY LOG`} onClose={onClose}>
      <form onSubmit={submit}>
        <label className="form-field full"><span>Measurement date</span><input type="date" required value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} /></label>
        <div className="form-grid-three">
          <NumberField label="Weight" unit="kg" value={form.weight} onChange={(value) => setForm({ ...form, weight: value })} />
          <NumberField label="Skeletal muscle" unit="kg" value={form.skeletalMuscle} onChange={(value) => setForm({ ...form, skeletalMuscle: value })} />
          <NumberField label="Body fat" unit="%" value={form.bodyFat} onChange={(value) => setForm({ ...form, bodyFat: value })} />
        </div>
        <label className="form-field full"><span>Training note <small>optional</small></span><textarea placeholder="Condition, training details, or what changed today." value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} /></label>
        <p className="form-notice"><Lock size={14} /> This information stays in this browser.</p>
        <div className="modal-actions"><button type="button" className="button button-secondary" onClick={onClose}>Cancel</button><button className="button button-primary" type="submit">Save record <ArrowRight size={17} /></button></div>
      </form>
    </Modal>
  )
}

function NumberField({ label, unit, value, onChange }: { label: string, unit: string, value: string, onChange: (value: string) => void }) {
  return <label className="form-field"><span>{label}</span><div className="input-with-unit"><input type="number" step="0.1" min="0" required value={value} onChange={(event) => onChange(event.target.value)} /><em>{unit}</em></div></label>
}

function GoalModal({ participant, onClose, onSave }: { participant: Participant, onClose: () => void, onSave: (title: string, goal: Goal) => void }) {
  const [title, setTitle] = useState(participant.goalTitle)
  const [goal, setGoal] = useState<Goal>(participant.goal)

  function submit(event: FormEvent) {
    event.preventDefault()
    onSave(title, goal)
  }

  return (
    <Modal title="Edit goal progress" eyebrow={`${participant.name} · CURRENT TARGET`} onClose={onClose}>
      <form onSubmit={submit}>
        <label className="form-field full"><span>Goal name</span><input value={title} required onChange={(event) => setTitle(event.target.value)} /></label>
        <div className="goal-type-readonly"><Target size={18} /><div><span>Goal format</span><strong>{goalKindLabel(goal)}</strong></div><small>The format stays fixed during an active challenge.</small></div>
        {goal.type === 'numeric' && <div className="form-grid-two"><NumberField label="Current value" unit={goal.unit} value={`${goal.current}`} onChange={(value) => setGoal({ ...goal, current: Number(value) })} /><NumberField label="Target value" unit={goal.unit} value={`${goal.target}`} onChange={(value) => setGoal({ ...goal, target: Number(value) })} /></div>}
        {goal.type === 'checkpoint' && (
          <div className="checkpoint-edit"><span>Completed milestones</span>{goal.checkpoints.map((point, index) => <button type="button" className={index < goal.completedCount ? 'done' : ''} onClick={() => setGoal({ ...goal, completedCount: index + 1 === goal.completedCount ? index : index + 1 })} key={point}><span>{index < goal.completedCount && <Check size={13} />}</span>{point}</button>)}</div>
        )}
        {goal.type === 'completion' && <label className="completion-toggle"><input type="checkbox" checked={goal.completed} onChange={(event) => setGoal({ ...goal, completed: event.target.checked })} /><span><CheckCircle2 /> This challenge is complete.</span></label>}
        <div className="modal-actions"><button type="button" className="button button-secondary" onClick={onClose}>Cancel</button><button className="button button-primary" type="submit">Save changes <ArrowRight size={17} /></button></div>
      </form>
    </Modal>
  )
}

export default App
