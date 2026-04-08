---
description: Build and Deploy to Production with Notification
---
// turbo-all
// Note: This project uses Windows/PowerShell. Avoid 'grep' and use ';' instead of '&&'.
1. 로케일 파일 정합성 검증 (npm run test:locales)
```powershell
npm run test:locales
```

2. 프로젝트 빌드 확인 (npm run build)
```powershell
npm run test:locales; npm run build
```

3. Vercel 운영 서버 배포 (npx vercel --prod --yes)
```powershell
npx -y vercel --prod --yes
```

3. 배포 결과 확인 및 사용자 알림
   - Aliased URL ([freestyle-tango.kr](https://freestyle-tango.kr)) 확인 후 작업 완료 보고
