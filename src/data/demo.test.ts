import { describe, expect, it } from 'vitest'
import { demoState } from './demo'

describe('owner-only demo state', () => {
  it('contains only Park Seongjun', () => {
    expect(demoState.participants).toHaveLength(1)
    expect(demoState.participants[0].name).toBe('박성준')
    expect(demoState.participants[0].pledge).toBeTruthy()
    expect(demoState.activeProfileId).toBe('seongjun')
  })

  it('starts challenge history on September 30, 2026', () => {
    expect(demoState.challenges[0].endDate).toBe('2026-09-30')
    expect(demoState.challenges.every((challenge) => challenge.participantIds.length === 1)).toBe(true)
  })
})
