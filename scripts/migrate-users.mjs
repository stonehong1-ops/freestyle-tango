import admin from 'firebase-admin';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Manually parse .env.local without dotenv dependency
const envPath = join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf-8');
  content.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      let value = (match[2] || '').trim();
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
      process.env[match[1]] = value;
    }
  });
}

if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
  console.error('FIREBASE_SERVICE_ACCOUNT is missing in .env.local');
  process.exit(1);
}

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
if (serviceAccount.private_key) {
  serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function migrate() {
  console.log('Starting migration...');
  
  const usersMap = new Map();

  // 1. Fetch from registrations
  console.log('Fetching registrations...');
  const regSnap = await db.collection('registrations').get();
  regSnap.forEach(doc => {
    const data = doc.data();
    const phone = data.phone?.replace(/[^0-9]/g, '');
    if (!phone) return;

    if (!usersMap.has(phone)) {
      usersMap.set(phone, {
        phone,
        nickname: data.nickname || '',
        photoURL: data.photoURL || '',
        role: data.role || 'user',
        createdAt: data.date ? admin.firestore.Timestamp.fromDate(new Date(data.date)) : admin.firestore.FieldValue.serverTimestamp(),
        lastVisit: admin.firestore.FieldValue.serverTimestamp(),
        settings: {
          pushEnabled: false,
          openChat: true,
          privateChat: true
        }
      });
    } else {
      const existing = usersMap.get(phone);
      if (data.photoURL && !existing.photoURL) existing.photoURL = data.photoURL;
      if (data.nickname && !existing.nickname) existing.nickname = data.nickname;
    }
  });

  // 2. Fetch from user_activity
  console.log('Fetching user_activity...');
  const actSnap = await db.collection('user_activity').get();
  actSnap.forEach(doc => {
    const data = doc.data();
    const phone = data.phone?.replace(/[^0-9]/g, '');
    if (!phone) return;

    const existing = usersMap.get(phone) || {};
    usersMap.set(phone, {
      ...existing,
      phone,
      nickname: data.nickname || existing.nickname || '',
      photoURL: data.photoURL || existing.photoURL || '',
      role: data.role || existing.role || 'user',
      lastVisit: data.lastVisit || existing.lastVisit || admin.firestore.FieldValue.serverTimestamp(),
      settings: existing.settings || {
        pushEnabled: false,
        openChat: true,
        privateChat: true
      }
    });
  });

  // 3. Fetch from user_settings
  console.log('Fetching user_settings...');
  const setSnap = await db.collection('user_settings').get();
  setSnap.forEach(doc => {
    const data = doc.data();
    const phone = doc.id.replace(/[^0-9]/g, '');
    
    const user = usersMap.get(phone);
    if (user) {
      user.settings = {
        pushEnabled: data.pushEnabled || false,
        openChat: data.openChat ?? true,
        privateChat: data.privateChat ?? true,
        token: data.token || user.settings?.token || null
      };
    } else {
       usersMap.set(phone, {
         phone,
         nickname: 'Unknown',
         settings: {
           pushEnabled: data.pushEnabled || false,
           openChat: data.openChat ?? true,
           privateChat: data.privateChat ?? true,
           token: data.token || null
         }
       });
    }
  });

  console.log(`Aggregated ${usersMap.size} users. Starting batch write...`);

  const batchSize = 500;
  const users = Array.from(usersMap.values());
  
  for (let i = 0; i < users.length; i += batchSize) {
    const batch = db.batch();
    const chunk = users.slice(i, i + batchSize);
    
    chunk.forEach(user => {
      const userRef = db.collection('users').doc(user.phone);
      batch.set(userRef, user, { merge: true });
    });
    
    await batch.commit();
    console.log(`Committed chunk ${Math.floor(i / batchSize) + 1}`);
  }

  console.log('Migration COMPLETED successfully.');
}

migrate().catch(err => {
  console.error('Migration FAILED:', err);
  process.exit(1);
});
