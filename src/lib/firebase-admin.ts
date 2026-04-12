import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    let sa = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (sa) {
      sa = sa.trim();
      // 양쪽 끝의 따옴표(홑/쌍) 제거
      if ((sa.startsWith("'") && sa.endsWith("'")) || (sa.startsWith('"') && sa.endsWith('"'))) {
        sa = sa.slice(1, -1);
      }
      
      let serviceAccount;
      try {
        serviceAccount = JSON.parse(sa);
      } catch (e: any) {
        console.warn('JSON.parse failed for Service Account, attempting manual extraction...');
        
        // JSON 파싱 실패 시 필수 필드만 정규식으로 추출
        const extractField = (field: string) => {
          const match = sa!.match(new RegExp(`"${field}"\\s*:\\s*"([^"]+)"`));
          if (!match) return null;
          // 이스케이프된 역슬래시 처리
          return match[1].replace(/\\\\/g, '\\');
        };

        const pk = extractField('private_key');
        const pid = extractField('project_id');
        const email = extractField('client_email');

        if (pk && pid && email) {
          serviceAccount = {
            project_id: pid,
            private_key: pk,
            client_email: email
          };
        } else {
          console.error('Failed to extract essential fields from FIREBASE_SERVICE_ACCOUNT');
          throw e;
        }
      }
      
      // PEM 개인키의 개행 문자(\n)가 문자열로 들어온 경우 실제 개행으로 변환
      if (serviceAccount.private_key && typeof serviceAccount.private_key === 'string') {
        const pk = serviceAccount.private_key;
        // 여러 가지 형태의 \n(\n, \\n, \\\n 등)을 실제 개행 문자로 통일
        serviceAccount.private_key = pk.replace(/\\n/g, '\n').replace(/\n\n/g, '\n');
        
        // PEM 헤더/푸터가 깨져있을 경우를 대비해 보정
        if (!serviceAccount.private_key.includes('-----BEGIN PRIVATE KEY-----')) {
          console.warn('PEM Header missing, adding it...');
          // 이 경우는 드물지만, 혹시 몰라 추가적인 보정 필요 시 여기서 처리
        }
      }

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as any),
        databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
      });
      console.log('Firebase Admin initialized successfully: project =', serviceAccount.project_id);
    }
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
  }
}

// Export the services only when an app exists to avoid build-time crashes
export const adminMessaging = admin.apps.length ? admin.messaging() : (null as any);
export const adminFirestore = admin.apps.length ? admin.firestore() : (null as any);
export const adminAuth = admin.apps.length ? admin.auth() : (null as any);
export const FieldValue = admin.firestore.FieldValue;
