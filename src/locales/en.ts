export default {
  header: {
    story: 'TangoStay Story',
    location: 'Location',
    guide: 'Details',
    contact: 'Contact Us',
  },
  nav: {
    milonga: 'Milonga',
    stay: 'TangoStay',
    class: 'Class',
    info: 'Guide',
    mypage: 'MyPage',
  },
  milonga: {
    title: 'Milonga Reservation',
    reserveBtn: 'Reserve',
    status: 'Status',
  },
  class: {
    title: 'Class Registration',
    applyBtn: 'Apply',
    applied: 'Applied',
  },
  mypage: {
    title: 'My Page',
    registrations: 'My Registrations',
    membership: 'Membership Info',
  },
  // Common Sections
  common: {
    story: {
      title: 'TangoStay Story',
      subtitle: '"Just bring yourself"... Introducing TangoStay\'s [Desert Island Experiment].',
      p1: 'My single goal in creating this space as a host was the \'Desert Island Experiment\'. A space where you can just walk in with a single suitcase and live perfectly comfortably for over a week without ever stepping outside. I designed this space to completely solve the countless inconveniences I experienced as a guest.',
      sol1Title: 'Stay Pack: ZERO Discomfort, Welcome Gift Box',
      sol1Text: 'Stop worrying about using someone else\'s towels or soap. We provide every guest with brand new towels, dishcloths, soap, and toothbrush sets—hotel amenity quality, all brand new. No need to run to the convenience store on your first day.',
      sol2Title: 'No More Water Worries! Premium Water Purifier',
      sol2Text: 'Free yourself from carrying heavy water bottles. A state-of-the-art water purifier is installed, providing unlimited clean, cool water anytime.',
      sol3Title: 'Uncompromising Cleanliness (Professional Laundrygo)',
      sol3Text: 'All bedding (duvet, cover, pad, pillowcases) and floor rugs are prepared in duplicates and professionally washed and high-temperature sterilized by Laundrygo for every new guest. Experience deep sleep on flawlessly clean bedding.',
      closing: 'I look forward to welcoming you to my \'Desert Island\', the most comfortable place to truly relax.',
      hostName: '👋 I\'m Stone, the Argentine Tango Dancer.',
      hostBio: ''
    },
    hostGuide: {
      title: '🛡️ Room Guidelines & Host Communication',
      list: [
        { t: '🔓 Check-in / Out (Flexible)', d: 'Contactless entry. Password and room info sent via message on check-in day.\nStandard: Check-in 15:00 / Check-out 11:00 (Can be adjusted for your convenience!)' },
        { t: '🏠 Strict Rules', d: 'Absolute NO SMOKING in the entire building. Special cleaning fees apply for violations.\nPlease separate recycling and do dishes before check-out.\nAs a newly built studio, please refrain from loud noises after 22:00.' },
        { t: '🤩 24/7 Host Communication', d: 'Contact me anytime, even early morning! Don\'t hesitate to message if you\'re uncomfortable.\nIf you are missing any essential items during your stay, let me know. I will purchase and deliver them same-day.' }
      ]
    },
    contact: {
      title: 'Contact Us',
      desc: 'Please feel free to reach out anytime if you have questions.',
      call: 'Call',
      sms: 'SMS',
      kakao: 'Kakao Chat',
      whatsapp: 'WhatsApp',
      fb: 'FB Messenger',
      callDesc: '010-7209-2468 (Stone)',
      smsDesc: 'Fast response guaranteed',
      kakaoDesc: 'ID: stonehong@kakao.com',
      whatsappDesc: 'For Global Guests',
      fbDesc: 'Facebook Message'
    },
    footer: {
      term: 'Terms of Service',
      privacy: 'Privacy Policy',
      termTitle: '[Terms of Service]',
      termText: `Article 1 (Purpose)\nThe purpose of these terms is to stipulate the rights, obligations, and responsibilities between the host and the guest regarding the accommodation services provided by TangoStay.\n\nArticle 2 (Service Provision)\n1. TangoStay provides the guest with the specified accommodation and all ancillary facilities (including free consumables).\n2. The host may claim actual damages from the guest for any damage to property within the accommodation.\n\nArticle 3 (Guest Obligations)\n1. Guests are prohibited from smoking or making loud noises (after 22:00) that may disturb others.\n2. Violations may result in forced eviction and a special cleaning fee.`,
      privacyTitle: '[Privacy Policy]',
      privacyText: `1. Collected Personal Information\nTangoStay collects the following personal information for smooth reservation and communication.\n- Items collected: Name, Contact number, Reservation schedule\n\n2. Purpose of Collection and Use\n- Guiding passwords for the building and room door locks\n- Payment and reservation confirmation, customer response for stay quality management\n\n3. Retention Period\n- In principle, the information is destroyed immediately after the purpose is achieved (1 month after check-out).`
    }
  },
  // Stay-specific Sections
  stays: {
    hapjeong: {
      name: 'Hapjeong',
      hero: {
        subtitle: '1 min from Hapjeong Stn, Hangang Park within walking distance, Your quiet & cozy stay'
      },
      gallery: {
        more: 'View More Photos',
        categories: ['All', 'Living', 'Bedroom', 'Kitchen', 'Bath', 'View'],
        descriptions: [
          'Living room, Desk (Vanity), Dining table for 2',
          'Premium studio with high ceilings',
          'Perfect layout for resting and dining',
          '2026 Samsung Smart TV M7 / Desk & Vanity',
          'Free Premium TV & OTT channels (Personal login available)',
          'Kakao Park Smart Speaker',
          'IKEA Premium Bedding (Queen Size)',
          'Bedroom TV',
          'Recliner Massage Chair (High Performance)',
          'Ace Single Bed with IKEA Bedding',
          'Accommodates 3 guests (Living room sofa can be used)',
          'Water purifier, Cooking utensils, Condiments, Disposables fully equipped',
          'Samsung Refrigerator & Washing Machine',
          'Separated Washbasin, Toilet, and Shower room',
          'Shampoo, Conditioner, Body wash provided',
          'Bidet available',
          'Han River View & Cool River Breeze',
          '1 minute to Hangang Park',
          'Han River View & City View'
        ]
      },
      calendar: {
        title: 'Reservation Availability',
        priceInfo: 'Smart Check-in / Base 2 guests (Max 3)',
        basePrice: 'Weekday: 90,000 KRW / Weekend: 120,000 KRW',
        feeGuideLines: [
          '80,000 KRW per night (1 Guest)',
          '+10,000 KRW per additional guest (Max 4)',
          '+10,000 KRW on Weekends & Holidays',
          '30,000 KRW cleaning fee',
          '20,000 KRW Discount for 7+ nights stay'
        ],
      },
      location: {
        title: 'Location',
        addressLabel: 'Address:',
        bldgLabel: 'Building:',
        address: '13 Yanghwa-ro, Mapo-gu, Seoul',
        bldg: 'Hapjeong Square Riverview',
  },
      guide: {
        title: 'Details & Guide',
        subtitle: '"We have equipped everything so you can start your daily life without any preparations"',
        highlights: {
          title: '✨ Key Highlights of the Room',
          list: [
            { t: 'Newly Built Premium with Open Views', d: 'Enjoy exceptional Han River views from the newest and cleanest studio in the Hapjeong/Hongdae area.' },
            { t: 'Uncompromising Cleanliness', d: 'Bedding and rugs are professionally washed by Laundrygo every time. Indoor steam cleaning, and all towels/dishcloths are 100% replaced with new ones.' },
            { t: 'Premium Relaxation Furniture', d: 'Two spacious beds (Queen, Super Single), cozy sofa, and a high-performance recliner massage chair.' },
            { t: 'Rich Entertainment', d: 'Living room features a 2026 Samsung Moving Style Smart TV, plus an additional TV in the bedroom.' }
          ],
          quote: '"Enjoy the massage chair while watching the Han River night view~"'
        },
        transport: {
          title: '📍 Convenient Location & Transport (Free Parking)',
          list: [
            { t: 'Super Prime Location', d: '1 min walk to Hapjeong Stn. Fast access to Hongdae/Sinchon by foot/subway/bus (10 min walk to Hongdae).' },
            { t: 'Transportation Hub', d: 'Convergence point for all buses moving across Seoul. (Mangwon Stn, Hongdae Stn all adjacent)' },
            { t: 'Convenient Parking', d: 'Bring your car and park for free. (Host covers the monthly 30,000 KRW fee)' },
            { t: 'Driving & Taxi', d: 'Just 1 minute to enter Gangbyeon Expressway heading to Gangnam, Ilsan, Yeouido.' }
          ]
        },
        facilities: {
          title: '🛋️ Amenities & Facilities (Free Consumables)',
          base: 'Basic Appliances/Furniture',
          baseDesc: 'Refrigerator, Washing Machine, AC, Smart TVs (2), Giga Wi-Fi, Sink, Induction stove, Queen & Super Single beds',
          add: 'Additional Facilities',
          addDesc: 'Secure Door Lock, CCTV/Management Office, Dining Table, Water Purifier, Sofa, Large Desk, Spacious Closet, Shoe Rack',
          freeTitle: '✨ All Consumables Provided Free!!!',
          freeDesc: 'Ramen, instant rice, toilet paper, tissues, toothbrush/toothpaste sets, shampoo/conditioner, body wash, hand wash provided.\nFreely use the laundry drying rack, detergent, fabric softener, and garbage/recycling bags!'
        },
        attractions: {
          title: '🛍️ Neighborhood Lifestyle & Attractions',
          list: [
            { t: 'Hapjeong / Hongdae District', d: 'Adjacent to the best restaurants and cafes in Hapjeong and the vibrant streets of Hongdae.' },
            { t: 'Convenient Supermarkets', d: 'Wang Mart is 1 min away for quick groceries. Homeplus Mega Mart is a 5 min walk for everything else.' },
            { t: 'Escape to the Han River Anytime', d: '1 minute walk to the Hangang Park entrance. Closely connected to Mangwon Hangang Park.' }
          ]
        }
      }
    },
    deokeun: {
      name: 'Deokeun',
      hero: {
        subtitle: 'Cozy new stay in Deokeun district, near Hangang Park, perfect for quiet rest'
      },
      gallery: {
        more: 'View More Photos',
        categories: ['All', 'Living', 'Bedroom', 'Kitchen', 'Bath', 'View'],
        descriptions: [
          'Bright and pleasant main living space',
          'The most comfortable and cozy bedroom',
          'Clean and spacious entrance structure',
          'Spacious desk and vanity area',
          'Always cozy and warm environment',
          'Android Smart TV with free OTT (Netflix, etc.)',
          'Spacious closet to keep your clothes wrinkle-free',
          'Fully equipped with air purifier, vacuum, and steam cleaner',
          'Neat and well-organized kitchen',
          'Fully equipped kitchen tools for cooking (1)',
          'Fully equipped kitchen tools for cooking (2)',
          'Welcome tea including coffee and green tea provided free',
          'Free instant rice and ramen for when you feel hungry',
          'Brand new bath amenities (towels, toothbrushes) provided free',
          'Hygienic bidet installed and maintained clean',
          'Separated shower room for a pleasant bath experience',
          'First aid kit for emergencies (painkillers, digestives, etc.)',
          'Free access to the fitness center equipped with the latest machines',
          'Ventilated area for fresh air drying of your clothes'
        ]
      },
      calendar: {
        title: 'Reservation Availability',
        priceInfo: 'Smart Check-in / Base 2 guests (Max 3)',
        basePrice: 'Weekday: 70,000 KRW / Weekend: 80,000 KRW',
        feeGuideLines: [
          '60,000 KRW per night (1 Guest)',
          '+10,000 KRW per additional guest (Max 4)',
          '+10,000 KRW on Weekends & Holidays',
          '30,000 KRW cleaning fee',
          '20,000 KRW Discount for 7+ nights stay'
        ],
  },
      location: {
        title: 'Location',
        addressLabel: 'Address:',
        bldgLabel: 'Building:',
        address: '110 Eutteum-ro, Deokyang-gu, Goyang-si, Gyeonggi-do',
        bldg: 'Hillstate Eco Deokeun',
  },
      guide: {
        title: 'Details & Guide',
        subtitle: '🏠 [Just bring yourself!] Free amenities, fitness center, and parking\nWebsite: freestay.notion.site\nWe have equipped everything so you can start your daily life without any preparations.',
        highlights: {
          title: '✨ Key Highlights of the Room',
          list: [
            { t: 'Cleanliness', d: 'Bedding and rugs professionally washed (Laundrygo), steam cleaned, towels/cloths replaced every time' },
            { t: 'Kitchen/Appliances', d: 'Coway water purifier, LG air purifier, Samsung combo oven, LG drum washer, SK induction' },
            { t: 'Storage/Furniture', d: '3-door closet, shoe rack, movable single dining table & desk' }
          ],
          quote: '| Coffee, bath/laundry supplies, and garbage bags are all provided for free!'
        },
        transport: {
          title: '📍 Convenient Location & Transport',
          list: [
            { t: '🚌 Bus right outside', d: 'Sangam/DMC 5 mins, Hongdae/Hapjeong 15 mins, Gayang 15 mins, Yeouido 30 mins' },
            { t: '🅿️ Convenient Parking', d: 'Spacious and pleasant parking lot indicative of a newly built building' },
            { t: '🚗 Driving', d: 'Located along Jayuro, 1 minute access to Gangbyeon Expressway toward Ilsan/Yeouido' }
          ]
        },
        facilities: {
          title: ' Couch Amenities & Facilities (Free Consumables)',
          base: 'Basic Appliances/Furniture',
          baseDesc: 'Refrigerator, Drum Washing Machine, System AC, Smart TV, Giga Wi-Fi, Comfortable bed and mattress',
          add: 'Additional Facilities',
          addDesc: 'Secure door lock, CCTV, Water purifier, Air purifier, Cozy lighting',
          freeTitle: '✨ All Consumables Provided Free!!!',
          freeDesc: 'Snacks like ramen and instant rice, premium shower kits (shampoo, body wash, toothbrush/toothpaste) all provided for free\nLaundry detergent and official garbage bags are also freely available for your convenience.'
        },
        attractions: {
          title: '🛍️ Neighborhood Lifestyle & Parks',
          list: [
            { t: '☕ Restaurants/Cafes', d: 'Dense commercial area. Paris Baguette (same bldg), Starbucks (next door), and 2 famous 9,000 KRW buffet restaurants' },
            { t: '🛒 Supermarket', d: 'Lotte Super is just a 1-minute walk away' },
            { t: '🌳 Greenery', d: 'Abundant neighborhood parks, Hangang Park entrance nearby' }
          ]
        },
        neighborhood: {
          title: '🌳 [Neighborhood Guide] "Is this Seoul or a Forest?" Perfect Guide to Deokeun-dong',
          list: [
            { t: '🏃‍♂️ Exceptional Parks & Greenery Just for Walking', d: 'The greatest advantage of Deokeun District is its proximity to the Han River, feeling like the park is your front yard.\n\n- Deokeun Hangang Park & Noeul Park Connection: Perfect for biking or jogging. The sunset over the Han River is the greatest gift of this "Desert Island Experiment."\n- Small Parks in the Complex: The walking trails between the buildings are exceptionally safe and pleasant for a light evening stroll.' },
            { t: '🛒 "Slipper-commute" Supermarkets & Convenience', d: 'Did you use up all the welcome gift box items after moving in? Don\'t worry. Everything is nearby.\n\n- Large Grocery Mart: A mart where you can buy fresh ingredients at low prices is close by, making it great for cooking.\n- Convenience Stores: Major convenience stores like GS25, CU, and 7-Eleven are clustered around, making it convenient 24/7.\n- Cafes & Bakeries: Emotional cafes that are great for bringing a laptop and working are popping up one after another.' },
            { t: '🏥 Reliable Living Infrastructure', d: 'You can\'t miss out on health and safety.\n\n- Clinics & Pharmacies: Basic clinics like internal medicine and dentistry, as well as pharmacies, are within walking distance, so you can feel safe in emergencies.\n- Laundry/Alterations: In addition to Laundrygo, if you have laundry that needs urgent care, try the neighborhood laundromat.' }
          ],
          quote: '"Deokeun-dong is vibrant during the day and really quiet at night. There won\'t be a better neighborhood for guests who want a noise-free rest."'
        },
        story: {
          title: '📜 From a Thousand-Year Land Embracing the Han River to a Smart City!',
          desc: 'Hello! Today I\'d like to tell you an interesting story about Deokeun-dong, where our stay is located. You\'ll be surprised if you thought it was just a new studio apartment complex. Without further ado, let\'s explore the fascinating behind-the-scenes story of this neighborhood!',
          sections: [
            { t: '1. Meaning of the Name: "A Neighborhood Where Virtue is Hidden"', d: 'The Hanja (Chinese characters) for Deokeun-dong translate to "Hiding (隱) in Great Virtue (德)."\n\n- Land Embracing Hidden Virtue: Since ancient times, this area has been considered a place where virtuous people quietly reside and build up virtue, owing to its cozy topography facing the Han River.\n- An Auspicious Site: It is actually considered an excellent spot based on Feng Shui principles, with the fertile land by the Han River in the front and Daedeoksan Mountain guarding the back.' },
            { t: '2. Deokeun-dong in History: A Home Since Prehistoric Times', d: 'Deokeun-dong is not a neighborhood that was just created recently. Its history goes all the way back to the Prehistoric Era.\n\n- Land of Relics: During the development of the Deokeun District, numerous relics and dolmens from the Paleolithic and Neolithic eras were discovered. This is proof that our ancestors chose this place as an optimal living site thousands of years ago.\n- A Strategic Defense Point: During the Joseon Dynasty, it was an important passageway to protect Hanyang (Seoul) and held immense historical significance in connection with the nearby Haengjusanseong Fortress.' },
            { t: '3. A Monumental Change: From a Military Base to "The Next Sangam"', d: 'Just a few years ago, this was a secretive space where public access was restricted because the Korea National Defense University and military facilities were located here.\n\n- The Birth of a New City: With the relocation of military facilities, the "Deokeun Media Valley," a complex combining residential and commercial areas, was developed across roughly 640,000 square meters.\n- The Extension of Sangam DMC: It directly borders Sangam-dong, Mapo-gu, and has already gained a reputation among broadcasting/media industry workers as a "cleaner, newer neighborhood than Sangam."' },
            { t: '4. Why Deokeun-dong is Attractive Today (3 Reasons)', d: '### ① The Han River like Your "Front Yard"\nDeokeun-dong is one of the residential districts closest to the Han River. You can reach the Hangang Park on foot, making a "Han River Lifestyle" an everyday reality.\n\n### ② Better Accessibility than Inside Seoul\nAlthough administratively in Goyang-si, cross the Gayang Bridge and you are in Gangseo-gu (Magok), and right next to it is Mapo-gu (Sangam). It boasts a smart location where you can reach major business districts within 10–20 minutes.\n\n### ③ The Pleasantness of a Planned City\nEverything is newly built, so the entire street is clean. There are no narrow alleys or old buildings, but instead, wide roads harmoniously matched with modern office buildings, giving off an exotic vibe.' }
          ],
          quote: '"If you stay in Deokeun-dong, be sure to visit the Daedeoksan Trail or the Han River connection path around sunset. We hope you feel exactly why this place is called where virtue is hidden."'
        },
        transportGuide: {
          title: '🚌 Transportation Encyclopedia: How to get to 7 key landmarks from Deokeun',
          list: [
            { t: '1. DMC (Digital Media City Station)', d: '• Public Transit: 15-20 min via Village Bus (Goyang 022A/B, 054)\n• Taxi: Approx 12 min (~7,000 KRW)\n• Car: Approx 8-10 min towards Susaek-ro' },
            { t: '2. Sangam (Broadcasting/Business District)', d: '• Public Transit: 20 min via Branch Bus (730, 7711)\n• Taxi: Under 10 min\n• Car: Arrive immediately passing World Cup Park' },
            { t: '3. Hongdae (Including Hapjeong/Yeonnam)', d: '• Public Transit: 15-20 min via Branch Bus (7711), no transfers\n• Taxi: 12-15 min via Gangbyeon Expressway (~9,000 KRW)\n• Car: Gangbyeon Expressway towards Seoul -> Hapjeong/Mangwon IC' },
            { t: '4. Magok (Gayang/Gangseo)', d: '• Public Transit: 15 min via Bus crossing Gayang Bridge -> Line 9 Gayang Stn\n• Taxi: Around 10 min crossing Gayang Bridge (~9,500 KRW)\n• Car: 10 min directly entering Magok Business District' },
            { t: '5. Ilsan (Lake Park/KINTEX)', d: '• Public Transit: 20-30 min direct via Bus 730 towards Jungang-ro\n• Taxi: 15-20 min via Jayu-ro (~15,000 KRW)\n• Car: 1 min to Jayu-ro, 15 min without traffic lights to Lake Park' },
            { t: '6. Yeouido (IFC Mall/Financial District)', d: '• Public Transit: 30 min via Express Bus (9707) to Yeouido Transfer Center\n• Taxi: 20-25 min via Gangbyeon Expressway (~15,000 KRW)\n• Car: 20 mins straight via Gangbyeon Expressway' },
            { t: '7. Gangnam (Sinsa/Gangnam Station)', d: '• Public Transit: 45-50 min via Bus -> Line 9 Express (Highly Recommended)\n• Taxi: 35-40 min via Gangbyeon / Olympic Expressway (non-rush hour)\n• Car: 30 min via Gangbyeon to Hannam/Olympic Expressway' }
          ]
        },
        complexNews: {
          title: '🏢 [Complex News] Premium Life at Hillstate: From Fitness to Laundry!',
          desc: 'Hello! Today we introduce the community facilities and convenient services that our residents love the most at Hillstate Eco Deokeun. Check out the premium lifestyle where you can manage your health and daily convenience without leaving the complex!',
          list: [
            { t: '1. 🏋️‍♂️ Free Fitness Center (07:00 AM ~ 10:00 PM)', d: 'Maintain a healthy lifestyle at our state-of-the-art fitness center.\n- Operating Hours: 07:00 AM ~ 10:00 PM (Closed Mondays)\n- Features: Spacious, separated cardio and weight zones\n- Required: Must register fingerprint at the adjacent management office' },
            { t: '2. 🧘‍♀️ Well-Public (Yoga & Pilates Studio)', d: 'Visit here if you need professional posture correction and healing. (Paid service)\n- Main Programs: Manual therapy, 1:1 Rehab PT, Yoga/Stretching (Kids, Healing, Traditional)\n- Expert Instructors: Physical therapist director and specialized instructors on-site' },
            { t: '3. 🧺 24-Hour Self-Service Laundromat', d: 'Easily wash large items or bedding within the complex!\n- Facilities: Extra-large washer (30kg) and dryer (28kg), plus a dedicated shoe washer/dryer\n- Convenient kiosk system with one-stop washing to drying' },
            { t: '4. 👔 New York Premium Laundry (Alterations & Delivery)', d: 'Leave your delicate garments and dry-cleaning to the professionals.\n- Specializes in suits, boutique dry-cleaning, and various garment alterations\n- Offers pick-up & delivery service right to your unit\n- Inquiries: 02-747-2325' }
          ],
          quote: '💡 Tip: Make smart use of the exclusive "my HILLS" app for residents. Don\'t miss out on the premium services exclusive to our complex!'
        }
      }
    },
    hongdae: {
      name: 'Hongdae',
      hero: {
        subtitle: 'Walking distance to Hongik Univ Stn, refined space in the heart of Hongdae'
      },
      gallery: {
        more: 'View More Photos',
        categories: ['All', 'Living', 'Bedroom', 'Kitchen', 'Bath', 'View'],
        descriptions: [
          'Living room, Desk (Vanity), Dining table for 2',
          'Premium studio with high ceilings',
          'Perfect layout for resting and dining',
          '2026 Samsung Smart TV M7 / Desk & Vanity',
          'Free Premium TV & OTT channels (Personal login available)',
          'Kakao Park Smart Speaker',
          'IKEA Premium Bedding (Queen Size)',
          'Bedroom TV',
          'Recliner Massage Chair (High Performance)',
          'Ace Single Bed with IKEA Bedding',
          'Accommodates 3 guests (Living room sofa can be used)',
          'Water purifier, Cooking utensils, Condiments, Disposables fully equipped',
          'Samsung Refrigerator & Washing Machine',
          'Separated Washbasin, Toilet, and Shower room',
          'Shampoo, Conditioner, Body wash provided',
          'Bidet available',
          'Dynamic views of Hongdae city center',
          'Best spot for foodies',
          'Vibrant city view'
        ]
      },
      calendar: {
        title: 'Reservation Availability',
        priceInfo: 'Smart Check-in / Base 2 guests (Max 3)',
        basePrice: 'Weekday: 90,000 KRW / Weekend: 120,000 KRW',
        feeGuideLines: [
          '80,000 KRW per night (1 Guest)',
          '+10,000 KRW per additional guest (Max 4)',
          '+10,000 KRW on Weekends & Holidays',
          '30,000 KRW cleaning fee',
          '20,000 KRW Discount for 7+ nights stay'
        ],
  },
      location: {
        title: 'Location',
        addressLabel: 'Address:',
        bldgLabel: 'Building:',
        address: 'Seogyo-dong, Mapo-gu, Seoul (Details soon)',
        bldg: 'Stay Hongdae',
  },
      guide: {
        title: 'Details & Guide',
        subtitle: '"We have equipped everything so you can start your daily life without any preparations"',
        highlights: {
          title: '✨ Key Highlights of the Room',
          list: [
            { t: 'Heart of Hongdae', d: 'Closest possible location to enjoy Hongdae\'s trendy culture.' },
            { t: 'Uncompromising Cleanliness', d: 'Bedding and rugs are professionally washed by Laundrygo every time. Indoor steam cleaning, and all towels/dishcloths are 100% replaced with new ones.' },
            { t: 'Premium Relaxation Furniture', d: 'Two spacious beds (Queen, Super Single), cozy sofa, and a high-performance recliner massage chair.' },
            { t: 'Rich Entertainment', d: 'Living room features a 2026 Samsung Moving Style Smart TV, plus an additional TV in the bedroom.' }
          ],
          quote: '"Premium rest after enjoying the vibes of Hongdae~"'
        },
        transport: {
          title: '📍 Convenient Location & Transport',
          list: [
            { t: 'Hongik Univ Stn Area', d: 'Very convenient access to Line 2, Airport Railroad, and Gyeongui-Jungang Line.' },
            { t: 'Plentiful Bus Routes', d: 'Numerous buses going across Seoul and to Incheon Airport.' },
            { t: 'Perfect for Walking', d: 'Best location to explore Hongdae, Hapjeong, and Yeonnam-dong all on foot.' }
          ]
        },
        facilities: {
          title: ' Couch Amenities & Facilities (Free Consumables)',
          base: 'Basic Appliances/Furniture',
          baseDesc: 'Refrigerator, Washing Machine, AC, Smart TVs (2), Giga Wi-Fi, Sink, Induction stove, Queen & Super Single beds',
          add: 'Additional Facilities',
          addDesc: 'Secure Door Lock, CCTV/Management Office, Dining Table, Water Purifier, Sofa, Large Desk, Spacious Closet, Shoe Rack',
          freeTitle: '✨ All Consumables Provided Free!!!',
          freeDesc: 'Ramen, instant rice, toilet paper, tissues, toothbrush/toothpaste sets, shampoo/conditioner, body wash, hand wash provided.\nFreely use the laundry drying rack, detergent, fabric softener, and garbage/recycling bags!'
        },
        attractions: {
          title: '🛍️ Neighborhood Lifestyle & Attractions',
          list: [
            { t: 'Hongdae Walking Street', d: 'Main street of Hongdae filled with busking and various shops.' },
            { t: 'Yeonnam-dong Gyeongui Line Forest Park', d: 'Enjoy "Yentral Park", a hot spot for walks and picnics.' },
            { t: 'Endless Restaurants & Cafes', d: 'Famous local and international restaurants and hidden cafes are dense within hundreds of meters.' }
          ]
        }
      }
    }
  },
  // Common items (fallback)
  calendar: {
    checkin: 'Check-in',
    checkout: 'Check-out',
    reserveBtn: 'Reserve Now',
    Sun: 'Sun', Mon: 'Mon', Tue: 'Tue', Wed: 'Wed', Thu: 'Thu', Fri: 'Fri', Sat: 'Sat',
    booked: 'Booked',
    available: 'Available',
    selected: 'Selected',
    totalPrice: 'Total Price',
    surcharge: 'Includes Weekend/Holiday Surcharge',
    clearBtn: 'Clear Selection',
    guestsCount: 'Guests',
    days: 'Nights',
    won: 'KRW',
    blockedAlert: '[Fully Booked]\nGuest:',
    period: 'Period:',
    invalidRange: 'Your selected range includes already booked dates. Please try again.',
    hintSelectOut: 'Please select a check-out date!',
    feeGuideTitle: 'Pricing Guide',
    hintSelectDates: 'Select dates on the calendar to see the exact total price.',
    guestSelectLabel: 'Guests',
    guestOptions: ['1 Guest (Base)', '2 Guests (+10k/night)', '3 Guests (+20k/night)', '4 Guests (Max, +30k/night)'],
    finalPriceTitle: 'Total Final Price',
    baseFee: 'Base Nightly Rate',
    guestFee: 'Extra Guest Fee',
    weekendFee: 'Weekend/Holiday Surcharge',
    cleaningFee: 'Cleaning Fee',
    longStayDiscount: 'Long Stay Discount',
    proceedBtn: 'Proceed to Book',
    stay: 'Stay',
    selectedDate: 'Selected Dates',
    viewList: 'View as List',
    viewCalendar: 'View as Calendar'
  },
  location: {
    naver: 'Open in Naver Map',
    kakao: 'Open in Kakao Map'
  },
  contact: {
    title: 'Contact Us',
    desc: 'Please feel free to reach out anytime if you have questions.',
    call: 'Call',
    sms: 'SMS',
    kakao: 'Kakao Chat',
    whatsapp: 'WhatsApp',
    fb: 'FB Messenger',
    callDesc: '010-7209-2468 (Stone)',
    smsDesc: 'Fast response guaranteed',
    kakaoDesc: 'ID: stonehong@kakao.com',
    whatsappDesc: 'For Global Guests',
    fbDesc: 'Facebook Message'
  },
  reserve: {
    title: 'Reservation Details',
    nights: 'Nights',
    reserveDate: 'Dates:',
    totalAmount: 'Total Amount:',
    nameLabel: 'Guest Name',
    namePlace: 'Enter your full name',
    phoneLabel: 'Contact',
    phonePlace: '010-0000-0000',
    guestLabel: 'Number of Guests',
    guests: 'Guests',
    reqLabel: 'Requests',
    reqPlace: 'Any special requests or questions?',
    submitBtn: 'Submit Reservation',
    submitting: 'Processing...',
    errorFill: 'Please fill in name, contact, and guest count.',
    errorFail: 'An error occurred while processing.',

    save: 'Save',
    cancel: 'Cancel',
    close: 'Close',
    editBtn: 'Edit',
    deleteBtn: 'Delete',
  },
  complete: {
    title: 'Reservation Complete! 🎉',
    desc: 'Payment and check-in instructions will be sent to your provided contact number shortly.',
    guestSmsBtn: 'Get reservation info (SMS)',
    hostSmsBtn: 'Notify host (SMS)',
    guideBtn: 'Preview Usage Guide',
    homeBtn: 'Return to Home',
    sms: '[{stayName} Reservation]\nGuest: {name}\nDates: {checkIn} ~ {checkOut}\nGuests: {guests}\nAmount: {total} KRW\n\n[Check-in Info]\nTime: 4:00 PM\nPassword: 9999\n\nThank you!'
  }
};
