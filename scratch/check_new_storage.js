const admin = require('firebase-admin');

const sa = {
  type: "service_account",
  project_id: "freestyle-tango-seoul",
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCnaaOxfbSzQ3Mk\n/wVz74ETTJKWi8Yb0yvtv2mbX9tO1NkWnsneXIpB94Y/Yg66KRFaGVXbbi9H1mCa\ntTpeWkQkeeFgJ6+7tvTgwbp21oIbBGqusi3dqZBq7dHm6kfOF0RSwcEBUR1xh3H1\n+0lFeaVBYvNSXLt2YPW3ViVIFfA0K+GZDgGwB1iN7CBDzvAfdnCaTQboFIDFLhg0\ntjf1JvbhajlWhDjxNIXh0g30YZBKsfywDxigtgoZSVnHODBxmIH/nuK+4XXQonq4\nJeamMcwJNxQIK5FMDl2Q8bkbricTEHSIed29RjONwLuFeh9J38nP0+hGVHdoyVgF\n4DLimDnLAgMBAAECggEADzWXu45SFl8wXNIWarv9nAU+5BJ6wxhiS00yiP0ibX0E\n4/s1F9CMdwXH2oZMFDma6/aVSEQwY3RkfmmsjdnhivbPtO6mFoW+pZS0HgvK8i1q\ni8iARj0bc7t7cGEkeOLAQEx9/mKiLChEADb+JyOwEcqtlHP8S/rvF+LprCziD7sv\nKhlRZ/ycRNKgQ2RNN//IyVvpv9oNuoduHv5nZtCgzdKLcEFhieZlgPboq0bm2qwq\nOwMM8SPm8kIaLxi9mHoxusIKRDFskUIS00365CjmLSUxiHR2VhIGAWcpyBceadET\nvY3BXdZt9OyJlp9FZgpJT/WAAX5vvui/LXqkLvmK8QKBgQDcCx9AT9XxpgTxLvzB\nJWE8r8oSguLEqkvVrU6EtkHqXxIMWi//BfZx/hLivEJ2vfIQoqmh3pXZ2OfoX7FF\na0tMBAXV7DOwoFlyf2rB6gwC9SFJ0Z9Mz7AEqRFh9ak3Yx8gHgqqZ1sEWTzN656y\ nU4DC86dGH8VRp0XdjDrzNO/LwKBgQDCxNx10XHMqNT+Jpji3ElH0TMbGiGWEjwY\nHciYyyW7UBEXc/7YLR2ZHqJKgzYj4yDiBs5KdsKJ71Scb2YKA/0kkkRNpr/3zxYI\n77BMzS7i39Ql+3igj52McKPsNK9wHrkcED/zdeqtYlQCGncR+0QnJyKeYIzWmHo+\nZtiRkjXoJQKBgGWiBXcw6MJKSjIT385eM4FSOGVAavknJwu0lnWZsOxNqQpnhY+m\n82NHVPXAunoZ1Xp1hyAqrNAH7WVY/YnwusCLgx6BkIZeKbJGw8p5Db839X4hAhD6\ RHSCmnLCgrwAXln5RjfasSFbDkiWMaCSI3wose/BZsEu8lPp1UK0QoElAoGBAKhF\nhqbv3h7Qmrw9Qod1hIZcsoeuyueqN2sqiD2h/aZYZXvaxomkaNb6hYJU3Hii6az9\n7kqdUjPzpylEgWcTzShEimiAMYh6zPHJi4q/FswCT3rFSZGGorpMMwOG/S+kC4+4\nZlgEP02vDx+GF+tcJ6SgBiPJDMT2lV7GYkNai+JVAoGAai14RZYNU4dCG/YDtQtR\nyVQM1RIWsuHt++iFPoLuX7TiZsQ70ItLUgFLlDZt3VnLhLvv59ib5HhqOV9YbqcQ\nlJdiCMK6XpvaAz7YGugMmxvQ42lPttXwJ8+Mbi20OLfEoIbjHdRXhj6MZG023dtp\nDjhjvG1G1M5Chvr2TzkWBVw=\n-----END PRIVATE KEY-----\n".replace(/\\n/g, '\n'),
  client_email: "firebase-adminsdk-fbsvc@freestyle-tango-seoul.iam.gserviceaccount.com"
};

const app = admin.initializeApp({
  credential: admin.credential.cert(sa),
  storageBucket: 'freestyle-tango-seoul.firebasestorage.app'
});

async function checkStorage() {
  const [files] = await app.storage().bucket().getFiles({ maxResults: 10 });
  console.log(`Found ${files.length} files in the new bucket.`);
  files.forEach(f => console.log(' - ' + f.name));
}

checkStorage().catch(console.error);
