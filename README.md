# Lifeboard

개인 일정과 할 일을 한곳에서 관리하기 위한 개인용 생산성 웹앱입니다. 현재는 Todo 관리에 집중한 초기 MVP 단계이며, 이후 일정, 반복 작업, 습관, 메모와 지식 기록 기능으로 확장할 예정입니다.

## 현재 기능

- Todo 생성 및 목록 조회
- Todo 제목·메모·마감일·우선순위 수정
- 완료·미완료 상태 전환
- 메모, 마감일, 우선순위 설정
- Todo 보관, 보관함 조회 및 복원
- 진행 중·완료 항목 수 표시
- 서버 입력 검증과 작업 진행·오류 상태 표시
- 데이터베이스 미설정 시 안내 화면 제공

## 기술 스택

- Next.js 16 App Router, React 19, TypeScript
- Tailwind CSS 4
- Neon Postgres
- Drizzle ORM
- pnpm

## 로컬 실행

### 준비 사항

- Node.js 20.9 이상
- Corepack
- Neon 또는 호환되는 PostgreSQL 데이터베이스

저장소를 받은 뒤 의존성을 설치합니다.

```bash
corepack enable
pnpm install --frozen-lockfile
```

환경 변수 예시를 복사하고 `DATABASE_URL`을 실제 연결 문자열로 교체합니다.

```bash
cp .env.example .env.local
```

```dotenv
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require
```

`.env.local`은 프로젝트 루트에 두며 커밋하지 않습니다. 데이터베이스를 준비한 다음 마이그레이션을 적용합니다.

```bash
pnpm db:migrate
```

개발 서버를 실행하고 [http://localhost:3000](http://localhost:3000)을 엽니다.

```bash
pnpm dev
```

`DATABASE_URL` 없이도 화면은 확인할 수 있지만, Todo 입력과 저장 기능은 비활성화됩니다.

## 주요 명령어

| 명령어 | 설명 |
| --- | --- |
| `pnpm dev` | 개발 서버 실행 |
| `pnpm build` | 프로덕션 빌드 |
| `pnpm start` | 빌드된 앱 실행 |
| `pnpm lint` | ESLint 검사 |
| `pnpm test` | Todo 입력 검증 단위 테스트 |
| `pnpm db:generate` | 스키마 변경으로부터 마이그레이션 생성 |
| `pnpm db:migrate` | 데이터베이스에 마이그레이션 적용 |
| `pnpm db:studio` | Drizzle Studio 실행 |

## 프로젝트 구조

```text
src/
  app/
    actions.ts      # Todo Server Actions
    layout.tsx      # 루트 레이아웃
    page.tsx        # 메인 Todo 화면
  db/
    index.ts        # Neon/Drizzle 연결
    schema.ts       # Todo 데이터 모델
  features/
    todos/
      model.ts       # Todo 도메인 타입과 상수
      repository.ts  # 서버 전용 데이터 접근 계층
      validation.ts  # 입력 파싱과 검증
drizzle/            # SQL 마이그레이션과 메타데이터
docs/
  initial-architecture.md
```

## 현재 범위와 다음 단계

현재 구현은 단일 사용자용 Todo MVP입니다. 인증과 CI는 아직 포함되어 있지 않습니다. 장기 방향과 확장 후보는 [`docs/initial-architecture.md`](docs/initial-architecture.md)에서 확인할 수 있습니다.

## 배포

Vercel에 배포할 경우 프로젝트 환경 변수에 `DATABASE_URL`을 등록하고, 대상 Neon 데이터베이스에 마이그레이션을 먼저 적용해야 합니다. 연결 문자열은 브라우저에 노출되는 `NEXT_PUBLIC_` 환경 변수로 등록하지 않습니다.
