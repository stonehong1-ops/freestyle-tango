import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { adminMessaging, adminFirestore } from '@/lib/firebase-admin';

/**
 * FCM 알림 통합 전송 엔진
 * 대상 전화번호(들)를 받아 해당 사용자의 모든 기기 토큰으로 메시지를 발송합니다.
 */
export async function POST(req: NextRequest) {
  try {
    const { targetPhones, title, body, link, data } = await req.json();

    // 1. 수신 거부 유저 필터링
    const optOutUsersSnap = await adminFirestore.collection('users')
      .where('settings.pushEnabled', '==', false)
      .get();
    const optOutPhones = new Set(optOutUsersSnap.docs.map((d: any) => d.id));

    // 2. 대상 전화번호들에 등록된 FCM 토큰들 조회
    let tokens: string[] = [];
    if (targetPhones === 'all') {
      const tokensSnapshot = await adminFirestore.collection('fcm_tokens').get();
      tokens = tokensSnapshot.docs
        .map((doc: any) => doc.data())
        .filter((data: any) => data.token && (!data.userId || !optOutPhones.has(data.userId)))
        .map((data: any) => data.token);
    } else {
      const cleanPhones = targetPhones.map((p: string) => p.replace(/[^0-9]/g, ''));
      const activePhones = cleanPhones.filter((p: string) => !optOutPhones.has(p));
      
      if (activePhones.length > 0) {
        const tokensSnapshot = await adminFirestore
          .collection('fcm_tokens')
          .where('userId', 'in', activePhones)
          .get();
        tokens = tokensSnapshot.docs.map((doc: any) => doc.data().token).filter((t: any) => !!t);
      }
    }


    if (tokens.length === 0) {
      // Trace which users are missing tokens
      if (targetPhones !== 'all') {
        console.warn(`[FCM WARNING] No tokens found for active users: ${targetPhones.join(', ')}`);
      }
      return NextResponse.json({ success: true, message: '등록된 기기 토큰이 없습니다.', sentCount: 0 });
    }

    // 2. 메시지 구성 (FCM Payload)
    const roomId = data?.roomId || '';
    const messagePayload = {
      notification: {
        title: title || '프리스타일 탱고',
        body: body || '',
      },
      data: {
        ...(data || {}),
        roomId: roomId, // Ensure roomId is passed for deep linking
        link: link || (roomId ? `/chatting?roomId=${roomId}` : '/mypage'), 
        click_action: 'FLUTTER_NOTIFICATION_CLICK',
      },
      tokens: tokens,
    };

    // 3. 일괄 전송
    const response = await adminMessaging.sendEachForMulticast(messagePayload);

    console.log(`[FCM SUMMARY] Success: ${response.successCount}, Failure: ${response.failureCount}`);

    // 4. 만료된 토큰 정리
    if (response.failureCount > 0) {
      const tokensToRemove: string[] = [];
      response.responses.forEach((resp: any, idx: number) => {
        if (!resp.success) {
          const errorCode = resp.error?.code;
          // Clean up tokens that are no longer valid
          if (
            errorCode === 'messaging/invalid-registration-token' ||
            errorCode === 'messaging/registration-token-not-registered'
          ) {
            tokensToRemove.push(tokens[idx]);
          }
          console.error(`[FCM TOKEN ERROR] Token: ${tokens[idx].substring(0, 10)}..., Error: ${errorCode}`);
        }
      });

      if (tokensToRemove.length > 0) {
        console.log(`[FCM CLEANUP] Removing ${tokensToRemove.length} invalid tokens...`);
        const cleanupPromises = tokensToRemove.map(token => 
          adminFirestore.collection('fcm_tokens').doc(token).delete()
        );
        await Promise.all(cleanupPromises);
      }
    }

    return NextResponse.json({
      success: true,
      sentCount: response.successCount,
      failureCount: response.failureCount,
      cleanedCount: response.failureCount > 0 ? tokens.length : 0 
    });
  } catch (error: any) {
    console.error('[FCM ERROR]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
