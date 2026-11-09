// 날짜 표시 (화면정의서 결정: 목록 2026.04.02, 상세 2026.04.02 18:30)
// 서버는 UTC 시각 문자열('2026-10-05T09:30:00.000Z')을 주고, 화면이 브라우저 시간대로 바꿔 보여준다

// Intl.DateTimeFormat: 브라우저에 들어 있는 날짜 형식 기능 (라이브러리 없음)
// timeZone을 주지 않으면 브라우저(사용자 컴퓨터)의 시간대를 쓴다 → 한국에서는 UTC + 9시간
// 형식 객체를 만드는 데 비용이 있어 한 번만 만들어 두고 다시 쓴다
const dateParts = new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });

// '2026-10-05T18:30:00.000Z' → '2026.10.06' (한국 시간으로는 다음 날 새벽 3:30)
// ko-KR 기본 출력은 '2026. 10. 06.'이라, formatToParts로 조각(연·월·일)만 꺼내 점으로 잇는다
export function formatDate(iso) {
  const parts = Object.fromEntries(dateParts.formatToParts(new Date(iso)).map((p) => [p.type, p.value]));
  return `${parts.year}.${parts.month}.${parts.day}`;
}

// 상세용: 시·분까지. hourCycle 'h23': 0~23시 24시간제 ('오후 6:30'이 아니라 '18:30')
const dateTimeParts = new Intl.DateTimeFormat('ko-KR', {
  year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
});

// '2026-04-02T09:30:00.000Z' → '2026.04.02 18:30' (한국 시간)
export function formatDateTime(iso) {
  const parts = Object.fromEntries(dateTimeParts.formatToParts(new Date(iso)).map((p) => [p.type, p.value]));
  return `${parts.year}.${parts.month}.${parts.day} ${parts.hour}:${parts.minute}`;
}
