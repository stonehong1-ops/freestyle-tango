import { db } from './src/lib/firebase';
import { collection, getDocs, updateDoc, doc, query, where } from 'firebase/firestore';

async function recoverNicknames() {
  console.log("Starting nickname recovery for coupons...");
  const issuancesSnap = await getDocs(collection(db, 'user_coupons'));
  const registrationsSnap = await getDocs(collection(db, 'registrations'));
  
  const regMap = new Map();
  registrationsSnap.docs.forEach(d => {
    const data = d.data();
    if (data.phone && data.nickname) {
      const cleanPhone = data.phone.replace(/[^0-9]/g, '');
      regMap.set(cleanPhone, data.nickname);
    }
  });

  let updatedCount = 0;
  for (const issuanceDoc of issuancesSnap.docs) {
    const data = issuanceDoc.data();
    if (!data.userName && data.userId) {
      const cleanUserId = data.userId.replace(/[^0-9]/g, '');
      const foundNickname = regMap.get(cleanUserId);
      
      if (foundNickname) {
        await updateDoc(doc(db, 'user_coupons', issuanceDoc.id), {
          userName: foundNickname
        });
        updatedCount++;
        console.log(`Updated ${issuanceDoc.id}: ${foundNickname}`);
      }
    }
  }
  
  console.log(`Finished! Updated ${updatedCount} records.`);
}

recoverNicknames().catch(console.error);
