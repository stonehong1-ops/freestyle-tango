// [SERVICE WORKER VERSION: 2026-04-12 09:02]
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

// [TODO] 여기에 실제 Firebase Config를 환경 변수 등에서 주입받거나, 프로젝트 공용 값을 설정해야 합니다.
// 서버 사이드에서 빌드 시점에 주입되지 않는다면, 아래에 하드코딩된 값을 확인해 주세요.
const firebaseConfig = {
  apiKey: "AIzaSyCrtzGtNMc_gNC_rqROj52qVOLQ6vVQwgc",
  authDomain: "freestyle-tango-seoul.firebaseapp.com",
  projectId: "freestyle-tango-seoul",
  storageBucket: "freestyle-tango-seoul.firebasestorage.app",
  messagingSenderId: "87031621234",
  appId: "1:87031621234:web:53c87298461b95cce2c4eb"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// 백그라운드 메시지 수신 시 강제로 알림을 띄우는 로직
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Background message received:', payload);

  // 알림 옵션 설정
  const notificationTitle = payload.notification?.title || payload.data?.title || 'Freestyle Tango';
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body || '새로운 알림이 도착했습니다.',
    icon: payload.notification?.icon || payload.data?.icon || '/icons/icon-192x192.png',
    badge: '/icons/badge-96x96.png',
    data: payload.data || {}, // 클릭 시 처리를 위한 데이터 보관
    tag: payload.data?.tag || 'default-push-tag', // 알림 중복 방지 태그
    renotify: true // 같은 태그여도 진동/소리 발생
  };

  // 강제로 알림 표시 (브라우저 자동 처리에 의존하지 않음)
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// 알림 클릭 이벤트 처리
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.notification);
  event.notification.close();

  // 클릭 시 이동할 URL 결정 및 절대 경로 변환
  const targetPath = event.notification.data?.url || event.notification.data?.link || '/';
  const fullTargetUrl = new URL(targetPath, self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // 1. 열려있는 앱(PWA 창)이 있는지 원격 검사
      for (const client of clientList) {
        if (client.url.startsWith(self.location.origin) && 'focus' in client) {
          return client.navigate(fullTargetUrl).then(c => c?.focus());
        }
      }
      // 2. 실행 중인 창이 없으면 PWA/브라우저로 새로 열기
      if (clients.openWindow) {
        return clients.openWindow(fullTargetUrl);
      }
    })
  );
});

