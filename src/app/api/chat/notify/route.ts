import { NextRequest, NextResponse } from 'next/server';

/**
 * 채팅 알림 전송 (통합 메인 엔드포인트 활용)
 * '채팅'에 특화된 포맷으로 변환하여 메인 발송 API를 다시 호출합니다.
 */
export async function POST(req: NextRequest) {
  try {
    const { roomId, roomName, senderName, text, targetPhones } = await req.json();

    if (!targetPhones || targetPhones.length === 0) {
      return NextResponse.json({ success: true, message: '대상자 없음' });
    }

    // 1. 알림 내용 구성
    const title = `${roomName}`;
    const body = `${senderName}: ${text}`;
    
    // 2. 딥링크 및 타겟 설정
    const link = `/chatting?roomId=${roomId}`;
    const NOTICE_ROOM_ID = 'freestyle_notice';
    
    // 3. 메인 알림 발송 API 호출 (내부 호출)
    const baseUrl = req.nextUrl.origin;
    const response = await fetch(`${baseUrl}/api/notifications/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        targetPhones: roomId === NOTICE_ROOM_ID ? 'all' : targetPhones,
        title,
        body,
        link,
        data: { roomId, type: 'chat' }
      })
    });

    const result = await response.json();
    return NextResponse.json(result);

  } catch (error: any) {
    console.error('[CHAT NOTIFY ERROR]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
