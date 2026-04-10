const admin = require('firebase-admin');

// [SOURCE] - US PROJECT
const sourceSa = {
  project_id: "tangostay-7355e",
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDQRZbb7zyG/p48\nlhY2tvHGvXkkbWXxyZMVHNqcRdMJYzEyZ0l0I6ifjsl35d9lLZ58W4CfSYWi5KO1\nAJWvpqFA0Z6kIBnF6Vc3ge+A6VJXRRagsKelqUTHEWOHJuKlMdGnmXXRxIU2Yiku\n/cmMWOgJ1YSL6gpCzB/T3u13lELXrlwFd3q2nkspdFUUoO8aRAk6clhaFvoMr3/H\n7ajT9qI6CAV3C9Y/YU95BjTPohhC0Gg3VpM/+OMPOXi2xkGbkb302bBS00+zbIsN\nM5oK/SCLBHb2anUg9QRDiKgugeEYH7cwJKCEpHm2M/P9sB/omLk3ehLkzmdC6r1Y\nxRhjhjdTAgMBAAECggEAZ3n7rwAY0XVVxwJGvR5912Ex/BBCczPUWMwCLVxfsq1O\ntx0sGIDS+Ztmq6RRLqLQuDZ6HCnaNIlmcLp+pEukmGDNcfvk8jixtYlgJmtGFsfj\nqyi50ovb+Q/BpFeEidDLunp7WCJMkS2KCqfa6FkPyDsGZMF+IZvrQEflMeE+qIs5\nei7Cdr8EIEf4D33QkO9TW82DoVwo0lXGqKRh3DF8Kd34VCCDLAoVYdI3UfEz/sKN\nYQjtPH7QQ8/F95j2zYAS1Oe7LiZ8kP72zssBkHXUayYyk9ApzVzuI+rxMkBuMrLs\ ZhJhgitKfhyR8Bdg34X0PJ0+DIswiP3BAZ3G53kquQKBgQD3jcF96v5cxB06HerR\n8igAiaL3eY6X2NcGn8IxV0PTqCRzrvoMR0iifoTjUyKGTpSrUPfBwWZH2FYAYPmn\nuIdlo/Yi/cnxwkPrL0kbLPU3HBUsWcAMmCP/r01R2OA/x52GfM/1p3h2XGNmTQ84\n6N8BBnHsDyYvtBzb3+1a14EgJwKBgQDXYLpYjP+xhEr4qE+TN4kypGWO4S3ZbarJ\nSOpXKUUymPK344B4XQVg7bVteXGVdfp3EEHyQre1snc9wFD/MfIymfCQM+p4izaz\nBWCvSWbDEO4JIL6F1ST9XuDj1hQZiKrEH8ByABzrnqG32XxX8pTO+r9n3UAE5IHm\mmZxSC8+9QKBgFZPxIDkqB8r+YzD1ZWxuqTFWF60sTTcU8xpc0nExU9Mtrjm7yPM\nztRpDGg+GjF9wHQi3N9fUQwHr6SeKy2BNyQHENCOcBSsyQV9DR4+hJjcX72A5Wb+\nvL5vHqRE25shPBkh91gNNgD+oWGPyJjtCKPQ3XOSrJvBTraS0qzzqn/NAoGAeo7b\nWzpY4f4C335/Uamfk8bC18xBV+G09rdcSl78tm8cZxG5cESWo/KAdBxQSxmIfiot\nLJtUiLtWaTg/nwgf5zV8E8LHIPMvHC3qN7TQGh5PJbiRUfzZAKj11hBi/aisa9AZ\npYV074skQUcsH6u1jBZZxtO6803IsZ2Yv8uwvuUCgYBFoCXepJGNiCmuodIEHqlA\nQ0LINZxU5NkESaqvdngqsl+wO7fjnna9hFLVZKe6XnFy7wJDK2OplB0m1pnSA2a\ncm2NHuDOz+JG4oR8o3iCasVBDBbUjwAeMlUao3OdIadiMenCGniO0LJLWj7Y8Iqs\n3YtNnNohyPoLusEMqP0zdQ==\n-----END PRIVATE KEY-----\n".replace(/\\n/g, '\n'),
  client_email: "firebase-adminsdk-fbsvc@tangostay-7355e.iam.gserviceaccount.com"
};
const sourceApp = admin.initializeApp({ credential: admin.credential.cert(sourceSa) }, 'source');

