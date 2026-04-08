import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminMessaging } from '@/lib/firebase-admin';
import { COMMUNITY_ROOM_ID } from '@/lib/chat';

/**
 * 스케줄 기반 알림 작업 (Vercel Cron용)
 * GET /api/notifications/cron?type=morning | afternoon
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');
  
  // 보안 검증 (Vercel 환경 변수 CRON_SECRET 확인)
  const authHeader = req.headers.get('authorization');
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
  const kstToday = new Date(now.getTime() + kstOffset).toISOString().split('T')[0]; // YYYY-MM-DD (KST)

  // 1. 오늘 날짜의 일정이 하나라도 있는지 확인 (수업 / 밀롱가 등)
  const [classesSnap, milongaSnap] = await Promise.all([
    adminDb.collection('tango_classes')
      .where('dates', 'array-contains', kstToday)
      .limit(1)
      .get(),
    adminDb.collection('milonga_reservations')
      .where('milongaDate', '==', kstToday)
      .limit(1)
      .get()
  ]);

  const hasEvent = !classesSnap.empty || !milongaSnap.empty;

  if (!hasEvent) {
    return NextResponse.json({ message: '오늘 등록된 일정이 없습니다.' });
  }

  // 2. 전체 사용자(토큰)에게 알림 발송
  const allTokensSnap = await adminDb.collection('fcm_tokens').get();
  const tokens = allTokensSnap.docs.map(d => d.data().token);

  if (tokens.length > 0) {
    await adminMessaging.sendEachForMulticast({
      tokens,
      notification: {
        title: '☀️ 오늘 일정을 확인하세요!',
        body: '오늘은 즐거운 탱고 일정이 있는 날입니다. 시간을 확인하고 늦지 않게 방문해 주세요!',
      },
      data: { 
        link: '/calendar',
        type: 'schedule'
      },
      webpush: {
        fcmOptions: { link: '/calendar' }
      }
    });
  }

  return NextResponse.json({ 
    success: true, 
    recipients: tokens.length, 
    date: kstToday,
    eventCheck: hasEvent
  });
}

/**
 * 오후 2시: 수다방 신규 메시지 요약 알림
 */
async function handleAfternoonSummary() {
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  // 1. 최근 24시간 메시지 카운트 (수다방)
  const msgsSnap = await adminDb.collection('chat_messages')
    .where('roomId', '==', COMMUNITY_ROOM_ID)
    .where('timestamp', '>=', yesterday)
    .count()
    .get();
  
  const newCount = msgsSnap.data().count;

  if (newCount === 0) {
    return NextResponse.json({ message: '신규 메시지 없음' });
  }

  // 2. 전체 사용자(토큰)에게 알림 발송
  const allTokensSnap = await adminDb.collection('fcm_tokens').get();
  const tokens = allTokensSnap.docs.map(d => d.data().token);

  if (tokens.length > 0) {
    await adminMessaging.sendEachForMulticast({
      tokens,
      notification: {
        title: '💬 수다방 소식',
        body: `오늘 수다방에 ${newCount}개의 새로운 이야기가 등록되었습니다. 지금 확인해 보세요!`,
      },
      data: {
        link: '/chatting',
        type: 'chat_summary'
      },
      webpush: {
        fcmOptions: { link: '/chatting' }
      }
    });
  }

  return NextResponse.json({ success: true, newMessages: newCount, recipients: tokens.length });
}
