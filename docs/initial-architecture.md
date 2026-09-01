# Lifeboard 초기 구성안

## 목표

Lifeboard는 개인용 웹 todo 앱으로 시작한다. 처음에는 빠르게 배포 가능한 단순 todo 관리 기능을 만들고, 이후 일정, 반복 작업, 습관, 메모, 대시보드 같은 개인 생산성 기능으로 확장할 수 있게 한다.

## 권장 스택

- Framework: Next.js + TypeScript
- UI: React, Tailwind CSS
- Backend: Next.js Route Handlers 또는 Server Actions
- Database: Neon Postgres
- ORM: Drizzle ORM
- Auth: 초기에는 단일 사용자 보호 방식, 이후 Auth.js 또는 외부 Auth로 확장
- Deployment: Vercel Hobby 우선 검토

## 인프라 구성

초기에는 프론트엔드와 백엔드를 하나의 Next.js 앱으로 운영한다. 별도 API 서버를 분리하지 않고, Next.js 내부 API 계층에서 데이터 접근을 처리한다.

```text
Browser
  -> Next.js App
    -> Server Actions / Route Handlers
      -> Drizzle ORM
        -> Neon Postgres
```

이 구조는 배포와 운영이 단순하고, 개인용 앱의 초기 트래픽에는 충분하다. 나중에 모바일 앱, 공개 API, 워커 작업이 필요해지면 백엔드를 분리한다.

## Neon 사용 방향

Supabase 무료 티어를 사용할 수 없으므로 Neon Postgres를 기본 DB 후보로 둔다. Neon 무료 플랜은 개인 todo 앱의 초기 데이터량과 요청량에는 충분할 가능성이 높다. 다만 무료 플랜은 storage, compute hour, idle wake-up 지연 같은 제한이 있으므로 실제 사용량을 보면서 유료 전환 여부를 판단한다.

## 초기 데이터 모델

첫 MVP는 `todos` 중심으로 시작한다.

```text
todos
- id
- title
- notes
- status
- priority
- due_date
- completed_at
- created_at
- updated_at
```

초기 상태값은 `active`, `completed`, `archived` 정도로 제한한다. 태그, 프로젝트, 반복 작업은 MVP 이후에 추가한다.

## MVP 기능

- todo 생성
- todo 목록 조회
- 완료/미완료 토글
- 제목/메모 수정
- 삭제 또는 보관
- 우선순위 설정
- 마감일 설정

## 이후 확장 후보

- 프로젝트/영역 분류
- 태그
- 반복 todo
- 캘린더 뷰
- 검색과 필터
- 일간/주간 대시보드
- 모바일 최적화
- 알림

## 스캐폴딩 방향

처음 스캐폴딩은 Next.js 단일 앱으로 만든다. DB 연결 전에도 로컬 UI를 먼저 확인할 수 있게 하고, 이후 Neon 연결 문자열을 `.env.local`에 넣어 Drizzle migration을 적용한다.
