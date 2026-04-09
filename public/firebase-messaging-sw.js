importScripts('https://www.gstatic.com/firebasejs/11.0.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.0.2/firebase-messaging-compat.js');

// [TODO] 여기에 실제 Firebase Config를 환경 변수 등에서 주입받거나, 프로젝트 공용 값을 설정해야 합니다.
// 서버 사이드에서 빌드 시점에 주입되지 않는다면, 아래에 하드코딩된 값을 확인해 주세요.
const firebaseConfig = {
  apiKey: "AIzaSyAz...", // (기존 firebase.ts의 값과 동일하게 유지되어야 함)
  authDomain: "freestyle-tango.firebaseapp.com",
  projectId: "freestyle-tango",
  storageBucket: "freestyle-tango.firebasestorage.app",
  messagingSenderId: "537832909151",
  appId: "1:537832909151:web:..."
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// 백그라운드 메시지 수신 처리
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Background Message:', payload);

  // 만약 payload에 notification 객체가 있으면, FCM SDK가 자동으로 알림을 표시하므로
  // 여기서 또 showNotification을 호출하면 중복 알림이 발생합니다.
  if (payload.notification) {
    console.log('[SW] Notification payload present, skipping manual showNotification to avoid duplicates.');
    return;
  }

  const notificationTitle = payload.data?.title || '프리스타일 탱고';
  const notificationOptions = {
    body: payload.data?.body || '',
    icon: '/icons/icon-192x192.png',
    data: {
      link: payload.data?.link // 서버에서 보낸 이동 링크 데이터
    }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// 알림 클릭 시 처리
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  // 서버에서 전달받은 링크가 있으면 그곳으로 이동, 없으면 메인으로 이동
  const urlToOpen = event.notification.data?.link || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // 1. 이미 열려 있는 창이 있으면 포커스 및 이동
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url.includes('freestyle-tango.kr') && 'focus' in client) {
          return client.navigate(urlToOpen).then(c => c.focus());
        }
      }
      // 2. 창이 없으면 새로 열기
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
