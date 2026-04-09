import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { adminFirestore, adminMessaging, FieldValue } from '@/lib/firebase-admin';
import { COMMUNITY_ROOM_ID } from '@/lib/chat';

/**
 * 스케줄 기반 알림 작업 (Vercel Cron용)
 * GET /api/notifications/cron?type=morning | afternoon
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');
  const authHeader = req.headers.get('authorization');
  
  // [임시 진단용] 요청이 들어왔음을 Firestore에 즉시 기록
  try {
    await adminFirestore.collection('cron_logs').add({
      type: `triggered_${type}`,
      timestamp: FieldValue.serverTimestamp(),
      authHeader: authHeader ? 'present' : 'missing',
      envSecret: process.env.CRON_SECRET ? 'configured' : 'missing'
    });
  } catch (e) {
    console.error('Failed to log trigger', e);
  }

  // 보안 검증
  if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }


  try {
    if (type === 'morning') {
      return await handleMorningSchedule();
    } else if (type === 'afternoon') {
      return await handleAfternoonSummary();
    } else {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('[CRON ERROR]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * 오전 10시: 오늘 일정이 있는 사용자에게 알림
 */
async function handleMorningSchedule() {
  const now = new Date();
  const kstOffset = 9 * 60 * 60 * 1000;
  const kstTime = new Date(now.getTime() + kstOffset);
  const kstToday = kstTime.toISOString().split('T')[0]; // YYYY-MM-DD (KST)
  
  // 날짜 제목 포맷팅: [4/9(목) 프리스타일 일정]
  const month = kstTime.getMonth() + 1;
  const date = kstTime.getDate();
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  const weekday = weekdays[kstTime.getDay()];
  const displayTitle = `[${month}/${date}(${weekday}) 프리스타일 일정]`;

  // 1. 오늘 날짜의 모든 일정 수집
  const [classesSnap, milongaSnap, extraSnap] = await Promise.all([
    adminFirestore.collection('tango_classes')
      .where('dates', 'array-contains', kstToday)
      .get(),
    adminFirestore.collection('milonga_info')
      .where('activeDate', '==', kstToday)
      .get(),
    adminFirestore.collection('extra_schedules')
      .where('date', '==', kstToday)
      .get()
  ]);

  const events: { time: string; title: string }[] = [];

  classesSnap.docs.forEach((doc: any) => {
    const data = doc.data();
    events.push({ time: data.timeStr || '', title: data.title });
  });

  milongaSnap.docs.forEach((doc: any) => {
    const data = doc.data();
    events.push({ time: data.startTime || '', title: '밀롱가 루씨' });
  });

  extraSnap.docs.forEach((doc: any) => {
    const data = doc.data();
    events.push({ time: data.time || '', title: data.title });
  });


  // 시간순 정렬
  events.sort((a, b) => a.time.localeCompare(b.time));

  if (events.length === 0) {
    return NextResponse.json({ success: true, message: '오늘 일정이 없습니다.' });
  }

  // 본문 구성: [시간] [제목]
  const bodyText = events.map(e => `[${e.time}] ${e.title}`).join('\n');

  // 2. 수신 거부 유저 필터링
  const optOutUsersSnap = await adminFirestore.collection('users')
    .where('settings.pushEnabled', '==', false)
    .get();
  const optOutPhones = new Set(optOutUsersSnap.docs.map((d: any) => d.id));

  // 3. 토큰 가져오기 (필터링 적용)
  const allTokensSnap = await adminFirestore.collection('fcm_tokens').get();
  const tokens = Array.from(new Set(
    allTokensSnap.docs
      .map((d: any) => d.data())
      .filter((data: any) => data.token && (!data.userId || !optOutPhones.has(data.userId)))
      .map((data: any) => data.token)
  )) as string[];

  let successCount = 0;
  let failureCount = 0;

  if (tokens.length > 0) {
    const response = await adminMessaging.sendEachForMulticast({
      tokens,
      notification: {
        title: displayTitle,
        body: bodyText,
      },
      data: { 
        link: '/calendar',
        type: 'schedule'
      },
      webpush: {
        fcmOptions: { link: '/calendar' }
      }
    });
    successCount = response.successCount;
    failureCount = response.failureCount;
  }

  // 4. 실행 로그 기록 (Firestore)
  await adminFirestore.collection('cron_logs').add({
    type: 'morning',
    timestamp: FieldValue.serverTimestamp(),
    kstDate: kstToday,
    eventCount: events.length,
    tokenCount: tokens.length,
    successCount,
    failureCount,
    executedAt: kstTime.toISOString()
  });

  return NextResponse.json({ 
    success: true, 
    title: displayTitle,
    recipients: tokens.length,
    sent: successCount,
    failed: failureCount,
    date: kstToday
  });
}

/**
 * 오후 2시: 수다방 신규 메시지 요약 알림
 */
async function handleAfternoonSummary() {
  const now = new Date();
  const kstOffset = 9 * 60 * 60 * 1000;
  const kstTime = new Date(now.getTime() + kstOffset);
  const kstToday = kstTime.toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  // 1. 최근 24시간 메시지 카운트 (수다방)
  const msgsSnap = await adminFirestore.collection('chat_messages')
    .where('roomId', '==', COMMUNITY_ROOM_ID)
    .where('timestamp', '>=', yesterday)
    .count()
    .get();
  
  const newCount = msgsSnap.data().count;

  if (newCount === 0) {
    return NextResponse.json({ success: true, message: '새로운 이야기가 없습니다.' });
  }

  // 2. 수신 거부 유저 필터링
  const optOutUsersSnap = await adminFirestore.collection('users')
    .where('settings.pushEnabled', '==', false)
    .get();
  const optOutPhones = new Set(optOutUsersSnap.docs.map((d: any) => d.id));

  // 3. 토큰 가져오기 (필터링 적용)
  const allTokensSnap = await adminFirestore.collection('fcm_tokens').get();
  const tokens = Array.from(new Set(
    allTokensSnap.docs
      .map((d: any) => d.data())
      .filter((data: any) => data.token && (!data.userId || !optOutPhones.has(data.userId)))
      .map((data: any) => data.token)
  )) as string[];

  const displayTitle = '💬 수다방 소식';
  const displayBody = `오늘 수다방에 ${newCount}개의 새로운 이야기가 올라왔습니다. 내용을 확인하세요~`;

  let successCount = 0;
  let failureCount = 0;

  if (tokens.length > 0) {
    const response = await adminMessaging.sendEachForMulticast({
      tokens,
      notification: {
        title: displayTitle,
        body: displayBody,
      },
      data: {
        link: '/chatting',
        type: 'chat_summary'
      },
      webpush: {
        fcmOptions: { link: '/chatting' }
      }
    });
    successCount = response.successCount;
    failureCount = response.failureCount;
  }

  // 4. 실행 로그 기록 (Firestore)
  await adminFirestore.collection('cron_logs').add({
    type: 'afternoon',
    timestamp: FieldValue.serverTimestamp(),
    kstDate: kstToday,
    newMessages: newCount,
    tokenCount: tokens.length,
    successCount,
    failureCount,
    executedAt: kstTime.toISOString()
  });

  return NextResponse.json({ 
    success: true, 
    newMessages: newCount, 
    recipients: tokens.length,
    sent: successCount,
    failed: failureCount
  });
}
