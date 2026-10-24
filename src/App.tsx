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
    if (!stored) return cloneDemo()
    const parsed = JSON.parse(stored) as AppState
    return {
      ...parsed,
      participants: parsed.participants.map((participant) => ({
        ...participant,
        pledge: participant.pledge ?? demoState.participants[0].pledge,
      })),
    }
  } catch {
    return cloneDemo()
  }
}

const metricLabels = {
  weight: '체중',
  skeletalMuscle: '골격근량',
  bodyFat: '체지방률',
} as const

const metricUnits = { weight: 'kg', skeletalMuscle: 'kg', bodyFat: '%' } as const

function formatDate(date: string, withYear = false) {
  const parsed = new Date(`${date}T12:00:00`)
  return new Intl.DateTimeFormat('ko-KR', {
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
    if (setup && password.length < 8) return setError('비밀번호는 8자 이상 입력해 주세요.')
    if (setup && password !== confirmPassword) return setError('비밀번호가 서로 일치하지 않습니다.')
    setBusy(true)
    try {
      if (setup) await createOwnerAccount(email, password, remember)
      else if (!await signInOwner(email, password, remember)) return setError('이메일 또는 비밀번호가 올바르지 않습니다.')
      onAuthenticated()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '문제가 발생했습니다. 다시 시도해 주세요.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="auth-shell">
      <div className="auth-art">
        <div className="auth-brand"><span className="brand-mark"><span>N</span></span><span className="brand-type"><strong>NIGHT OF</strong><strong>DISCIPLINE</strong></span></div>
        <div className="auth-art-copy"><span className="eyebrow">관리자 전용 · 개인 기록</span><h1>꾸준함은<br /><em>증거를 남긴다.</em></h1><p>신체 변화와 도전, 긴 호흡의 성과를 하나의 개인 훈련 기록에 남깁니다.</p></div>
        <div className="auth-grid-word">NOD</div>
      </div>
      <section className="auth-panel">
        <div className="auth-card">
          <span className="auth-icon"><ShieldCheck /></span>
          <span className="eyebrow">{setup ? '첫 관리자 설정' : '관리자 로그인'}</span>
          <h2>{setup ? '관리자 계정을 만들어 주세요' : '다시 오셨군요, 성준님'}</h2>
          <p>{setup ? '이 기기에서 훈련 기록을 열 수 있는 유일한 계정입니다.' : '개인 훈련 기록을 열려면 로그인해 주세요.'}</p>
          <form onSubmit={submit}>
            <label className="form-field full"><span>관리자 이메일</span><input type="email" autoComplete="email" required placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
            <label className="form-field full"><span>비밀번호</span><div className="password-field"><input type={showPassword ? 'text' : 'password'} autoComplete={setup ? 'new-password' : 'current-password'} required value={password} onChange={(event) => setPassword(event.target.value)} /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}>{showPassword ? <EyeOff /> : <Eye />}</button></div></label>
            {setup && <label className="form-field full"><span>비밀번호 확인</span><input type={showPassword ? 'text' : 'password'} autoComplete="new-password" required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} /></label>}
            <label className="remember-row"><input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} /><span>이 기기에서 로그인 유지</span></label>
            {error && <p className="auth-error" role="alert">{error}</p>}
            <button className="button button-primary auth-submit" disabled={busy}>{busy ? '안전하게 설정 중…' : setup ? '관리자 계정 만들기' : '기록 열기'} <ArrowRight size={17} /></button>
          </form>
          <div className="auth-security"><KeyRound size={15} /><p>비밀번호는 salt를 더한 해시로 저장되며 원문은 저장하지 않습니다.</p></div>
          <small className="auth-caveat">현재는 로컬 MVP 보호 방식입니다. 외부 공개 전에는 서버 인증이 필요합니다.</small>
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
        lastUpdate: '방금 전',
        updateText: `${formatDate(record.date)} 신체 기록을 추가했습니다.`,
      }
    })
    setRecordOpen(false)
    setToast('신체 기록을 이 기기에 저장했습니다.')
  }

  function updateGoal(title: string, goal: Goal) {
    updateParticipant(activeProfile.id, (person) => ({
      ...person,
      goalTitle: title,
      goal,
      lastUpdate: '방금 전',
      updateText: '현재 목표 진행 상황을 수정했습니다.',
    }))
    setGoalOpen(false)
    setToast('목표 진행 상황을 수정했습니다.')
  }

  function updatePlans(shortTerm: PlanGoal, longTerm: PlanGoal) {
    updateParticipant(activeProfile.id, (person) => ({ ...person, plans: { shortTerm, longTerm } }))
    setToast('단기·장기 목표를 저장했습니다.')
  }

  function updatePledge(pledge: string) {
    updateParticipant(activeProfile.id, (person) => ({ ...person, pledge }))
    setToast('이번 다짐을 저장했습니다.')
  }

  function resetDemo() {
    setState(cloneDemo())
    setMenuOpen(false)
    setToast('데모 데이터를 처음 상태로 되돌렸습니다.')
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
            onUpdatePledge={updatePledge}
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
      <button className="brand" onClick={() => onNavigate('squad')} aria-label="스쿼드 홈">
        <span className="brand-mark"><span>N</span></span>
        <span className="brand-type"><strong>NIGHT OF</strong><strong>DISCIPLINE</strong></span>
      </button>
      <nav className="desktop-nav" aria-label="주요 메뉴">
        <NavButton active={view === 'squad'} onClick={() => onNavigate('squad')}>스쿼드</NavButton>
        <NavButton active={view === 'journey'} onClick={() => onNavigate('journey')}>나의 기록</NavButton>
        <NavButton active={view === 'challenges'} onClick={() => onNavigate('challenges')}>월간 내기</NavButton>
      </nav>
      <div className="top-actions">
        <span className="local-badge"><Lock size={13} /> 이 기기에 비공개 저장</span>
        <button className="button button-primary desktop-only" onClick={onOpenRecord}><Plus size={17} /> 기록 추가</button>
        <button className="avatar-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="프로필 메뉴" aria-expanded={menuOpen}>
          <Avatar person={activeProfile} size="small" />
          <ChevronDown size={15} />
        </button>
        {menuOpen && (
          <div className="profile-menu">
            <div><strong>{activeProfile.name}</strong><span>{activeProfile.handle}</span></div>
            <button onClick={onReset}><RotateCcw size={15} /> 데모 데이터 초기화</button>
            <button onClick={onSignOut}><LogOut size={15} /> 로그아웃</button>
          </div>
        )}
      </div>
    </header>
  )
}

