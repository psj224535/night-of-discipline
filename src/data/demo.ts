import type { AppState } from '../types'

export const demoState: AppState = {
  activeProfileId: 'seongjun',
  participants: [
    {
      id: 'seongjun', name: '박성준', handle: '@seongjun', initials: 'PS', role: '복싱 · 웨이트', accent: '#d9ff62',
      goalTitle: '골격근량 +1.0kg',
      goal: { type: 'numeric', metric: 'skeletalMuscle', start: 34.2, target: 35.2, current: 34.8, unit: 'kg', direction: 'increase' },
      plans: {
        shortTerm: { title: '골격근량 +1.0kg', targetDate: '2026-10-31', note: '매주 근력 운동 4회를 채우고 단백질 섭취를 꾸준히 지킨다.' },
        longTerm: { title: '민첩한 78kg 체형 만들기', targetDate: '2027-03-31', note: '복싱 스피드와 체력을 유지하면서 순수 근육량을 늘린다.' },
      },
      pledge: '완벽한 하루보다, 빠뜨리지 않은 하루를 만든다.',
      nextChallengeProposal: '턱걸이 최대 15개 달성',
      streak: 12, lastUpdate: '오늘 · 20:42', updateText: '스쿼트 5×5 완료. 마지막 세트가 가장 깔끔했다.', cheerCount: 8, previousResult: 'first',
      records: [
        { id: 'ps1', date: '2026-09-30', weight: 75.2, skeletalMuscle: 34.2, bodyFat: 16.8, note: '시작점 측정' },
        { id: 'ps2', date: '2026-10-07', weight: 75.4, skeletalMuscle: 34.4, bodyFat: 16.6, note: '운동 후 측정' },
        { id: 'ps3', date: '2026-10-15', weight: 75.7, skeletalMuscle: 34.6, bodyFat: 16.5, note: '꾸준한 상승세' },
        { id: 'ps4', date: '2026-10-23', weight: 75.9, skeletalMuscle: 34.8, bodyFat: 16.3, note: '회복 컨디션 좋음' },
      ],
    },
    {
      id: 'jaewoo', name: '김재우', handle: '@jaewoo', initials: 'KJ', role: '러닝 · 웨이트', accent: '#7dd3fc',
      goalTitle: '체지방률 -1.5%',
      goal: { type: 'numeric', metric: 'bodyFat', start: 22.4, target: 20.9, current: 21.7, unit: '%', direction: 'decrease' },
      plans: {
        shortTerm: { title: '주 4회 운동 루틴', targetDate: '2026-10-31', note: '근력 운동 3회와 5km 러닝 1회를 매주 채운다.' },
        longTerm: { title: '체지방률 18% 진입', targetDate: '2027-03-31', note: '무리한 감량 없이 운동 수행력을 유지하며 천천히 감량한다.' },
      },
      pledge: '시작이 늦어도 오늘 할 몫은 오늘 끝낸다.',
      nextChallengeProposal: '한 달 운동 출석률 90% 달성',
      streak: 5, lastUpdate: '어제 · 21:10', updateText: '5km 러닝 후 하체 스트레칭까지 완료했다.', cheerCount: 5, previousResult: 'first',
      records: [
        { id: 'kj1', date: '2026-09-30', weight: 81.3, skeletalMuscle: 33.1, bodyFat: 22.4, note: '첫 기록' },
        { id: 'kj2', date: '2026-10-07', weight: 80.9, skeletalMuscle: 33.2, bodyFat: 22.1, note: '러닝 루틴 시작' },
        { id: 'kj3', date: '2026-10-15', weight: 80.5, skeletalMuscle: 33.2, bodyFat: 21.9, note: '식단 유지' },
        { id: 'kj4', date: '2026-10-23', weight: 80.2, skeletalMuscle: 33.3, bodyFat: 21.7, note: '주간 목표 완료' },
      ],
    },
    {
      id: 'hyunjae', name: '조현재', handle: '@hyunjae', initials: 'JH', role: '크로스핏 · 러닝', accent: '#ffbd66',
      goalTitle: '체지방률 -2.0%',
      goal: { type: 'numeric', metric: 'bodyFat', start: 19.6, target: 17.6, current: 18.7, unit: '%', direction: 'decrease' },
      plans: {
        shortTerm: { title: '체지방률 -2.0%', targetDate: '2026-10-31', note: '주 4회 운동과 야식 없는 평일을 함께 지킨다.' },
        longTerm: { title: '10km 55분 완주', targetDate: '2027-04-30', note: '주간 러닝 거리를 조금씩 늘리며 체력을 만든다.' },
      },
      pledge: '무리하지 않되, 정한 횟수는 반드시 채운다.',
      nextChallengeProposal: '골격근량 +0.5kg와 체지방 유지',
      streak: 9, lastUpdate: '오늘 · 19:18', updateText: '크로스핏 와드와 코어 운동을 마쳤다.', cheerCount: 7, previousResult: 'first',
      records: [
        { id: 'jh1', date: '2026-09-30', weight: 72.8, skeletalMuscle: 32.6, bodyFat: 19.6, note: '9월 측정' },
        { id: 'jh2', date: '2026-10-07', weight: 72.5, skeletalMuscle: 32.7, bodyFat: 19.3, note: '유산소 추가' },
        { id: 'jh3', date: '2026-10-15', weight: 72.2, skeletalMuscle: 32.7, bodyFat: 19.0, note: '회복 상태 양호' },
        { id: 'jh4', date: '2026-10-23', weight: 71.9, skeletalMuscle: 32.8, bodyFat: 18.7, note: '꾸준한 감량' },
      ],
    },
    {
      id: 'taemin', name: '안태민', handle: '@taemin', initials: 'AT', role: '웨이트 · 수영', accent: '#c4a7ff',
      goalTitle: '골격근량 +1.0kg',
      goal: { type: 'numeric', metric: 'skeletalMuscle', start: 32.8, target: 33.8, current: 33.3, unit: 'kg', direction: 'increase' },
      plans: {
        shortTerm: { title: '골격근량 +1.0kg', targetDate: '2026-10-31', note: '주 4회 웨이트와 수면 7시간을 우선한다.' },
        longTerm: { title: '벤치프레스 100kg', targetDate: '2027-05-31', note: '부상 없이 볼륨과 강도를 단계적으로 올린다.' },
      },
      pledge: '기록이 흔들려도 루틴은 흔들리지 않게 한다.',
      nextChallengeProposal: '체지방률 -1.5% 감량',
      streak: 7, lastUpdate: '오늘 · 18:30', updateText: '등 운동 20세트와 가벼운 수영을 완료했다.', cheerCount: 6, previousResult: 'first',
      records: [
        { id: 'at1', date: '2026-09-30', weight: 73.9, skeletalMuscle: 32.8, bodyFat: 18.2, note: '시작점 측정' },
        { id: 'at2', date: '2026-10-07', weight: 74.1, skeletalMuscle: 33.0, bodyFat: 18.1, note: '훈련량 증가' },
        { id: 'at3', date: '2026-10-15', weight: 74.4, skeletalMuscle: 33.1, bodyFat: 18.0, note: '중간 점검' },
        { id: 'at4', date: '2026-10-23', weight: 74.7, skeletalMuscle: 33.3, bodyFat: 17.9, note: '근육량 상승' },
      ],
    },
    {
      id: 'yuchan', name: '정유찬', handle: '@yuchan', initials: 'JY', role: '러닝 · 클라이밍', accent: '#ff8fb3',
      goalTitle: '체지방률 -2.0%',
      goal: { type: 'numeric', metric: 'bodyFat', start: 18.8, target: 16.8, current: 17.9, unit: '%', direction: 'decrease' },
      plans: {
        shortTerm: { title: '체지방률 -2.0%', targetDate: '2026-10-31', note: '주 3회 러닝과 2회 클라이밍으로 활동량을 유지한다.' },
        longTerm: { title: '하프 마라톤 완주', targetDate: '2027-04-30', note: '월별 장거리 러닝을 늘리고 부상 방지 운동을 병행한다.' },
      },
      pledge: '컨디션에 맞게 강도는 바꿔도 운동은 건너뛰지 않는다.',
      nextChallengeProposal: '5km 27분 이내 완주',
      streak: 10, lastUpdate: '오늘 · 07:45', updateText: '아침 러닝 4km를 가볍게 마쳤다.', cheerCount: 9, previousResult: 'first',
      records: [
        { id: 'jy1', date: '2026-09-30', weight: 69.7, skeletalMuscle: 31.8, bodyFat: 18.8, note: '기준 기록' },
        { id: 'jy2', date: '2026-10-07', weight: 69.4, skeletalMuscle: 31.9, bodyFat: 18.5, note: '러닝 주간' },
        { id: 'jy3', date: '2026-10-15', weight: 69.1, skeletalMuscle: 31.9, bodyFat: 18.2, note: '클라이밍 병행' },
        { id: 'jy4', date: '2026-10-23', weight: 68.9, skeletalMuscle: 32.0, bodyFat: 17.9, note: '감량 흐름 유지' },
      ],
    },
  ],
  challenges: [
    {
      id: 'sep-26', edition: 'ROUND 09', title: '첫 번째 체성분 내기', subtitle: '각자의 숫자에 정면으로 도전한 한 달',
      startDate: '2026-09-01', endDate: '2026-09-30', status: 'completed',
      participantIds: ['seongjun', 'hyunjae', 'taemin', 'yuchan'], reward: '함께하는 회복 식사',
      goals: [
        { participantId: 'seongjun', title: '골격근량 +1.0kg' },
        { participantId: 'hyunjae', title: '체지방률 -2.0%' },
        { participantId: 'taemin', title: '골격근량 +1.0kg' },
        { participantId: 'yuchan', title: '체지방률 -2.0%' },
      ],
    },
    {
      id: 'oct-26', edition: 'ROUND 10', title: '하루도 빠짐없이', subtitle: '완벽보다 꾸준함',
      startDate: '2026-10-01', endDate: '2026-10-31', status: 'active',
      participantIds: ['seongjun', 'jaewoo', 'hyunjae', 'taemin', 'yuchan'], reward: '다음 라운드 종목 선택권',
      goals: [
        { participantId: 'seongjun', title: '골격근량 +1.0kg' },
        { participantId: 'jaewoo', title: '체지방률 -1.5%' },
        { participantId: 'hyunjae', title: '체지방률 -2.0%' },
        { participantId: 'taemin', title: '골격근량 +1.0kg' },
        { participantId: 'yuchan', title: '체지방률 -2.0%' },
      ],
    },
    {
      id: 'nov-26', edition: 'ROUND 11', title: '다음 내기 제안', subtitle: '각자 제안한 다음 도전',
      startDate: '2026-11-01', endDate: '2026-11-30', status: 'upcoming',
      participantIds: ['seongjun', 'jaewoo', 'hyunjae', 'taemin', 'yuchan'], reward: '새 운동 장비',
      goals: [
        { participantId: 'seongjun', title: '턱걸이 최대 15개 달성' },
        { participantId: 'jaewoo', title: '한 달 운동 출석률 90% 달성' },
        { participantId: 'hyunjae', title: '골격근량 +0.5kg와 체지방 유지' },
        { participantId: 'taemin', title: '체지방률 -1.5% 감량' },
        { participantId: 'yuchan', title: '5km 27분 이내 완주' },
      ],
    },
  ],
}
