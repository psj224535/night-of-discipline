import type { Goal } from '../types'

export function goalProgress(goal: Goal): number {
  if (goal.type === 'completion') return goal.completed ? 100 : 0

  if (goal.type === 'checkpoint') {
    if (goal.checkpoints.length === 0) return 0
    return (goal.completedCount / goal.checkpoints.length) * 100
  }

  const distance = goal.direction === 'increase'
    ? goal.target - goal.start
    : goal.start - goal.target

  if (distance === 0) return goal.current === goal.target ? 100 : 0

  const travelled = goal.direction === 'increase'
    ? goal.current - goal.start
    : goal.start - goal.current

  return Math.max(0, (travelled / distance) * 100)
}

export function displayProgress(goal: Goal): number {
  return Math.round(goalProgress(goal))
}

export function progressLabel(goal: Goal): string {
  if (goal.type === 'numeric') {
    return `${goal.current}${goal.unit} / ${goal.target}${goal.unit}`
  }
  if (goal.type === 'checkpoint') {
    return `${goal.completedCount} / ${goal.checkpoints.length} checkpoints`
  }
  return goal.completed ? 'Complete' : 'In progress'
}

export function goalKindLabel(goal: Goal): string {
  if (goal.type === 'numeric') return 'Numeric goal'
  if (goal.type === 'checkpoint') return 'Milestone goal'
  return 'Completion goal'
}
