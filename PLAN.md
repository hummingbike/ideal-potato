# PLAN — 기술 실행 계획

> 상태: 초안 (Draft) · 최종 수정: 2026-06-18
> 제품 요구사항은 [PRD.md](PRD.md) 참고.
> 단계 번호는 PRD의 Phase 번호와 다를 수 있다 — 범용 캔버스 라이브러리 구현이 별도 선행 단계로 추가되었기 때문.

## 1. 전체 아키텍처 (제안)

```
[브라우저 / 모바일 웹]
   ├─ 평면도 업로드 & 치수 입력 폼 & 그리드 에디터
   ├─ 셀 사진 촬영/업로드
   ├─ 범용 캔버스 라이브러리 기반 그리드 보드 (드래그앤드롭 재배치)
   └─ AI 추천 배치 호출 & 미리보기

        │ (REST/RPC)
        ▼
[백엔드 / API]
   ├─ Floorplan / Grid / Cell / FurnitureItem / Layout CRUD
   ├─ 이미지 업로드 처리 (리사이즈, 저장)
   ├─ 자동 세그멘테이션 처리 (사진 → 가구 마스크/크롭 → 2D 아이콘)
   └─ AI 추천 엔드포인트 (휴리스틱 → LLM 단계적 적용)

        │
        ▼
[저장소]
   ├─ 객체 스토리지 (사진: 평면도, 셀 사진, 가구 크롭/아이콘 이미지)
   └─ DB (Floorplan/Grid/Cell/FurnitureItem/Layout 메타데이터)
```

## 2. 제안 기술 스택

| 영역 | 제안 | 비고 |
|---|---|---|
| 프론트엔드 | Next.js + TypeScript + Tailwind CSS | 모바일 웹 대응, PWA 확장 용이 |
| 그리드/드래그앤드롭 캔버스 | **자체 구현** (절대 위치 DOM 엘리먼트 + Pointer Events 기반) | 외부 라이브러리(react-konva, dnd-kit 등) 미사용. DOM 기반으로 결정 — 이유는 본문 3절 참고. 이 프로젝트 외 다른 곳에서도 재사용 가능한 범용 API/패키지로 설계 |
| 가구 인식 (세그멘테이션) | 자동 세그멘테이션 모델/서비스 (예: SAM 계열 모델 또는 클라우드 비전 API, 구체 모델은 PoC에서 확정) | 처음부터 자동 인식 적용, 오인식은 보정 UI로 후처리 |
| 백엔드/DB/스토리지 | Supabase (Postgres + Storage + Auth) | 사진 업로드(Storage), 데이터 모델(Postgres), 추후 계정 확장 시 Auth 재사용 |
| AI 추천 (v1) | 자체 휴리스틱 로직 (서버리스 함수) | 외부 의존성 없이 빠르게 "동작하는" 추천 제공 |
| AI 추천 (v2) | Claude API (구조화 입력 → 배치 좌표/사유 출력) | 가구 목록 + 제약을 JSON으로 전달, 응답을 Layout으로 저장 |
| 배포 | Vercel (프론트) + Supabase (백엔드) | 개인 프로젝트 규모에 적합, 운영 부담 최소화 |

## 3. 마일스톤

### Phase 0 — 설계 확정
- [x] PRD / PLAN / TODO 작성
- [x] 캔버스 구현 방식 결정 (외부 라이브러리 대신 직접 구현, 범용 패키지로 설계)
- [x] 가구 인식 방식 결정 (자동 세그멘테이션 우선)
- [x] 그리드 보드 표현 방식 결정 (2D 탑뷰 아이콘)
- [x] 평면도 외곽선 입력 방식 결정 (치수 입력 폼 제공)
- [x] 백엔드/스토리지 기술 스택 확정 (Supabase: Postgres + Storage + Auth)
- [ ] 데이터 모델 확정 (PRD 8절 기준 스키마 설계)

