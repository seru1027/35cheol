#!/usr/bin/env bash
# MVP 완료 기준 테스트표 5줄을 다시 확인한다 (이슈 #1 멘토 3차 피드백 4-1)
# 백엔드를 고친 뒤 "남의 조직 공지가 여전히 막히는가"를 한 번에 다시 보기 위한 회귀 확인용
#
# 쓰는 법: 서버를 켠 뒤(npm run dev) server 폴더에서
#   bash scripts/mvp-check.sh
# 다른 주소의 서버를 볼 때: BASE_URL=http://localhost:4000/api bash scripts/mvp-check.sh
#
# 확인용 계정 3개·조직 2개·공지 1개를 매번 새로 만든다. 지금 DB의 데이터와 비밀번호에 기대지 않으려는 것
# (실행할 때마다 DB에 행이 쌓인다. 아이디·조직 이름에 mvp와 실행 시각이 붙어 구분된다)

# -e: 명령이 실패하면 그 자리에서 멈춤 / -u: 없는 변수를 쓰면 멈춤 / -o pipefail: 파이프 중간 실패도 실패로
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:4000/api}"

# 쿠키 파일과 응답 본문은 임시 폴더에 두고, 스크립트가 끝나면(실패해도) 지운다
WORK_DIR="$(mktemp -d "${TMPDIR:-/tmp}/mvp-check.XXXXXX")"
trap 'rm -rf "$WORK_DIR"' EXIT
BODY="$WORK_DIR/body.json"

# 실행마다 다른 아이디가 되도록 실행 시각(초)을 붙인다. 비밀번호는 이번 실행에서만 쓰는 임의 값
RUN_ID="$(date +%s)"
PASSWORD="$(openssl rand -hex 12)"

# request METHOD PATH COOKIE_FILE [JSON]
# 쿠키 파일의 쿠키를 보내고(-b), 응답 본문은 $BODY에 저장하고, 상태 코드만 출력한다(-w)
request() {
  local method=$1 path=$2 cookie=$3 json=${4:-}
  local args=(-s -o "$BODY" -w '%{http_code}' -X "$method" -b "$cookie")
  if [[ -n $json ]]; then
    args+=(-H 'Content-Type: application/json' -d "$json")
  fi
  curl "${args[@]}" "$BASE_URL$path"
}

# 준비 단계가 기대와 다르면 더 진행해도 의미가 없으므로 이유를 보여 주고 멈춘다
expect() {
  local want=$1 got=$2 step=$3
  if [[ $got != "$want" ]]; then
    echo "준비 실패: $step (기대 $want, 실제 $got)" >&2
    cat "$BODY" >&2
    echo >&2
    exit 1
  fi
}

# signup_and_login 이름표 → 가입하고 로그인해서 쿠키를 $WORK_DIR/<이름표>.cookie에 저장(-c)
signup_and_login() {
  local who=$1
  local login_id="mvp${who}${RUN_ID}"
  local cookie="$WORK_DIR/$who.cookie"
  local json
  # jq -n --arg: 따옴표가 섞여도 깨지지 않게 JSON을 만든다
  json="$(jq -n --arg id "$login_id" --arg name "MVP $who" --arg pw "$PASSWORD" \
    '{loginId: $id, name: $name, password: $pw}')"

  local status
  status="$(curl -s -o "$BODY" -w '%{http_code}' -X POST \
    -H 'Content-Type: application/json' -d "$json" "$BASE_URL/auth/signup")"
  expect 201 "$status" "$who 회원가입"

  status="$(curl -s -o "$BODY" -w '%{http_code}' -X POST -c "$cookie" \
    -H 'Content-Type: application/json' -d "$json" "$BASE_URL/auth/login")"
  expect 200 "$status" "$who 로그인"
}

# 서버가 꺼져 있으면 curl이 0이 아닌 종료 코드를 낸다. set -e로 조용히 끝나기 전에 먼저 알려 준다
if ! curl -s -o /dev/null "$BASE_URL/auth/me"; then
  echo "서버에 연결할 수 없습니다: $BASE_URL (server 폴더에서 npm run dev 먼저)" >&2
  exit 1
fi

echo "준비: 계정·조직·공지 만들기 (실행 ID $RUN_ID)"

