-- =============================================================
-- 35cheol DB 설계 v0.1 (초안)
-- 범위: MVP 기능 17개 (AUTH-01~04, ORG-01~03, JOIN-01~04, MEMBER-01, NOTICE-01~05)
-- 기준: Figma 02 기능정의서
--
-- 실행: mysql -u root -p < server/src/db/schema.sql
-- 주의: 초안 단계라 실행할 때마다 테이블을 지우고 다시 만든다 (데이터도 사라짐)
--
-- `-- [결정 필요 D?]` 표시는 아직 정하지 않은 규칙이다. 지금은 임시값으로 두었다.
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
  created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,  -- [결정 필요 D6] 시간 저장 방식

  PRIMARY KEY (id),
  UNIQUE KEY uq_users_login_id (login_id)  -- 아이디 중복 → 409 (동시 가입도 1건만)
) ENGINE = InnoDB;


-- -------------------------------------------------------------
-- 2. organizations — 동아리 (ORG-01~03, JOIN-01·02)
-- -------------------------------------------------------------
CREATE TABLE organizations (
  id          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  name        VARCHAR(30)   NOT NULL,  -- 앞뒤 공백 제거 후 1~30자, 중복 허용
  -- [결정 필요 D1] 초대 코드를 이 테이블의 칼럼으로 둘지, 별도 테이블로 뺄지 (임시: 칼럼)
  invite_code CHAR(8)       NULL,      -- 8자리 대문자+숫자. NULL = 아직 발급 안 함. 재발급 = 덮어쓰기
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,  -- [결정 필요 D6]

  PRIMARY KEY (id),
  UNIQUE KEY uq_organizations_invite_code (invite_code)  -- 코드만으로 조직을 찾으므로 서비스 전체에서 유일
) ENGINE = InnoDB;


-- -------------------------------------------------------------
-- 3. memberships — 사용자와 조직의 소속 관계, 역할은 여기에 붙는다
--    (ORG-01·02·03, JOIN-02~04, MEMBER-01, 모든 조직 기능의 검문 ②③)
-- -------------------------------------------------------------
CREATE TABLE memberships (
  id         INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  user_id    INT UNSIGNED  NOT NULL,
  org_id     INT UNSIGNED  NOT NULL,
  -- [결정 필요 D2] PENDING일 때 역할을 비워둘지(NULL), MEMBER로 채워둘지 (임시: NULL)
  -- [결정 필요 D3] 회원 목록의 역할 정렬(회장 → 운영진 → 회원)을 무엇으로 할지
  role       ENUM('OWNER', 'ADMIN', 'MEMBER')        NULL,
  -- [결정 필요 D4] 탈퇴·추방을 상태값으로 남길지, 행을 지울지 (핵심 기능이지만 지금 모양에 영향)
  status     ENUM('PENDING', 'ACTIVE', 'REJECTED')   NOT NULL,
  -- [결정 필요 D5] 행을 재사용(재신청)하므로 어떤 시각을 남길지
  --   - 신청 목록 정렬(JOIN-03): 신청 시각
  --   - 내 조직 목록 정렬(ORG-02), 회원 목록 정렬·가입일(MEMBER-01): 가입 시각
  created_at DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,  -- 임시. [결정 필요 D6]

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
  title      VARCHAR(100)  NOT NULL,  -- 앞뒤 공백 제거 후 1~100자  [결정 필요 D7] 글자 수 기준
  body       TEXT          NOT NULL,  -- 1~5,000자 일반 텍스트, 입력 그대로 저장  [결정 필요 D7]
  created_at DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,  -- [결정 필요 D6]
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
-- [핵심]   거절·역할 변경·추방·탈퇴·회장 위임 (JOIN-05, MEMBER-02~05) → memberships 변경 가능성
-- [추가 1] audit_logs — 감사 로그 (승인자·삭제자 기록이 여기로 넘어와 있음)
-- [추가 2] dues, due_payments — 회비 (DECIMAL, 집계)
-- [추가 3] schedules — 일정
-- [추가 4] 새 공지 표시 — 마지막 확인 시각 칼럼 (NOTICE-06)
-- =============================================================