### Phase 1 — 범용 캔버스 라이브러리 구현
다른 프로젝트에서도 재사용 가능하도록, 앱 코드와 분리된 독립 모듈/패키지로 설계·구현한다.
- [x] 라이브러리 범위/공개 API 설계 (그리드 정의, 아이템 배치, 드래그 이벤트, 스냅, 충돌 감지)
- [x] 렌더링 방식 결정: **절대 위치 DOM 엘리먼트 + Pointer Events**. Canvas 2D는 jsdom에서 렌더링 결과를 검증할 수 없어 단위 테스트가 어렵고, SVG는 DOM과 테스트 용이성이 비슷하지만 추가 이점이 없어 제외. 개인 프로젝트 규모(가구 수십 개 이내)에서는 DOM 렌더링 성능으로 충분.
- [x] 그리드 렌더링 구현 (`GridBoard`, 절대 위치 DOM 엘리먼트)
- [x] 포인터 이벤트 기반 드래그 앤 드롭 구현
- [x] 칸 단위 스냅 구현 (`snapToGrid`)
- [x] 아이템 간 겹침(충돌) 감지 구현 (`hasCollision`/`findCollisions`)
- [x] 앱 의존성 없는 독립 패키지로 분리 (`packages/grid-canvas`, 별도 `package.json`/빌드/테스트)
- [x] 데모 페이지로 라이브러리 단독 동작 검증 (`demo/`, Vite dev server + build 확인. 실제 브라우저에서 드래그 인터랙션 수동 확인은 아직 안 함)

> Phase 1 완료. 단위 테스트 26개 통과 (`coordinates`/`snap`/`collision`/`GridBoard`), `pnpm typecheck`/`test`/`build` 모두 통과.

### Phase 2 — MVP ✅ 완료 (실제 외부 서비스 연동은 보류)
Phase 1에서 만든 캔버스 라이브러리를 사용해 실제 제품 기능을 구현한다. `apps/web`(Next.js 14 App Router)에 구현.

**아키텍처 결정**: Supabase Storage/Postgres와 가구 자동 세그멘테이션 모델/서비스는 모두 실제 계정·API 키 없이 진행하기 위해, `ObjectStoragePort`/`SegmentationPort`/`LayoutRepositoryPort` 세 개의 인터페이스로 추상화하고 각각 인메모리 가짜 구현(`InMemoryObjectStorage`, `StubSegmentationProvider`, `InMemoryLayoutRepository`)을 사용했다. 호출부는 포트 인터페이스에만 의존하므로, 실제 Supabase/세그멘테이션 어댑터를 나중에 끼워넣어도 호출부 변경이 필요 없다.

- [x] 프로젝트 스캐폴딩 (`apps/web`: Next.js 14 + TypeScript + Tailwind + Vitest/RTL)
- [x] 평면도 업로드 화면 (`FloorplanUpload`, `ObjectStoragePort` 사용)
- [x] 평면도 치수 입력 폼 (가로/세로) → 외곽선 생성 (`validateDimensions`, `DimensionForm`)
- [x] 그리드 생성 UI (셀 크기 지정 → 행/열 계산) (`createGrid`, `GridSizeForm`)
- [x] 셀 탭 → 사진 촬영/업로드 → Storage 저장 및 매핑 (`CellPhotoGrid`)
- [x] 사진 → 자동 세그멘테이션으로 가구 영역 추출 (`extractFurniture`, `StubSegmentationProvider`로 파이프라인만 검증 — 실제 모델/서비스는 미선정)
- [x] 추출 결과 → 2D 탑뷰 아이콘 변환 (`applyTopViewIcon`, 카테고리별 고정 SVG 아이콘)
- [x] 캔버스 라이브러리 기반 그리드 보드 구현 (`FurnitureBoard`, `@ideal-potato/grid-canvas`의 `GridBoard` 사용)
- [x] 레이아웃 저장 API + 불러오기 화면 (`LayoutManager`, `InMemoryLayoutRepository`)
- [x] 위 단계를 하나의 페이지 흐름으로 연결 (`app/page.tsx`) + 골든 패스 통합 테스트

> Phase 2 완료. 단위/컴포넌트/통합 테스트 51개 통과, `pnpm typecheck`/`test`/`build` 전체 워크스페이스 통과. 벽/외벽이 아닌 직사각형 룸만 지원하는 등 단순화한 부분은 위 항목별 커밋 메시지에 기록.

