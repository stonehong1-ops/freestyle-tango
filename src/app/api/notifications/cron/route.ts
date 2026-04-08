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
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const notificationsSent = [];

  // 1. 오늘 날짜가 포함된 클래스 찾기
  const classesSnap = await adminDb.collection('tango_classes')
    .where('dates', 'array-contains', today)
    .get();
  
  const classIds = classesSnap.docs.map(d => d.id);
  const classTitles: Record<string, string> = {};
  classesSnap.docs.forEach(d => { classTitles[d.id] = d.data().title; });

  // 2. 해당 클래스를 신청한 사용자들 찾기
  const targetPhones = new Set<string>();
  if (classIds.length > 0) {
    const regsSnap = await adminDb.collection('registrations')
      .where('classIds', 'array-contains-any', classIds)
      .get();
    regsSnap.docs.forEach(doc => {
      const phone = doc.data().phone?.replace(/[^0-9]/g, '');
      if (phone) targetPhones.add(phone);
    });
  }

  // 3. 오늘 밀롱가 예약자 추가
  const milongaSnap = await adminDb.collection('milonga_reservations')
    .where('milongaDate', '==', today)
    .get();
  milongaSnap.docs.forEach(doc => {
    const phone = doc.data().phone?.replace(/[^0-9]/g, '');
    if (phone) targetPhones.add(phone);
  });

  // 4. 기타 일정 포함 여부 (추가 가능)

  if (targetPhones.size === 0) {
    return NextResponse.json({ message: '오늘 일정이 있는 사용자가 없습니다.' });
  }

  // 5. 알림 발송 (전화번호 기반 토큰 조회 및 발송)
  const phoneList = Array.from(targetPhones);
  const tokensSnap = await adminDb.collection('fcm_tokens')
    .where('userId', 'in', phoneList)
    .get();
  
  const tokens = tokensSnap.docs.map(d => d.data().token);
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

  return NextResponse.json({ success: true, count: tokens.length, targets: phoneList.length });
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