function NavButton({ active, children, onClick }: { active: boolean, children: ReactNode, onClick: () => void }) {
  return <button className={active ? 'active' : ''} onClick={onClick}>{children}</button>
}

function SquadPage({ participants, challenges, onOpenProfile, onOpenChallenge, onUpdatePledge }: {
  participants: Participant[]
  challenges: Challenge[]
  onOpenProfile: (id: string) => void
  onOpenChallenge: (id: string) => void
  onUpdatePledge: (pledge: string) => void
}) {
  const active = challenges.find((challenge) => challenge.status === 'active')!
  const remaining = Math.max(0, Math.ceil((new Date(`${active.endDate}T23:59:59`).getTime() - new Date('2026-10-24T12:00:00').getTime()) / 86400000))

  return (
    <div className="page squad-page">
      <section className="squad-intro">
        <div>
          <div className="eyebrow"><span className="live-dot" /> 개인 스쿼드 보드 · 4주차</div>
          <h1>이번 주도,<br /><em>선을 끌어올리자.</em></h1>
          <p>분명한 목표 하나, 솔직한 기록 하나. 매달의 도전이 긴 여정의 새로운 점이 됩니다.</p>
        </div>
        <aside className="round-snapshot">
          <span>{active.edition} · 진행 중</span>
          <strong>{active.title}</strong>
          <p>이번 달 마감까지 {remaining}일 남았습니다.</p>
          <button onClick={() => onOpenChallenge(active.id)}>내기 자세히 보기 <ArrowRight size={16} /></button>
        </aside>
      </section>

      <section className="content-section weekly-board-section">
        <SectionHeading eyebrow="이번 주 보드" title="지금 눈앞의 목표" description="참가자가 늘어나면 사람마다 고유한 색상으로 구분됩니다." />
        <div className="weekly-goal-board">
          {participants.map((person) => <WeeklyGoalCard key={person.id} person={person} onOpen={() => onOpenProfile(person.id)} />)}
          <div className="future-member-slot"><Plus size={20} /><div><strong>다음 스쿼드 멤버</strong><span>새로운 색상과 이번 주 목표가 이곳에 표시됩니다.</span></div></div>
        </div>
      </section>

      <section className="content-section performance-section">
        <SectionHeading eyebrow="긴 여정" title="월간 내기 성과" description="성공한 달은 선을 위로 끌어올립니다. 점에 마우스를 올리면 결과를, 누르면 상세 기록을 볼 수 있습니다." />
        <PerformanceGraph challenges={challenges} participant={participants[0]} onOpenChallenge={onOpenChallenge} />
      </section>

      <section className="content-section squad-bottom-grid">
        <article className="activity-focus">
          <span className="eyebrow">최근 기록</span>
          <div><Avatar person={participants[0]} /><div><strong>{participants[0].name}</strong><p>{participants[0].updateText}</p><span>{participants[0].lastUpdate}</span></div></div>
        </article>
        <PledgeCard pledge={participants[0].pledge} onSave={onUpdatePledge} />
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

function PledgeCard({ pledge, onSave }: { pledge: string, onSave: (pledge: string) => void }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(pledge)

  function save() {
    const next = draft.trim()
    if (!next) return
    onSave(next)
    setEditing(false)
  }

  return (
    <aside className="pledge-card">
      <div className="pledge-head"><span className="eyebrow">이번 다짐</span><button onClick={() => { setDraft(pledge); setEditing(!editing) }} aria-label={editing ? '이번 다짐 편집 취소' : '이번 다짐 수정'}>{editing ? <X size={15} /> : <Pencil size={15} />}</button></div>
      {editing ? <><textarea aria-label="이번 다짐 내용" maxLength={90} value={draft} onChange={(event) => setDraft(event.target.value)} autoFocus /><button className="button pledge-save" disabled={!draft.trim()} onClick={save}><Save size={14} /> 다짐 저장</button></> : <blockquote>“{pledge}”</blockquote>}
    </aside>
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
      <div className="performance-legend"><span><i /> 누적 성과 지수</span><span>시작점: 2026년 9월 30일</span></div>
      <div className="performance-canvas">
        <div className="y-axis"><span>{maxScore}</span><span>{Math.round(maxScore / 2)}</span><span>0</span></div>
        <svg viewBox="0 0 100 92" preserveAspectRatio="none" role="img" aria-label="시간에 따른 누적 내기 성과 그래프">
          <defs><linearGradient id="performance-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#d9ff62" stopOpacity=".22" /><stop offset="1" stopColor="#d9ff62" stopOpacity="0" /></linearGradient></defs>
          {[16, 50, 84].map((y) => <line key={y} x1="6" x2="96" y1={y} y2={y} className="grid-line" />)}
          <path d={area} fill="url(#performance-fill)" />
          <path d={path} fill="none" stroke="#d9ff62" strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
        </svg>
        {points.map((point) => (
          <button className={`performance-node ${point.challenge.status}`} style={{ left: `${point.x}%`, top: `${point.y}%` }} onClick={() => onOpenChallenge(point.challenge.id)} key={point.challenge.id} aria-label={`${point.challenge.title} 상세 보기`}>
            <span />
            <div className="node-tooltip"><small>{point.challenge.edition} · {formatDate(point.challenge.endDate)}</small><strong>{point.challenge.title}</strong><p>{point.challenge.status === 'active' ? `${point.contribution}% 진행 중` : point.result ? '목표 달성 · 성과 +100' : '목표 미달성 · 성과 -25'}</p></div>
          </button>
        ))}
        <div className="x-axis">{points.map((point) => <span style={{ left: `${point.x}%` }} key={point.challenge.id}>{formatDate(point.challenge.endDate)}</span>)}</div>
      </div>
      <div className="performance-footer"><div><span>현재 성과 지수</span><strong>{score}</strong></div><div><span>완료한 라운드</span><strong>{challenges.filter((item) => item.status === 'completed').length}</strong></div><div><span>현재 목표</span><strong>{participant.goalTitle}</strong></div></div>
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
            <span className="eyebrow">나의 훈련</span>
            <h1>{participant.name}</h1>
            <p>{participant.role} · <Flame size={15} /> {participant.streak}일 연속 기록 중</p>
          </div>
        </div>
        <span className="owner-profile-badge"><ShieldCheck size={15} /> 관리자 프로필</span>
      </section>

      <section className={`goal-plans-panel ${editingPlans ? 'editing' : ''}`}>
        <div className="goal-plans-head"><div><span className="eyebrow">목표의 방향</span><h2>단기 목표, 장기 목표</h2><p>오늘 행동할 만큼 가까운 목표와, 방향을 잡아줄 만큼 먼 목표를 함께 세웁니다.</p></div><button className="button button-secondary" onClick={() => { setDraftPlans(participant.plans); setEditingPlans(!editingPlans) }}>{editingPlans ? <X size={16} /> : <Pencil size={16} />}{editingPlans ? '취소' : '편집 모드'}</button></div>
        {editingPlans ? (
          <form className="plan-edit-grid" onSubmit={savePlans}>
            <PlanGoalEditor label="단기 목표" value={draftPlans.shortTerm} onChange={(shortTerm) => setDraftPlans({ ...draftPlans, shortTerm })} />
            <PlanGoalEditor label="장기 목표" value={draftPlans.longTerm} onChange={(longTerm) => setDraftPlans({ ...draftPlans, longTerm })} />
            <div className="plan-save-row"><button className="button button-primary"><Save size={16} /> 두 목표 저장</button></div>
          </form>
        ) : (
          <div className="plan-card-grid"><PlanGoalCard label="다음 체크포인트" goal={participant.plans.shortTerm} index="01" /><PlanGoalCard label="장기 방향" goal={participant.plans.longTerm} index="02" /></div>
        )}
      </section>

      <section className="body-stat-grid">
        <BodyStat label="체중" value={latest.weight} unit="kg" change={latest.weight - first.weight} icon={<Scale />} desired="decrease" />
        <BodyStat label="골격근량" value={latest.skeletalMuscle} unit="kg" change={latest.skeletalMuscle - first.skeletalMuscle} icon={<Dumbbell />} desired="increase" />
        <BodyStat label="체지방률" value={latest.bodyFat} unit="%" change={latest.bodyFat - first.bodyFat} icon={<Activity />} desired="decrease" />
        <button className="add-stat-card" onClick={onAddRecord}><Plus size={23} /><span>신체 기록 추가</span><small>새 측정값 기록하기</small></button>
      </section>

      <section className="journey-grid">
        <article className="panel goal-panel">
          <div className="panel-header"><div><span className="eyebrow">현재 목표</span><h2>10월 목표</h2></div><button className="text-button" onClick={onEditGoal}>진행 수정</button></div>
          <div className="goal-ring-wrap">
            <ProgressRing value={progress} accent={participant.accent} />
            <div><span>{goalKindLabel(participant.goal)}</span><h3>{participant.goalTitle}</h3><p>{progressLabel(participant.goal)}</p></div>
          </div>
          {participant.goal.type === 'numeric' && (
            <div className="goal-scale">
              <span>시작 <strong>{participant.goal.start}{participant.goal.unit}</strong></span>
              <span>현재 <strong>{participant.goal.current}{participant.goal.unit}</strong></span>
              <span>목표 <strong>{participant.goal.target}{participant.goal.unit}</strong></span>
            </div>
          )}
          {checkpointGoal && (
            <ol className="checkpoint-list">
              {checkpointGoal.checkpoints.map((point, index) => <li className={index < checkpointGoal.completedCount ? 'done' : ''} key={point}><span>{index < checkpointGoal.completedCount ? <Check size={13} /> : index + 1}</span>{point}</li>)}
            </ol>
          )}
          {participant.goal.type === 'completion' && (
            <div className={`completion-status ${participant.goal.completed ? 'done' : ''}`}><Award size={24} /><div><strong>{participant.goal.completed ? '미션 완료' : '도전을 준비 중'}</strong><span>{participant.goal.completed ? '약속한 도전을 마쳤습니다.' : '완료하면 목표가 100%가 됩니다.'}</span></div></div>
          )}
        </article>

        <article className="panel chart-panel">
          <div className="panel-header chart-heading"><div><span className="eyebrow">신체 변화</span><h2>세 지표를 한 그래프에</h2></div><span className="normalized-label">시작점 대비 변화율</span></div>
          <CombinedBodyChart records={participant.records} />
        </article>
      </section>

      <section className="content-section timeline-section">
        <SectionHeading eyebrow="긴 여정" title="변화 타임라인" description="신체 측정과 월간 내기를 하나의 흐름으로 확인합니다." />
        <JourneyTimeline participant={participant} challenges={challenges} />
      </section>
    </div>
  )
}

function PlanGoalCard({ label, goal, index }: { label: string, goal: PlanGoal, index: string }) {
  return <article className="plan-goal-card"><span className="plan-index">{index}</span><span className="eyebrow">{label}</span><h3>{goal.title}</h3><p>{goal.note}</p><time><CalendarDays size={14} /> 목표일 · {formatDate(goal.targetDate, true)}</time></article>
}

function PlanGoalEditor({ label, value, onChange }: { label: string, value: PlanGoal, onChange: (goal: PlanGoal) => void }) {
  return (
    <fieldset className="plan-goal-editor">
      <legend>{label}</legend>
      <label className="form-field"><span>목표</span><input required value={value.title} onChange={(event) => onChange({ ...value, title: event.target.value })} /></label>
      <label className="form-field"><span>목표일</span><input type="date" required value={value.targetDate} onChange={(event) => onChange({ ...value, targetDate: event.target.value })} /></label>
      <label className="form-field"><span>실행 계획</span><textarea required value={value.note} onChange={(event) => onChange({ ...value, note: event.target.value })} /></label>
    </fieldset>
  )
}

function BodyStat({ label, value, unit, change, icon, desired }: { label: string, value: number, unit: string, change: number, icon: ReactNode, desired: 'increase' | 'decrease' }) {
  const positive = desired === 'increase' ? change >= 0 : change <= 0
  return (
    <article className="body-stat-card">
      <div className="body-stat-label"><span>{icon}</span>{label}</div>
      <div className="body-stat-value"><strong>{value}</strong><span>{unit}</span></div>
      <div className={`body-stat-change ${positive ? 'positive' : 'negative'}`}>{change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />} {signed(change, unit)} <span>시작점 대비</span></div>
    </article>
  )
}

function ProgressRing({ value, accent }: { value: number, accent: string }) {
  const radius = 44
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - clampProgress(value) / 100)
  return (
    <div className="progress-ring">
      <svg viewBox="0 0 104 104" aria-label={`목표 달성률 ${value}%`}><circle className="ring-bg" cx="52" cy="52" r={radius} /><circle className="ring-value" cx="52" cy="52" r={radius} style={{ stroke: accent, strokeDasharray: circumference, strokeDashoffset: offset }} /></svg>
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
      <svg className="line-chart" viewBox="0 0 100 92" preserveAspectRatio="none" role="img" aria-label="체중, 골격근량, 체지방률 변화 그래프">
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
      <p className="chart-note">단위가 다른 세 지표를 함께 볼 수 있도록 9월 30일 시작점 대비 변화율로 표시합니다.</p>
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
          <div className="timeline-card"><span className="event-type">신체 측정</span><h3>{event.record.note || '신체 기록 업데이트'}</h3><div className="record-values"><span>{event.record.weight}<small>kg 체중</small></span><span>{event.record.skeletalMuscle}<small>kg 골격근</small></span><span>{event.record.bodyFat}<small>% 체지방</small></span></div></div>
        </article>
      ) : (
        <article className="timeline-event" key={`c-${event.challenge.id}`}>
          <div className="timeline-rail"><span className={`timeline-node challenge-node ${event.challenge.status}`}><Trophy size={15} /></span>{index < events.length - 1 && <i />}</div>
          <time>{formatDate(event.date, true)}</time>
          <div className="timeline-card challenge-event"><span className="event-type">{event.challenge.edition} · 월간 내기</span><h3>{event.challenge.title}</h3><p>{event.challenge.subtitle}</p><ChallengeResult challenge={event.challenge} participantId={participant.id} /></div>
        </article>
      ))}
    </div>
  )
}

