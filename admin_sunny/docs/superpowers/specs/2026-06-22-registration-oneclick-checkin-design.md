# 등록자 원클릭 체크인 — 설계

날짜: 2026-06-22
화면: `/events/:eventCode/registrations` (`admin_sunny/src/pages/events/EventRegistrations.js`)
관련 API: `POST /checkin/from-registration` (신규), `GET /checkin/{event_code}` (기존), `GET /registration/list` (기존)

## 배경 / 문제

운영자가 등록자 섹션에서 버튼 한 번으로 해당 등록자를 체크인할 수 있어야 한다.
지금은 체크인 화면에서 이름·전화번호를 다시 입력해야 한다.

## 핵심 결정: "이 이벤트 체크인됨" 판단 소스

요구사항 문서의 프론트 가이드는 `attendance_count > 0`이면 체크인된 것으로 보라고 안내한다.
**이 가이드는 채택하지 않는다.**

근거 (코드 확인):
- `EventRegistration` 모델에 횟수 개념 없음 (`common_layer/model.py:132`).
- 백엔드의 유일한 count 개념은 `api_handler` `_get_checkin_count` → `this_year_count` /
  `all_count` / `all_by_organization_count`. 전부 phone 기준 **크로스-이벤트** 집계
  (`api_handler/repository.py:41-65`).
- 체크인은 `(phone, event_code)` 복합 PK → 한 이벤트당 0/1.
- 컬럼 헤더도 `참석 횟수`.
- **사용자 확인 완료: `attendance_count`는 누적(크로스-이벤트) 참석 횟수다.**

결론: `attendance_count`로 체크인 여부를 판단하면 **과거에 자주 참석한 단골**이
오늘 미체크인 상태인데도 버튼이 잘못 비활성화된다. 가장 자주 오는 사람이 막히는 버그.

→ "이 이벤트 체크인됨"은 `GET /checkin/{event_code}`(`checkinService.getCheckins`)가
돌려주는 이 이벤트 체크인자 목록으로 판단한다. `checkedInPhones = new Set(checkins.map(c => c.phone))`.

> 후속: 요구사항 문서를 쓴 백엔드 쪽에 "그 프론트 가이드는 단골을 잘못 막는다"고 피드백 전달.

## UI

- `참석 횟수` 컬럼은 **그대로 유지** (누적 참석 = 단골 식별에 유용, 체크인 상태와 별개).
- `참석 횟수`와 `작업` 사이에 **`체크인` 상태/액션 컬럼 신설** — 🗑️삭제와 물리적으로 분리해
  연타 시 삭제 오클릭 방지.
- 상태별 렌더:
  - 미체크인 (`phone ∉ checkedInPhones`) → contained `체크인` 버튼 (success/primary).
  - 체크인됨 (`phone ∈ checkedInPhones`) → 비활성 `✅ 체크인됨` 칩.
  - 요청 진행 중 (`phone ∈ checkingInPhones`) → 버튼 disable + 스피너.

## 동작

- 원클릭: confirm 다이얼로그 **없이** 바로 호출.
- `POST /checkin/from-registration` body: `{ event_code, phone }`.
  - `phone`은 목록 행의 **해시값 그대로** 전달 (서버가 재해시하지 않음).
- 성공(201) → 스낵바 성공 + `checkedInPhones`에 phone 추가 (또는 체크인 목록 refetch).
- 에러:
  - 409 → "이미 체크인되었습니다" 안내 + 체크인 목록 refetch (Set 갱신).
  - 404 → detail에 따라 "등록자를 찾을 수 없습니다." / "이벤트를 찾을 수 없습니다.".
  - 기타 → "체크인에 실패했습니다.".
- 연타 방어: 요청 중인 phone을 `checkingInPhones` Set으로 관리해 버튼 비활성.
  서버 409는 최종 가드.

## 변경 파일

1. `src/services/checkinService.js`
   - `createCheckinFromRegistration(eventCode, phone)` 추가
     → `api.post('/checkin/from-registration', { event_code, phone })`.
     기존 함수들과 동일하게 mock 폴백 패턴 유지.

2. `src/pages/events/EventRegistrations.js`
   - `checkinService` import, 아이콘(예: `HowToRegIcon`/`CheckCircleIcon`), `Chip`, `CircularProgress` import.
   - state: `checkedInPhones` (Set), `checkingInPhones` (Set).
   - 로드/리페치 시 등록자 목록과 함께 `checkinService.getCheckins(eventCode)`도 호출해 Set 구성
     (등록자 fetch와 병렬).
   - `참석 횟수`와 `작업` 사이에 `체크인` 컬럼 추가 (위 렌더 규칙).
   - `handleCheckin(row)` 핸들러 추가.

## 범위 밖 (YAGNI)

- 여러 명 일괄(체크박스) 체크인 — 이번 범위 아님.
- 체크인 취소(되돌리기) — 기존 체크인 관리 화면이 담당.
- 모바일 전용 레이아웃 — 별도 작업.

## 테스트 관점

- 미체크인 등록자 → 버튼 클릭 → 201 → 칩이 `체크인됨`으로 전환.
- `attendance_count > 0`이지만 이 이벤트 미체크인(단골) → 버튼이 **활성** 상태여야 한다 (회귀 방지 핵심).
- 이미 체크인된 등록자 → 칩 비활성.
- 연타 → 두 번째 요청은 클라이언트에서 막히거나 서버 409 → "이미 체크인되었습니다".
