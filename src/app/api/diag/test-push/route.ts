import { NextResponse } from 'next/server';
import { adminMessaging } from '@/lib/firebase-admin';

export async function POST(req: Request) {
  try {
    const { token, title, body } = await req.json();

    if (!adminMessaging) {
      return NextResponse.json({ 
        success: false, 
        error: "Firebase Admin Messaging is not initialized" 
      }, { status: 500 });
    }

    try {
      const response = await adminMessaging.send({
        token,
        notification: {
          title: title || "정밀 진단 테스트",
          body: body || "서버 응답을 확인 중입니다.",
        },
        android: {
          priority: 'high',
        },
        webpush: {
          headers: {
            Urgency: 'high'
          }
        }
      });

      return NextResponse.json({ 
        success: true, 
        messageId: response,
        info: "FCM 서버가 요청을 수락했습니다." 
      });
    } catch (fcmError: any) {
      console.error('FCM Detailed Error:', fcmError);
      return NextResponse.json({ 
        success: false, 
        errorCode: fcmError.code,
        errorMessage: fcmError.message,
        errorDetails: fcmError.errorInfo || null,
        suggestion: "이 에러 코드를 바탕으로 문제를 해결해야 합니다."
      }, { status: 400 });
    }
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