function ChallengeResult({ challenge, participantId }: { challenge: Challenge, participantId: string }) {
  const goal = challenge.goals.find((item) => item.participantId === participantId)
  if (!goal) return null
  if (challenge.status !== 'completed') return <span className="result-pill active"><Clock3 size={13} /> {goal.title}</span>
  return <span className={`result-pill ${goal.result ? 'success' : 'missed'}`}>{goal.result ? <CheckCircle2 size={13} /> : <X size={13} />}{goal.result ? '목표 달성' : '목표 미달성'} · {goal.title}</span>
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
        <div><span className="eyebrow">월간 내기</span><h1>매달의 도전은<br /><em>흔적을 남긴다.</em></h1></div>
        <p>다음 도전을 정하고, 현재 목표를 밀어붙이고,<br />모든 결과를 솔직하게 기록합니다.</p>
      </section>
      <div className="challenge-filters segmented-control">
        {([['all', '전체'], ['upcoming', '예정'], ['active', '진행 중'], ['completed', '완료']] as const).map(([value, label]) => <button className={filter === value ? 'active' : ''} onClick={() => setFilter(value)} key={value}>{label}</button>)}
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
      <div className="challenge-meta"><span><CalendarDays size={14} /> {formatDate(challenge.startDate)} — {formatDate(challenge.endDate)}</span><span><UserRound size={14} /> {challenge.participantIds.length}명</span></div>
    </button>
  )
}

