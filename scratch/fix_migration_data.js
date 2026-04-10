
const admin = require('firebase-admin');

const sa = {
  type: "service_account",
  project_id: "freestyle-tango-seoul",
  private_key: "-----BEGIN PRIVATE KEY-----\n" +
"MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCnaaOxfbSzQ3Mk\n" +
"/wVz74ETTJKWi8Yb0yvtv2mbX9tO1NkWnsneXIpB94Y/Yg66KRFaGVXbbi9H1mCa\n" +
"tTpeWkQkeeFgJ6+7tvTgwbp21oIbBGqusi3dqZBq7dHm6kfOF0RSwcEBUR1xh3H1\n" +
"+0lFeaVBYvNSXLt2YPW3ViVIFfA0K+GZDgGwB1iN7CBDzvAfdnCaTQboFIDFLhg0\n" +
"tjf1JvbhajlWhDjxNIXh0g30YZBKsfywDxigtgoZSVnHODBxmIH/nuK+4XXQonq4\n" +
"JeamMcwJNxQIK5FMDl2Q8bkbricTEHSIed29RjONwLuFeh9J38nP0+hGVHdoyVgF\n" +
"4DLimDnLAgMBAAECggEADzWXu45SFl8wXNIWarv9nAU+5BJ6wxhiS00yiP0ibX0E\n" +
"4/s1F9CMdwXH2oZMFDma6/aVSEQwY3RkfmmsjdnhivbPtO6mFoW+pZS0HgvK8i1q\n" +
"i8iARj0bc7t7cGEkeOLAQEx9/mKiLChEADb+JyOwEcqtlHP8S/rvF+LprCziD7sv\n" +
"KhlRZ/ycRNKgQ2RNN//IyVvpv9oNuoduHv5nZtCgzdKLcEFhieZlgPboq0bm2qwq\n" +
"OwMM8SPm8kIaLxi9mHoxusIKRDFskUIS00365CjmLSUxiHR2VhIGAWcpyBceadET\n" +
"vY3BXdZt9OyJlp9FZgpJT/WAAX5vvui/LXqkLvmK8QKBgQDcCx9AT9XxpgTxLvzB\n" +
"JWE8r8oSguLEqkvVrU6EtkHqXxIMWi//BfZx/hLivEJ2vfIQoqmh3pXZ2OfoX7FF\n" +
"a0tMBAXV7DOwoFlyf2rB6gwC9SFJ0Z9Mz7AEqRFh9ak3Yx8gHgqqZ1sEWTzN656y\n" +
"nU4DC86dGH8VRp0XdjDrzNO/LwKBgQDCxNx10XHMqNT+Jpji3ElH0TMbGiGWEjwY\n" +
"HciYyyW7UBEXc/7YLR2ZHqJKgzYj4yDiBs5KdsKJ71Scb2YKA/0kkkRNpr/3zxYI\n" +
"77BMzS7i39Ql+3igj52McKPsNK9wHrkcED/zdeqtYlQCGncR+0QnJyKeYIzWmHo+\n" +
"ZtiRkjXoJQKBgGWiBXcw6MJKSjIT385eM4FSOGVAavknJwu0lnWZsOxNqQpnhY+m\n" +
"82NHVPXAunoZ1Xp1hyAqrNAH7WVY/YnwusCLgx6BkIZeKbJGw8p5Db839X4hAhD6\n" +
"RHSCmnLCgrwAXln5RjfasSFbDkiWMaCSI3wose/BZsEu8lPp1UK0QoElAoGBAKhF\n" +
"hqbv3h7Qmrw9Qod1hIZcsoeuyueqN2sqiD2h/aZYZXvaxomkaNb6hYJU3Hii6az9\n" +
"7kqdUjPzpylEgWcTzShEimiAMYh6zPHJi4q/FswCT3rFSZGGorpMMwOG/S+kC4+4\n" +
"ZlgEP02vDx+GF+tcJ6SgBiPJDMT2lV7GYkNai+JVAoGAai14RZYNU4dCG/YDtQtR\n" +
"yVQM1RIWsuHt++iFPoLuX7TiZsQ70ItLUgFLlDZt3VnLhLvv59ib5HhqOV9YbqcQ\n" +
"lJdiCMK6XpvaAz7YGugMmxvQ42lPttXwJ8+Mbi20OLfEoIbjHdRXhj6MZG023dtp\n" +
"DjhjvG1G1M5Chvr2TzkWBVw=\n" +
"-----END PRIVATE KEY-----\n",
  client_email: "firebase-adminsdk-fbsvc@freestyle-tango-seoul.iam.gserviceaccount.com"
};

admin.initializeApp({ credential: admin.credential.cert(sa) });
const db = admin.firestore();

const OLD_BUCKET = "tangostay-7355e.firebasestorage.app";
const NEW_BUCKET = "freestyle-tango-seoul.firebasestorage.app";

async function fixData() {
    console.log('Fixing milonga_info...');
    const milongaSnap = await db.collection('milonga_info').get();
    for (const doc of milongaSnap.docs) {
        const data = doc.data();
        if (data.posterUrl && data.posterUrl.includes(OLD_BUCKET)) {
            const newUrl = data.posterUrl.replace(OLD_BUCKET, NEW_BUCKET);
            await doc.ref.update({ posterUrl: newUrl });
            console.log(`Updated posterUrl for [${doc.id}]`);
        }
    }

    console.log('Fixing media...');
    const mediaCount = { updated: 0, typeFixed: 0 };
    const mediaSnap = await db.collection('media').get();
    for (const doc of mediaSnap.docs) {
        const data = doc.data();
        let updated = false;
        const updates = {};

        // URL fix
        ['videoUrl', 'thumbnailUrl'].forEach(key => {
            if (data[key] && data[key].includes(OLD_BUCKET)) {
                updates[key] = data[key].replace(OLD_BUCKET, NEW_BUCKET);
                updated = true;
            }
        });

        // Type fix for Lucy Live
        if (data.relatedMilongaDate && data.type !== 'lucy') {
            updates.type = 'lucy';
            updated = true;
            mediaCount.typeFixed++;
        }

        if (updated) {
            await doc.ref.update(updates);
            mediaCount.updated++;
        }
    }
    console.log(`Updated ${mediaCount.updated} media items (${mediaCount.typeFixed} types corrected to 'lucy')`);
}

fixData().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
