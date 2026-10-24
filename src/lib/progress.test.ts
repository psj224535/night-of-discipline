import { describe, expect, it } from 'vitest'
import { goalProgress } from './progress'

describe('goalProgress', () => {
  it('normalizes increasing numeric goals', () => {
    expect(goalProgress({
      type: 'numeric', metric: 'skeletalMuscle', start: 34, target: 35, current: 34.6,
      unit: 'kg', direction: 'increase',
    })).toBeCloseTo(60)
  })

  it('normalizes decreasing numeric goals', () => {
    expect(goalProgress({
      type: 'numeric', metric: 'bodyFat', start: 18, target: 14, current: 15,
      unit: '%', direction: 'decrease',
    })).toBeCloseTo(75)
  })

  it('supports progress beyond 100%', () => {
    expect(goalProgress({
      type: 'numeric', metric: 'weight', start: 80, target: 76, current: 75,
      unit: 'kg', direction: 'decrease',
    })).toBe(125)
  })

  it('normalizes checkpoint goals', () => {
    expect(goalProgress({
      type: 'checkpoint', checkpoints: ['A', 'B', 'C', 'D'], completedCount: 3,
    })).toBe(75)
  })
})
