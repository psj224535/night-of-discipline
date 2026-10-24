import type { AppState } from '../types'

export const demoState: AppState = {
  activeProfileId: 'seongjun',
  participants: [
    {
      id: 'seongjun',
      name: '박성준',
      handle: '@seongjun',
      initials: 'PS',
      role: '복싱 · 웨이트',
      accent: '#d9ff62',
      goalTitle: '골격근량 +1.0kg',
      goal: {
        type: 'numeric', metric: 'skeletalMuscle', start: 34.2, target: 35.2,
        current: 34.8, unit: 'kg', direction: 'increase',
      },
      plans: {
        shortTerm: {
          title: '골격근량 +1.0kg', targetDate: '2026-10-31',
          note: '매주 근력 운동 4회를 채우고 단백질 섭취를 꾸준히 지킨다.',
        },
        longTerm: {
          title: '민첩한 78kg 체형 만들기', targetDate: '2027-03-31',
          note: '복싱 스피드와 체력을 유지하면서 순수 근육량을 늘린다.',
        },
      },
      pledge: '완벽한 하루보다, 빠뜨리지 않은 하루를 만든다.',
      streak: 12,
      lastUpdate: '오늘 · 20:42',
      updateText: '스쿼트 5×5 완료. 마지막 세트가 가장 깔끔했다.',
      cheerCount: 8,
      previousResult: 'success',
      records: [
        { id: 'ps1', date: '2026-09-30', weight: 75.2, skeletalMuscle: 34.2, bodyFat: 16.8, note: '시작점 측정' },
        { id: 'ps2', date: '2026-10-07', weight: 75.4, skeletalMuscle: 34.4, bodyFat: 16.6, note: '운동 후 측정' },
        { id: 'ps3', date: '2026-10-15', weight: 75.7, skeletalMuscle: 34.6, bodyFat: 16.5, note: '꾸준한 상승세' },
        { id: 'ps4', date: '2026-10-23', weight: 75.9, skeletalMuscle: 34.8, bodyFat: 16.3, note: '회복 컨디션 좋음' },
      ],
    },
  ],
  challenges: [
    {
      id: 'sep-26', edition: 'ROUND 09', title: '9월 기본기', subtitle: '기본을 쌓은 한 달',
      startDate: '2026-09-01', endDate: '2026-09-30', status: 'completed', participantIds: ['seongjun'],
      reward: '든든한 회복 식사',
      goals: [{ participantId: 'seongjun', title: '주 4회 근력 운동', result: true }],
    },
    {
      id: 'oct-26', edition: 'ROUND 10', title: '하루도 빠짐없이', subtitle: '완벽보다 꾸준함',
      startDate: '2026-10-01', endDate: '2026-10-31', status: 'active', participantIds: ['seongjun'],
      reward: '11월 운동 종목 선택권',
      goals: [{ participantId: 'seongjun', title: '골격근량 +1.0kg' }],
    },
    {
      id: 'nov-26', edition: 'ROUND 11', title: '겨울 엔진', subtitle: '겨울을 버티는 체력 만들기',
      startDate: '2026-11-01', endDate: '2026-11-30', status: 'upcoming', participantIds: ['seongjun'],
      reward: '새 운동 장비',
      goals: [{ participantId: 'seongjun', title: '목표 설정 전' }],
    },
  ],
}
