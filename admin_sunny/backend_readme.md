# AWSKRUG 서버리스 체크인 관리자 문서

이 문서는 AWSKRUG 서버리스 체크인 시스템의 관리 목적으로 사용 가능한 데이터베이스 스키마와 API 작업을 설명합니다.

## 데이터베이스 스키마

시스템은 세 개의 주요 DynamoDB 테이블을 사용합니다:

### 1. 이벤트 테이블

**테이블 이름**: `{env}-event`

**기본 키**: 
- 파티션 키: `event_code` (문자열)

**속성**:
- `event_code`: 이벤트의 고유 식별자 (형식: MMDDXXX, XXX는 무작위 대문자)
- `event_date_time`: 이벤트 날짜 및 시간 (ISO 형식)
- `description`: 이벤트 설명
- `event_name`: 이벤트 이름
- `qr_url`: S3에 저장된 QR 코드 이미지 URL
- `code_expired_at`: 이벤트 코드 만료 날짜 및 시간 (ISO 형식)
- `event_version`: 이벤트 버전

### 2. 이벤트 등록 테이블

**테이블 이름**: `{env}-event-registration`

**기본 키**:
- 파티션 키: `event_code` (문자열)
- 정렬 키: `phone` (문자열, 해시됨)

**속성**:
- `event_code`: 등록된 이벤트 코드
- `phone`: 등록자의 해시된 전화번호
- `name`: 등록자 이름 (선택 사항)
- `email`: 등록자 이메일 (선택 사항)

### 3. 이벤트 체크인 테이블

**테이블 이름**: `{env}-event-checkin`

**기본 키**:
- 파티션 키: `phone` (문자열, 해시됨)
- 정렬 키: `event_code` (문자열)

**속성**:
- `phone`: 참석자의 해시된 전화번호
- `event_code`: 체크인한 이벤트 코드
- `email`: 참석자 이메일 (선택 사항)
- `name`: 참석자 이름 (선택 사항)
- `checked_at`: 체크인 발생 시간 (ISO 형식)
- `event_version`: 이벤트 버전

## 관리자 API 작업

관리 목적으로 구현해야 하는 API 작업은 다음과 같습니다:

### 이벤트 관리

#### 1. 이벤트 생성

- **API 경로**: `/admin/event`
- **메소드**: POST
- **파라미터**:
  ```json
  {
    "event_name": "문자열",
    "event_date_time": "ISO 날짜시간",
    "code_expired_at": "ISO 날짜시간",
    "description": "문자열",
    "event_version": "문자열"
  }
  ```
- **응답**: 
  ```json
  {
    "event_code": "문자열",
    "qr_url": "문자열"
  }
  ```
- **설명**: 새 이벤트를 생성하고 체크인용 QR 코드를 생성합니다

#### 2. 이벤트 조회

- **API 경로**: `/admin/event/{event_code}`
- **메소드**: GET
- **파라미터**: 없음 (경로에 event_code)
- **응답**: 
  ```json
  {
    "event_code": "문자열",
    "event_name": "문자열",
    "event_date_time": "ISO 날짜시간",
    "description": "문자열",
    "qr_url": "문자열",
    "code_expired_at": "ISO 날짜시간",
    "event_version": "문자열"
  }
  ```
- **설명**: 특정 이벤트의 세부 정보를 조회합니다

#### 3. 이벤트 목록

- **API 경로**: `/admin/events`
- **메소드**: GET
- **파라미터**: 
  - `start_date` (선택 사항): 이 날짜부터 이벤트 필터링
  - `end_date` (선택 사항): 이 날짜까지 이벤트 필터링
- **응답**: 
  ```json
  [
    {
      "event_code": "문자열",
      "event_name": "문자열",
      "event_date_time": "ISO 날짜시간",
      "description": "문자열",
      "qr_url": "문자열",
      "code_expired_at": "ISO 날짜시간",
      "event_version": "문자열"
    }
  ]
  ```
- **설명**: 모든 이벤트를 나열하며, 선택적으로 날짜 범위로 필터링합니다

#### 4. 이벤트 업데이트

- **API 경로**: `/admin/event/{event_code}`
- **메소드**: PUT
- **파라미터**:
  ```json
  {
    "event_name": "문자열",
    "event_date_time": "ISO 날짜시간",
    "code_expired_at": "ISO 날짜시간",
    "description": "문자열"
  }
  ```
- **응답**: 
  ```json
  {
    "event_code": "문자열",
    "event_name": "문자열",
    "event_date_time": "ISO 날짜시간",
    "description": "문자열",
    "qr_url": "문자열",
    "code_expired_at": "ISO 날짜시간",
    "event_version": "문자열"
  }
  ```
- **설명**: 기존 이벤트의 세부 정보를 업데이트합니다

#### 5. 이벤트 삭제

