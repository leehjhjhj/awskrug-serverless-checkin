-- AWS DSQL Array Query Examples
-- AWS DSQL stores arrays as comma-separated TEXT, but can query them as arrays

-- ============================================
-- 1. event_version을 배열로 조회하기
-- ============================================

-- 기본: 문자열로 저장됨
SELECT
    organization_code,
    organization_name,
    event_version  -- "v1,v2,v3" 형태
FROM event_organization;

-- string_to_array로 배열로 변환
SELECT
    organization_code,
    organization_name,
    string_to_array(event_version, ',') as event_versions  -- {v1,v2,v3} 형태
FROM event_organization;


-- ============================================
-- 2. 특정 버전 포함 여부 확인
-- ============================================

-- 방법 1: LIKE 사용 (간단하지만 부정확할 수 있음)
SELECT *
FROM event_organization
WHERE event_version LIKE '%v2%';

-- 방법 2: 배열 변환 후 확인 (정확)
SELECT *
FROM event_organization
WHERE 'v2' = ANY(string_to_array(event_version, ','));


-- ============================================
-- 3. 배열 길이 확인
-- ============================================

SELECT
    organization_code,
    organization_name,
    array_length(string_to_array(event_version, ','), 1) as version_count
FROM event_organization;


-- ============================================
-- 4. 배열 요소 개별 조회 (UNNEST)
-- ============================================

-- 각 버전을 별도 행으로 펼치기
SELECT
    organization_code,
    organization_name,
    unnest(string_to_array(event_version, ',')) as individual_version
FROM event_organization;

-- 특정 organization의 모든 버전 리스트
SELECT
    unnest(string_to_array(event_version, ',')) as version
FROM event_organization
WHERE organization_code = 'AWSKRUG';


-- ============================================
-- 5. 배열 집계
-- ============================================

-- 모든 organization에서 사용 중인 고유한 버전들
SELECT DISTINCT
    unnest(string_to_array(event_version, ',')) as version
FROM event_organization
ORDER BY version;

-- 버전별 사용 organization 수
SELECT
    unnest(string_to_array(event_version, ',')) as version,
    COUNT(DISTINCT organization_code) as org_count
FROM event_organization
GROUP BY version
ORDER BY org_count DESC;


-- ============================================
-- 6. 실전 예시: 특정 버전 사용하는 organization의 이벤트 통계
-- ============================================

-- v2를 지원하는 organization들의 총 체크인 수
SELECT
    o.organization_code,
    o.organization_name,
    COUNT(DISTINCT c.phone) as unique_attendees
FROM event_organization o
JOIN event_check_in c ON o.organization_code = c.organization_code
WHERE 'v2' = ANY(string_to_array(o.event_version, ','))
GROUP BY o.organization_code, o.organization_name
ORDER BY unique_attendees DESC;


-- ============================================
-- 7. 데이터 삽입/업데이트 예시
-- ============================================

-- 새로운 organization 추가 (배열을 문자열로)
INSERT INTO event_organization
(organization_code, organization_name, logo_url, event_version)
VALUES
('ORG001', 'Test Org', 'https://example.com/logo.png', 'v1,v2,v3');

-- 버전 추가 (기존 문자열에 append)
UPDATE event_organization
SET event_version = event_version || ',v4'
WHERE organization_code = 'ORG001'
  AND event_version NOT LIKE '%v4%';

-- 특정 버전 제거 (복잡하므로 애플리케이션 레벨에서 처리 권장)
UPDATE event_organization
SET event_version = array_to_string(
    array_remove(string_to_array(event_version, ','), 'v2'),
    ','
)
WHERE organization_code = 'ORG001';
