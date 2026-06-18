# TODO

> [PRD.md](PRD.md) / [PLAN.md](PLAN.md) 기준 작업 목록. 완료 시 체크.
> Phase 번호는 [PLAN.md](PLAN.md) 기준 (캔버스 라이브러리 구현이 별도 단계로 분리되어 PRD와 번호가 다를 수 있음).

## Phase 0 — 설계 확정
- [x] PRD 작성
- [x] PLAN 작성
- [x] TODO 작성
- [x] 캔버스 구현 방식 결정 (직접 구현, 범용 패키지)
- [x] 가구 인식 방식 결정 (자동 세그멘테이션 우선)
- [x] 그리드 보드 표현 방식 결정 (2D 탑뷰 아이콘)
- [x] 평면도 외곽선 입력 방식 결정 (치수 입력 폼 제공)
- [x] 백엔드/스토리지 기술 스택 확정 (Supabase: Postgres + Storage + Auth)
- [x] Floorplan/Grid/Cell/FurnitureItem/Layout 스키마 확정 (테이블 컬럼까지) — `supabase/migrations/20260618003947_create_core_schema.sql`

## Phase 1 — 범용 캔버스 라이브러리 구현 ✅ 완료
- [x] 라이브러리 공개 API 설계 (그리드 정의, 아이템 배치, 드래그 이벤트, 스냅, 충돌 감지)
- [x] 렌더링 방식 결정: 절대 위치 DOM 엘리먼트 + Pointer Events
- [x] 그리드 렌더링 구현
- [x] 포인터 이벤트 기반 드래그 앤 드롭 구현
- [x] 칸 단위 스냅 구현
- [x] 아이템 간 겹침(충돌) 감지 구현
- [x] 앱 코드와 분리된 독립 패키지로 분리 (`/packages/grid-canvas`)
- [x] 데모 페이지로 라이브러리 단독 동작 검증 (`pnpm --filter @ideal-potato/grid-canvas dev`)

## Phase 2 — MVP ✅ 완료 (`apps/web`)
- [x] 프로젝트 스캐폴딩 (Next.js + TypeScript + Tailwind + Vitest/RTL, `apps/web`)
- [x] 평면도 업로드 화면 (`FloorplanUpload`)
- [x] 평면도 치수 입력 폼 (가로/세로) → 외곽선 생성 (`validateDimensions`, `DimensionForm`)
- [x] 그리드 생성 UI (셀 크기 입력 → 행/열 계산) (`createGrid`, `GridSizeForm`)
- [x] 셀 탭 → 사진 촬영/업로드 → Storage 저장 + Cell 매핑 (`CellPhotoGrid`)
- [x] 사진 → 자동 세그멘테이션 호출 → 가구 영역 추출 (`extractFurniture` + `StubSegmentationProvider`)
- [x] 추출 결과 → 2D 탑뷰 아이콘 변환 (`applyTopViewIcon`)
- [x] Phase 1 캔버스 라이브러리로 그리드 보드 구현 (`FurnitureBoard`)
- [x] 레이아웃 저장 API + 불러오기 화면 (`LayoutManager` + `InMemoryLayoutRepository`)
- [x] 전체 플로우를 한 페이지로 연결 + 골든 패스 통합 테스트 (`app/page.tsx`)
- [ ] Supabase 프로젝트 생성 및 스키마 마이그레이션 → Phase 3로 이동 (Phase 2는 인메모리 포트 구현으로 완료)

## Phase 3 — 가구 인식 고도화 / 실제 외부 서비스 연동
### 1단계 (프론트엔드) ✅ 완료
- [x] 가구 메타데이터 입력 폼 (이름/카테고리/크기)
- [x] 자동 세그멘테이션 결과 확인/보정 UI (박스 드래그로 인식 영역의 위치/크기만 재조정, 마스크 직접 편집은 미지원)

### 2단계 (실제 외부 서비스 연동)
- [x] Supabase 프로젝트 생성(`ideal-potato`) 및 스키마 마이그레이션, `ObjectStoragePort`/`LayoutRepositoryPort` 실제 구현체로 교체 (`SupabaseObjectStorage`/`SupabaseLayoutRepository`, `app/page.tsx`에서 환경변수 유무로 분기)
- [ ] 실제 세그멘테이션 모델/서비스 선정 및 연동 (`StubSegmentationProvider` 교체) — 미선정으로 보류
- [ ] 배경 제거 품질 개선 (투명 PNG 정제)

## Phase 4 — AI 추천 배치
- [ ] 휴리스틱 추천 로직 v1 구현
- [ ] Claude API 연동 추천 v2 (구조화 입출력)
- [ ] 추천 사유 텍스트 노출
- [ ] 추천 미리보기 → 적용/되돌리기 UX

## Phase 5 — 다듬기
- [ ] 레이아웃 전/후 비교 뷰
- [ ] 레이아웃 이미지 내보내기
- [ ] 모바일 촬영 흐름 최적화
- [ ] PWA 적용 검토

## 남은 미정 사항 (착수 전 결정 필요)
- [ ] 자동 세그멘테이션 모델/서비스 선정 (자체 호스팅 vs 외부 API) — Phase 3에서 결정
