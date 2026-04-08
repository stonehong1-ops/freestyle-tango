import { NextResponse } from 'next/server';
import admin from 'firebase-admin';
import { getClasses, getMilongaInfo, getExtraSchedules } from '@/lib/db';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT 
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
      : undefined;

    if (serviceAccount) {
      if (serviceAccount.private_key) {
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
      }
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } else {
      // Fallback for local development or if using individual env vars
      admin.initializeApp({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      });
    }
  } catch (error) {
    console.error('Firebase admin initialization error', error);
  }
}

export async function GET(request: Request) {
  // Security check for Vercel Cron
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && process.env.NODE_ENV === 'production') {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    // 1. Get current date in KST (Timezone: Asia/Seoul)
    const kstDate = new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Seoul"}));
    const todayStr = kstDate.getFullYear() + '-' + 
                    String(kstDate.getMonth() + 1).padStart(2, '0') + '-' + 
                    String(kstDate.getDate()).padStart(2, '0');
                    
    const dayNames = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
    const todayDayName = dayNames[kstDate.getDay()];
    const currentMonth = todayStr.substring(0, 7);

    console.log(`[Cron] Fetching schedules for ${todayStr} (${todayDayName})`);

    // 2. Fetch schedules for today
    const [classes, milonga, extraSchedules] = await Promise.all([
      getClasses(),
      getMilongaInfo(todayStr),
      getExtraSchedules(currentMonth)
    ]);

    // Filter today's items
    const todayClasses = classes.filter(c => 
      c.targetMonth === currentMonth && c.time.includes(todayDayName)
    );
    const todayExtra = extraSchedules.filter(s => s.date === todayStr);

    // 3. Compose message
    let messageBody = '';
    if (todayClasses.length > 0) {
      messageBody += `📚 수업: ${todayClasses.map(c => c.title).join(', ')}\n`;
    }
    if (milonga) {
      messageBody += `💃 밀롱가: 오늘 ${milonga.activeDate} 일정이 있습니다!\n`;
    }
    if (todayExtra.length > 0) {
      messageBody += `📅 기타: ${todayExtra.map(s => s.title).join(', ')}\n`;
    }

    // If no schedule, skip notification
    if (!messageBody) {
      console.log('[Cron] No schedules for today. Skipping notification.');
      return NextResponse.json({ success: true, message: 'No schedule today' });
    }

    console.log('[Cron] Schedule found:', messageBody.trim());

    // 4. Get all FCM tokens
    const db = admin.firestore();
    const tokensSnapshot = await db.collection('fcm_tokens').get();
    const tokens = tokensSnapshot.docs.map(doc => doc.id);

    if (tokens.length === 0) {
      console.warn('[Cron] No registered FCM tokens found in Firestore.');
      return NextResponse.json({ success: true, message: 'No registered tokens' });
    }

    console.log(`[Cron] Sending push to ${tokens.length} tokens.`);

    // 5. Send notification
    const payload = {
      notification: {
        title: '오늘의 프리스타일 탱고 일정',
        body: messageBody.trim(),
      },
      tokens: tokens,
    };

    const response = await admin.messaging().sendEachForMulticast(payload);
    
    // Cleanup invalid tokens
    if (response.failureCount > 0) {
      const failedTokens: string[] = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          failedTokens.push(tokens[idx]);
        }
      });
      
      const batch = db.batch();
      failedTokens.forEach(t => {
        batch.delete(db.collection('fcm_tokens').doc(t));
      });
      await batch.commit();
    }

    return NextResponse.json({ 
      success: true, 
      sentCount: response.successCount,
      failureCount: response.failureCount 
    });

  } catch (error) {
    console.error('Error in daily notification cron:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
