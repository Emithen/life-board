# Lifeboard

계층형 문서와 할 일을 한곳에서 관리하기 위한 개인용 생산성 웹앱입니다. 문서 안의 하위 문서를 따라 탐색하고, 별도 Todo 화면에서 할 일을 관리할 수 있습니다.

## 현재 기능

- 루트 문서 목록과 하위 문서 수·최근 활동 표시
- 문서 상세의 상위 경로, 직접 하위 문서, 참조·역참조 조회
- 기존 주제 주소에서 새 문서 주소로 이동
- 기존 주제·문서 생성·수정·보관·복원은 `/topics/manage`에서 제공
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
    page.tsx        # 루트 문서 목록
    documents/      # 문서 상세·경로·참조 조회
    topics/         # 기존 주제 관리 및 보관함, 옛 주소 연결
    todos/          # Todo 화면과 보관함
  db/
    index.ts        # Neon/Drizzle 연결
    schema.ts       # Todo 데이터 모델
  features/
    content/        # 주제·문서 도메인, 검증, 데이터 접근
    todos/
      model.ts       # Todo 도메인 타입과 상수
      repository.ts  # 서버 전용 데이터 접근 계층
      validation.ts  # 입력 파싱과 검증
drizzle/            # SQL 마이그레이션과 메타데이터
docs/
  initial-architecture.md
```

## 현재 범위와 다음 단계

현재 구현은 단일 사용자용 지식·Todo MVP입니다. 새 계층 화면은 읽기 단계이며, 문서의 계층 이동과 참조 추가·제거는 아직 제공하지 않습니다. 인증, 문서 관계 그래프와 CI도 포함되어 있지 않습니다. 현재 주제·문서 MVP의 결정 사항은 [`docs/topics-mvp.md`](docs/topics-mvp.md), 재귀적 포함 문서 구조로의 변경 기획은 [`docs/recursive-documents-plan.md`](docs/recursive-documents-plan.md), 장기 방향은 [`docs/initial-architecture.md`](docs/initial-architecture.md)에서 확인할 수 있습니다.

## 배포

Vercel에 배포할 경우 프로젝트 환경 변수에 `DATABASE_URL`을 등록하고, 대상 Neon 데이터베이스에 마이그레이션을 먼저 적용해야 합니다. 연결 문자열은 브라우저에 노출되는 `NEXT_PUBLIC_` 환경 변수로 등록하지 않습니다.
