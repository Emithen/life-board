# Production DB 마이그레이션

개발 DB의 `pnpm db:migrate`는 기존 `.env.local`을 사용한다. Neon production 브랜치에는 `pnpm db:migrate:prod`를 사용한다. 운영 명령은 `.env.local`이나 `DATABASE_URL`을 읽지 않고 `PRODUCTION_DIRECT_DATABASE_URL`만 요구한다.

1. `.env.migrate.production.example`을 `.env.migrate.production`으로 복사한다. Neon 콘솔에서 **production 브랜치**를 선택하고, `-pooler`가 없는 direct 연결 문자열을 넣는다. 이 파일은 Git에서 무시된다. CI에서는 같은 이름의 비밀 환경 변수를 주입하면 파일 없이 실행할 수 있다.
2. 운영 DB의 복구 지점을 마련하고, 가능하면 운영 데이터에서 만든 별도 Neon 브랜치에 같은 마이그레이션을 먼저 시험한다. 이번 `0003` 변경은 데이터 백필 뒤 동기화 트리거를 설치하므로 운영 적용 중에는 앱 쓰기를 잠시 멈춘다.
3. 프로젝트 루트에서 `pnpm db:migrate:prod`를 실행한다. 출력된 호스트와 DB 이름이 운영 대상과 일치하는지 확인한다. 명령은 값이 없거나 pooler 주소면 실행 전에 중단한다.
4. 주제 수와 생성된 루트 문서 수, 기존 문서의 부모 연결 및 보관 상태를 확인하고 앱을 배포한다. `0003` SQL에도 루트·부모 연결 누락 시 실패하는 검사가 들어 있다.

운영 브랜치 자체는 URL만 보고 확정할 수 없으므로, 명령 실행 전에 Neon 콘솔에서 선택한 브랜치와 URL의 호스트를 대조해야 한다. URL이나 비밀번호를 커밋하거나 채팅에 붙여넣지 않는다.