function ChallengeDetail({ challenge, participants }: { challenge: Challenge, participants: Participant[] }) {
  return (
    <article className="challenge-detail">
      <div className="detail-head"><div><span className="eyebrow">{challenge.edition}</span><h2>{challenge.title}</h2><p>{challenge.subtitle}</p></div><StatusBadge status={challenge.status} /></div>
      <div className="detail-rule"><Trophy size={20} /><div><span>이번 내기의 보상</span><strong>{challenge.reward}</strong></div></div>
      <h3 className="detail-subtitle">참가자와 목표</h3>
      <div className="challenge-goals">
        {challenge.goals.map((item) => {
          const person = participants.find((candidate) => candidate.id === item.participantId)!
          const currentProgress = displayProgress(person.goal)
          return (
            <div className="challenge-goal-row" key={item.participantId}>
              <Avatar person={person} size="small" />
              <div><strong>{person.name}</strong><span>{item.title}</span></div>
              {challenge.status === 'completed' ? <span className={`outcome ${item.result ? 'success' : 'missed'}`}>{item.result ? <Check size={14} /> : <Minus size={14} />}{item.result ? '달성' : '미달성'}</span> : challenge.status === 'active' ? <span className="outcome progress">{currentProgress}%</span> : <span className="outcome pending">예정</span>}
            </div>
          )
        })}
      </div>
      <div className="date-range"><span>{formatDate(challenge.startDate, true)}</span><div><i /></div><span>{formatDate(challenge.endDate, true)}</span></div>
    </article>
  )
}

