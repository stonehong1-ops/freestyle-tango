export default {
  header: {
    story: 'TangoStay Story',
    location: 'Location',
    guide: 'Details',
    contact: 'Contact',
    login: 'Register',
    community: 'Community',
    join: 'Join'
  },
  nav: {
    home: 'Class',
    milonga: 'Milonga',
    stay: 'Stay',
    class: 'Class',
    info: 'Info',
    mypage: 'MyPage',
    lucy: 'Milonga',
    chat: 'Chatting',
    guide: 'Membership',
    classGuide: 'Class Info',
    fullSchedule: 'Calendar',
    media: 'Media',
    story: 'Story'
  },

  reserve: {
    closed: 'Reservation Closed',
    title: 'Reservation Request',
    nameLabel: 'Name',
    namePlace: 'Enter your name',
    phoneLabel: 'Phone',
    phonePlace: 'Enter your phone number',
    guests: 'Guests',
    reqLabel: 'Requests',
    reqPlace: 'Any special requests? (Optional)',
    submitting: 'Processing...',
    submitBtn: 'Complete Reservation',
    directBookingWarning: 'Click the button below to complete. Your reservation will be cancelled if payment is not received within 1 hour.',
    smsTemplate: '[{stayName} Confirmation]\nName: {name}\nDate: {checkIn} ~ {checkOut}\nGuests: {guests}\nAmount: {amount} KRW\n\n[Payment]\n1. KR: KakaoBank 3333-03-7249602 (Hong Byong Seok)\n2. US: Acc 352665336763211 / Routing: 084009519 (ACH Free)\n3. International: SWIFT/BIC TRWIUS35XXX\n\n[Check-in]\nTime: 4 PM\nPassword: 9999\n\nThank you!',
    errorFill: 'Please enter both name and phone number.',
    errorFail: 'An error occurred. Please try again.',
    save: 'Save',
    cancel: 'Cancel'
  },
  complete: {
    title: 'Reservation Complete',
    desc: 'Your request has been submitted. We will send a confirmation message after verifying payment.',
    homeBtn: 'Back to Home',
    guestSmsBtn: 'Inquire via SMS'
  },
  home: {
    studioName: 'FreestyleTango',
    info: {
      subtitle: 'Freestyle Tango Membership Guide',
      intro: 'Like a fresh rose with mother\'s milk\nLooking like a mix of colors\nWhite, yellow, red roses\n\nSpring where flower buds bloom\nIn the eternal time of autumn leaves\nTo everyone who sweats\nCultivating body and mind\n\nFreestyle will be\nA shelter and a guide.',
      highlight: '180,000 KRW for all classes!',
      benefitsTitle: 'Membership Benefits',
      benefits: [
        'Monthly Membership: 180k, all classes included / Intl workshop d.c',
        'New member 6-month discount: 20% d.c 860k',
        'Open floor access (16h/month)',
        'Partner class application (for existing partners)',
        'Benefits: Instructor/Staff discount 100k d.c, free 1:1 lesson for referrals'
      ],
      cultureTitle: 'Community Culture',
      cultureList: [
        'Be nice to everyone (Happy space, Warm people)',
        'Gender balance (aiming for 15:15)'
      ],
      bankTitle: 'Membership Fee Payment',
      bankName: 'KakaoBank 3333-14-3159646 (Hong Byong Seok)',
      copyBtn: 'Copy Account Number',
      copyHint: 'Please contact us with your name after payment.',
      contactPhone: 'Phone Inquiry',
      contactKakao: 'KakaoTalk',
      contactWhatsapp: 'WhatsApp',
      openChatBanner: 'Join Freestyle Tango Open Chat',
      copySuccess: 'Account number copied.',
      contactTitle: 'Contact',
      contactSlogan: 'Inquire about classes, facilities, and stays (24/7 inquiries welcome)',
      photoGallery: 'Photo Gallery',
      facilityGallery: 'Facility Guide'
    },
    admin: {
      addClass: 'Add Class',
      addMilonga: 'Add Milonga',
      editMilonga: 'Edit Milonga',
      saveNotice: 'Save Notice',
      editNotice: 'Edit Notice',
      noticePlaceholder: 'Enter notice (2-3 lines)',
      noticeEmpty: 'No monthly notices registered. Click to add one.',
      saveSuccess: 'Notice saved.',
      saveFail: 'Save failed'
    },
    chat: {
      title: 'Chat',
      newRoom: '+ New Room',
      roomPlaceholder: 'Chat Room',
      enterName: 'Enter room name:',
      enterType: 'Enter room type (public, notice, private, support):',
      leaveRoom: 'Leave Room',
      renameRoom: 'Rename Room',
      participants: 'Participants',
      readCount: 'Read',
      allRead: 'All Read',
      noActiveChats: 'No active chats.'
    },
    export: {
      imageBtn: '📸 Save Promo Image (PNG)',
      error: 'Error generating image.'
    },
    exit: {
      toast: 'Press back again to exit'
    },
    stay: {
      viewMonthly: 'View Monthly Status',
      monthlyTitle: 'Monthly Reservation Status'
    },
    registration: {
      title: 'Class Registration',
      classDetail: 'Class Details',
      fullListTitle: 'Full Registration Status',
      addClass: 'Add Class',
      loading: 'Loading...',
      noClasses: 'No classes registered for {month}.',
      cartAdded: 'Class added to cart! Proceed to final registration in [MyPage].',
      deleteConfirm: 'Are you sure you want to delete this class?',
      deleteSuccess: 'Deleted.',
      deleteFail: 'Delete failed: {error}',
      saveSuccess: 'Saved.',
      saveFail: 'Save failed: {error}',
      pastMonthWarning: 'Cannot apply for past classes.',
      selected: '✅ Selected',
      leader: 'Leader',
      follower: 'Follower',
      teacherLabel: 'Instructor:',
      priceLabel: 'KRW',
      datesTitle: 'Class Schedule (4 weeks)',
      noDates: 'No schedule registered.',
      curriculumTitle: 'Curriculum Details',
      previewTitle: 'Preview Video',
      introTitle: 'Class Intro',
      currentStatus: 'Current Status',
      waiting: 'Waiting for application',
      adminTitle: 'Applicant List (Admin)',
      nickname: 'Nickname',
      phone: 'Phone',
      status: 'Status',
      paid: 'Paid',
      edit: 'Edit',
      delete: 'Delete',
      download: 'Download',
      addToList: 'Add to List',
      applied: 'Applied',
      footerNote: 'You can apply for all classes at once in MyPage later.',
      dayNames: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      daysFull: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Other'],
      monthLabel: 'Month',
      dayLabel: 'Day',
      viewFullStatus: 'View Status',
      viewFullStatusHint: '(Only for applicants)',
      bittersweet: 'For Milonga',
      fullStatusTitle: 'Full Status for {month}',
      fullStatusSummary: 'Leaders {leader} / Followers {follower}',
      noPermissionMessage: 'Only for applicants.',
      role: 'Role',
      classSelection: 'Registration',
      noData: 'No registration data.'
    },
    milonga: {
      bookingBtn: '🎟️ Book Milonga Table',
      eventTitle: 'Event Info',
      eventSubtitle: 'Make memories at Lucy',
      normalTable: 'Table Booking',
      normalTableDesc: 'Available for 2+ people.',
      event2plus1: '2+1 Event',
      event2plus1Desc: 'One person free for every three people.',
      event3plus1: '3+1 Event',
      event3plus1Desc: 'One person free for every four people.',
      noSchedule: 'No milonga schedule registered.',
      checkBack: 'Please check back later.',
      bookingStatus: 'Booking Status',
      noReservations: 'No bookings yet.',
      editTitle: 'Edit Booking',
      editDesc: 'You can modify your booking.',
      confirmPayBtn: 'Request Payment Check',
      deleteConfirm: 'Are you sure you want to delete this booking?',
      deleteSuccess: 'Deleted.',
      error: 'An error occurred.',
      options: ['15k KRW per person', 'Event (Free)'],
      optionPrompt: 'Select an option.',
      cancel: 'Cancel',
      submit: 'OK',
      datePending: 'Schedule Pending',
      newTitle: 'New Booking',
      dateLabel: 'Date',
      optionLabel: 'Option',
      nicknamePlaceholder: 'Enter nickname',
      phoneLabel: 'Phone',
      requestsLabel: 'Requests',
      requestsPlaceholder: 'Additional requests (Optional)',
      submitting: 'Processing...',
      saveEdit: 'Save Changes',
      saveNew: 'Book',
      noPoster: 'Poster is being prepared.'
    },
    membership: {
      title: 'Membership Guide',
      desc: 'Check the benefits of Freestyle Tango membership.',
      type1: '1 Month Free Pass',
      type1Price: '180,000 KRW',
      type2: '3+1 Event',
      type2Price: '120,000 KRW',
      type3: '6 Months Membership',
      type3Price: '860,000 KRW',
      close: 'Close'
    },
    registrationStatus: {
      editTitle: 'Edit Registration',
      newTitle: 'Apply for {month} Classes',
      cancelEdit: 'Cancel Edit',
      desc: 'Select classes to apply.',
      selectPrompt: 'Please select a class',
      typeSelectorTitle: 'Select Type',
      typeIndividual: 'Individual / 1 Month',
      typeMembership6: '6 Months Membership',
      editSubmit: 'Save Changes',
      newSubmit: 'Apply'
    },
    payment: {
      title: 'Payment Options',
      desc: 'Select the payment option matching your registration.',
      placeholder: 'Select an option',
      options: [
        'Individual',
        '1 Month',
        '6 Months (1st)',
        '6 Months (2nd)',
        '6 Months (3rd)',
        '6 Months (4th)',
        '6 Months (5th)',
        '6 Months (6th)'
      ],
      optionPrompt: 'Please select a payment option.',
      cancel: 'Cancel',
      submit: 'Confirm'
    },
    history: {
      title: 'My History',
      loading: 'Loading...',
      empty: 'No history found.',
      appliedLabel: 'Registered for {month}',
      statusPaid: 'Paid',
      statusWaiting: 'Waiting for Payment',
      appliedDate: 'Applied: {date}',
      paidMsg: '{type} / {amount} KRW Paid',
      paidDate: 'Confirmed: {date}',
      confirmPayBtn: 'Request Payment Check',
      edit: 'Edit',
      delete: 'Delete',
      deleteConfirm: 'Are you sure you want to delete this history?',
      alreadyRegistered: 'Already registered. Please use edit function.',
      deleteSuccess: 'Deleted.',
      confirmSuccess: 'Completed.',
      error: 'An error occurred.'
    },
    success: {
      welcome: 'Thank you for applying.',
      completed: 'Please transfer to the account below and click \'Request Payment Check\' in MyPage.',
      info: 'For other inquiries, contact us via the channels below.',
      bankLabel: 'Account',
      bankNumber: 'KakaoBank 3333-14-3159646 (Hong Byong Seok)',
      copyBtn: 'Copy',
      copySuccess: 'Copied.',
      done: 'OK'
    }
  },
  mypage: {
    title: 'MyPage',
    loginPrompt: 'Login required.',
    loginBtn: 'Login',
    logoutBtn: 'Logout',
    membership: 'Membership Guide',
    profile: {
      nickname: 'Nickname',
      phone: 'Phone',
      role: 'Role'
    },
    tabs: {
      registration: 'April News/Apply',
      history: 'History',
      wallet: 'Wallet',
      coaching: 'Coaching',
      profile: 'My Info',
      admin: 'Admin'
    },
    walletDesc: 'Your coupon list.',
    wallet: {
      title: 'My Wallet & Coupons',
      noCoupons: 'No coupons found.',
      useCoupon: 'Use Now',
      usedCoupon: 'Used',
      membershipCoupon: {
        title: '1-Month Membership 5% Discount',
        desc: '5% discount for 3rd-week class application (10,000 KRW off)',
        target: 'For Membership Members'
      },
      milongaCoupon: {
        title: 'Milonga Luci 1-Time Free Pass',
        desc: '1-time free entry coupon for class registrants',
        target: 'For Class Registrants'
      },
      usageConfirm: 'Would you like to use this coupon?\nUsed coupons cannot be restored.',
      usageSuccess: 'Payment check request sent.'
    }
  },
  admin: {
    member: {
      searchPlaceholder: 'Search nickname or number',
      searchBtn: 'Search',
      engagement: 'Engagement',
      joinDate: 'Join Date',
      recentVisit: 'Recent Visit',
      loading: 'Loading data...',
      noResults: 'No members found.',
      instructor: 'Instructor',
      pushStatus: 'Notifications',
      lastRegMonth: 'Last Applied',
      topPercent: 'Top {percent}%',
      grantInstructor: 'Grant Instructor',
      revokeInstructor: 'Revoke Instructor',
      leader: 'Leader',
      follower: 'Follower',
      errorToggle: 'Error changing permissions.'
    }
  },
  info: {
    tabs: {
      location: 'Location',
      membership: 'Membership',
      story: 'Story'
    }
  },
  calendar: {
    Sun: 'Sun',
    Mon: 'Mon',
    Tue: 'Tue',
    Wed: 'Wed',
    Thu: 'Thu',
    Fri: 'Fri',
    Sat: 'Sat',
    blockedAlert: 'Already booked.',
    period: 'Admin Block:',
    invalidRange: 'Invalid range.',
    viewList: 'View Full Status',
    available: 'Available',
    booked: 'Booked',
    selected: 'Selected',
    days: 'nights',
    won: 'KRW',
    hintSelectOut: 'Select checkout date.',
    hintSelectDates: 'Select check-in/out dates.',
    finalPriceTitle: 'Total Price',
    baseFee: 'Room Fee',
    guestFee: 'Extra Guest Fee',
    weekendFee: 'Weekend/Holiday Surcharge',
    cleaningFee: 'Cleaning Fee',
    longStayDiscount: 'Long Stay Discount',
    proceedBtn: 'Apply Now',
    stay: 'Stay',
    guestSelectLabel: 'Guests',
    guestOptions: ['1 person', '2 people', '3 people', '4 people'],
    checkin: 'Check-in',
    checkout: 'Check-out',
    clearBtn: 'Clear',
    feeGuideTitle: 'Fees'
  },
  location: {
    naver: 'Naver Map',
    kakao: 'KakaoMap'
  },
  stays: {
    viewMonthlyStatus: 'View Monthly Status',
    monthlyStatusTitle: 'Monthly Reservation Status',
    hapjeong: {
      name: 'Hapjeong',
      hero: {
        subtitle: 'Artistic space with Han River view'
      },
      location: {
        title: 'Location',
        addressLabel: 'Address',
        address: '13 Yanghwa-ro, Mapo-gu, Seoul',
        bldgLabel: 'Building',
        bldg: 'Hapjeong Square Riverview'
      },
      guide: {
        title: 'Details',
        subtitle: 'Artistic rest in the heart of Seoul',
        highlights: {
          title: 'Highlights',
          list: [
            { t: 'Location', d: '1 min walk from Hapjeong Station' },
            { t: 'View', d: 'Stunning Han River view from high floor' },
            { t: 'Vibe', d: 'Sensible interior favored by artists' }
          ],
          quote: 'A special space where tango and daily life become one.'
        },
        transport: {
          title: 'Directions',
          list: [
            { t: 'Subway', d: 'Line 2/6 Hapjeong Station Exit 7' },
            { t: 'Bus', d: '1 min walk from Hapjeong Station stop' }
          ]
        },
        facilities: {
          title: 'Facilities',
          base: 'Basic',
          baseDesc: 'Queen bed, AC, high-speed Wi-Fi',
          add: 'Kitchen/Conv',
          addDesc: 'Fridge, induction, washer, cookware',
          freeTitle: 'Freebies',
          freeDesc: 'Water, towels, shampoo/body wash, hair dryer'
        },
        attractions: {
          title: 'Attractions',
          list: [
            { t: 'Shopping', d: 'Mecenatpolis, Delight Square nearby' },
            { t: 'Art/Culture', d: 'Hapjeong Cafe Street, Mangridan-gil walk' }
          ]
        }
      },
      calendar: {
        title: 'Status',
        feeGuideTitle: 'Price List',
        feeGuideLines: [
          '80,000 KRW per night',
          '2 guests base / max 4',
          '10,000 KRW per extra guest',
          '10,000 KRW weekend surcharge',
          'Discount: 20k for 7+ nights, 40k for 14+ nights',
          '30,000 KRW separate cleaning fee'
        ]
      },
      gallery: {
        more: 'View More',
        categories: ['All', 'Living', 'Bedroom', 'Kitchen', 'Bath', 'View'],
        descriptions: [
          'Hapjeong Living Room',
          'Cozy Sofa',
          'Sensible Interior',
          'Living Lighting',
          'Sunny Space',
          'Large Living Room',
          'Comfortable Bedroom',
          'Clean Bedding',
          'Cozy Night',
          'Bedroom View',
          'Dressing Table',
          'Full Kitchen',
          'Clean Kitchen',
          'Clean Bathroom',
          'Bath Amenities',
          'Refreshing Bath',
          'Beautiful River View',
          'Night City View',
          'Relaxing View'
        ]
      }
    },
    deokeun: {
      name: 'Deokeun(Sangam)',
      hero: {
        subtitle: 'Modern facilities and peaceful rest'
      },
      location: {
        title: 'Location',
        addressLabel: 'Address',
        address: '110 Eudeum-ro, Deogyang-gu, Goyang, Gyeonggi',
        bldgLabel: 'Building',
        bldg: 'Hillstate Eco Deokeun'
      },
      guide: {
        title: 'Details',
        subtitle: 'Your own quiet and cozy hideaway',
        highlights: {
          title: 'Highlights',
          list: [
            { t: 'New', d: 'Clean space with latest tech' },
            { t: 'Peace', d: 'Quiet atmosphere away from city' },
            { t: 'Facilities', d: 'Modern appliances and practical design' }
          ],
          quote: 'The perfect place for those seeking true rest.'
        },
        transport: {
          title: 'Directions',
          list: [
            { t: 'Car', d: '5 min from Sangam-dong' },
            { t: 'Bus', d: '3 min walk from Deokeun stop' }
          ]
        },
        facilities: {
          title: 'Facilities',
          base: 'Basic',
          baseDesc: 'Comfortable bed, AC/Heating, Smart TV',
          add: 'Kitchen/Conv',
          addDesc: 'Microwave, toaster, basic dishes',
          freeTitle: 'Freebies',
          freeDesc: 'Coffee capsules, water, hygiene kits'
        },
        attractions: {
          title: 'Attractions',
          list: [
            { t: 'Nature', d: 'Noeul/Haneul Park nearby' },
            { t: 'Business', d: 'Sangam DMC district adjacent' }
          ]
        }
      },
      calendar: {
        title: 'Status',
        feeGuideTitle: 'Price List',
        feeGuideLines: [
          '60,000 KRW per night',
          '2 guests base / max 4',
          '10,000 KRW per extra guest',
          '10,000 KRW weekend surcharge',
          'Discount: 20k for 7+ nights, 40k for 14+ nights',
          '30,000 KRW separate cleaning fee'
        ]
      },
      gallery: {
        more: 'View More',
        categories: ['All', 'Living', 'Bedroom', 'Kitchen', 'Bath', 'View'],
        descriptions: [
          'Deokeun Main',
          'Bedroom space',
          'Entrance',
          'Desk',
          'Cozy Interior',
          'Smart TV',
          'Closet',
          'Purifier/Home appliances',
          'Organized Kitchen',
          'Cookware',
          'Dish Set',
          'Free Tea',
          'Snack service',
          'Bath amenities',
          'Bidet',
          'Shower room',
          'First aid kit',
          'Fitness center',
          'Drying area'
        ]
      }
    },
    hongdae: {
      name: 'Hongdae',
      hero: {
        subtitle: 'Rest in the street of youth and art'
      },
      location: {
        title: 'Location',
        addressLabel: 'Address',
        address: 'Seogyo-dong, Mapo-gu, Seoul',
        bldgLabel: 'Building',
        bldg: 'Stay Hongdae'
      },
      guide: {
        title: 'Details',
        subtitle: 'Harmony of energy and comfort',
        highlights: {
          title: 'Highlights',
          list: [
            { t: 'Center', d: 'Optimal location between Hongdae and Hapjeong' },
            { t: 'Trend', d: 'Interior filled with MZ sensibility' },
            { t: 'Prep', d: 'Currently preparing to open.' }
          ],
          quote: 'We promise the most comfortable night in the hippest street.'
        },
        transport: {
          title: 'Directions',
          list: [
            { t: 'Subway', d: '7 min walk from Hongdae Station Line 2' }
          ]
        },
        facilities: {
          title: 'Facilities',
          base: 'Basic',
          baseDesc: 'Premium bedding, Beam projector',
          add: 'Kitchen/Conv',
          addDesc: 'Under preparation.',
          freeTitle: 'Freebies',
          freeDesc: 'Water, towels'
        },
        attractions: {
          title: 'Attractions',
          list: [
            { t: 'Hot Place', d: 'Hongdae Street, Yeonnam-dong nearby' }
          ]
        }
      },
      calendar: {
        title: 'Status',
        feeGuideTitle: 'Price List',
        feeGuideLines: [
          '80,000 KRW per night',
          'Opening special coming soon'
        ]
      },
      gallery: {
        more: 'View More',
        categories: ['All', 'Living', 'Bedroom', 'Kitchen', 'Bath', 'View'],
        descriptions: [
          'Gallery coming soon',
          'Cozy space prep',
          'Sensible Interior'
        ]
      }
    }
  },
  common: {
    save: 'Save',
    cancel: 'Cancel',
    loading: 'Loading...',
    contact: {
      title: 'Contact',
      desc: 'Feel free to contact us anytime.',
      call: 'Phone',
      callDesc: 'Direct Call',
      sms: 'SMS',
      smsDesc: 'Inquire via SMS',
      kakao: 'KakaoTalk',
      kakaoDesc: 'KakaoTalk Channel',
      whatsapp: 'WhatsApp',
      whatsappDesc: 'WhatsApp Inquiry',
      fb: 'Messenger',
      fbDesc: 'Facebook Message'
    },
    hostGuide: {
      title: 'Host Intro',
      list: [
        { t: 'Host', d: 'Stone Hong (Hong Byong Seok)' },
        { t: 'Intro', d: 'Tango Instructor / Stay Host. Supporting your tango journey in an artistic space.' },
        { t: 'Inquiry', d: 'Contact us via KakaoTalk or WhatsApp for stay and lesson inquiries.' }
      ]
    },
    story: {
      title: 'TangoStay Story',
      subtitle: 'Art and Rest in Seoul',
      p1: 'Freestyle Tango leading the culture where dance and life harmonize. Providing optimal rest for tangueros is our goal.',
      sol1Title: 'Accessibility',
      sol1Text: 'Located near major milongas like Hapjeong for easy travel.',
      sol2Title: 'For Artists',
      sol2Text: 'Beyond simple stay, providing an artistic interior for inspiration.',
      sol3Title: 'Community',
      sol3Text: 'A platform where tangueros worldwide communicate and make memories.',
      closing: 'Start your special Seoul journey at TangoStay.',
      hostName: 'Stone Hong',
      hostBio: 'Tango Instructor / Stay Host'
    },
    footer: {
      term: 'Terms',
      privacy: 'Privacy',
      termTitle: 'Terms of Service',
      privacyTitle: 'Privacy Policy',
      termText: 'Article 1 (Purpose)...',
      privacyText: 'TangoStay values your personal information...'
    },
  },
  startTime: 'Start Time',
  endTime: 'End Time',
  media: {
    title: 'Media',
    edit: 'Edit Media',
    type: {
      youtube: 'YouTube',
      demonstration: 'Demo',
      general: 'General'
    },
    filterAll: 'All',
    addBtn: 'Register',
    like: 'Like',
    comment: 'Comment',
    views: 'Views',
    noAccess: 'Demonstration video for class participants only.',
    placeholder: {
      title: 'Enter title',
      url: 'YouTube ID or Video URL',
      desc: 'Enter description',
      class: 'Select Class (Optional)',
      comment: 'Leave a comment...'
    },
    uploading: 'Uploading...',
    deleteConfirm: 'Delete this?',
    saveSuccess: 'Saved.',
    deleteSuccess: 'Deleted.'
  },
  story: {
    campaign: {
      title: 'Core Campaign',
      slogan: 'Happy Space, Warm People',
      sloganKo: 'Happy Space, Warm People'
    },
    hero: {
      title: 'The Playground We Dream of,\nA Sanctuary for All',
      subtitle: 'A Freestyle Tango community where we grow together with respect'
    },
    ethics: {
      title: 'Community Core Values',
      respectTitle: 'Attitude First (Respect)',
      respectDesc: 'The premise that we must respect each other is too clear. Otherwise, club activities may be restricted.',
      teachingTitle: 'No Teaching',
      teachingDesc: 'One-sided teaching among students can hinder the progress of both yourself and others. We welcome exchange of opinions, but please resolve technical issues through the instructors.',
      teachingDetail: 'It is important to accurately understand the teacher\'s intentions. Regardless of experience, please refrain from one-sided teaching.'
    },
    projects: {
      title: 'Strategic Projects',
      azit: {
        title: "Project 'Azit'",
        desc: 'Our own sanctuary where we can comfortably talk and enjoy food and drinks before and after classes.'
      },
      camp: {
        title: "Project 'Camp'",
        desc: 'A pension space that can be a sanctuary for us outside the city on weekends and holidays.'
      },
      nuevo: {
        title: "Project Professional Performance Team 'Nuevo Company'",
        desc: 'Operation of a professional performance team and activation of yoga rooms and cultural centers for wellness.'
      },
      orchestra: {
        title: "Project 'House Ochestra'",
        desc: 'Freestyle\'s own house orchestra for salon recitals and live milongas.'
      }
    },
    roadmap: {
      title: 'Sustainable Future',
      cooperative: {
        title: 'Cooperative Transition',
        desc: 'A system where members share ownership of the club and jointly operate and make decisions.'
      },
      donation: {
        title: 'Establishing a Donation Culture',
        desc: 'A culture that supports new members and helps the club grow through scholarships and volunteering.'
      },
      instructor: {
        title: 'Internal Instructor Training',
        desc: 'A system to nurture the next generation of leaders from within our community.'
      }
    },
    guidelines: {
      title: 'General Guide',
      cleaning: 'Wipe up spills immediately.',
      shoes: 'Only dedicated shoes or bare feet are allowed inside.',
      toilet: 'Only toilet paper in the toilet (No hand towels, wet wipes).',
      trash: 'Sort trash and dispose of it in bins when leaving.',
      power: 'Use the main switch next to the door when entering/leaving.',
      facilities: {
        wifi: 'WiFi: freestyle1234',
        pc: 'PC PW: 7788',
        lockers: 'Items cannot be stored outside personal lockers.'
      }
    }
  },
  coaching: {
    title: 'Coaching Management',
    newCoaching: 'New Coaching',
    empty: 'No coaching items registered.',
    student: 'Student',
    instructor: 'Instructor',
    progress: 'Progress',
    status: 'Status',
    ongoing: 'In Progress',
    solved: 'Solve',
    solvedBadge: 'Solved',
    itemTitle: 'Coaching Title',
    itemDesc: 'Coaching Description',
    selectStudent: 'Select Student',
    searchStudentPlaceholder: 'Search name or phone...',
    searchSearching: 'Searching...',
    searchNoResults: 'No results found.',
    creating: 'Creating...',
    updates: 'Activity Log',
    activityAdd: 'Add Activity',
    addComment: 'Write a comment...',
    uploadMedia: 'Add Photo/Video',
    updateProgress: 'Update Progress',
    saveUpdate: 'Save Log',
    noUpdates: 'No logs found.',
    confirmStatusChange: 'Change status?',
    reopen: 'Reopen',
    errorSave: 'Error saving update.'
  }
};
