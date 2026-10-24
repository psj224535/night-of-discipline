import type { AppState } from '../types'

export const demoState: AppState = {
  activeProfileId: 'seongjun',
  participants: [
    {
      id: 'seongjun',
      name: 'Park Seongjun',
      handle: '@seongjun',
      initials: 'PS',
      role: 'Boxing · Strength',
      accent: '#d9ff62',
      goalTitle: 'Skeletal muscle +1.0kg',
      goal: {
        type: 'numeric', metric: 'skeletalMuscle', start: 34.2, target: 35.2,
        current: 34.8, unit: 'kg', direction: 'increase',
      },
      plans: {
        shortTerm: {
          title: 'Skeletal muscle +1.0kg', targetDate: '2026-10-31',
          note: 'Hit four strength sessions every week and keep protein intake consistent.',
        },
        longTerm: {
          title: 'Build an athletic 78kg frame', targetDate: '2027-03-31',
          note: 'Add lean mass without losing boxing speed or conditioning.',
        },
      },
      streak: 12,
      lastUpdate: 'Today · 20:42',
      updateText: 'Squat 5×5 complete. The final set was the cleanest one.',
      cheerCount: 8,
      previousResult: 'success',
      records: [
        { id: 'ps1', date: '2026-09-30', weight: 75.2, skeletalMuscle: 34.2, bodyFat: 16.8, note: 'Baseline check' },
        { id: 'ps2', date: '2026-10-07', weight: 75.4, skeletalMuscle: 34.4, bodyFat: 16.6, note: 'Post-training check' },
        { id: 'ps3', date: '2026-10-15', weight: 75.7, skeletalMuscle: 34.6, bodyFat: 16.5, note: 'Steady upward trend' },
        { id: 'ps4', date: '2026-10-23', weight: 75.9, skeletalMuscle: 34.8, bodyFat: 16.3, note: 'Recovery felt strong' },
      ],
    },
  ],
  challenges: [
    {
      id: 'sep-26', edition: 'ROUND 09', title: 'SEPTEMBER GROUNDWORK', subtitle: 'A month built on fundamentals',
      startDate: '2026-09-01', endDate: '2026-09-30', status: 'completed', participantIds: ['seongjun'],
      reward: 'A proper recovery dinner',
      goals: [{ participantId: 'seongjun', title: 'Strength training 4× weekly', result: true }],
    },
    {
      id: 'oct-26', edition: 'ROUND 10', title: 'NO ZERO DAYS', subtitle: 'Consistency over perfection',
      startDate: '2026-10-01', endDate: '2026-10-31', status: 'active', participantIds: ['seongjun'],
      reward: 'Choose the November discipline',
      goals: [{ participantId: 'seongjun', title: 'Skeletal muscle +1.0kg' }],
    },
    {
      id: 'nov-26', edition: 'ROUND 11', title: 'WINTER ENGINE', subtitle: 'Build the engine that carries winter',
      startDate: '2026-11-01', endDate: '2026-11-30', status: 'upcoming', participantIds: ['seongjun'],
      reward: 'A new piece of training gear',
      goals: [{ participantId: 'seongjun', title: 'Goal not set yet' }],
    },
  ],
}
