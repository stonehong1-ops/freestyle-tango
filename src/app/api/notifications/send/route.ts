import { NextRequest, NextResponse } from 'next/server';
import { sendNotification } from '@/lib/notifications-server';

export async function POST(req: NextRequest) {
  try {
    const { 
      title, 
      body, 
      link, 
      targetPhones, 
      data,
      // Legacy chat params for backward compatibility if needed
      roomId,
      roomName,
      senderName,
      text 
    } = await req.json();

    if (!targetPhones || (Array.isArray(targetPhones) && targetPhones.length === 0)) {
      return NextResponse.json({ success: true, message: '대상자 없음' });
    }

    const NOTICE_ROOM_ID = 'freestyle_notice';
    
    // 직접 알림 발송 함수 호출
    const result = await sendNotification({
      targetPhones: roomId === NOTICE_ROOM_ID ? 'all' : targetPhones,
      title: title || roomName || '새 메시지',
      body: body || (senderName ? `${senderName}: ${text}` : text) || '알림이 도착했습니다.',
      link: link || (roomId ? `/chatting?roomId=${roomId}` : undefined),
      data: data || (roomId ? { roomId, type: 'chat' } : undefined)
    });

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('[CHAT NOTIFY ERROR]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
