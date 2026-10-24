import { describe, expect, it } from 'vitest'
import { demoState } from './demo'

describe('five-person squad demo state', () => {
  it('contains all five squad members with commitments', () => {
    expect(demoState.participants.map((participant) => participant.name)).toEqual(['박성준', '김재우', '조현재', '안태민', '정유찬'])
    expect(demoState.participants.every((participant) => participant.pledge && participant.nextChallengeProposal)).toBe(true)
    expect(demoState.activeProfileId).toBe('seongjun')
  })

  it('stores the requested previous challenge roster and goals', () => {
    const previous = demoState.challenges[0]
    expect(previous.endDate).toBe('2026-09-30')
    expect(previous.participantIds).not.toContain('jaewoo')
    expect(previous.goals).toEqual([
      { participantId: 'seongjun', title: '골격근량 +1.0kg' },
      { participantId: 'hyunjae', title: '체지방률 -2.0%' },
      { participantId: 'taemin', title: '골격근량 +1.0kg' },
      { participantId: 'yuchan', title: '체지방률 -2.0%' },
    ])
  })
})