- **API 경로**: `/admin/event/{event_code}`
- **메소드**: DELETE
- **파라미터**: 없음 (경로에 event_code)
- **응답**: 
  ```json
  {
    "message": "이벤트가 성공적으로 삭제되었습니다"
  }
  ```
- **설명**: 이벤트와 선택적으로 관련 등록 및 체크인을 삭제합니다

### 등록 관리

#### 1. 등록 업로드

- **API 경로**: `/admin/registration/upload`
- **메소드**: POST
- **파라미터**: 다음 열이 있는 Excel 파일 업로드:
  - `visitor_name`: 등록자 이름
  - `visitor_mobile`: 등록자 전화번호
  - `visitor_email`: 등록자 이메일
- **응답**: 
  ```json
  {
    "message": "Excel 파일이 성공적으로 처리되었습니다",
    "rows_processed": 123
  }
  ```
- **설명**: 이벤트 참석자를 등록하기 위해 Excel 파일을 처리합니다

#### 2. 등록 목록

- **API 경로**: `/admin/event/{event_code}/registrations`
- **메소드**: GET
- **파라미터**: 없음 (경로에 event_code)
- **응답**: 
  ```json
  [
    {
      "phone": "문자열 (해시됨)",
      "name": "문자열",
      "email": "문자열"
    }
  ]
  ```
- **설명**: 특정 이벤트에 대한 모든 등록을 나열합니다

#### 3. 등록 추가

- **API 경로**: `/admin/event/{event_code}/registration`
- **메소드**: POST
- **파라미터**:
  ```json
  {
    "phone": "문자열",
    "name": "문자열",
    "email": "문자열"
  }
  ```
- **응답**: 
  ```json
  {
    "event_code": "문자열",
    "phone": "문자열 (해시됨)",
    "name": "문자열",
    "email": "문자열"
  }
  ```
- **설명**: 이벤트에 단일 등록을 추가합니다

#### 4. 등록 삭제

- **API 경로**: `/admin/event/{event_code}/registration/{phone}`
- **메소드**: DELETE
- **파라미터**: 없음 (경로에 event_code와 phone)
- **응답**: 
  ```json
  {
    "message": "등록이 성공적으로 삭제되었습니다"
  }
  ```
- **설명**: 이벤트에서 등록을 제거합니다

### 체크인 관리

#### 1. 체크인 목록

- **API 경로**: `/admin/event/{event_code}/checkins`
- **메소드**: GET
- **파라미터**: 없음 (경로에 event_code)
- **응답**: 
  ```json
  [
    {
      "phone": "문자열 (해시됨)",
      "name": "문자열",
      "email": "문자열",
      "checked_at": "ISO 날짜시간"
    }
  ]
  ```
- **설명**: 특정 이벤트에 대한 모든 체크인을 나열합니다

#### 2. 수동 체크인

- **API 경로**: `/admin/event/{event_code}/checkin`
- **메소드**: POST
- **파라미터**:
  ```json
  {
    "phone": "문자열"
  }
  ```
- **응답**: 
  ```json
  {
    "name": "문자열",
    "count": 1
  }
  ```
- **설명**: 전화번호를 사용하여 참석자를 수동으로 체크인합니다

#### 3. 체크인 삭제

- **API 경로**: `/admin/checkin/{phone}/{event_code}`
- **메소드**: DELETE
- **파라미터**: 없음 (경로에 phone과 event_code)
- **응답**: 
  ```json
  {
    "message": "체크인이 성공적으로 삭제되었습니다"
  }
  ```
- **설명**: 체크인 기록을 제거합니다

### 통계 및 보고서

#### 1. 이벤트 통계

- **API 경로**: `/admin/event/{event_code}/stats`
- **메소드**: GET
- **파라미터**: 없음 (경로에 event_code)
- **응답**: 
  ```json
  {
    "event_name": "문자열",
    "event_date_time": "ISO 날짜시간",
    "total_registrations": 123,
    "total_checkins": 100,
    "attendance_rate": 81.3
  }
  ```
- **설명**: 이벤트에 대한 등록 및 체크인 통계를 제공합니다

#### 2. 체크인 내보내기

- **API 경로**: `/admin/event/{event_code}/export`
- **메소드**: GET
- **파라미터**: 
  - `format`: "csv" 또는 "excel" (기본값: "excel")
- **응답**: 파일 다운로드
- **설명**: 지정된 형식으로 이벤트의 체크인 데이터를 내보냅니다

## 구현 참고사항

1. 모든 관리자 API는 적절한 인증 및 권한 부여로 보호되어야 합니다.
2. 개인정보 보호를 위해 전화번호는 저장 전에 해시해야 합니다.
3. 대용량 데이터셋을 반환할 수 있는 목록 작업에 대해 페이지네이션 구현을 고려하세요.
4. 모든 작업에는 적절한 오류 처리 및 유효성 검사가 포함되어야 합니다.
5. 관리자 인터페이스는 필요한 경우 QR 코드를 재생성하는 방법을 제공해야 합니다.