# 아스날 팬 허브

아스날 FC의 경기·순위·통계·선수단·이적시장·여론을 한 페이지에 모은 비공식 팬 사이트입니다.

화면은 `index.html` 한 파일이고, 빌드 과정은 없습니다. 디자인 시스템 CSS(색·글꼴·간격 토큰과 컴포넌트)도 이 파일 맨 앞에 들어 있습니다. 선수는 사진 대신 이니셜로 표시합니다.
일정·순위·요약 같은 자주 바뀌는 값은 `data/` 의 JSON 파일에서 읽고, 파일을 못 읽으면 HTML 에 적어 둔 내용을 그대로 보여 줍니다.

## 메뉴

| 메뉴 | 내용 |
|---|---|
| 홈 | 지금 아스날 한 줄 요약, 다음 경기·순위·최근 결과 |
| 경기 | 한국시간 일정(현지 시각 병기)·결과, 경기 요약, 부상자, 다음 상대 미리보기 |
| 순위·기록 | EPL 순위표와 기록 |
| 선수단 | 1군 선수 명단과 선수별 정보 |
| 소식 | 칼럼·기자회견·팬 여론·이적(신뢰도 등급 표기) |

## 파일

| 파일 | 내용 |
|---|---|
| `index.html` | 사이트 전체 |
| `data/fixtures.json` | 일정·결과(한국시간·현지 시각, 중계) |
| `data/standings.json` | EPL 순위표 |
| `data/content.json` | 첫 화면 문구, 경기 요약, 헤드라인, 이적 보드 |
| `arsenal.ics` | 휴대폰 달력 구독 파일 |
| `assets/crests/` | 구단 엠블럼(출처·상표 안내는 `assets/crests/README.md`) |
| `scripts/build-ics.mjs` | `data/fixtures.json` 으로 `arsenal.ics` 를 다시 만듭니다 (`node scripts/build-ics.mjs`) |

## 표기 원칙

- 모든 일정은 **한국시간(KST)** 기준이며 현지 시각을 함께 적었습니다.
- **오피셜과 루머를 반드시 구분**하고, 루머는 신뢰도를 함께 표기합니다.
- 확인되지 않은 정보는 지어내지 않고 "미확정"으로 남깁니다.
- 커뮤니티 여론은 원문을 그대로 인용하지 않고 순화해 요약합니다.

## 출처

일정 [PremierLeague.com](https://www.premierleague.com) · [Arsenal.com](https://www.arsenal.com) ·
순위 [BBC](https://www.bbc.co.uk/sport/football/premier-league/table) · [Guardian](https://www.theguardian.com/football/premierleague/table) ·
구단 엠블럼 이미지 [football-data.org](https://www.football-data.org) ·
기사 [Arsenal.com](https://www.arsenal.com) · [Sky Sports](https://www.skysports.com) · [BBC](https://www.bbc.com/sport/football) · [ESPN](https://www.espn.com/soccer/) · [Guardian](https://www.theguardian.com/football) · [Arseblog](https://arseblog.com) · [Opta Analyst](https://theanalyst.com) 등 ·
국내 반응 베스트일레븐 등 국내 스포츠 매체

글꼴: [Pretendard](https://github.com/orioncactus/pretendard) · [Archivo](https://fonts.google.com/specimen/Archivo) (SIL Open Font License 1.1)

## 고지

비공식 팬 사이트입니다. 구단 엠블럼은 각 구단의 상표이며, 구단·리그와 관계가 없습니다.
모든 내용은 공개된 보도를 요약한 것이며, 상표와 이미지의 권리는 각 권리자에게 있습니다.