# A 회원: 조직 A를 만들어 OWNER. 역할 검사를 통과해야 SQL의 org_id 조건까지 시험된다 (8단계에서 이영희를 ADMIN으로 바꾼 것과 같은 이유)
# B 회원: 조직 B를 만들고 공지 하나를 쓴다
# 일반 회원: 초대 코드로 조직 A에 신청하고 A 회원이 승인 → 조직 A의 MEMBER
signup_and_login a
signup_and_login b
signup_and_login m
A="$WORK_DIR/a.cookie"
B="$WORK_DIR/b.cookie"
M="$WORK_DIR/m.cookie"

status="$(request POST /orgs "$A" "{\"name\":\"mvp-check A $RUN_ID\"}")"
expect 201 "$status" "조직 A 생성"
ORG_A="$(jq -r '.data.orgId' "$BODY")"

status="$(request POST /orgs "$B" "{\"name\":\"mvp-check B $RUN_ID\"}")"
expect 201 "$status" "조직 B 생성"
ORG_B="$(jq -r '.data.orgId' "$BODY")"

status="$(request POST "/orgs/$ORG_B/notices" "$B" '{"title":"B 공지","content":"B 회원만 보는 공지"}')"
expect 201 "$status" "B 공지 작성"
NOTICE_B="$(jq -r '.data.noticeId' "$BODY")"

status="$(request POST "/orgs/$ORG_A/invite-code" "$A")"
expect 201 "$status" "조직 A 초대 코드 발급"
INVITE_CODE="$(jq -r '.data.inviteCode' "$BODY")"

status="$(request POST /join-requests "$M" "{\"inviteCode\":\"$INVITE_CODE\"}")"
expect 201 "$status" "일반 회원 가입 신청"

status="$(request GET "/orgs/$ORG_A/join-requests" "$A")"
expect 200 "$status" "가입 신청 목록"
MEMBERSHIP_ID="$(jq -r '.data.joinRequests[0].membershipId' "$BODY")"

status="$(request POST "/orgs/$ORG_A/join-requests/$MEMBERSHIP_ID/approve" "$A")"
expect 200 "$status" "가입 승인"

echo "  조직 A=$ORG_A, 조직 B=$ORG_B, B 공지=$NOTICE_B"
echo

PASS=0
TOTAL=0

# check 설명 기대상태 기대코드 METHOD PATH COOKIE_FILE [JSON]
# 한 줄에 기대값과 실제값을 나란히 보여 주고, 둘 다 같으면 통과
check() {
  local label=$1 want_status=$2 want_code=$3
  shift 3
  local status code result
  status="$(request "$@")"
  code="$(jq -r '.code' "$BODY")"
  TOTAL=$((TOTAL + 1))
  if [[ $status == "$want_status" && $code == "$want_code" ]]; then
    result="통과"
    PASS=$((PASS + 1))
  else
    result="실패"
  fi
  printf '%s  기대 %s %-18s  실제 %s %-18s  %s\n' \
    "$result" "$want_status" "$want_code" "$status" "$code" "$label"
}

echo "MVP 완료 기준 테스트표"
check "A 회원이 B 공지 목록 조회" 404 ORG_NOT_FOUND \
  GET "/orgs/$ORG_B/notices" "$A"
check "A 회원이 A 주소로 B 공지 상세 조회" 404 NOTICE_NOT_FOUND \
  GET "/orgs/$ORG_A/notices/$NOTICE_B" "$A"
check "A 회원이 A 주소로 B 공지 수정" 404 NOTICE_NOT_FOUND \
  PUT "/orgs/$ORG_A/notices/$NOTICE_B" "$A" '{"title":"바꿈","content":"바꿈"}'
check "A 회원이 A 주소로 B 공지 삭제" 404 NOTICE_NOT_FOUND \
  DELETE "/orgs/$ORG_A/notices/$NOTICE_B" "$A"
check "일반 회원이 공지 작성" 403 INSUFFICIENT_ROLE \
  POST "/orgs/$ORG_A/notices" "$M" '{"title":"회원 공지","content":"회원이 쓴 공지"}'

echo
echo "결과: $PASS / $TOTAL 통과"

# 종료 코드: 모두 통과면 0, 하나라도 실패면 1 (다른 스크립트나 CI가 이 값으로 성공·실패를 판단한다)
if [[ $PASS -ne $TOTAL ]]; then
  exit 1
fi
