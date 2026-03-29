export interface StayInfo {
  id: string;
  nameKey: 'stayHapjeong' | 'stayDeokeun' | 'stayHongdae';
  address: string;
  bldg: string;
  coords: { lat: number; lng: number };
  naverMapUrl: string;
  kakaoMapUrl: string;
  googleMapUrl: string;
  isPreparing?: boolean;
}

export const STAYS: StayInfo[] = [
  {
    id: 'hapjeong',
    nameKey: 'stayHapjeong',
    address: '서울 마포구 양화로 13',
    bldg: '합정스퀘어리버뷰',
    coords: { lat: 37.5489, lng: 126.9123 },
    naverMapUrl: 'https://map.naver.com/p/search/%EC%84%9C%EC%9A%B8%20%EB%A7%88%ED%8F%AC%EA%B5%AC%20%EC%96%91%ED%99%94%EB%A1%9C%2013',
    kakaoMapUrl: 'https://map.kakao.com/link/search/%EC%84%9C%EC%9A%B8%20%EB%A7%88%ED%8F%AC%EA%B5%AC%20%EC%96%91%ED%99%94%EB%A1%9C%2013',
    googleMapUrl: 'https://maps.google.com/maps?q=%EC%84%9C%EC%9A%B8%20%EB%A7%88%ED%8F%AC%EA%B5%AC%20%EC%96%91%ED%99%94%EB%A1%9C%2013&t=&z=15&ie=UTF8&iwloc=&output=embed',
  },
  {
    id: 'deokeun',
    nameKey: 'stayDeokeun',
    address: '경기도 고양시 덕양구 으뜸로 110',
    bldg: '힐스테이트에코덕은',
    coords: { lat: 37.585, lng: 126.865 }, // Approx
    naverMapUrl: 'https://map.naver.com/p/search/%EA%B2%BD%EA%B8%B0%EB%8F%84%20%EA%B3%A0%EC%96%91%EC%8B%9C%20%EB%8D%95%EC%96%91%EA%B5%AC%20%EC%9C%BC%EB%9C%B8%EB%A1%9C%20110',
    kakaoMapUrl: 'https://map.kakao.com/link/search/%EA%B2%BD%EA%B8%B0%EB%8F%84%20%EA%B3%A0%EC%96%91%EC%8B%9C%20%EB%8D%95%EC%96%91%EA%B5%AC%20%EC%9C%BC%EB%9C%B8%EB%A1%9C%20110',
    googleMapUrl: 'https://maps.google.com/maps?q=%EA%B2%BD%EA%B8%B0%EB%8F%84%20%EA%B3%A0%EC%96%91%EC%8B%9C%20%EB%8D%95%EC%96%91%EA%B5%AC%20%EC%9C%BC%EB%9C%B8%EB%A1%9C%20110&t=&z=15&ie=UTF8&iwloc=&output=embed',
  },
  {
    id: 'hongdae',
    nameKey: 'stayHongdae',
    address: '서울 마포구 서교동 (상세주소 예정)',
    bldg: '스테이 홍대',
    coords: { lat: 37.556, lng: 126.923 }, // Approx
    naverMapUrl: 'https://map.naver.com/p/search/%EC%84%9C%EC%9A%B8%20%EB%A7%88%ED%8F%AC%EA%B5%AC%20%EC%84%9C%EA%B5%90%EB%8F%99',
    kakaoMapUrl: 'https://map.kakao.com/link/search/%EC%84%9C%EC%9A%B8%20%EB%A7%88%ED%8F%AC%EA%B5%AC%20%EC%84%9C%EA%B5%90%EB%8F%99',
    googleMapUrl: 'https://maps.google.com/maps?q=%EC%84%9C%EC%9A%B8%20%EB%A7%88%ED%8F%AC%EA%B5%AC%20%EC%84%9C%EA%B5%90%EB%8F%99&t=&z=15&ie=UTF8&iwloc=&output=embed',
    isPreparing: true
  }
];