// [TARGET] - Seoul Project
const targetSa = {
  project_id: "freestyle-tango-seoul",
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCnaaOxfbSzQ3Mk\n/wVz74ETTJKWi8Yb0yvtv2mbX9tO1NkWnsneXIpB94Y/Yg66KRFaGVXbbi9H1mCa\ntTpeWkQkeeFgJ6+7tvTgwbp21oIbBGqusi3dqZBq7dHm6kfOF0RSwcEBUR1xh3H1\n+0lFeaVBYvNSXLt2YPW3ViVIFfA0K+GZDgGwB1iN7CBDzvAfdnCaTQboFIDFLhg0\ntjf1JvbhajlWhDjxNIXh0g30YZBKsfywDxigtgoZSVnHODBxmIH/nuK+4XXQonq4\nJeamMcwJNxQIK5FMDl2Q8bkbricTEHSIed29RjONwLuFeh9J38nP0+hGVHdoyVgF\n4DLimDnLAgMBAAECggEADzWXu45SFl8wXNIWarv9nAU+5BJ6wxhiS00yiP0ibX0E\n4/s1F9CMdwXH2oZMFDma6/aVSEQwY3RkfmmsjdnhivbPtO6mFoW+pZS0HgvK8i1q\ni8iARj0bc7t7cGEkeOLAQEx9/mKiLChEADb+JyOwEcqtlHP8S/rvF+LprCziD7sv\nKhlRZ/ycRNKgQ2RNN//IyVvpv9oNuoduHv5nZtCgzdKLcEFhieZlgPboq0bm2qwq\nOwMM8SPm8kIaLxi9mHoxusIKRDFskUIS00365CjmLSUxiHR2VhIGAWcpyBceadET\nvY3BXdZt9OyJlp9FZgpJT/WAAX5vvui/LXqkLvmK8QKBgQDcCx9AT9XxpgTxLvzB\nJWE8r8oSguLEqkvVrU6EtkHqXxIMWi//BfZx/hLivEJ2vfIQoqmh3pXZ2OfoX7FF\na0tMBAXV7DOwoFlyf2rB6gwC9SFJ0Z9Mz7AEqRFh9ak3Yx8gHgqqZ1sEWTzN656y\nnU4DC86dGH8VRp0XdjDrzNO/LwKBgQDCxNx10XHMqNT+Jpji3ElH0TMbGiGWEjwY\nHciYyyW7UBEXc/7YLR2ZHqJKgzYj4yDiBs5KdsKJ71Scb2YKA/0kkkRNpr/3zxYI\n77BMzS7i39Ql+3igj52McKPsNK9wHrkcED/zdeqtYlQCGncR+0QnJyKeYIzWmHo+\nZtiRkjXoJQKBgGWiBXcw6MJKSjIT385eM4FSOGVAavknJwu0lnWZsOxNqQpnhY+m\n82NHVPXAunoZ1Xp1hyAqrNAH7WVY/YnwusCLgx6BkIZeKbJGw8p5Db839X4hAhD6\nRHSCmnLCgrwAXln5RjfasSFbDkiWMaCSI3wose/BZsEu8lPp1UK0QoElAoGBAKhF\nhqbv3h7Qmrw9Qod1hIZcsoeuyueqN2sqiD2h/aZYZXvaxomkaNb6hYJU3Hii6az9\n7kqdUjPzpylEgWcTzShEimiAMYh6zPHJi4q/FswCT3rFSZGGorpMMwOG/S+kC4+4\nZlgEP02vDx+GF+tcJ6SgBiPJDMT2lV7GYkNai+JVAoGAai14RZYNU4dCG/YDtQtR\nyVQM1RIWsuHt++iFPoLuX7TiZsQ70ItLUgFLlDZt3VnLhLvv59ib5HhqOV9YbqcQ\nlJdiCMK6XpvaAz7YGugMmxvQ42lPttXwJ8+Mbi20OLfEoIbjHdRXhj6MZG023dtp\nDjhjvG1G1M5Chvr2TzkWBVw=\n-----END PRIVATE KEY-----\n".replace(/\\n/g, '\n'),
  client_email: "firebase-adminsdk-fbsvc@freestyle-tango-seoul.iam.gserviceaccount.com"
};
const targetApp = admin.initializeApp({ credential: admin.credential.cert(targetSa) }, 'target');

const sourceDb = sourceApp.firestore();
const targetDb = targetApp.firestore();

const collections = [
  'admin_settings',
  'chat_messages',
  'chat_rooms',
  'coaching_items',
  'coaching_updates',
  'coupons',
  'cron_logs',
  'extra_schedules',
  'fcm_tokens',
  'media',
  'media_comments',
  'media_likes',
  'milonga_info',
  'milonga_reservations',
  'monthly_notices',
  'registrations',
  'reservations',
  'tango_classes',
  'user_coupons',
  'users'
];

async function migrate() {
  console.log('🚀 Final Sync: US -> SEOUL (Self-contained)');
  for (const collectionName of collections) {
    console.log(`\n📦 Collection: [${collectionName}]`);
    const snapshot = await sourceDb.collection(collectionName).get();
    if (snapshot.empty) {
      console.log(`  - Skipping (empty).`);
      continue;
    }
    console.log(`  - Copying ${snapshot.size} docs...`);
    let batch = targetDb.batch();
    let count = 0;
    for (const doc of snapshot.docs) {
      const docRef = targetDb.collection(collectionName).doc(doc.id);
      batch.set(docRef, doc.data());
      count++;
      if (count % 450 === 0) {
        await batch.commit();
        batch = targetDb.batch();
      }
    }
    await batch.commit();
    console.log(`  ✅ Success.`);
  }
}

migrate().then(() => {
  console.log('🎉 Final data sync completed.');
  process.exit(0);
}).catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
