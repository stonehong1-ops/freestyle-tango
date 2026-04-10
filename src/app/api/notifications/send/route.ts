import { NextRequest, NextResponse } from 'next/server';
import { sendNotification } from '@/lib/notifications-server';

export async function POST(req: NextRequest) {
  try {
    const { roomId, roomName, senderName, text, targetPhones } = await req.json();

    if (!targetPhones || targetPhones.length === 0) {
      return NextResponse.json({ success: true, message: '대상자 없음' });
    }

    const NOTICE_ROOM_ID = 'freestyle_notice';
    
    // 직접 알림 발송 함수 호출 (HTTP fetch 오버헤드 제거)
    const result = await sendNotification({
      targetPhones: roomId === NOTICE_ROOM_ID ? 'all' : targetPhones,
      title: roomName,
      body: `${senderName}: ${text}`,
      link: `/chatting?roomId=${roomId}`,
      data: { roomId, type: 'chat' }
    });

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('[CHAT NOTIFY ERROR]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
