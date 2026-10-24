export type GoalType = 'numeric' | 'checkpoint' | 'completion'
export type Direction = 'increase' | 'decrease'
export type ChallengeStatus = 'upcoming' | 'active' | 'completed'

export interface NumericGoal {
  type: 'numeric'
  metric: 'weight' | 'skeletalMuscle' | 'bodyFat'
  start: number
  target: number
  current: number
  unit: string
  direction: Direction
}

export interface CheckpointGoal {
  type: 'checkpoint'
  checkpoints: string[]
  completedCount: number
}

export interface CompletionGoal {
  type: 'completion'
  completed: boolean
}

export type Goal = NumericGoal | CheckpointGoal | CompletionGoal

export interface BodyRecord {
  id: string
  date: string
  weight: number
  skeletalMuscle: number
  bodyFat: number
  note: string
}

export interface PlanGoal {
  title: string
  targetDate: string
  note: string
}

export interface Participant {
  id: string
  name: string
  handle: string
  initials: string
  role: string
  accent: string
  goalTitle: string
  goal: Goal
  streak: number
  lastUpdate: string
  updateText: string
  cheerCount: number
  records: BodyRecord[]
  previousResult: 'success' | 'missed' | 'first'
  plans: {
    shortTerm: PlanGoal
    longTerm: PlanGoal
  }
}

export interface ChallengeGoalSnapshot {
  participantId: string
  title: string
  result?: boolean
}

export interface Challenge {
  id: string
  edition: string
  title: string
  subtitle: string
  startDate: string
  endDate: string
  status: ChallengeStatus
  participantIds: string[]
  goals: ChallengeGoalSnapshot[]
  reward: string
}

export interface AppState {
  participants: Participant[]
  challenges: Challenge[]
  activeProfileId: string
}

export type View = 'squad' | 'journey' | 'challenges'
