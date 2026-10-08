-- =============================================================
-- 35cheol ERD v0.2
-- 범위: MVP API 18개 (AUTH-01~04, ORG-01~03, JOIN-01~04, MEMBER-01, NOTICE-01~05)
-- 기준: Wiki 'API 명세서' v0.2, 설계 결정 D1~D9 (Wiki 'ERD 설계서')
--
-- 실행: mysql -u root -p --default-character-set=utf8mb4 < server/src/db/schema.sql
--   --default-character-set: mysql 클라이언트의 기본 문자셋이 latin1이면 한글·이모지가 깨지거나
--   한 글자가 여러 글자로 세어져 VARCHAR 길이 검사에 걸린다
-- 주의: 초안 단계라 실행할 때마다 테이블을 지우고 다시 만든다 (데이터도 사라짐)
--
-- 공통 규칙
--   - 시각은 모두 DATETIME, UTC로 저장한다 (D6). 커넥션 풀이 세션 시간대를 UTC로 맞춘다
--     → server/src/db/connection.js
--   - 글자 수 제한은 VARCHAR의 '글자' 기준. 서버 검증도 [...str].length로 같은 기준을 쓴다 (D7)
--   - 서버가 먼저 검사해 400으로 응답한다. VARCHAR·NOT NULL은 마지막 방어선
--     (strict 모드라 넘치면 잘라 저장하지 않고 1406 에러 → 500)
--   - UNIQUE 위반(1062)은 API마다 409로 바꾸거나(사용자가 고른 값) 다시 시도한다(서버가 뽑은 값)
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
  login_id      VARCHAR(20)   NOT NULL,  -- 4~20자 영문·숫자. 서버가 앞뒤 공백 제거·소문자 변환 후 저장
  name          VARCHAR(20)   NOT NULL,  -- 앞뒤 공백 제거 후 1~20자, 중복 허용
  password_hash CHAR(60)      NOT NULL,  -- bcrypt 해시는 항상 60자. 원문 저장 금지
  created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  -- AUTH-01 409 LOGIN_ID_ALREADY_EXISTS의 근거 (동시 가입도 1건만). AUTH-02 로그인 조회도 이 인덱스를 쓴다
  -- DB 기본 콜레이션(ai_ci)이 대소문자를 구분하지 않아 소문자 변환이 빠져도 'Kim123'과 'kim123'은 중복
  CONSTRAINT uq_users_login_id UNIQUE (login_id)
) ENGINE = InnoDB;


-- -------------------------------------------------------------
-- 2. organizations — 동아리 (ORG-01·02, JOIN-01·02)
-- -------------------------------------------------------------
CREATE TABLE organizations (
  id          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  name        VARCHAR(30)   NOT NULL,  -- 앞뒤 공백 제거 후 1~30자, 중복 허용
  -- D1: 조직당 1개라 칼럼으로 둔다. 만료·횟수 제한(학습용 확장)이 생기면 별도 테이블로 분리
  -- 8자리, 대문자+숫자에서 0 O 1 I L을 뺀 31자 중 crypto로 뽑는다. NULL = 아직 발급 안 함. 재발급 = 덮어쓰기
  invite_code CHAR(8)       NULL,
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  -- 코드만으로 조직을 찾으므로(JOIN-02) 서비스 전체에서 유일. NULL끼리는 겹쳐도 된다(미발급 조직 여러 개)
  -- JOIN-01 발급에서 1062가 나면 409가 아니라 새 코드를 뽑아 다시 저장 (5번 연속 실패 → 500)
  CONSTRAINT uq_organizations_invite_code UNIQUE (invite_code)
) ENGINE = InnoDB;


