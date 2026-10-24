import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import {
  Activity, ArrowLeft, ArrowRight, Award, CalendarDays, Check, CheckCircle2, ChevronDown,
  CircleDot, Clock3, Dumbbell, Flame, Gauge, Heart, History, Home, LineChart, Lock,
  Medal, Menu, MessageCircle, Minus, Plus, RotateCcw, Scale, Sparkles, Target, TrendingDown,
  TrendingUp, Trophy, UserRound, Users, X, Zap,
} from 'lucide-react'
import { demoState } from './data/demo'
import { displayProgress, goalKindLabel, progressLabel } from './lib/progress'
import type { AppState, BodyRecord, Challenge, ChallengeStatus, Goal, Participant, View } from './types'

const STORAGE_KEY = 'night-of-discipline:v1'

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
  const [state, setState] = useState<AppState>(loadState)
  const [view, setView] = useState<View>('squad')
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
        updateText: `${formatDate(record.date)} 인바디 기록을 추가했습니다.`,
      }
    })
    setRecordOpen(false)
    setToast('새 기록이 로컬에 저장되었습니다.')
  }

  function updateGoal(title: string, goal: Goal) {
    updateParticipant(activeProfile.id, (person) => ({
      ...person,
      goalTitle: title,
      goal,
      lastUpdate: '방금 전',
      updateText: '현재 목표 진행 상황을 업데이트했습니다.',
    }))
    setGoalOpen(false)
    setToast('목표가 업데이트되었습니다.')
  }

  function cheer(id: string) {
    updateParticipant(id, (person) => ({ ...person, cheerCount: person.cheerCount + 1 }))
    setToast('응원을 보냈습니다. 오늘도 같이 갑니다!')
  }

  function resetDemo() {
    setState(cloneDemo())
    setMenuOpen(false)
    setToast('데모 데이터를 처음 상태로 되돌렸습니다.')
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
      />

      <main>
        {view === 'squad' && (
          <SquadPage
            participants={state.participants}
            challenges={state.challenges}
            onCheer={cheer}
            onOpenProfile={(id) => {
              setState((current) => ({ ...current, activeProfileId: id }))
              showView('journey')
            }}
            onViewChallenges={() => showView('challenges')}
          />
        )}
        {view === 'journey' && (
          <JourneyPage
            participant={activeProfile}
            participants={state.participants}
            challenges={state.challenges}
            onSelectProfile={(id) => setState((current) => ({ ...current, activeProfileId: id }))}
            onAddRecord={() => setRecordOpen(true)}
            onEditGoal={() => setGoalOpen(true)}
          />
        )}
        {view === 'challenges' && (
          <ChallengesPage challenges={state.challenges} participants={state.participants} />
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
  view, activeProfile, onNavigate, onOpenRecord, menuOpen, setMenuOpen, onReset,
}: {
  view: View
  activeProfile: Participant
  onNavigate: (view: View) => void
  onOpenRecord: () => void
  menuOpen: boolean
  setMenuOpen: (open: boolean) => void
  onReset: () => void
}) {
  return (
    <header className="topbar">
      <button className="brand" onClick={() => onNavigate('squad')} aria-label="스쿼드 홈으로">
        <span className="brand-mark"><span>N</span></span>
        <span className="brand-type"><strong>NIGHT OF</strong><strong>DISCIPLINE</strong></span>
      </button>
      <nav className="desktop-nav" aria-label="주요 메뉴">
        <NavButton active={view === 'squad'} onClick={() => onNavigate('squad')}>스쿼드</NavButton>
        <NavButton active={view === 'journey'} onClick={() => onNavigate('journey')}>나의 기록</NavButton>
        <NavButton active={view === 'challenges'} onClick={() => onNavigate('challenges')}>월간 내기</NavButton>
      </nav>
      <div className="top-actions">
        <span className="local-badge"><Lock size={13} /> 이 기기에 저장됨</span>
        <button className="button button-primary desktop-only" onClick={onOpenRecord}><Plus size={17} /> 기록 추가</button>
        <button className="avatar-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="프로필 메뉴" aria-expanded={menuOpen}>
          <Avatar person={activeProfile} size="small" />
          <ChevronDown size={15} />
        </button>
        {menuOpen && (
          <div className="profile-menu">
            <div><strong>{activeProfile.name}</strong><span>{activeProfile.handle}</span></div>
            <button onClick={onReset}><RotateCcw size={15} /> 데모 데이터 초기화</button>
          </div>
        )}
      </div>
    </header>
  )
}

function NavButton({ active, children, onClick }: { active: boolean, children: ReactNode, onClick: () => void }) {
  return <button className={active ? 'active' : ''} onClick={onClick}>{children}</button>
}

function SquadPage({
  participants, challenges, onCheer, onOpenProfile, onViewChallenges,
}: {
  participants: Participant[]
  challenges: Challenge[]
  onCheer: (id: string) => void
  onOpenProfile: (id: string) => void
  onViewChallenges: () => void
}) {
  const active = challenges.find((challenge) => challenge.status === 'active')!
  const average = Math.round(participants.reduce((sum, person) => sum + Math.min(100, displayProgress(person.goal)), 0) / participants.length)
  const remaining = Math.max(0, Math.ceil((new Date(`${active.endDate}T23:59:59`).getTime() - new Date('2026-10-24T12:00:00').getTime()) / 86400000))

  return (
    <div className="page squad-page">
      <section className="hero hero-grid">
        <div className="hero-copy">
          <div className="eyebrow"><span className="live-dot" /> OCTOBER · ROUND 10</div>
          <h1>혼자라면 멈췄을<br /><em>오늘을, 같이.</em></h1>
          <p>서로 다른 목표, 같은 한 달. 숫자보다 꾸준함을 보고<br className="desktop-only" /> 매일의 작은 승리를 함께 기록합니다.</p>
          <div className="hero-actions">
            <button className="button button-primary" onClick={onViewChallenges}>이번 내기 보기 <ArrowRight size={18} /></button>
            <span><Flame size={17} /> 스쿼드 최장 연속 <strong>18일</strong></span>
          </div>
        </div>
        <div className="challenge-poster">
          <div className="poster-top"><span>{active.edition}</span><span>ACTIVE</span></div>
          <div className="poster-orbit orbit-one" />
          <div className="poster-orbit orbit-two" />
          <div className="poster-center">
            <span className="poster-kicker">THIS MONTH'S PACT</span>
            <strong>NO<br />ZERO<br /><i>DAYS</i></strong>
            <span className="poster-dates">OCT 01 — OCT 31</span>
          </div>
          <div className="poster-footer"><span>5 DISCIPLINES</span><span>{remaining} DAYS LEFT</span></div>
        </div>
      </section>

      <section className="stat-strip" aria-label="스쿼드 요약">
        <SummaryStat icon={<Users />} value="5" label="함께 도전 중" />
        <SummaryStat icon={<Gauge />} value={`${average}%`} label="평균 달성률" />
        <SummaryStat icon={<Zap />} value="59" label="이번 달 체크인" />
        <SummaryStat icon={<CalendarDays />} value={`D-${remaining}`} label="10월 마감까지" />
      </section>

      <section className="content-section">
        <SectionHeading eyebrow="THE SQUAD" title="각자의 페이스로, 같은 방향으로" description="목표의 크기가 아닌, 각자 출발점에서 나아간 정도를 봅니다." />
        <div className="member-grid">
          {participants.map((person) => (
            <MemberCard key={person.id} person={person} onCheer={() => onCheer(person.id)} onOpen={() => onOpenProfile(person.id)} />
          ))}
        </div>
      </section>

      <section className="content-section two-column-section">
        <div>
          <SectionHeading eyebrow="RECENT MOMENTS" title="오늘의 움직임" compact />
          <div className="activity-list">
            {participants.slice(0, 4).map((person, index) => (
              <article className="activity-row" key={person.id}>
                <Avatar person={person} size="small" />
                <div><strong>{person.name}</strong><p>{person.updateText}</p><span>{person.lastUpdate}</span></div>
                <span className="activity-index">0{index + 1}</span>
              </article>
            ))}
          </div>
        </div>
        <aside className="manifesto-card">
          <span className="eyebrow">SQUAD RULE #01</span>
          <blockquote>“비교는 어제의 나와.<br />응원은 오늘의 우리에게.”</blockquote>
          <div className="manifesto-stamp"><CircleDot size={42} /><span>NOD<br />2026</span></div>
        </aside>
      </section>
    </div>
  )
}

function SummaryStat({ icon, value, label }: { icon: ReactNode, value: string, label: string }) {
  return <div className="summary-stat"><span className="summary-icon">{icon}</span><strong>{value}</strong><span>{label}</span></div>
}

function SectionHeading({ eyebrow, title, description, compact = false }: { eyebrow: string, title: string, description?: string, compact?: boolean }) {
  return (
    <div className={`section-heading ${compact ? 'compact' : ''}`}>
      <span className="eyebrow">{eyebrow}</span>
      <div><h2>{title}</h2>{description && <p>{description}</p>}</div>
    </div>
  )
}

function MemberCard({ person, onCheer, onOpen }: { person: Participant, onCheer: () => void, onOpen: () => void }) {
  const progress = displayProgress(person.goal)
  const checkpointGoal = person.goal.type === 'checkpoint' ? person.goal : null
  return (
    <article className="member-card" style={{ '--accent': person.accent } as React.CSSProperties}>
      <div className="member-top">
        <Avatar person={person} />
        <div className="member-name"><h3>{person.name}</h3><span>{person.role}</span></div>
        <button className="icon-button" aria-label={`${person.name} 기록 보기`} onClick={onOpen}><ArrowRight size={19} /></button>
      </div>
      <span className="goal-kind">{goalKindLabel(person.goal)}</span>
      <h4>{person.goalTitle}</h4>
      <div className="progress-header"><span>{progressLabel(person.goal)}</span><strong>{progress}%</strong></div>
      <div className="progress-track"><span style={{ width: `${clampProgress(progress)}%` }} /></div>
      {checkpointGoal && (
        <div className="checkpoint-dots">
          {checkpointGoal.checkpoints.map((point, index) => <span className={index < checkpointGoal.completedCount ? 'done' : ''} key={point} title={point} />)}
        </div>
      )}
      <div className="member-update"><span className="tiny-pulse" /><p>{person.updateText}</p></div>
      <div className="member-footer">
        <span><Flame size={15} /> {person.streak}일 연속</span>
        <button onClick={onCheer}><Heart size={15} /> 응원 {person.cheerCount}</button>
      </div>
    </article>
  )
}

function JourneyPage({ participant, participants, challenges, onSelectProfile, onAddRecord, onEditGoal }: {
  participant: Participant
  participants: Participant[]
  challenges: Challenge[]
  onSelectProfile: (id: string) => void
  onAddRecord: () => void
  onEditGoal: () => void
}) {
  const latest = participant.records.at(-1)!
  const first = participant.records[0]
  const progress = displayProgress(participant.goal)
  const checkpointGoal = participant.goal.type === 'checkpoint' ? participant.goal : null
  const [metric, setMetric] = useState<keyof Pick<BodyRecord, 'weight' | 'skeletalMuscle' | 'bodyFat'>>('skeletalMuscle')

  return (
    <div className="page journey-page">
      <section className="profile-hero" style={{ '--accent': participant.accent } as React.CSSProperties}>
        <div className="profile-person">
          <Avatar person={participant} size="large" />
          <div>
            <span className="eyebrow">MY DISCIPLINE</span>
            <h1>{participant.name}</h1>
            <p>{participant.role} · <Flame size={15} /> {participant.streak}일 연속 기록 중</p>
          </div>
        </div>
        <label className="profile-switcher">
          <span>프로필 보기</span>
          <select value={participant.id} onChange={(event) => onSelectProfile(event.target.value)}>
            {participants.map((person) => <option value={person.id} key={person.id}>{person.name}</option>)}
          </select>
        </label>
      </section>

      <section className="body-stat-grid">
        <BodyStat label="체중" value={latest.weight} unit="kg" change={latest.weight - first.weight} icon={<Scale />} desired="decrease" />
        <BodyStat label="골격근량" value={latest.skeletalMuscle} unit="kg" change={latest.skeletalMuscle - first.skeletalMuscle} icon={<Dumbbell />} desired="increase" />
        <BodyStat label="체지방률" value={latest.bodyFat} unit="%" change={latest.bodyFat - first.bodyFat} icon={<Activity />} desired="decrease" />
        <button className="add-stat-card" onClick={onAddRecord}><Plus size={23} /><span>새 인바디 기록</span><small>측정값 추가하기</small></button>
      </section>

      <section className="journey-grid">
        <article className="panel goal-panel">
          <div className="panel-header"><div><span className="eyebrow">CURRENT TARGET</span><h2>10월의 목표</h2></div><button className="text-button" onClick={onEditGoal}>수정</button></div>
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
            <div className={`completion-status ${participant.goal.completed ? 'done' : ''}`}><Award size={24} /><div><strong>{participant.goal.completed ? '미션 완료!' : '결전의 날을 준비 중'}</strong><span>{participant.goal.completed ? '약속한 도전을 해냈습니다.' : '완주하는 순간 100%가 됩니다.'}</span></div></div>
          )}
        </article>

        <article className="panel chart-panel">
          <div className="panel-header chart-heading"><div><span className="eyebrow">BODY CHANGE</span><h2>신체 변화</h2></div><div className="segmented-control">
            {(Object.keys(metricLabels) as Array<keyof typeof metricLabels>).map((key) => <button className={metric === key ? 'active' : ''} onClick={() => setMetric(key)} key={key}>{metricLabels[key]}</button>)}
          </div></div>
          <BodyChart records={participant.records} metric={metric} accent={participant.accent} />
        </article>
      </section>

      <section className="content-section timeline-section">
        <SectionHeading eyebrow="THE LONG GAME" title="변화의 타임라인" description="측정 기록과 매달의 도전을 한 흐름으로 확인합니다." />
        <JourneyTimeline participant={participant} challenges={challenges} />
      </section>
    </div>
  )
}