### Phase 3 — 가구 인식 고도화 / 실제 외부 서비스 연동
**1단계 (프론트엔드, 외부 서비스 연동 없이 진행) ✅ 완료**
- [x] 가구 메타데이터 입력 폼 (이름/카테고리/크기) — `validateFurnitureMetadata`, `FurnitureExtractionPanel`에 통합
- [x] 자동 세그멘테이션 결과 확인/보정 UI (박스 드래그로 인식 영역의 위치/크기만 재조정, 마스크 직접 편집은 미지원) — `boundingBoxCorrection` 도메인 함수 + `BoundingBoxCorrectionPanel`, `app/page.tsx` 가구 추출 단계에 연결

**2단계 (실제 외부 서비스 연동, 계정/비용 결정 필요 — 보류)**
- [ ] 실제 세그멘테이션 모델/서비스 선정 및 `SegmentationPort` 구현체 교체 (`StubSegmentationProvider` → 실제 어댑터)
- [ ] 실제 Supabase 프로젝트 생성 + `ObjectStoragePort`/`LayoutRepositoryPort` 구현체 교체 (`InMemory*` → Supabase 어댑터)
- [ ] 배경 제거 품질 개선 (투명 PNG 정제) — 실제 세그멘테이션 모델 연동 이후 품질 평가 가능

> 1단계 완료. `FurnitureItem`에 `boundingBox`를 저장해 보정 UI가 다룰 데이터를 마련했고, 보정 패널은 `StubSegmentationProvider`가 가정하는 200x200 픽셀 공간(`ASSUMED_IMAGE_BOUNDS`)을 기준으로 동작한다 — 실제 이미지 크기 인식은 2단계(실제 세그멘테이션 연동)에서 처리.

### Phase 4 — AI 추천 배치
- [ ] 휴리스틱 기반 추천 v1 (벽 붙이기, 동선 폭 확보, 겹침 금지)
- [ ] Claude API 연동 추천 v2 (구조화 입력/출력, 추천 사유 텍스트)
- [ ] 추천 미리보기 → 적용/되돌리기 UX

### Phase 5 — 다듬기
- [ ] 레이아웃 비교(전/후) 뷰
- [ ] 레이아웃 이미지 내보내기
- [ ] 모바일 촬영 흐름 최적화 / PWA 적용 검토

## 4. 디렉터리 구조 (현재)
```
/packages
  /grid-canvas       # 범용 캔버스 라이브러리 (앱 비의존, 독립 배포 가능한 구조)
    /src
    /demo            # 단독 동작 검증용 데모

/apps
  /web               # 제품 앱 (Next.js 14 App Router)
    /app             # 라우트 (page.tsx가 전체 MVP 플로우를 단계별로 연결)
    /src/domain       # 순수 로직: outline/grid/cell/furnitureExtraction/furnitureIcon/layout
    /src/ports        # ObjectStoragePort/SegmentationPort/LayoutRepositoryPort + 인메모리 가짜 구현
    /src/components   # DimensionForm/GridSizeForm/FloorplanUpload/CellPhotoGrid/
                       # FurnitureExtractionPanel/FurnitureBoard/LayoutManager
    /tests            # 위 구조를 그대로 미러링하는 단위/컴포넌트/통합 테스트
```

## 5. 리스크 / 미정 사항
- 캔버스 라이브러리를 직접 구현하므로 드래그/스냅/충돌 감지의 완성도를 검증할 시간이 더 필요함 → Phase 1을 별도 단계로 분리해 충분히 검증 후 Phase 2(MVP) 진입. (해결됨)
- 자동 세그멘테이션 모델/서비스 선정(자체 호스팅 vs 외부 API) 및 비용/속도 트레이드오프는 아직 미정. Phase 2에서는 `SegmentationPort` 인터페이스 뒤에 `StubSegmentationProvider`만 두고 진행했고, 실제 모델 선정은 Phase 3로 이동.
- 같은 이유로 Supabase 실제 프로젝트 생성도 Phase 3로 이동 (`ObjectStoragePort`/`LayoutRepositoryPort`의 인메모리 구현으로 Phase 2를 완료).
- AI 추천(v2)의 응답 신뢰성(겹침/범위 밖 배치 방지)을 위해 v2도 결과를 휴리스틱으로 후검증하는 단계가 필요할 수 있음.

## 6. 다음 액션
세부 작업 단위는 [TODO.md](TODO.md) 참고.