-- -------------------------------------------------------------
-- 3. memberships — 사용자와 조직의 소속 관계, 역할은 여기에 붙는다
--    (ORG-01·02·03, JOIN-02~04, MEMBER-01, 모든 조직 API의 멤버십·역할 검사)
-- -------------------------------------------------------------
CREATE TABLE memberships (
  id           INT UNSIGNED  NOT NULL AUTO_INCREMENT,  -- API의 membershipId (JOIN-03 목록 → JOIN-04 승인 URL)
  user_id      INT UNSIGNED  NOT NULL,
  org_id       INT UNSIGNED  NOT NULL,
  -- D2: PENDING·REJECTED는 역할 없음(NULL). 승인(JOIN-04) 때 MEMBER, 조직 생성(ORG-01) 때 OWNER
  --     재신청(JOIN-02)하면 다시 NULL로 → 이전 역할이 남아 승인 즉시 운영진이 되는 일을 막는다
  -- D3: 선언 순서 = 정렬 순서. ORDER BY role 하면 OWNER → ADMIN → MEMBER (MEMBER-01). 순서를 바꾸지 말 것
  role         ENUM('OWNER', 'ADMIN', 'MEMBER')        NULL,
  -- D4: 탈퇴·추방은 행을 지우지 않고 상태값으로 남긴다. 핵심 기능 단계에서 'LEFT', 'REMOVED' 추가 예정
  -- 멤버십 미들웨어: ACTIVE만 통과, PENDING → 403 MEMBERSHIP_PENDING, 나머지·행 없음 → 404 ORG_NOT_FOUND
  status       ENUM('PENDING', 'ACTIVE', 'REJECTED')   NOT NULL,
  -- D5: 행을 재사용하므로 시각 두 개를 따로 둔다
  requested_at DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,  -- 신청 시각. 재신청 때 갱신. 신청 목록(JOIN-03)·내 조직 목록(ORG-02) 정렬
  joined_at    DATETIME      NULL DEFAULT NULL,                   -- ACTIVE가 된 시각. 재신청 때 NULL로. 회원 목록 정렬·가입일(MEMBER-01)

  PRIMARY KEY (id),
  -- 한 사람·한 조직은 1행 (재신청 시 재사용). JOIN-02 INSERT의 1062 → 기존 행 UPDATE 또는 409
  -- 왼쪽 칼럼(user_id)만으로도 쓰이므로 내 조직 목록(ORG-02: WHERE user_id = ?)의 인덱스를 겸한다
  CONSTRAINT uq_memberships_user_org UNIQUE (user_id, org_id),
  -- 신청 목록(JOIN-03)·회원 목록(MEMBER-01): WHERE org_id = ? AND status = ?
  KEY idx_memberships_org_status (org_id, status),

  CONSTRAINT fk_memberships_user FOREIGN KEY (user_id) REFERENCES users (id),
  CONSTRAINT fk_memberships_org  FOREIGN KEY (org_id)  REFERENCES organizations (id),

  -- D8: 상태와 역할·가입 시각의 짝을 DB가 강제한다 (D2·D5). 어기면 3819 에러 → 500 (서버 버그)
  --     핵심 단계에서 LEFT·REMOVED를 추가할 때 이 식도 함께 고친다
  --   ACTIVE면 역할·가입 시각이 반드시 있음 / PENDING이면 둘 다 NULL / 그 밖의 상태는 제한하지 않음
  --   REJECTED도 역할 NULL(D2)이지만 MVP에는 거절 기능이 없어 아직 강제하지 않는다 → 거절(JOIN-05) 만들 때 추가
  CONSTRAINT chk_memberships_status_role CHECK (
    (status = 'ACTIVE'  AND role IS NOT NULL AND joined_at IS NOT NULL) OR
    (status = 'PENDING' AND role IS NULL     AND joined_at IS NULL) OR
    status NOT IN ('ACTIVE', 'PENDING')
  )
) ENGINE = InnoDB;


-- -------------------------------------------------------------
-- 4. notices — 공지 (NOTICE-01~05). 멀티테넌시를 처음 검증하는 테이블
-- -------------------------------------------------------------
CREATE TABLE notices (
  id         INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  org_id     INT UNSIGNED  NOT NULL,  -- 서버가 URL의 조직 ID로 넣는다. 모든 조회·수정·삭제의 조건 (IDOR 방어)
  author_id  INT UNSIGNED  NOT NULL,  -- 서버가 토큰의 사용자 ID로 넣는다. 응답 authorName은 users와 JOIN한 현재 이름 (D9)
  title      VARCHAR(100)  NOT NULL,  -- 앞뒤 공백 제거 후 1~100자
  -- API 명세서 NOTICE ②: body → content (HTTP 요청 본문 req.body와 헷갈리지 않게)
  content    TEXT          NOT NULL,  -- 앞뒤 공백 제거 후 1~5,000자 일반 텍스트, 그 밖에는 입력 그대로 저장 (TEXT 최대 65,535바이트)
  created_at DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME      NULL DEFAULT NULL,  -- 수정된 적 없으면 NULL (응답 updatedAt: null). NOTICE-04에서 기록

  PRIMARY KEY (id),
  -- 공지 목록(NOTICE-01): WHERE org_id = ? ORDER BY created_at DESC, id DESC
  -- InnoDB 보조 인덱스는 끝에 기본 키(id)를 품고 있어 (org_id, created_at, id) 순서로 정렬되어 있다
  KEY idx_notices_org_created (org_id, created_at),

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
