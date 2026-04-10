import { adminMessaging, adminFirestore } from './firebase-admin';

export interface NotificationPayload {
  targetPhones: string[] | 'all';
  title: string;
  body: string;
  link?: string;
  data?: Record<string, string>;
}

/**
 * FCM 알림 통합 전송 로직 (서버 사이드 전용)
 * API Route나 서버 컴포넌트에서 직접 호출하여 HTTP 오버헤드를 줄입니다.
 */
export async function sendNotification({
  targetPhones,
  title,
  body,
  link,
  data
}: NotificationPayload) {
  if (!adminMessaging || !adminFirestore) {
    console.error('[NOTIFICATION] Firebase Admin not initialized');
    return { success: false, error: 'Admin not initialized' };
  }

  try {
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
        // Firestore 'in' query supports up to 30 items. 
        // For larger lists, we should chunk them, but usually targetPhones (chat participants) is small.
        const tokensSnapshot = await adminFirestore
          .collection('fcm_tokens')
          .where('userId', 'in', activePhones)
          .get();
        tokens = tokensSnapshot.docs.map((doc: any) => doc.data().token).filter((t: any) => !!t);
      }
    }

    if (tokens.length === 0) {
      return { success: true, message: 'No tokens found', sentCount: 0 };
    }

    // 3. 메시지 구성
    const roomId = data?.roomId || '';
    const messagePayload = {
      notification: {
        title: title || '프리스타일 탱고',
        body: body || '',
      },
      data: {
        ...(data || {}),
        roomId: roomId,
        link: link || (roomId ? `/chatting?roomId=${roomId}` : '/mypage'),
        click_action: 'FLUTTER_NOTIFICATION_CLICK',
      },
      tokens: tokens,
    };

    // 4. 전송
    const response = await adminMessaging.sendEachForMulticast(messagePayload);
    console.log(`[FCM SUMMARY] Success: ${response.successCount}, Failure: ${response.failureCount}`);

    // 5. 만료된 토큰 정리 (비동기로 실행하여 응답 지연 최소화)
    if (response.failureCount > 0) {
      (async () => {
        const tokensToRemove: string[] = [];
        response.responses.forEach((resp: any, idx: number) => {
          if (!resp.success) {
            const errorCode = resp.error?.code;
            if (
              errorCode === 'messaging/invalid-registration-token' ||
              errorCode === 'messaging/registration-token-not-registered'
            ) {
              tokensToRemove.push(tokens[idx]);
            }
          }
        });

        if (tokensToRemove.length > 0) {
          const batch = adminFirestore.batch();
          tokensToRemove.forEach(token => {
            batch.delete(adminFirestore.collection('fcm_tokens').doc(token));
          });
          await batch.commit();
        }
      })().catch(e => console.error('[FCM CLEANUP ERROR]', e));
    }

    return {
      success: true,
      sentCount: response.successCount,
      failureCount: response.failureCount
    };

  } catch (error: any) {
    console.error('[SEND NOTIFICATION ERROR]', error);
    throw error;
  }
}