function BodyStat({ label, value, unit, change, icon, desired }: { label: string, value: number, unit: string, change: number, icon: ReactNode, desired: 'increase' | 'decrease' }) {
  const positive = desired === 'increase' ? change >= 0 : change <= 0
  return (
    <article className="body-stat-card">
      <div className="body-stat-label"><span>{icon}</span>{label}</div>
      <div className="body-stat-value"><strong>{value}</strong><span>{unit}</span></div>
      <div className={`body-stat-change ${positive ? 'positive' : 'negative'}`}>{change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />} {signed(change, unit)} <span>첫 기록 대비</span></div>
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

function BodyChart({ records, metric, accent }: { records: BodyRecord[], metric: keyof Pick<BodyRecord, 'weight' | 'skeletalMuscle' | 'bodyFat'>, accent: string }) {
  const data = records.slice(-7)
  const values = data.map((record) => record[metric])
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const points = values.map((value, index) => ({
    x: data.length === 1 ? 50 : 8 + (index / (data.length - 1)) * 84,
    y: 72 - ((value - min) / range) * 48,
    value,
  }))
  const line = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ')
  const area = `${line} L ${points.at(-1)?.x ?? 92} 82 L ${points[0]?.x ?? 8} 82 Z`
  const delta = values.at(-1)! - values[0]

  return (
    <div className="chart-wrap">
      <div className="chart-summary"><strong>{values.at(-1)}{metricUnits[metric]}</strong><span className={delta === 0 ? '' : delta > 0 ? 'up' : 'down'}>{signed(delta, metricUnits[metric])} 기간 변화</span></div>
      <svg className="line-chart" viewBox="0 0 100 92" preserveAspectRatio="none" role="img" aria-label={`${metricLabels[metric]} 변화 그래프`}>
        <defs><linearGradient id={`area-${metric}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={accent} stopOpacity=".28" /><stop offset="1" stopColor={accent} stopOpacity="0" /></linearGradient></defs>
        {[24, 48, 72].map((y) => <line key={y} x1="4" y1={y} x2="96" y2={y} className="grid-line" />)}
        <path d={area} fill={`url(#area-${metric})`} />
        <path d={line} fill="none" stroke={accent} strokeWidth="1.4" vectorEffect="non-scaling-stroke" />
        {points.map((point, index) => <circle key={data[index].id} cx={point.x} cy={point.y} r="1.7" fill="#191a16" stroke={accent} strokeWidth="1.1" vectorEffect="non-scaling-stroke"><title>{formatDate(data[index].date)} {point.value}{metricUnits[metric]}</title></circle>)}
      </svg>
      <div className="chart-labels">{data.map((record) => <span key={record.id}>{formatDate(record.date)}</span>)}</div>
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
          <div className="timeline-card"><span className="event-type">INBODY CHECK</span><h3>{event.record.note || '신체 기록 업데이트'}</h3><div className="record-values"><span>{event.record.weight}<small>kg 체중</small></span><span>{event.record.skeletalMuscle}<small>kg 골격근</small></span><span>{event.record.bodyFat}<small>% 체지방</small></span></div></div>
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
  return <span className={`result-pill ${goal.result ? 'success' : 'missed'}`}>{goal.result ? <CheckCircle2 size={13} /> : <X size={13} />}{goal.result ? '목표 달성' : '아쉬운 마감'} · {goal.title}</span>
}

function ChallengesPage({ challenges, participants }: { challenges: Challenge[], participants: Participant[] }) {
  const [filter, setFilter] = useState<'all' | ChallengeStatus>('all')
  const [selectedId, setSelectedId] = useState(challenges.find((challenge) => challenge.status === 'active')?.id ?? challenges[0].id)
  const visible = filter === 'all' ? challenges : challenges.filter((challenge) => challenge.status === filter)
  const selected = challenges.find((challenge) => challenge.id === selectedId) ?? challenges[0]

  return (
    <div className="page challenges-page">
      <section className="page-intro">
        <div><span className="eyebrow">MONTHLY PACTS</span><h1>우리가 지킨<br /><em>한 달의 약속</em></h1></div>
        <p>다가올 도전을 정하고, 현재를 밀어주고,<br />끝난 달의 결과까지 솔직하게 남깁니다.</p>
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
      <div className="challenge-meta"><span><CalendarDays size={14} /> {formatDate(challenge.startDate)} — {formatDate(challenge.endDate)}</span><span><Users size={14} /> {challenge.participantIds.length}명</span></div>
    </button>
  )
}

function ChallengeDetail({ challenge, participants }: { challenge: Challenge, participants: Participant[] }) {
  return (
    <article className="challenge-detail">
      <div className="detail-head"><div><span className="eyebrow">{challenge.edition}</span><h2>{challenge.title}</h2><p>{challenge.subtitle}</p></div><StatusBadge status={challenge.status} /></div>
      <div className="detail-rule"><Trophy size={20} /><div><span>이번 내기의 약속</span><strong>{challenge.reward}</strong></div></div>
      <h3 className="detail-subtitle">참가자와 개인 목표</h3>
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
    onSave({ id: `record-${Date.now()}`, date: form.date, weight: Number(form.weight), skeletalMuscle: Number(form.skeletalMuscle), bodyFat: Number(form.bodyFat), note: form.note.trim() || '새 인바디 측정' })
  }

  return (
    <Modal title="새 인바디 기록" eyebrow={`${participant.name} · BODY LOG`} onClose={onClose}>
      <form onSubmit={submit}>
        <label className="form-field full"><span>측정일</span><input type="date" required value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} /></label>
        <div className="form-grid-three">
          <NumberField label="체중" unit="kg" value={form.weight} onChange={(value) => setForm({ ...form, weight: value })} />
          <NumberField label="골격근량" unit="kg" value={form.skeletalMuscle} onChange={(value) => setForm({ ...form, skeletalMuscle: value })} />
          <NumberField label="체지방률" unit="%" value={form.bodyFat} onChange={(value) => setForm({ ...form, bodyFat: value })} />
        </div>
        <label className="form-field full"><span>오늘의 메모 <small>선택</small></span><textarea placeholder="컨디션, 운동 내용, 느낀 점을 남겨보세요." value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} /></label>
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
    <Modal title="목표 진행 수정" eyebrow={`${participant.name} · CURRENT TARGET`} onClose={onClose}>
      <form onSubmit={submit}>
        <label className="form-field full"><span>목표 이름</span><input value={title} required onChange={(event) => setTitle(event.target.value)} /></label>
        <div className="goal-type-readonly"><Target size={18} /><div><span>목표 방식</span><strong>{goalKindLabel(goal)}</strong></div><small>진행 중에는 방식이 유지됩니다.</small></div>
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