function StatusBadge({ status }: { status: ChallengeStatus }) {
  const labels = { upcoming: '예정', active: '진행 중', completed: '완료' }
  return <span className={`status-badge ${status}`}>{status === 'active' && <span className="live-dot" />}{labels[status]}</span>
}

function Avatar({ person, size = 'default' }: { person: Participant, size?: 'small' | 'default' | 'large' }) {
  return <span className={`avatar avatar-${size}`} style={{ '--accent': person.accent } as React.CSSProperties}>{person.initials}</span>
}

function BottomNav({ view, onNavigate, onAdd }: { view: View, onNavigate: (view: View) => void, onAdd: () => void }) {
  return (
    <nav className="bottom-nav" aria-label="모바일 메뉴">
      <button className={view === 'squad' ? 'active' : ''} onClick={() => onNavigate('squad')}><Home /><span>스쿼드</span></button>
      <button className={view === 'journey' ? 'active' : ''} onClick={() => onNavigate('journey')}><UserRound /><span>나의 기록</span></button>
      <button className="add-button" onClick={onAdd} aria-label="기록 추가"><Plus /></button>
      <button className={view === 'challenges' ? 'active' : ''} onClick={() => onNavigate('challenges')}><Trophy /><span>월간 내기</span></button>
      <button onClick={() => onNavigate('squad')}><Menu /><span>더보기</span></button>
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
        <div className="modal-header"><div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2></div><button className="icon-button" onClick={onClose} aria-label="닫기"><X /></button></div>
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
    onSave({ id: `record-${Date.now()}`, date: form.date, weight: Number(form.weight), skeletalMuscle: Number(form.skeletalMuscle), bodyFat: Number(form.bodyFat), note: form.note.trim() || '새 신체 측정' })
  }

  return (
    <Modal title="신체 기록 추가" eyebrow={`${participant.name} · 신체 기록`} onClose={onClose}>
      <form onSubmit={submit}>
        <label className="form-field full"><span>측정일</span><input type="date" required value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} /></label>
        <div className="form-grid-three">
          <NumberField label="체중" unit="kg" value={form.weight} onChange={(value) => setForm({ ...form, weight: value })} />
          <NumberField label="골격근량" unit="kg" value={form.skeletalMuscle} onChange={(value) => setForm({ ...form, skeletalMuscle: value })} />
          <NumberField label="체지방률" unit="%" value={form.bodyFat} onChange={(value) => setForm({ ...form, bodyFat: value })} />
        </div>
        <label className="form-field full"><span>운동 메모 <small>선택</small></span><textarea placeholder="컨디션, 운동 내용, 오늘 달라진 점을 남겨보세요." value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} /></label>
        <p className="form-notice"><Lock size={14} /> 입력한 정보는 이 브라우저에만 저장됩니다.</p>
        <div className="modal-actions"><button type="button" className="button button-secondary" onClick={onClose}>취소</button><button className="button button-primary" type="submit">기록 저장 <ArrowRight size={17} /></button></div>
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
    <Modal title="목표 진행 수정" eyebrow={`${participant.name} · 현재 목표`} onClose={onClose}>
      <form onSubmit={submit}>
        <label className="form-field full"><span>목표 이름</span><input value={title} required onChange={(event) => setTitle(event.target.value)} /></label>
        <div className="goal-type-readonly"><Target size={18} /><div><span>목표 방식</span><strong>{goalKindLabel(goal)}</strong></div><small>진행 중인 내기에서는 방식이 유지됩니다.</small></div>
        {goal.type === 'numeric' && <div className="form-grid-two"><NumberField label="현재 값" unit={goal.unit} value={`${goal.current}`} onChange={(value) => setGoal({ ...goal, current: Number(value) })} /><NumberField label="목표 값" unit={goal.unit} value={`${goal.target}`} onChange={(value) => setGoal({ ...goal, target: Number(value) })} /></div>}
        {goal.type === 'checkpoint' && (
          <div className="checkpoint-edit"><span>완료한 체크포인트</span>{goal.checkpoints.map((point, index) => <button type="button" className={index < goal.completedCount ? 'done' : ''} onClick={() => setGoal({ ...goal, completedCount: index + 1 === goal.completedCount ? index : index + 1 })} key={point}><span>{index < goal.completedCount && <Check size={13} />}</span>{point}</button>)}</div>
        )}
        {goal.type === 'completion' && <label className="completion-toggle"><input type="checkbox" checked={goal.completed} onChange={(event) => setGoal({ ...goal, completed: event.target.checked })} /><span><CheckCircle2 /> 이 도전을 완료했습니다.</span></label>}
        <div className="modal-actions"><button type="button" className="button button-secondary" onClick={onClose}>취소</button><button className="button button-primary" type="submit">변경 저장 <ArrowRight size={17} /></button></div>
      </form>
    </Modal>
  )
}

export default App
