import type { AppState } from '../types'

export const demoState: AppState = {
  activeProfileId: 'jun',
  participants: [
    {
      id: 'jun', name: '박하준', handle: '@hajun', initials: 'HJ', role: '복싱 · 웨이트', accent: '#d9ff62',
      goalTitle: '골격근량 +1.0kg',
      goal: { type: 'numeric', metric: 'skeletalMuscle', start: 34.2, target: 35.2, current: 34.8, unit: 'kg', direction: 'increase' },
      streak: 12, lastUpdate: '오늘 · 20:42', updateText: '스쿼트 5×5 완료. 마지막 세트가 가장 좋았다.', cheerCount: 8,
      previousResult: 'success',
      records: [
        { id: 'jr1', date: '2026-08-31', weight: 74.8, skeletalMuscle: 33.7, bodyFat: 17.1, note: '8월 최종 측정' },
        { id: 'jr2', date: '2026-09-28', weight: 75.2, skeletalMuscle: 34.2, bodyFat: 16.8, note: '9월 목표 달성' },
        { id: 'jr3', date: '2026-10-07', weight: 75.4, skeletalMuscle: 34.4, bodyFat: 16.6, note: '운동 직후 측정' },
        { id: 'jr4', date: '2026-10-15', weight: 75.7, skeletalMuscle: 34.6, bodyFat: 16.5, note: '꾸준히 상승 중' },
        { id: 'jr5', date: '2026-10-23', weight: 75.9, skeletalMuscle: 34.8, bodyFat: 16.3, note: '컨디션 좋음' },
      ],
    },
    {
      id: 'min', name: '김도민', handle: '@domin', initials: 'DM', role: '러닝 · 클라이밍', accent: '#ffbf69',
      goalTitle: '첫 10K 대회 완주',
      goal: { type: 'completion', completed: false },
      streak: 8, lastUpdate: '어제 · 07:18', updateText: '8km 페이스런. 대회까지 컨디션 조절!', cheerCount: 11,
      previousResult: 'missed',
      records: [
        { id: 'dm1', date: '2026-09-04', weight: 68.4, skeletalMuscle: 31.2, bodyFat: 14.8, note: '러닝 블록 시작' },
        { id: 'dm2', date: '2026-10-01', weight: 67.9, skeletalMuscle: 31.1, bodyFat: 14.2, note: '월초 기록' },
        { id: 'dm3', date: '2026-10-20', weight: 67.6, skeletalMuscle: 31.0, bodyFat: 13.9, note: '8km 페이스런' },
      ],
    },
    {
      id: 'seo', name: '이서준', handle: '@seojun', initials: 'SJ', role: '크로스핏', accent: '#83d9ff',
      goalTitle: '체지방률 -2.0%p',
      goal: { type: 'numeric', metric: 'bodyFat', start: 19.4, target: 17.4, current: 18.1, unit: '%', direction: 'decrease' },
      streak: 15, lastUpdate: '오늘 · 06:31', updateText: '아침 WOD 출석. 식단도 계획대로 유지 중.', cheerCount: 14,
      previousResult: 'success',
      records: [
        { id: 'sj1', date: '2026-09-29', weight: 82.1, skeletalMuscle: 36.4, bodyFat: 19.4, note: '10월 시작점' },
        { id: 'sj2', date: '2026-10-10', weight: 81.3, skeletalMuscle: 36.5, bodyFat: 18.7, note: '식단 2주차' },
        { id: 'sj3', date: '2026-10-22', weight: 80.7, skeletalMuscle: 36.6, bodyFat: 18.1, note: '근육량 유지 성공' },
      ],
    },
    {
      id: 'woo', name: '정태우', handle: '@taewoo', initials: 'TW', role: '주짓수', accent: '#c8a8ff',
      goalTitle: '가드 패스 4단계 숙련',
      goal: { type: 'checkpoint', checkpoints: ['기본 동작', '드릴 50회', '스파링 성공', '오픈매트 검증'], completedCount: 2 },
      streak: 6, lastUpdate: '2일 전', updateText: '토레안도 드릴 50회. 다음은 실전 적용.', cheerCount: 9,
      previousResult: 'first',
      records: [
        { id: 'tw1', date: '2026-10-02', weight: 77.3, skeletalMuscle: 35.1, bodyFat: 15.7, note: '월초 측정' },
        { id: 'tw2', date: '2026-10-18', weight: 77.5, skeletalMuscle: 35.4, bodyFat: 15.5, note: '드릴 50회 달성' },
      ],
    },
    {
      id: 'jin', name: '최유진', handle: '@yujin', initials: 'YJ', role: '필라테스 · 수영', accent: '#ff8faf',
      goalTitle: '체중 3.0kg 감량',
      goal: { type: 'numeric', metric: 'weight', start: 63.5, target: 60.5, current: 61.1, unit: 'kg', direction: 'decrease' },
      streak: 18, lastUpdate: '오늘 · 19:05', updateText: '퇴근 후 자유형 1,200m. 이제 목표가 보인다.', cheerCount: 16,
      previousResult: 'success',
      records: [
        { id: 'yj1', date: '2026-09-30', weight: 63.5, skeletalMuscle: 23.8, bodyFat: 28.4, note: '10월 시작점' },
        { id: 'yj2', date: '2026-10-08', weight: 62.7, skeletalMuscle: 23.8, bodyFat: 27.8, note: '수영 주 2회' },
        { id: 'yj3', date: '2026-10-16', weight: 61.9, skeletalMuscle: 23.9, bodyFat: 27.1, note: '페이스 좋음' },
        { id: 'yj4', date: '2026-10-23', weight: 61.1, skeletalMuscle: 24.0, bodyFat: 26.4, note: '목표까지 0.6kg' },
      ],
    },
  ],
  challenges: [
    {
      id: 'sep-26', edition: 'ROUND 09', title: 'SEPTEMBER GROUNDWORK', subtitle: '기본기를 쌓은 30일',
      startDate: '2026-09-01', endDate: '2026-09-30', status: 'completed', participantIds: ['jun', 'min', 'seo', 'jin'], reward: '성수동 고기 회식',
      goals: [
        { participantId: 'jun', title: '주 4회 웨이트', result: true },
        { participantId: 'min', title: '월 80km 러닝', result: false },
        { participantId: 'seo', title: '체지방률 -1%p', result: true },
        { participantId: 'jin', title: '수영 10회', result: true },
      ],
    },
    {
      id: 'oct-26', edition: 'ROUND 10', title: 'NO ZERO DAYS', subtitle: '완벽보다 반복. 10월의 약속',
      startDate: '2026-10-01', endDate: '2026-10-31', status: 'active', participantIds: ['jun', 'min', 'seo', 'woo', 'jin'], reward: '꼴찌가 단체 회식 쏘기',
      goals: [
        { participantId: 'jun', title: '골격근량 +1.0kg' },
        { participantId: 'min', title: '첫 10K 대회 완주' },
        { participantId: 'seo', title: '체지방률 -2.0%p' },
        { participantId: 'woo', title: '가드 패스 4단계 숙련' },
        { participantId: 'jin', title: '체중 3.0kg 감량' },
      ],
    },
    {
      id: 'nov-26', edition: 'ROUND 11', title: 'WINTER ENGINE', subtitle: '겨울을 버티는 체력 만들기',
      startDate: '2026-11-02', endDate: '2026-11-30', status: 'upcoming', participantIds: ['jun', 'min', 'seo', 'woo', 'jin'], reward: '챔피언이 12월 종목 선정',
      goals: [
        { participantId: 'jun', title: '목표 설정 전' }, { participantId: 'min', title: '목표 설정 전' },
        { participantId: 'seo', title: '목표 설정 전' }, { participantId: 'woo', title: '목표 설정 전' },
        { participantId: 'jin', title: '목표 설정 전' },
      ],
    },
  ],
}
