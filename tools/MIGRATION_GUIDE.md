# AWS DSQL Migration Guide

DynamoDB에서 AWS DSQL(PostgreSQL 기반)로 마이그레이션하는 가이드입니다.

## 개요

AWS DSQL은 PostgreSQL과 호환되는 관리형 데이터베이스 서비스입니다. 이 프로젝트는 DynamoDB의 NoSQL 모델에서 AWS DSQL의 관계형 모델로 마이그레이션합니다.

### 주요 차이점

- **DynamoDB**: NoSQL, partition_key/sort_key 기반
- **AWS DSQL**: PostgreSQL 기반, PRIMARY KEY 사용, FK 없음

## 테이블 구조

### 1. event_organization
조직 정보를 저장하는 테이블

- **Primary Key**: `organization_code`
- **특이사항**: `event_version`은 PostgreSQL 배열 타입 사용

### 2. event
이벤트 정보를 저장하는 테이블

- **Primary Key**: `event_code`
- **관계**: `organization_code`로 조직과 논리적 연결 (FK 없음)

### 3. event_registration
이벤트 등록 정보를 저장하는 테이블

- **Primary Key**: `(event_code, phone)` 복합 키
- **관계**: 이벤트와 참가자 등록 정보

### 4. event_check_in
체크인 기록을 저장하는 테이블 **(통계 최적화를 위해 비정규화됨)**

- **Primary Key**: `(phone, event_code)` 복합 키
- **특이사항**:
  - DynamoDB와 키 순서가 다름
  - **비정규화 필드**: `organization_code` 포함 (event_name은 JOIN 사용)
  - **목적**: Organization별 통계를 JOIN 없이 빠르게 조회

## 마이그레이션 절차

### 1. 스키마 생성

```bash
# AWS DSQL 연결
psql -h <your-dsql-endpoint> -U <username> -d <database>

# 스키마 생성
\i migration_to_dsql.sql
```

### 2. 데이터 마이그레이션

#### 사전 준비

```bash
# 필요한 패키지 설치
pip install boto3 psycopg2-binary
```

#### 환경 변수 설정

```bash
export DSQL_CONNECTION_STRING="postgresql://username:password@your-dsql-endpoint:5432/database"
export DYNAMODB_TABLE_PREFIX="awskrug-"
export AWS_REGION="ap-northeast-2"
```

#### 마이그레이션 실행

```bash
# DynamoDB 테이블 이름을 실제 테이블 이름으로 수정한 후 실행
python migrate_data.py
```

### 3. 데이터 검증

```sql
-- 각 테이블의 레코드 수 확인
SELECT 'event_organization' as table_name, COUNT(*) as count FROM event_organization
UNION ALL
SELECT 'event' as table_name, COUNT(*) as count FROM event
UNION ALL
SELECT 'event_registration' as table_name, COUNT(*) as count FROM event_registration
UNION ALL
SELECT 'event_check_in' as table_name, COUNT(*) as count FROM event_check_in;

-- 샘플 데이터 확인
SELECT * FROM event LIMIT 5;
SELECT * FROM event_registration LIMIT 5;
SELECT * FROM event_check_in LIMIT 5;
SELECT * FROM event_organization LIMIT 5;

-- 비정규화 필드 검증 (event_check_in)
SELECT
    c.event_code,
    c.organization_code,
    e.event_name,
    COUNT(*) as checkin_count
FROM event_check_in c
JOIN event e ON c.event_code = e.event_code
GROUP BY c.event_code, c.organization_code, e.event_name
LIMIT 5;
```

### 4. 통계 쿼리 테스트

organization_code 비정규화 덕분에 핵심 통계를 JOIN 없이 조회할 수 있습니다:

```sql
-- 특정 organization의 event_version별 출석 수 (JOIN 불필요!)
SELECT
    organization_code,
    event_version,
    COUNT(DISTINCT phone) as unique_attendees
FROM event_check_in
WHERE organization_code = 'AWSKRUG'
GROUP BY organization_code, event_version;

-- 특정 event_code의 출석자 명단 (event_name은 간단한 JOIN)
SELECT c.phone, c.name, e.event_name, c.checked_at
FROM event_check_in c
JOIN event e ON c.event_code = e.event_code
WHERE c.event_code = 'EVENT001'
ORDER BY c.checked_at DESC;
```

더 많은 통계 쿼리 예시는 `statistics_queries.sql` 파일을 참조하세요.

## 애플리케이션 코드 수정

### 1. 의존성 추가

```bash
# requirements.txt에 추가
psycopg2-binary==2.9.9
# 또는
asyncpg==0.29.0  # 비동기 처리가 필요한 경우
```

### 2. 데이터베이스 연결 설정

