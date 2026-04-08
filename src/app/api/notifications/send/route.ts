import { NextRequest, NextResponse } from 'next/server';
import { adminMessaging, adminFirestore } from '@/lib/firebase-admin';

/**
 * FCM 알림 통합 전송 엔진
 * 대상 전화번호(들)를 받아 해당 사용자의 모든 기기 토큰으로 메시지를 발송합니다.
 */
export async function POST(req: NextRequest) {
  try {
    const { targetPhones, title, body, link, data } = await req.json();

    if (!targetPhones || (targetPhones !== 'all' && (!Array.isArray(targetPhones) || targetPhones.length === 0))) {
      return NextResponse.json({ error: '대상 전화번호가 필요합니다.' }, { status: 400 });
    }

    // 1. 대상 전화번호들에 등록된 FCM 토큰들 조회
    let tokens: string[] = [];
    if (targetPhones === 'all') {
      const tokensSnapshot = await adminFirestore.collection('fcm_tokens').get();
      tokens = tokensSnapshot.docs.map(doc => doc.data().token).filter(t => !!t);
    } else {
      const cleanPhones = targetPhones.map((p: string) => p.replace(/[^0-9]/g, ''));
      const tokensSnapshot = await adminFirestore
        .collection('fcm_tokens')
        .where('userId', 'in', cleanPhones)
        .get();
      tokens = tokensSnapshot.docs.map(doc => doc.data().token).filter(t => !!t);
    }

    if (tokens.length === 0) {
      return NextResponse.json({ success: true, message: '등록된 기기 토큰이 없습니다.', sentCount: 0 });
    }

    // 2. 메시지 구성 (FCM Payload)
    // - notification: 시스템 레이어 알림 (앱이 꺼져있을 때 표시)
    // - data: 클릭 시 이동 링크 등 커스텀 데이터 (앱 내부에서 활용)
    const messagePayload = {
      notification: {
        title: title || '프리스타일 탱고',
        body: body || '',
      },
      data: {
        ...(data || {}),
        link: link || '/mypage', // 클릭 시 이동할 경로 (기본값: 마이페이지)
        click_action: 'FLUTTER_NOTIFICATION_CLICK', // 범용 클릭 액션 상업적 명칭 유지
      },
      tokens: tokens,
    };

    // 3. 일괄 전송
    const response = await adminMessaging.sendEachForMulticast(messagePayload);

    console.log(`[FCM SUCCESS] ${response.successCount} messages sent. ${response.failureCount} failed.`);

    // 4. 만료된 토큰 정리 (실패한 토큰 중 만료된 것은 DB에서 삭제 권장하지만, 일단 성공 결과만 반환)
    return NextResponse.json({
      success: true,
      sentCount: response.successCount,
      failureCount: response.failureCount,
    });
  } catch (error: any) {
    console.error('[FCM ERROR]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
