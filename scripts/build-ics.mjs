#!/usr/bin/env node
// data/fixtures.json → arsenal.ics (휴대폰 달력 구독 파일)
//
// 쓰는 법:  node scripts/build-ics.mjs
// 일정 데이터(data/fixtures.json)를 고친 뒤 다시 돌리면 저장소 루트의 arsenal.ics 가 새로 만들어진다.
//
// - 킥오프 시각이 확정된 경기: 한국시간(Asia/Seoul) 기준 2시간짜리 일정
// - 시간 미정 경기: 영국 현지 날짜로 종일 일정(제목에 «시간 미정»)
// - 끝난 경기: 제목에 스코어를 붙여 남긴다
// - UID 는 경기 id 로 고정이라, 시각이 바뀌어도 달력 앱이 같은 일정으로 알아보고 고친다.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const data = JSON.parse(readFileSync(join(root, 'data/fixtures.json'), 'utf8'));
const SITE = 'https://kimthegooner.github.io/football-info/';

const COMP = { EPL: '프리미어리그', UCL: '챔피언스리그', EFL: '카라바오컵', FAC: 'FA컵' };

// RFC 5545 글자 이스케이프
const esc = (s) => String(s ?? '').replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');

// 한 줄 75옥텟 넘으면 접는다(UTF-8 글자 중간은 자르지 않음)
function fold(line) {
  const out = [];
  let cur = '', bytes = 0, limit = 75;
  for (const ch of line) {
    const b = Buffer.byteLength(ch, 'utf8');
    if (bytes + b > limit) { out.push(cur); cur = ' '; bytes = 1; limit = 75; }
    cur += ch; bytes += b;
  }
  out.push(cur);
  return out.join('\r\n');
}

// '2026-10-10T20:30:00+09:00' → '20261010T203000' (문자열이 이미 한국시간)
const localStamp = (iso) => iso.slice(0, 19).replace(/[-:]/g, '');
const ymd = (d) => d.replace(/-/g, '');
function nextDay(d) {
  const t = new Date(d + 'T00:00:00Z'); t.setUTCDate(t.getUTCDate() + 1);
  return t.toISOString().slice(0, 10).replace(/-/g, '');
}
function plusHours(iso, h) {
  const t = new Date(iso); t.setTime(t.getTime() + h * 3600000);
  const k = new Date(t.getTime() + 9 * 3600000); // 한국시간 벽시계
  return k.toISOString().slice(0, 19).replace(/[-:]/g, '');
}
const utcStamp = (iso) => new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

const stamp = utcStamp(data.as_of_kst || new Date().toISOString());
const timed = (f) => !!f.kickoff_kst && f.kickoff_status === '확정';

function title(f) {
  const comp = `${COMP[f.competition] || f.competition_ko || f.competition} ${f.round || ''}`.trim();
  let match;
  if (f.result) {
    const a = f.result.arsenal, o = f.result.opponent;
    match = f.home_away === 'H' ? `아스날 ${a}-${o} ${f.opponent_ko}` : `${f.opponent_ko} ${o}-${a} 아스날`;
  } else {
    match = f.home_away === 'H' ? `아스날 vs ${f.opponent_ko}` : `${f.opponent_ko} vs 아스날`;
  }
  const extra = !f.result && !timed(f) ? ' (시간 미정)' : (!f.result && f.dawn_kst ? ' (새벽)' : '');
  return `${match} · ${comp}${extra}`;
}

function description(f) {
  const lines = [];
  if (timed(f)) {
    lines.push(`한국시간 ${f.kickoff_kst.slice(0, 10)} ${f.kickoff_kst.slice(11, 16)} (현지 ${f.kickoff_local.slice(11, 16)} ${f.local_tz || ''})`.trim());
  } else {
    lines.push(`킥오프 시간 미정 — 날짜는 영국 현지 기준 ${f.date_status || '잠정'}. 방송 편성이 나오면 이 일정이 바뀝니다.`);
  }
  if (f.dawn_kst && timed(f)) lines.push('한국시간 새벽 경기');
  const tv = f.kr_broadcast?.name;
  lines.push(`국내 중계: ${tv ? tv + (f.kr_broadcast.status && f.kr_broadcast.status !== '확인' ? ` (${f.kr_broadcast.status})` : '') : '미확정'}`);
  // 일정 변경·편성 안내만 싣는다(확인 과정 메모는 싣지 않음)
  if (f.note && /변경|편성|최종전|TV|잠정/.test(f.note)) lines.push(f.note);
  lines.push(`일정 전체: ${SITE}#matches`);
  return lines.join('\n');
}

const all = [...(data.recent_results || []), ...(data.fixtures || [])];
const ev = [];
for (const f of all) {
  const L = ['BEGIN:VEVENT', `UID:${f.id}@kimthegooner.github.io`, `DTSTAMP:${stamp}`];
  if (timed(f)) {
    L.push(`DTSTART;TZID=Asia/Seoul:${localStamp(f.kickoff_kst)}`);
    L.push(`DTEND;TZID=Asia/Seoul:${plusHours(f.kickoff_kst, 2)}`);
  } else {
    L.push(`DTSTART;VALUE=DATE:${ymd(f.date_local)}`);
    L.push(`DTEND;VALUE=DATE:${nextDay(f.date_local)}`);
    L.push('TRANSP:TRANSPARENT');
  }
  L.push(`SUMMARY:${esc(title(f))}`);
  if (f.venue) L.push(`LOCATION:${esc(f.venue)}`);
  L.push(`DESCRIPTION:${esc(description(f))}`);
  L.push(`STATUS:${timed(f) || f.result ? 'CONFIRMED' : 'TENTATIVE'}`);
  L.push(`URL:${SITE}#matches`);
  L.push('END:VEVENT');
  ev.push(...L);
}

const cal = [
  'BEGIN:VCALENDAR',
  'VERSION:2.0',
  'PRODID:-//football-info//Arsenal fixtures KST//KO',
  'CALSCALE:GREGORIAN',
  'METHOD:PUBLISH',
  'X-WR-CALNAME:아스날 경기 일정 (한국시간)',
  'X-WR-CALDESC:아스날 팬 허브 — 한국시간 경기 일정. 시간 미정 경기는 종일 일정으로 들어갑니다.',
  'X-WR-TIMEZONE:Asia/Seoul',
  'REFRESH-INTERVAL;VALUE=DURATION:PT12H',
  'X-PUBLISHED-TTL:PT12H',
  'BEGIN:VTIMEZONE',
  'TZID:Asia/Seoul',
  'BEGIN:STANDARD',
  'DTSTART:19700101T000000',
  'TZOFFSETFROM:+0900',
  'TZOFFSETTO:+0900',
  'TZNAME:KST',
  'END:STANDARD',
  'END:VTIMEZONE',
  ...ev,
  'END:VCALENDAR',
];

writeFileSync(join(root, 'arsenal.ics'), cal.map(fold).join('\r\n') + '\r\n');
const n = all.length, t = all.filter(timed).length;
console.log(`arsenal.ics: 일정 ${n}개 (시각 확정 ${t} · 종일 ${n - t})`);