기존 DynamoDB 클라이언트 대신 PostgreSQL 연결을 사용합니다:

```python
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    return psycopg2.connect(
        os.environ['DSQL_CONNECTION_STRING'],
        cursor_factory=RealDictCursor
    )
```

### 3. 쿼리 변경 예시

#### DynamoDB (기존)
```python
# Event 조회
table = dynamodb.Table('Event')
response = table.get_item(Key={'partition_key': event_code})
event = response['Item']
```

#### AWS DSQL (변경 후)
```python
# Event 조회
conn = get_db_connection()
cursor = conn.cursor()
cursor.execute(
    "SELECT * FROM event WHERE event_code = %s",
    (event_code,)
)
event = cursor.fetchone()
cursor.close()
conn.close()
```

### 4. Pydantic 모델 수정

`common_layer/model.py`의 alias 제거:

```python
class Event(BaseModel):
    event_code: str  # alias='partition_key' 제거
    event_date_time: datetime
    description: str
    event_name: str
    qr_url: str
    code_expired_at: datetime
    event_version: str
    organization_code: str
```

## 성능 최적화

### 인덱스 활용

마이그레이션 스크립트에 이미 다음 인덱스가 포함되어 있습니다:

- `event`: `event_date_time`, `organization_code`, `code_expired_at`
- `event_registration`: `phone`, `email`
- `event_check_in`: `event_code`, `checked_at`, `email`

추가 인덱스가 필요한 경우:

```sql
CREATE INDEX idx_custom ON table_name(column_name);
```

### 연결 풀링

프로덕션 환경에서는 연결 풀링 사용을 권장합니다:

```python
from psycopg2 import pool

connection_pool = pool.SimpleConnectionPool(
    1, 20,  # min, max connections
    os.environ['DSQL_CONNECTION_STRING']
)
```

## 롤백 계획

마이그레이션 중 문제 발생 시:

1. 애플리케이션을 DynamoDB로 되돌림
2. AWS DSQL 테이블 삭제 또는 유지
3. 문제 해결 후 재시도

## 주의사항

1. **FK 제약 없음**: AWS DSQL은 FK를 지원하지 않으므로 애플리케이션 레벨에서 데이터 무결성 관리 필요

2. **비정규화된 데이터 동기화**:
   - `event_check_in` 테이블의 `organization_code`는 비정규화됨
   - Event의 organization_code 변경 시 기존 체크인 레코드는 자동 업데이트 안됨
   - 필요 시 별도 업데이트 쿼리 실행:
   ```sql
   UPDATE event_check_in c
   SET organization_code = e.organization_code
   FROM event e
   WHERE c.event_code = e.event_code;
   ```
   - Event 이름 변경은 실시간 반영 (JOIN으로 조회하므로 동기화 불필요)

3. **트랜잭션**: PostgreSQL은 트랜잭션을 지원하므로 적극 활용 권장
   ```python
   # 체크인 시 트랜잭션 사용 예시
   conn.begin()
   try:
       # Insert check-in with denormalized organization_code
       cursor.execute("""
           INSERT INTO event_check_in
           (phone, event_code, name, checked_at, event_version, organization_code)
           SELECT %s, %s, %s, %s, %s, organization_code
           FROM event WHERE event_code = %s
       """, (phone, event_code, name, now, version, event_code))
       conn.commit()
   except:
       conn.rollback()
       raise
   ```

4. **배열 타입 (중요!)**:
   - AWS DSQL은 배열을 **테이블 컬럼으로 저장 불가**
   - 저장: 쉼표로 구분된 TEXT (`"v1,v2,v3"`)
   - 쿼리: `string_to_array(event_version, ',')` 함수 사용
   ```sql
   -- 특정 버전 포함 여부 확인
   SELECT * FROM event_organization
   WHERE 'v2' = ANY(string_to_array(event_version, ','));

   -- 배열 길이
   SELECT array_length(string_to_array(event_version, ','), 1)
   FROM event_organization;
   ```
   - 자세한 예시는 `array_query_examples.sql` 참조

5. **성능 테스트**: 마이그레이션 후 반드시 성능 테스트 수행

## 문제 해결

### 연결 오류
```
DSQL_CONNECTION_STRING 환경 변수를 확인하세요
```

### 데이터 타입 오류
```
datetime 필드가 올바른 형식인지 확인하세요
ISO 8601 형식 권장: 2024-12-23T10:00:00Z
```

### 마이그레이션 스크립트 오류
```
DynamoDB 테이블 이름이 정확한지 확인하세요
AWS 자격 증명이 올바른지 확인하세요
```

## 참고 자료

- [AWS DSQL Documentation](https://docs.aws.amazon.com/dsql/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [psycopg2 Documentation](https://www.psycopg.org/docs/)
