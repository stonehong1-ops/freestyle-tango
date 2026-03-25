export interface ClassInfo {
  id: string;
  title: string;
  instructors: string[];
  day: string;
  dates: string[];
  time: string;
  durationMin: number;
  leaders: number;
  followers: number;
  maxLeaders?: number;
  maxFollowers?: number;
  description: string;
  imageUrl: string;
}

export const APRIL_CLASSES: ClassInfo[] = [
  {
    id: 'mon-1',
    title: '아리스의 골반엔진 혁명',
    instructors: ['아리스', '파트너'],
    day: '월요일(Mon)',
    dates: ['4월 7, 14, 21, 28일'],
    time: '19:40-21:00',
    durationMin: 80,
    leaders: 10,
    followers: 8,
    description: "올 봄 아리스쌤의 핵심 키워드는 '골반 거울', '골반 엔진'. 현재 서울, 부산, 창원에서 최고의 인기를 누리고 있는 수업입니다.",
    imageUrl: 'https://images.unsplash.com/photo-1545931701-d8ec28a1b94d?q=80&w=200&h=200&auto=format&fit=crop',
  },
  {
    id: 'tue-1',
    title: '탱고 테크닉 (뮤즈)',
    instructors: ['뮤즈', '민석'],
    day: '화요일(Tue)',
    dates: ['4월 1, 8, 15, 22일'],
    time: '19:40-21:00',
    durationMin: 80,
    leaders: 6,
    followers: 7,
    description: "성숙한 보행과 정교한 테크닉을 위한 특별 클래스입니다. 기초부터 심화까지 세밀하게 티칭합니다.",
    imageUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=200&h=200&auto=format&fit=crop',
  },
  {
    id: 'tue-2',
    title: '리더.팔로어 쇼타임 (스톤)',
    instructors: ['스톤', '제인'],
    day: '화요일(Tue)',
    dates: ['4월 1, 8, 15, 22일'],
    time: '21:10-22:30',
    durationMin: 80,
    leaders: 5,
    followers: 4,
    description: "무대에서 빛나는 탱고를 위한 표현력과 안무 구성을 배웁니다.",
    imageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=200&h=200&auto=format&fit=crop',
  },
  {
    id: 'wed-1',
    title: '리모델링 클래스 (스톤)',
    instructors: ['스톤', '파트너'],
    day: '수요일(Wed)',
    dates: ['4월 2, 9, 16, 23일'],
    time: '19:40-21:00',
    durationMin: 80,
    leaders: 8,
    followers: 10,
    description: "기존의 습관을 버리고 기초부터 다시 쌓아올리는 리모델링 수업입니다.",
    imageUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=200&h=200&auto=format&fit=crop',
  },
  {
    id: 'thu-1',
    title: '파트너 소셜댄스 (커플반)',
    instructors: ['강남스타일', '파트너'],
    day: '목요일(Thu)',
    dates: ['4월 3, 10, 17, 24일'],
    time: '19:40-21:00',
    durationMin: 80,
    leaders: 12,
    followers: 12,
    description: "파티에서 바로 활용 가능한 소셜댄스 실전 테크닉을 배웁니다.",
    imageUrl: 'https://images.unsplash.com/photo-1547153760-18fc86324498?q=80&w=200&h=200&auto=format&fit=crop',
  }
];
