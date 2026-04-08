# Development Rules

## Deployment Policy
- **Minor Changes**: 마이너한 코드 수정이나 UI 개선 사항이 포함된 경우, 작업 완료 후 반드시 운영 서버에 배포(`npm run build` 및 `npx vercel --prod --yes`)를 수행합니다.
- **Summary Report**: 배포 완료 후 사용자에게 보고할 때는 반드시 배포 결과(빌드 성공 여부, 배포 링크 등)를 요약에 포함해야 합니다.

## Build & Verification
- 배포 전에는 반드시 `npm run test:locales`를 통해 언어 파일의 정합성을 검증합니다.
- 빌드 오류 발생 시 즉시 원인을 파악하고 수정 후 재배포를 시도합니다.
