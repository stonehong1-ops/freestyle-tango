export default {
  header: {
    story: '탱고스테이 스토리',
    location: '숙소 위치',
    guide: '상세 정보',
    contact: '문의하기',
    login: '등록',
    community: '커뮤니티',
    join: '함께하기'
  },
  nav: {
    home: '수업',
    milonga: '밀롱가',
    stay: '스테이',
    class: '수업',
    info: '정보',
    mypage: '마이',
    lucy: '밀롱가',
    chat: '채팅',
    guide: '안내',
    classGuide: '안내',
    fullSchedule: '달력',
    media: '메뉴',
    story: '스토리'
  },

  reserve: {
    closed: '마감되었습니다',
    title: '숙소 예약 신청',
    nameLabel: '예약자 닉네임',
    namePlace: '닉네임을 입력하세요',
    phoneLabel: '연락처',
    phonePlace: '전화번호를 입력하세요',
    guests: '명',
    reqLabel: '요청사항',
    reqPlace: '기타 요청사항이 있다면 입력해주세요 (선택)',
    submitting: '처리 중...',
    submitBtn: '예약완료',
    directBookingWarning: '아래 버튼 클릭하면 예약이 완료됩니다.\n1시간 이내에 입금하시지 않으면 호스트가 예약을 취소합니다.',
    smsTemplate: '[{stayName} 예약확인]\n예약자: {name}님\n날짜: {checkIn} ~ {checkOut}\n인원: {guests}명\n금액: {amount}원\n\n[입금 안내 / Payment]\n1. KR (한국계좌): KakaoBank 3333-03-7249602 (홍병석)\n2. US (미국 Wise): Acc 352665336763211 / Routing: 084009519 (ACH Free)\n3. International: SWIFT/BIC TRWIUS35XXX\n\n[입실 안내]\n시간: 오후 4시\n비밀번호: 9999\n\n감사합니다!',
    errorFill: '닉네임과 연락처를 모두 입력해주세요.',
    errorFail: '예약 신청 중 오류가 발생했습니다. 다시 시도해주세요.',
    save: '저장',
    cancel: '취소'
  },
  complete: {
    title: '예약 신청 완료',
    desc: '예약 신청이 접수되었습니다. 입금 확인 후 확정 문자를 보내드립니다.',
    homeBtn: '홈으로 돌아가기',
    guestSmsBtn: '문자로 문의하기'
  },
  home: {
    studioName: '프리스타일탱고',
    info: {
      subtitle: '프리스타일 탱고 멤버쉽 안내',
      intro: '',
      highlight: '180,000원 올-패스',
      benefitsTitle: '멤버쉽 혜택',
      benefits: [
        '월 멤버쉽 : 18만, 모든 수업 수강 가능 / 해외 워크샵 d.c',
        '처음 오시는 분 6개월 멤버쉽 할인 : 20% d.c 86만원',
        '멤버쉽 전체 오픈플로어 사용 (월 16시간)',
        '파트너수업 외 2개 클래스 파트너 신청 가능 (기존 파트너만 대상됨)',
        '혜택 : 강사.스텝.루씨스텝 월10만원d.c, 처음오신분/소개하신분 개인레슨 1회 무료'
      ],
      cultureTitle: '이런 문화 꼭 만들거에요!',
      cultureList: [
        '모두에게 나이스하게, 블랙없는 커뮤니티 (행복한 공간, 따뜻한 사람들)',
        '15인 기준 남.녀 인원 맞추기 (한 팀씩 추가)'
      ],
      bankTitle: '수업료 입금 계좌',
      bankName: '카카오뱅크 3333-14-3159646 (홍병석)',
      copyBtn: '계좌번호 복사',
      copyHint: '입금 후 닉네임과 함께 연락 부탁드립니다.',
      contactPhone: '전화 상담',
      contactKakao: '카카오톡 상담',
      contactWhatsapp: 'WhatsApp',
      openChatBanner: '프리스타일 탱고 오픈채팅방 바로가기',
      copySuccess: '계좌번호가 복사되었습니다.',
      contactTitle: '문의하기',
      contactSlogan: '수업, 시설이용, 스테이 문의 (24시간 무엇이든 물어보세요)',
      photoGallery: '포토갤러리',
      facilityGallery: '시설안내'
    },
    admin: {
      addClass: '수업 등록',
      addMilonga: '밀롱가 등록',
      editMilonga: '밀롱가 수정',
      saveNotice: '공지 저장',
      editNotice: '공지 수정',
      noticePlaceholder: '공지 내용을 입력하세요 (2~3줄)',
      noticeEmpty: '등록된 월간 공지가 없습니다. 클릭하여 공지를 등록해보세요.',
      saveSuccess: '공지가 저장되었습니다.',
      saveFail: '저장 실패'
    },
    chat: {
      title: '채팅',
      newRoom: '+ 새 채팅방',
      roomPlaceholder: '채팅방',
      enterName: '채팅방 이름을 입력하세요:',
      enterType: '채팅방 유형을 입력하세요 (public, notice, private, support):',
      leaveRoom: '채팅방 나가기',
      renameRoom: '채팅방 이름 변경',
      participants: '대화 참여자',
      readCount: '읽음',
      allRead: '모두 읽음',
      noActiveChats: '진행 중인 채팅이 없습니다.'
    },
    export: {
      imageBtn: '📸 홍보용 이미지 저장 (PNG)',
      error: '이미지 생성 중 오류가 발생했습니다.'
    },
    exit: {
      toast: '뒤로가기를 한 번 더 누르시면 페이지가 닫힙니다'
    },
    stay: {
      viewMonthly: '월별 전체 현황 보기',
      monthlyTitle: '월별 전체 예약 현황',
      legendReserved: '예약됨',
      legendAvailable: '예약가능'
    },
    registration: {
      title: '수업 신청',
      classDetail: '수업 상세 정보',
      fullListTitle: '전체 신청 현황',
      addClass: '수업 등록',
      loading: '로딩 중...',
      noClasses: '{month}월에 등록된 수업이 없습니다.',
      cartAdded: '수업신청이 완료되었습니다. 내 신청내역에서 수정하실 수 있습니다.',
      deleteConfirm: '정말로 이 수업을 삭제하시겠습니까?',
      deleteSuccess: '삭제되었습니다.',
      deleteFail: '삭제 실패: {error}',
      saveSuccess: '저장되었습니다.',
      saveFail: '저장 실패: {error}',
      pastMonthWarning: '지나간 달의 수업은 신청할 수 없습니다.',
      selected: '✅ 선택됨',
      leader: '리더',
      follower: '팔로워',
      teacherLabel: '강사:',
      priceLabel: '원',
      datesTitle: '수업 일정 (4주 과정)',
      noDates: '등록된 일정이 없습니다.',
      curriculumTitle: '커리큘럼 상세',
      previewTitle: '미리보기 영상',
      introTitle: '수업 소개',
      currentStatus: '현재 신청 현황',
      waiting: '신청 대기 중',
      adminTitle: '신청자 상세 명단 (관리자)',
      nickname: '닉네임',
      phone: '연락처',
      status: '상태',
      paid: '입금완료',
      edit: '수정',
      delete: '삭제',
      download: '다운로드',
      addToList: '신청수업 목록에 담기',
      applied: '신청완료',
      footerNote: '추후 마이페이지에서 모든 수업을 한꺼번에 신청하실 수 있습니다',
      dayNames: [
        '일',
        '월',
        '화',
        '수',
        '목',
        '금',
        '토'
      ],
      daysFull: [
        '일요일',
        '월요일',
        '화요일',
        '수요일',
        '목요일',
        '금요일',
        '토요일',
        '기타'
      ],
      monthLabel: '월',
      dayLabel: '일',
      viewFullStatus: '신청현황',
      viewFullStatusHint: '(신청자만 확인 가능합니다)',
      bittersweet: '밀롱가용',
      fullStatusTitle: '{month}월 전체 신청 현황',
      fullStatusSummary: '리더 {leader}명 / 팔로어 {follower}명',
      noPermissionMessage: '이 버튼은 수강신청자만 확인 가능합니다.',
      role: '구분',
      classSelection: '신청내역',
      noData: '신청 내역이 없습니다.'
    },
    milonga: {
      bookingBtn: '🎟️ 밀롱가 테이블 예약하기',
      eventTitle: '이벤트 안내',
      eventSubtitle: '루씨에서 즐거운 추억을 만드세요',
      normalTable: '테이블 예약',
      normalTableDesc: '2인 이상 테이블 신청 가능합니다.',
      event2plus1: '2+1 Event',
      event2plus1Desc: '세 분이 오시면 한 분은 무료입니다.',
      event3plus1: '3+1 Event',
      event3plus1Desc: '네 분이 오시면 한 분은 무료입니다.',
      noSchedule: '현재 등록된 밀롱가 일정이 없습니다.',
      checkBack: '잠시 후 다시 확인해주세요.',
      bookingStatus: '예약 현황',
      noReservations: '아직 예약이 없습니다.',
      editTitle: '예약 수정하기',
      editDesc: '예약 내용을 수정할 수 있습니다.',
      confirmPayBtn: '입금 확인 요청',
      deleteConfirm: '정말로 이 예약을 삭제하시겠습니까?',
      deleteSuccess: '삭제되었습니다.',
      error: '오류가 발생했습니다.',
      options: [
        '1인 1.5만원',
        '이벤트 (무료)'
      ],
      optionPrompt: '옵션을 선택하세요.',
      cancel: '취소',
      submit: '확인',
      datePending: '일정 협의 중',
      newTitle: '신규 예약',
      dateLabel: '일시',
      optionLabel: '옵션',
      nicknamePlaceholder: '닉네임을 입력하세요',
      phoneLabel: '연락처',
      requestsLabel: '요청사항',
      requestsPlaceholder: '추가 요청사항 (선택)',
      submitting: '처리 중...',
      saveEdit: '수정 완료',
      saveNew: '예약하기',
      noPoster: '포스터 준비 중입니다.'
    },
    membership: {
      title: '멤버쉽 가이드',
      desc: '프리스타일탱고 멤버쉽 혜택을 확인하세요.',
      type1: '1개월 자유권',
      type1Price: '180,000원',
      type2: '3+1 이벤트',
      type2Price: '120,000원',
      type3: '6개월 멤버쉽',
      type3Price: '860,000원',
      close: '닫기'
    },
    registrationStatus: {
      editTitle: '신청 수정하기',
      newTitle: '{month}월 수업 신청하기',
      cancelEdit: '수정 취소',
      desc: '신청할 수업을 선택해주세요.',
      selectPrompt: '수업을 선택해주세요',
      typeSelectorTitle: '신청 유형 선택',
      typeIndividual: '개별수강 / 1개월멤버쉽',
      typeMembership6: '6개월멤버쉽',
      editSubmit: '수정 완료',
      newSubmit: '신청하기'
    },
    payment: {
      title: '입금 옵션 선택',
      desc: '신청하신 내역에 맞는 입금 옵션을 선택해주세요.',
      placeholder: '옵션을 선택해주세요',
      options: [
        '개별수강',
        '1개월멤버쉽',
        '6개월멤버쉽(1차)',
        '6개월멤버쉽(2차)',
        '6개월멤버쉽(3차)',
        '6개월멤버쉽(4차)',
        '6개월멤버쉽(5차)',
        '6개월멤버쉽(6차)'
      ],
      optionPrompt: '입금 옵션을 선택해주세요.',
      cancel: '취소',
      submit: '선택 완료'
    },
    history: {
      title: '내 신청 내역',
      loading: '로딩 중...',
      empty: '신청 내역이 없습니다.',
      appliedLabel: '{month}월 신청 내역',
      statusPaid: '입금 확인됨',
      statusWaiting: '입금 대기 중',
      appliedDate: '신청일시: {date}',
      paidMsg: '{type} / {amount}원 입금 완료',
      paidDate: '확인일시: {date}',
      confirmPayBtn: '입금 확인 요청',
      edit: '수정',
      delete: '삭제',
      deleteConfirm: '정말로 이 신청 내역을 삭제하시겠습니까?',
      alreadyRegistered: '이미 등록된 내역이 있습니다. 수정 기능을 이용해주세요.',
      deleteSuccess: '삭제되었습니다.',
      confirmSuccess: '완료되었습니다.',
      error: '오류가 발생했습니다.'
    },
    success: {
      welcome: '신청해 주셔서 감사합니다.',
      completed: '아래 계좌로 입금해 주신 후 마이페이지에서 \'입금확인요청\' 버튼을 누르시면 됩니다.',
      info: '기타 문의사항은 하단 상담 채널로 연락주세요.',
      bankLabel: '입금 계좌',
      bankNumber: '카카오뱅크 3333-14-3159646 (홍병석)',
      copyBtn: '복사',
      copySuccess: '복사되었습니다.',
      done: '확인'
    }
  },
  mypage: {
    title: '마이페이지',
    loginPrompt: '로그인이 필요한 서비스입니다.',
    loginBtn: '로그인하기',
    logoutBtn: '로그아웃',
    membership: '멤버쉽 가이드',
    profile: {
      nickname: '닉네임',
      phone: '연락처',
      role: '역할'
    },
    tabs: {
      registration: '{month}월 신청',
      history: '수업현황',
      wallet: '지갑',
      coaching: '코칭',
      profile: '내정보',
      admin: '관리'
    },
    alerts: {
      registration_failed: '알림 등록에 실패했습니다.\n상세 정보: {detail}\n\n브라우저 설정의 알림 허용 여부나 네트워크를 확인해주세요.',
      permission_denied: '알림 권한이 거부되었습니다. 주소창의 자물쇠 아이콘을 클릭하여 권한을 허용해주세요.',
      update_error: '설정 업데이트 중 오류가 발생했습니다: {detail}',
      confirm_logout: '로그아웃 하시겠습니까?',
      only_for_active_users: '이번 달 수업 진행 중인 사용자만 받을 수 있습니다.',
      wait_7_days: '마지막 쿠폰을 받은 후 7일이 지나야 다시 받을 수 있습니다.',
      already_issued: '이미 발급받은 쿠폰입니다.',
      sold_out: '정해진 쿠폰 {total}매가 모두 발급되었습니다.',
      confirm_issue: '이 쿠폰을 받으시겠습니까?',
      issue_success: '쿠폰이 발급되었습니다.',
      issue_failed: '발급 실패: {message}',
      confirm_cancel: '정말 쿠폰을 취소(반납)하시겠습니까? 취소된 쿠폰 수량은 다시 복구됩니다.',
      cancel_success: '쿠폰이 성공적으로 취소되었습니다.',
      cancel_failed: '취소 실패: {message}',
      general_error: '오류가 발생했습니다. 다시 시도해 주세요.',
      expired_coupon: '사용 기간이 만료되어 사용할 수 없는 쿠폰입니다.',
      confirm_use: '이 쿠폰을 사용하시겠습니까?',
      only_self: '자신의 페이지만 볼 수 있습니다.'
    },
    payment: {
      status_paid: '결제완료',
      status_pending: '입금확인중',
      history_title: '{month}월 신청 내역',
      date_label: '신청일',
      no_history: '신청 내역이 없습니다.'
    },
    notices: {
      title: '📢 쿠폰 발급 안내',
      list: [
        '수업 신청 완료(입금 확인) 후 쿠폰을 받으실 수 있습니다.',
        '발급된 쿠폰은 취소(수량 복구)가 가능합니다.',
        '쿠폰별 사용 기간과 대상(리더/팔로어 등)을 확인해주세요.',
        '쿠폰 사용 버튼은 사용 직전에만 눌러주세요.'
      ],
      no_coupons: '현재 발행 중인 쿠폰이 없습니다.'
    },
    labels: {
      get_coupon: '쿠폰받기',
      used: '사용완료',
      expired: '기한만료',
      use_now: '사용하기',
      issued: '발행완료',
      free: '무료',
      ticket: '입장권',
      off: 'OFF',
      won_off: '원 할인',
      ten_thousand_off: '만원 할인',
      status_available: '발급가능',
      status_can_use: '사용가능',
      duration_limited: '발급 후 {duration}개월 이내 사용',
      duration_unlimited: '기간 제한 없음',
      count_unit: '명',
      role_leader: '리더',
      role_follower: '팔로어',
      phone: '전화번호',
      push_notif: '푸시 알림',
      edit_profile: '내 정보 수정'
    },
    admin_menu: {
      member: {
        title: '회원 관리',
        desc: '전체 회원 목록 및 정보 관리'
      },
      coaching: {
        title: '전체 코칭 관리',
        desc: '전체 코칭 신청 현황 조회 및 관리'
      },
      checklist: {
        title: '스테이 체크리스트',
        desc: '숙소 예약 평면도 및 체크리스트'
      },
      sms: {
        title: '스테이 문자설정',
        desc: '예약 확정 및 안내 메시지 관리'
      },
      coupon: {
        title: '쿠폰 발행 및 관리',
        desc: '신규 쿠폰 발행 및 사용 현황'
      }
    },
    walletDesc: '보유하신 쿠폰 목록입니다.',
    wallet: {
      title: '내 지갑 & 쿠폰',
      noCoupons: '보유하신 쿠폰이 없습니다.',
      useCoupon: '사용하기',
      usedCoupon: '사용완료',
      membershipCoupon: {
        title: '1개월 멤버쉽 쿠폰',
        desc: '수업 신청 시 사용 가능한 쿠폰',
        target: '멤버십 회원 대상'
      },
      milongaCoupon: {
        title: '밀롱가 루씨 1회 무료입장권',
        desc: '수업 신청자 대상 밀롱가 1회 무료 쿠폰',
        target: '수업 신청자 대상'
      },
      usageConfirm: '쿠폰을 사용하시겠습니까?\n사용한 쿠폰은 되돌릴 수 없습니다.',
      usageSuccess: '쿠폰 사용이 완료되었습니다.'
    }
  },
  admin: {
    member: {
      searchPlaceholder: '닉네임 또는 번호 검색',
      searchBtn: '검색',
      engagement: '열성도',
      joinDate: '가입일자',
      recentVisit: '최근방문',
      loading: '데이터 로딩 중...',
      noResults: '계정 정보를 찾을 수 없습니다.',
      instructor: '강사',
      pushStatus: '알림 설정',
      lastRegMonth: '최종 수업 신청월',
      topPercent: '상위 {percent}%',
      grantInstructor: '강사 권한 부여',
      revokeInstructor: '강사 권한 해제',
      leader: '리더',
      follower: '팔로어',
      errorToggle: '권한 변경 중 오류가 발생했습니다.'
    }
  },
  info: {
    tabs: {
      location: '시설안내',
      membership: '멤버쉽',
      story: '스토리'
    }
  },
  calendar: {
    Sun: '일',
    Mon: '월',
    Tue: '화',
    Wed: '수',
    Thu: '목',
    Fri: '금',
    Sat: '토',
    blockedAlert: '이미 예약된 날짜입니다.',
    period: '관리자 예약 기간:',
    invalidRange: '유효하지 않은 날짜 범위입니다.',
    viewList: '전체 예약 현황 보기',
    available: '예약 가능',
    booked: '예약 완료',
    selected: '선택됨',
    days: '박',
    won: '원',
    hintSelectOut: '체크아웃 날짜를 선택해주세요.',
    hintSelectDates: '체크인/체크아웃 날짜를 선택해주세요.',
    finalPriceTitle: '총 결제 금액',
    baseFee: '객실 요금',
    guestFee: '인원 추가 요금',
    weekendFee: '주말/공휴일 할증',
    cleaningFee: '청소비',
    longStayDiscount: '장기 숙박 할인',
    proceedBtn: '예약 신청하기',
    stay: '객실',
    guestSelectLabel: '인원 선택',
    guestOptions: [
      '1명',
      '2명',
      '3명',
      '4명'
    ],
    checkin: '체크인',
    checkout: '체크아웃',
    clearBtn: '지우기',
    feeGuideTitle: '요금 안내',
    reserveBtn: '예약 신청하기'
  },
  location: {
    naver: '네이버 지도',
    kakao: '카카오맵'
  },
  stays: {
    viewMonthlyStatus: '월별 전체 현황 보기',
    monthlyStatusTitle: '월별 전체 예약 현황',
    hapjeong: {
      name: '합정',
      hero: {
        subtitle: '한강이 보이는 예술적인 휴식 공간'
      },
      location: {
        title: '위치 안내',
        addressLabel: '주소',
        address: '서울 마포구 양화로 13',
        bldgLabel: '상가/건물',
        bldg: '합정스퀘어리버뷰'
      },
      guide: {
        title: '합정 상세 안내',
        subtitle: '서울의 중심에서 즐기는 예술적인 휴식',
        highlights: {
          title: '공간의 특징',
          list: [
            {
              t: '위치',
              d: '합정역 도보 1분 거리 (초역세권)'
            },
            {
              t: '전망',
              d: '고층에서 즐기는 탁 트인 한강뷰'
            },
            {
              t: '분위기',
              d: '예술가들이 선호하는 감각적인 인테리어'
            }
          ],
          quote: '탱고와 일상이 하나가 되는 특별한 공간입니다.'
        },
        transport: {
          title: '오시는 길',
          list: [
            {
              t: '지하철',
              d: '2호선/6호선 합정역 7번 출구에서 바로 앞'
            },
            {
              t: '버스',
              d: '합정역 정류장에서 도보 1분'
            }
          ]
        },
        facilities: {
          title: '시설 안내',
          base: '기본 시설',
          baseDesc: '퀸 사이즈 베드, 시스템 에어컨, 초고속 Wi-Fi',
          add: '주방/편의 시설',
          addDesc: '냉장고, 인덕션, 드럼세탁기, 기본 조리도구',
          freeTitle: '무료 제공 품목',
          freeDesc: '생수, 고급 수건, 샴푸/바디워시, 드라이기'
        },
        attractions: {
          title: '주변 명소',
          list: [
            {
              t: '주변 상권',
              d: '메세나폴리스, 딜라이트 스퀘어 인접'
            },
            {
              t: '예술/문화',
              d: '합정동 카페거리, 망리단길 도보 이용 가능'
            }
          ]
        }
      },
      calendar: {
        title: '예약 현황',
        feeGuideTitle: '요금 안내',
        feeGuideLines: [
          '1박 8만원',
          '추가 인원 1인당 1만원 추가 (최대 4인)',
          '금,토,공휴일 1만원 할증',
          '7박 이상 2만원, 14박 이상 4만원 d.c',
          '퇴실청소비 3만원 별도'
        ]
      },
      gallery: {
        more: '사진 더 보기',
        categories: [
          '전체',
          '거실',
          '침실',
          '키친',
          '화장실',
          '뷰'
        ],
        descriptions: [
          '합정 거실 전경',
          '아늑한 소파와 테이블',
          '세련된 인테리어',
          '거실 조명',
          '채광이 좋은 공간',
          '넓은 리빙룸',
          '편안한 침실',
          '깔끔한 침구류',
          '아늑한 잠자리',
          '침실 전경',
          '화장대 및 수납공간',
          '식기류가 완비된 키친',
          '깔끔한 주방 환경',
          '청결한 화장실',
          '욕실 용품 완비',
          '쾌적한 욕실',
          '아름다운 한강 전망',
          '야경이 멋진 창밖 풍경',
          '여유로운 뷰 공간'
        ]
      }
    },
    deokeun: {
      name: '덕은(상암)',
      hero: {
        subtitle: '최신 시설과 평온한 휴식을 제공하는 공간'
      },
      location: {
        title: '위치 안내',
        addressLabel: '주소',
        address: '경기도 고양시 덕양구 으뜸로 110',
        bldgLabel: '상가/건물',
        bldg: '힐스테이트에코덕은'
      },
      guide: {
        title: '덕은(상암) 상세 안내',
        subtitle: '조용하고 안락한 나만의 휴식처',
        highlights: {
          title: '공간의 특징',
          list: [
            {
              t: '신축',
              d: '최신 건축 기술로 지어진 쾌적한 공간'
            },
            {
              t: '평온',
              d: '복잡한 도심을 벗어난 조용하고 평화로운 분위기'
            },
            {
              t: '시설',
              d: '최신 가전제품과 실용적인 공간 설계'
            }
          ],
          quote: '진정한 휴식을 원하시는 분들을 위한 최적의 장소입니다.'
        },
        transport: {
          title: '오시는 길',
          list: [
            {
              t: '자차',
              d: '상암동에서 차로 5분 거리'
            },
            {
              t: '버스',
              d: '덕은지구 정류장 하차 후 도보 3분'
            }
          ]
        },
        facilities: {
          title: '시설 안내',
          base: '기본 시설',
          baseDesc: '편안한 침대, 개별 냉난방, 스마트 TV',
          add: '주방/편의 시설',
          addDesc: '전자레인지, 토스터기, 기본 식기류',
          freeTitle: '무료 제공 품목',
          freeDesc: '커피 캡슐, 생수, 위생 용품'
        },
        attractions: {
          title: '주변 명소',
          list: [
            {
              t: '자연',
              d: '노을공원, 하늘공원 인접 (산책로 연결)'
            },
            {
              t: '비즈니스',
              d: '상암 DMC 업무지구 및 스튜디오 인접'
            }
          ]
        }
      },
      calendar: {
        title: '덕은(상암) 예약 현황',
        feeGuideTitle: '요금 안내',
        feeGuideLines: [
          '1박 6만원',
          '추가 인원 1인당 1만원 추가 (최대 4인)',
          '금,토,공휴일 1만원 할증',
          '7박 이상 2만원, 14박 이상 4만원 d.c',
          '퇴실청소비 3만원 별도'
        ]
      },
      gallery: {
        more: '사진 더 보기',
        categories: [
          '전체',
          '거실',
          '침실',
          '키친',
          '화장실',
          '뷰'
        ],
        descriptions: [
          '덕은 메인 전경',
          '침실 공간',
          '출입문과 입구',
          '책상과 화장대',
          '아늑한 실내',
          '스마트 TV 시설',
          '넓은 옷장 가구',
          '공기청정기 및 가전',
          '정돈된 주방',
          '조리기구 완비',
          '식기류 세트',
          '무료 차 서비스',
          '간식 서비스',
          '욕실 소모품',
          '비데 시설',
          '샤워룸 전경',
          '구급 상자 상비',
          '피트니스 센터',
          '외부 건조 공간'
        ]
      }
    },
    hongdae: {
      name: '홍대',
      hero: {
        subtitle: '젊음과 예술의 거리 홍대에서 즐기는 휴식'
      },
      location: {
        title: '위치 안내',
        addressLabel: '주소',
        address: '서울 마포구 서교동 (상세주소 예정)',
        bldgLabel: '상가/건물',
        bldg: '스테이 홍대'
      },
      guide: {
        title: '상세 정보 & 이용 안내',
        subtitle: '"몸만 오셔도 바로 일상을 시작하실 수 있게 모든 것을 준비했습니다"',
        highlights: {
          title: '✨ 이 숙소의 포인트',
          list: [
            {
              t: '홍대 중심가',
              d: '홍대의 트렌디한 문화를 즐기기에 최적의 입지입니다.'
            },
            {
              t: '타협 없는 완벽한 청결',
              d: '침구와 러그는 매번 런드리고 전문 세탁, 실내 스팀 청소 실시, 수건과 행주는 매번 아낌없이 모두 새것으로 교체합니다.'
            },
            {
              t: '프리미엄 휴식 가구',
              d: '넓은 침대 2개(퀸, 슈퍼싱글), 편안한 소파, 고성능 리클라이닝 안마의자 완비.'
            },
            {
              t: '풍성한 엔터테인먼트',
              d: '거실에는 2026 삼성 무빙스타일 최신 스마트 TV, 그리고 침실에도 별도의 TV가 마련되어 있습니다.'
            }
          ],
          quote: '"홍대의 열기를 즐긴 후, 프리미엄한 휴식을 만끽하세요~"'
        },
        transport: {
          title: '📍 편리한 입지 & 교통',
          list: [
            {
              t: '홍대입구역 역세권',
              d: '2호선, 공항철도, 경의중앙선 이용이 매우 편리한 위치입니다.'
            },
            {
              t: '풍부한 버스 노선',
              d: '서울 전역 및 인천공항으로 향하는 다양한 버스를 이용 가능합니다.'
            },
            {
              t: '도보 이동 최적',
              d: '홍대, 합정, 연남동을 모두 도보로 탐방할 수 있는 최고의 장소에 위치합니다.'
            }
          ]
        },
        facilities: {
          title: ' Stay 시설 & 옵션 (무료 소모품 안내)',
          base: '기본 가전·가구',
          baseDesc: '냉장고, 세탁기, 에어컨, 스마트TV(2대), 기가 Wi-Fi, 싱크대, 인덕션, 퀸 & 슈퍼싱글 침대',
          add: '추가 편의 시설',
          addDesc: '안전한 도어락과 CCTV/관리실, 다이닝 테이블, 위생적인 정수기, 폭신한 소파, 넓은 데스크, 대용량 옷장, 신발장',
          freeTitle: '✨ 모든 소모품이 무료!!!',
          freeDesc: '라면, 햇반, 롤휴지, 티슈, 칫솔세트, 샴푸/린스, 바디워시, 핸드워시 등 모든 일회용품·소모품이 준비되어 있습니다.\n세탁용 건조대와 세제, 유연제는 물론 종량제 봉투까지 모두 자유롭게 무료로 사용하세요!'
        },
        attractions: {
          title: '🛍️ 주변 생활 인프라 & 즐길거리',
          list: [
            {
              t: '홍대 걷고싶은거리',
              d: '버스킹과 다양한 샵들이 즐비한 홍대의 메인 스트리트입니다.'
            },
            {
              t: '연남동 경의선숲길',
              d: '산책과 피크닉의 명소 "연트럴파크"를 즐길 수 있습니다.'
            },
            {
              t: '셀 수 없는 맛집과 카페',
              d: '수백 미터 이내에 국내외 유명 맛집과 숨은 감성 카페들이 밀집해 있습니다.'
            }
          ]
        }
      },
      calendar: {
        title: '홍대점 예약 현황',
        feeGuideTitle: '요금 안내',
        feeGuideLines: [
          '1박 8만원',
          '오픈 특가 적용 예정'
        ]
      },
      gallery: {
        more: '사진 더 보기',
        categories: [
          '전체',
          '거실',
          '침실',
          '키친',
          '화장실',
          '뷰'
        ],
        descriptions: [
          '홍대점 갤러리 준비 중',
          '아늑한 공간 구성 예정',
          '감각적인 인테리어'
        ]
      }
    }
  },
  common: {
    save: '저장',
    cancel: '취소',
    loading: '로딩 중...',
    contact: {
      title: '문의하기',
      desc: '궁금하신 점은 언제든 문의주세요.',
      call: '전화 상담',
      callDesc: '직통 전화 연결',
      sms: '문자 문의',
      smsDesc: '문자로 문의하기',
      kakao: '카카오톡',
      kakaoDesc: '카카오톡 상담 채널',
      whatsapp: 'WhatsApp',
      whatsappDesc: '왓츠앱 상담',
      fb: 'Messenger',
      fbDesc: '페이스북 메시지'
    },
    hostGuide: {
      title: '호스트 소개',
      list: [
        {
          t: '호스트',
          d: 'Stone Hong (홍병석)'
        },
        {
          t: '소개',
          d: '탱고 인스트럭터 / 스테이 호스트로 활동 중입니다.\n편안하고 예술적인 공간에서 여러분의 탱고 여행을 지원합니다.'
        },
        {
          t: '문의',
          d: '숙박 및 탱고 레슨 관련 문의는 카카오톡이나 왓츠앱으로 연락주세요.'
        }
      ]
    },
    story: {
      title: '탱고스테이 스토리',
      subtitle: '"몸만 오세요"… 탱고스테이의 [무인도 실험]을 소개합니다.',
      p1: "호스트로서 이 공간을 준비하며 설정한 단 하나의 목표, 바로 '무인도 실험'입니다. 트렁크 하나만 들고 입실해도 일주일 이상 밖으로 한 발자국도 나가지 않고 완벽하게 쾌적한 생활이 가능한 공간을 만드는 것. 제가 게스트로서 경험했던 '수많은 불편함'들을 완벽하게 해결하기 위해 기획했습니다.",
      sol1Title: '스테이 팩: 불쾌감 제로, 웰컴 기프트 세트',
      sol1Text: "남이 쓰던 수건이나 비누의 찜찜함은 이제 그만. 모든 게스트분께 호텔 어메니티 급의 '새' 수건, 행주, 비누, 칫솔 세트를 제공합니다. 첫날 편의점으로 달려갈 필요가 전혀 없습니다.",
      sol2Title: '물 걱정 끝! 최신 정수기 설치',
      sol2Text: "무거운 생수를 나르는 고통에서 해방되세요. 최상위 정수기가 설치되어 언제든 깨끗하고 시원한 물을 마음껏 드실 수 있습니다.",
      sol3Title: '타협 없는 청결함 (세탁 전문 런드리고)',
      sol3Text: "모든 침구(이불, 커버, 패드, 베개커버)와 러그는 2세트씩 준비되어, 전문 비대면 세탁 업체(런드리고)를 통한 고온 살균과 건조를 거친 것으로 매번 교체됩니다. 눈에 보이지 않는 진드기까지 완벽하게 소독된 폭신한 침구에서 깊은 숙면을 경험하세요.",
      closing: "세상에서 가장 편안한 나만의 '무인도'에서 진정한 휴식을 즐기실 여러분을 기다립니다.",
      hostName: '👋 아르헨티나 탱고 추는 남자, 스톤입니다.',
      hostBio: ''
    },
    footer: {
      term: '이용약관',
      privacy: '개인정보처리방침',
      termTitle: 'TangoStay 이용약관',
      privacyTitle: '개인정보처리방침',
      termText: '제 1조 (목적)\n본 약관은 TangoStay에서 제공하는 예약 서비스를 이용함에 있어...',
      privacyText: 'TangoStay는 이용자의 개인정보를 소중히 다루며...'
    },
  },
  startTime: '시작 시간',
  endTime: '종료 시간',
  media: {
    title: '미디어',
    edit: '영상 수정',
    type: {
      youtube: '유튜브',
      demonstration: '시연',
      general: '일반'
    },
    filterAll: '수업별로 보기 (전체)',
    addBtn: '등록',
    like: '좋아요',
    comment: '댓글',
    views: '조회수',
    noAccess: '수업 신청자만 볼 수 있습니다',
    placeholder: {
      title: '제목을 입력하세요',
      url: '유투브 ID 또는 영상 URL',
      desc: '설명을 입력하세요',
      class: '관련 수업 선택 (선택사항)',
      comment: '댓글을 남겨보세요...'
    },
    uploading: '업로드 중...',
    deleteConfirm: '정말로 삭제하시겠습니까?',
    saveSuccess: '저장되었습니다.',
    deleteSuccess: '삭제되었습니다.'
  },
  story: {
    campaign: {
      title: '모두 함께',
      slogan: 'Happy Space, Warm People',
      sloganKo: '행복한 공간, 따뜻한 사람들'
    },
    hero: {
      title: '우리가 꿈꾸는 놀이터,\n모두의 휴식처',
      subtitle: '서로 존중하며 함께 성장하는 프리스타일 탱고 커뮤니티'
    },
    ethics: {
      title: '커뮤니티 핵심 가치',
      respectTitle: '태도가 먼저 (Respect)',
      respectDesc: '서로 존중해야 한다는 것은 너무나 명확한 명제입니다. 그렇지 못할 경우 클럽 활동이 제한될 수 있습니다.',
      teachingTitle: '티칭 금지 (No Teaching)',
      teachingDesc: '학생 간 일방적인 가르침은 본인과 상대방 모두의 발전을 방해할 수 있습니다. 의견 교류는 환영하지만, 기술적인 문제는 강사진을 통해 해결해 주세요.',
      teachingDetail: '선생님의 의도를 정확히 이해하는 것이 중요합니다. 경력에 관계없이 일방적인 티칭은 삼가 주시기 바랍니다.'
    },
    projects: {
      title: '전략 프로젝트',
      azit: {
        title: "Project 'Azit'",
        desc: '수업 전후로 편안하게 대화하며 음식과 술을 즐길 수 있는 우리만의 뒷풀이 공간.'
      },
      camp: {
        title: "Project 'Camp'",
        desc: '주말과 연휴, 도심을 벗어나 우리들만의 쉼터가 될 수 있는 펜션 공간.'
      },
      nuevo: {
        title: "Project 프로페셔널 공연단 'Nuevo Company'",
        desc: '프로페셔널 공연단 운영 및 웰니스를 위한 요가룸, 문화센터 활성화.'
      },
      orchestra: {
        title: "Project 'House Ochestra'",
        desc: '살롱 연주회와 라이브 밀롱가를 위한 프리스타일만의 하우스 오케스트라.'
      }
    },
    roadmap: {
      title: '지속가능한 미래',
      cooperative: {
        title: '협동조합 전환',
        desc: '클럽의 소유권을 멤버들이 나누어 공동으로 운영하고 의사결정하는 시스템.'
      },
      donation: {
        title: '기부 문화 정착',
        desc: '장학제도와 자원봉사를 통해 신입 회원을 지원하고 클럽의 성장을 돕는 문화.'
      },
      instructor: {
        title: '내부 강사 양성',
        desc: '누구나 특정 주제를 깊이 있게 연구하여 직접 클래스를 개설할 수 있는 시스템.'
      }
    },
    guidelines: {
      title: '이용 수칙 (General Guide)',
      cleaning: '바닥에 음료를 흘릴 경우 즉시 깨끗이 닦아주세요.',
      shoes: '전용 슈즈나 맨발 외에는 실내 출입이 불가합니다.',
      toilet: '변기에는 휴지만 넣어주세요 (핸드타올, 물티슈 절대 금지).',
      trash: '퇴실 시 쓰레기는 분리수거하여 휴지통에 버려주세요.',
      power: '입퇴실 시 출입문 옆 전체 스위치를 이용해 주세요.',
      facilities: {
        wifi: 'WiFi: freestyle1234',
        pc: 'PC PW: 7788',
        lockers: '개인 사물함 외 물품 보관은 불가합니다.'
      }
    }
  },
  coaching: {
    title: '코칭 관리',
    newCoaching: '새 코칭 등록',
    empty: '등록된 코칭 항목이 없습니다.',
    student: '수강생',
    instructor: '담당 강사',
    progress: '진행률',
    status: '상태',
    ongoing: '진행중',
    solved: '문제해결',
    solvedBadge: '해결됨',
    itemTitle: '코칭 제목',
    itemDesc: '코칭 설명',
    selectStudent: '수강생 선택',
    searchStudentPlaceholder: '이름 또는 전화번호 검색',
    searchSearching: '검색 중...',
    searchNoResults: '검색 결과가 없습니다.',
    creating: '등록 중...',
    updates: '활동 기록',
    activityAdd: '활동 추가',
    comment: '코멘트',
    placeholderComment: '코멘트를 남겨보세요...',
    media: '미디어',
    addComment: '코멘트 작성...',
    uploadMedia: '사진/동영상 추가',
    updateProgress: '진행률 업데이트',
    saveUpdate: '기록 저장',
    noUpdates: '기록이 없습니다.',
    confirmStatusChange: '상태를 변경하시겠습니까?',
    reopen: '재개',
    editActivity: '활동 수정',
    deleteActivity: '활동 삭제',
    confirmDelete: '정말로 삭제하시겠습니까?',
    cancel: '취소',
    confirm: '확인',
    errorSave: '저장 중 오류가 발생했습니다.'
  }
};
