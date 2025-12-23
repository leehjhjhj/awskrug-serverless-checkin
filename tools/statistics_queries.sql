-- Statistics Query Examples for AWS DSQL
-- Optimized with denormalized event_check_in table

-- ============================================
-- 1. 특정 organization의 event_version별 출석 수
-- ============================================

-- JOIN 불필요 - 단일 테이블 조회
SELECT
    organization_code,
    event_version,
    COUNT(DISTINCT phone) as unique_attendees,
    COUNT(*) as total_checkins
FROM event_check_in
WHERE organization_code = 'AWSKRUG'
GROUP BY organization_code, event_version
ORDER BY event_version;

-- 더 상세한 통계 (날짜별)
SELECT
    organization_code,
    event_version,
    DATE(checked_at) as check_date,
    COUNT(DISTINCT phone) as unique_attendees,
    COUNT(*) as total_checkins
FROM event_check_in
WHERE organization_code = 'AWSKRUG'
GROUP BY organization_code, event_version, DATE(checked_at)
ORDER BY check_date DESC, event_version;


-- ============================================
-- 2. 특정 event_code의 출석자 명단
-- ============================================

-- 기본 출석자 명단 (event_name은 간단한 JOIN으로)
SELECT
    c.phone,
    c.name,
    e.event_name,
    c.organization_code,
    c.event_version,
    c.checked_at
FROM event_check_in c
JOIN event e ON c.event_code = e.event_code
WHERE c.event_code = 'EVENT001'
ORDER BY c.checked_at DESC;

-- 출석 시간대별 통계
SELECT
    c.event_code,
    e.event_name,
    DATE_TRUNC('hour', c.checked_at) as hour_bucket,
    COUNT(*) as checkin_count
FROM event_check_in c
JOIN event e ON c.event_code = e.event_code
WHERE c.event_code = 'EVENT001'
GROUP BY c.event_code, e.event_name, hour_bucket
ORDER BY hour_bucket;


-- ============================================
-- 3. 추가 유용한 통계 쿼리
-- ============================================

-- Organization별 전체 이벤트 출석 통계
SELECT
    organization_code,
    COUNT(DISTINCT event_code) as total_events,
    COUNT(DISTINCT phone) as unique_attendees,
    COUNT(*) as total_checkins,
    MIN(checked_at) as first_checkin,
    MAX(checked_at) as last_checkin
FROM event_check_in
GROUP BY organization_code
ORDER BY total_checkins DESC;

-- 이벤트별 출석률 (등록 대비)
SELECT
    r.event_code,
    COUNT(DISTINCT r.phone) as registered_count,
    COUNT(DISTINCT c.phone) as checkin_count,
    ROUND(COUNT(DISTINCT c.phone)::NUMERIC / NULLIF(COUNT(DISTINCT r.phone), 0) * 100, 2) as attendance_rate
FROM event_registration r
LEFT JOIN event_check_in c ON r.event_code = c.event_code
GROUP BY r.event_code
ORDER BY attendance_rate DESC;

-- 월별 출석 추이
SELECT
    organization_code,
    DATE_TRUNC('month', checked_at) as month,
    COUNT(DISTINCT phone) as unique_attendees,
    COUNT(*) as total_checkins
FROM event_check_in
GROUP BY organization_code, month
ORDER BY organization_code, month DESC;

-- 가장 활발한 참석자 (특정 organization)
SELECT
    phone,
    name,
    COUNT(DISTINCT event_code) as events_attended,
    MIN(checked_at) as first_attendance,
    MAX(checked_at) as last_attendance
FROM event_check_in
WHERE organization_code = 'AWSKRUG'
GROUP BY phone, name
ORDER BY events_attended DESC
LIMIT 20;

-- Event version별 인기도
SELECT
    event_version,
    COUNT(DISTINCT event_code) as event_count,
    COUNT(DISTINCT phone) as total_attendees,
    ROUND(AVG(attendee_per_event), 2) as avg_attendees_per_event
FROM (
    SELECT
        event_version,
        event_code,
        COUNT(DISTINCT phone) as attendee_per_event
    FROM event_check_in
    GROUP BY event_version, event_code
) subquery
GROUP BY event_version
ORDER BY total_attendees DESC;

-- 시간대별 체크인 패턴 분석
SELECT
    EXTRACT(HOUR FROM checked_at) as hour_of_day,
    COUNT(*) as checkin_count,
    COUNT(DISTINCT event_code) as events_count
FROM event_check_in
GROUP BY hour_of_day
ORDER BY hour_of_day;

-- 주간 참석자 vs 신규 참석자 (특정 organization)
WITH attendee_first_event AS (
    SELECT
        phone,
        MIN(checked_at) as first_attendance
    FROM event_check_in
    WHERE organization_code = 'AWSKRUG'
    GROUP BY phone
)
SELECT
    c.event_code,
    c.event_name,
    COUNT(DISTINCT c.phone) as total_attendees,
    COUNT(DISTINCT CASE
        WHEN c.checked_at = a.first_attendance THEN c.phone
    END) as new_attendees,
    COUNT(DISTINCT CASE
        WHEN c.checked_at > a.first_attendance THEN c.phone
    END) as returning_attendees
FROM event_check_in c
JOIN attendee_first_event a ON c.phone = a.phone
WHERE c.organization_code = 'AWSKRUG'
GROUP BY c.event_code, c.event_name
ORDER BY c.event_code;
