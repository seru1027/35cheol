-- =============================================================
-- 35cheol DB 설계 v0.1
-- 범위: MVP 기능 17개 (AUTH-01~04, ORG-01~03, JOIN-01~04, MEMBER-01, NOTICE-01~05)
-- 기준: Figma 02 기능정의서, 설계 결정 D1~D7 (Wiki 'DB 설계서')
--
-- 실행: mysql -u root -p < server/src/db/schema.sql
-- 주의: 초안 단계라 실행할 때마다 테이블을 지우고 다시 만든다 (데이터도 사라짐)
--
-- 공통 규칙
--   - 시각은 모두 DATETIME, UTC로 저장한다 (D6). 커넥션 풀이 세션 시간대를 UTC로 맞춘다
--     → server/src/db/connection.js
--   - 글자 수 제한은 VARCHAR의 '글자' 기준. 서버 검증도 [...str].length로 같은 기준을 쓴다 (D7)
-- =============================================================

CREATE DATABASE IF NOT EXISTS `35cheol`
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_0900_ai_ci;

USE `35cheol`;

-- 다른 테이블이 참조하는 테이블을 나중에 지운다 (만드는 순서의 반대)
DROP TABLE IF EXISTS notices;
DROP TABLE IF EXISTS memberships;
DROP TABLE IF EXISTS organizations;
DROP TABLE IF EXISTS users;


-- -------------------------------------------------------------
-- 1. users — 서비스 계정 (AUTH-01~03)
-- -------------------------------------------------------------
CREATE TABLE users (
  id            INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  login_id      VARCHAR(20)   NOT NULL,  -- 4~20자 영문·숫자, 소문자로 바꿔 저장
  name          VARCHAR(20)   NOT NULL,  -- 1~20자, 중복 허용
  password_hash CHAR(60)      NOT NULL,  -- bcrypt 해시는 항상 60자. 원문 저장 금지
  created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_users_login_id (login_id)  -- 아이디 중복 → 409 (동시 가입도 1건만)
) ENGINE = InnoDB;


-- -------------------------------------------------------------
-- 2. organizations — 동아리 (ORG-01~03, JOIN-01·02)
-- -------------------------------------------------------------
CREATE TABLE organizations (
  id          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  name        VARCHAR(30)   NOT NULL,  -- 앞뒤 공백 제거 후 1~30자, 중복 허용
  -- D1: 조직당 1개라 칼럼으로 둔다. 만료·횟수 제한(학습용 확장)이 생기면 별도 테이블로 분리
  invite_code CHAR(8)       NULL,      -- 8자리 대문자+숫자. NULL = 아직 발급 안 함. 재발급 = 덮어쓰기
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_organizations_invite_code (invite_code)  -- 코드만으로 조직을 찾으므로 서비스 전체에서 유일. NULL끼리는 겹쳐도 됨
) ENGINE = InnoDB;


-- -------------------------------------------------------------
-- 3. memberships — 사용자와 조직의 소속 관계, 역할은 여기에 붙는다
--    (ORG-01·02·03, JOIN-02~04, MEMBER-01, 모든 조직 기능의 검문 ②③)
-- -------------------------------------------------------------
CREATE TABLE memberships (
  id           INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  user_id      INT UNSIGNED  NOT NULL,
  org_id       INT UNSIGNED  NOT NULL,
  -- D2: PENDING·REJECTED는 역할 없음(NULL). 승인(JOIN-04) 때 MEMBER, 조직 생성(ORG-01) 때 OWNER
  --     재신청(JOIN-02)하면 다시 NULL로 → 이전 역할이 남아 승인 즉시 운영진이 되는 일을 막는다
  -- D3: 선언 순서 = 정렬 순서. ORDER BY role 하면 OWNER → ADMIN → MEMBER (MEMBER-01). 순서를 바꾸지 말 것
  role         ENUM('OWNER', 'ADMIN', 'MEMBER')        NULL,
  -- D4: 탈퇴·추방은 행을 지우지 않고 상태값으로 남긴다. 핵심 기능 단계에서 'LEFT', 'REMOVED' 추가 예정
  status       ENUM('PENDING', 'ACTIVE', 'REJECTED')   NOT NULL,
  -- D5: 행을 재사용하므로 시각 두 개를 따로 둔다
  requested_at DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,  -- 신청 시각. 재신청 때 갱신. 신청 목록(JOIN-03)·내 조직 목록(ORG-02) 정렬
  joined_at    DATETIME      NULL DEFAULT NULL,                   -- ACTIVE가 된 시각. 재신청 때 NULL로. 회원 목록 정렬·가입일(MEMBER-01)

  PRIMARY KEY (id),
  UNIQUE KEY uq_memberships_user_org (user_id, org_id),  -- 한 사람·한 조직은 1행 (재신청 시 재사용)
  KEY idx_memberships_org_status (org_id, status),        -- 신청 목록·회원 목록: WHERE org_id = ? AND status = ?

  CONSTRAINT fk_memberships_user FOREIGN KEY (user_id) REFERENCES users (id),
  CONSTRAINT fk_memberships_org  FOREIGN KEY (org_id)  REFERENCES organizations (id)
) ENGINE = InnoDB;


-- -------------------------------------------------------------
-- 4. notices — 공지 (NOTICE-01~05). 멀티테넌시를 처음 검증하는 테이블
-- -------------------------------------------------------------
CREATE TABLE notices (
  id         INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  org_id     INT UNSIGNED  NOT NULL,  -- 서버가 URL의 조직 ID로 넣는다. 모든 조회·수정·삭제의 조건
  author_id  INT UNSIGNED  NOT NULL,  -- 서버가 토큰의 사용자 ID로 넣는다
  title      VARCHAR(100)  NOT NULL,  -- 앞뒤 공백 제거 후 1~100자
  body       TEXT          NOT NULL,  -- 1~5,000자 일반 텍스트, 입력 그대로 저장 (TEXT 최대 65,535바이트)
  created_at DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME      NULL DEFAULT NULL,  -- 수정된 적 없으면 NULL (NOTICE-02 '비움'). NOTICE-04에서 기록

  PRIMARY KEY (id),
  KEY idx_notices_org_created (org_id, created_at),  -- 공지 목록: WHERE org_id = ? ORDER BY created_at DESC

  CONSTRAINT fk_notices_org    FOREIGN KEY (org_id)    REFERENCES organizations (id),
  CONSTRAINT fk_notices_author FOREIGN KEY (author_id) REFERENCES users (id)
) ENGINE = InnoDB;


-- =============================================================
-- 이후 단계 (자리만 표시, 해당 단계에서 설계)
-- -------------------------------------------------------------
-- [핵심]   Refresh Token 저장 (AUTH-05)
-- [핵심]   거절·역할 변경·추방·탈퇴·회장 위임 (JOIN-05, MEMBER-02~05) → memberships.status에 LEFT·REMOVED 추가 (D4)
-- [추가 1] audit_logs — 감사 로그 (승인자·삭제자 기록이 여기로 넘어와 있음)
-- [추가 2] dues, due_payments — 회비 (DECIMAL, 집계)
-- [추가 3] schedules — 일정
-- [추가 4] 새 공지 표시 — 마지막 확인 시각 칼럼 (NOTICE-06)
-- =============================================================
