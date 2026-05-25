# 땡굴이의 발자국

개인 활동 기록을 시각화한 GitHub Pages 대시보드입니다.

🔗 **https://topnipon.github.io**

---

## 페이지 구성

### 🗺 대한민국 여행 지도 (`index.html`)

전국 567개 관광지를 지도 위에 표시하는 스티커 여행 기록 시스템입니다.

- 방문한 곳은 컬러/발광 표시, 미방문은 어둡게 표시
- 13개 카테고리 필터 (산/자연, 해변, 역사/문화, 도시, 섬, 자연, 특별, 트래킹, 놀이동산, 리조트, 공원, 사찰, 박물관)
- 카테고리 범례 — 스팟 수 내림차순 정렬
- 시도별 색상 오버레이 + 방문율 통계 (세종 포함 17개 시도)
- 스팟 클릭 시 상세 패널 — Leaflet 미니맵 + 구글 지도 연동 버튼
- 발자국 남기기 / 방문 완료 — 소유자 인증 후 온라인에서만 사용 가능 (localhost 비활성화)
- ⚙ 설정에서 GitHub Token 입력 시 발자국 클릭과 동시에 GitHub에 자동 저장
- 다음 발자국 추천 — 지역 완성도 기반 후보 + 선택한 스팟 주변 미방문 후보

### 🚶 걷기 기록 (`walking.html`)

**2025.04 – 현재**까지의 일별 걷기 데이터를 시각화한 대시보드입니다.

- **캘린더 히트맵** — 날짜별 걷기 거리를 색상으로 표시
- **누적 거리 라인 차트** — 기간 누적 km 추이
- **월별 통계** — 월별 km / 걸음 수 전환 차트
- **요일별 평균** — 요일 패턴 분석
- **지도 오버레이** — 총 거리, 활동 일수, 최고 기록 요약 카드
- **걷기 × 여행 연결** — 누적 걷기 거리와 여행 도감 완성률을 함께 표시
- **실시간 날씨** — 성남 현재 날씨 패널 (Open-Meteo API)

### 🧭 방문 타임라인 (`timeline.html`)

방문 완료한 여행지를 날짜순으로 모아보는 개인 발자국 타임라인입니다.

- 날짜가 있는 방문 기록은 월별 타임라인으로 표시
- 기존 방문지처럼 방문일이 없는 기록은 `방문일 미입력` 구역에 정리
- 지역/테마/검색 필터
- 지역별·테마별 방문 랭킹 요약

### 🏅 발자국 도감 (`atlas.html`)

지역별·테마별 여행 완성률을 관리하는 진행 상황 도감입니다.

- 지역/테마 모드 전환
- 완성률 높은순·낮은순·남은 곳 많은순·이름순 정렬
- 각 도감 항목의 방문/미방문/완성률 요약
- 선택한 지역 또는 테마의 남은 발자국 목록 표시

---

## 데이터 구조

```
assets/
└── images/
    ├── footprint-mascot.png # 발자국 마스코트 UI 이미지
    └── visit-stamp.png      # 방문 완료 도장 이미지

data/
├── walking-data.json     # 일별 걷기 기록 (km, 걸음 수)
├── travel-spots.json     # 여행지 목록 567개 (위치, 카테고리 등)
├── visited-spots.json    # 방문한 여행지 ID 목록 + 개인 방문 기록
└── korea-regions.json    # 시도별 GeoJSON 경계 (색상 오버레이용)
```

```json
// walking-data.json
{
  "2025-04-07": { "km": 4.271, "steps": 6054 }
}

// travel-spots.json
{
  "spots": [
    { "id": "hallasan", "name": "한라산", "region": "제주", "lat": 33.362, "lng": 126.533,
      "radius": 20000, "category": "mountain", "description": "..." }
  ]
}

// visited-spots.json
{
  "visited": ["hallasan", "bukhansan"],
  "records": {
    "hallasan": {
      "visitedAt": "2026-05-17",
      "memo": "",
      "rating": null,
      "photos": []
    }
  },
  "lastUpdated": "2026-05-17"
}
```

---

## 자동 업데이트

### 걷기 기록

GitHub Actions(`.github/workflows/update-walking.yml`)를 통해 `repository_dispatch`로 자동 커밋됩니다.

```bash
curl -X POST https://api.github.com/repos/topnipon/topnipon.github.io/dispatches \
  -H "Authorization: token <TOKEN>" \
  -d '{"event_type":"update-walking","client_payload":{"date":"2026-05-17","km":7.5,"steps":9500}}'
```

### 데이터 검증

여행지/방문/걷기 데이터 변경 후에는 아래 명령으로 JSON 품질을 확인합니다.

```bash
node tools/validate-data.mjs
```

검증 항목:

- 여행지 ID 중복, 필수 필드, 좌표/반경, 지역/카테고리 값
- 방문 완료 ID가 실제 여행지에 존재하는지 여부
- 개인 방문 기록(`records`)의 날짜/평점/사진 형식
- 걷기 데이터 날짜, km, 걸음 수 형식
- 시도 GeoJSON 기본 구조

### 여행지 방문 기록

**온라인(topnipon.github.io)에서만** 발자국 등록/삭제가 가능합니다. localhost에서는 해당 기능이 비활성화됩니다.

사이트 우측 하단 ⚙ 버튼에서 GitHub Token을 등록한 뒤 소유자 암호를 입력하면, 발자국 클릭 시 GitHub Contents API(PUT) 저장 완료를 확인한 다음 화면에 반영합니다. 토큰이 없거나 저장에 실패하면 방문 상태를 바꾸지 않고 안내 메시지를 표시합니다.

> 토큰은 브라우저 localStorage에 저장되므로, 기기마다 1회 등록이 필요합니다.

---

## Codex 작업 메모

이 저장소는 집 로컬 환경에서 Codex로 이어서 관리합니다. 작업 전에는 `git pull origin main`으로 GitHub Pages의 최신 상태를 받아오고, 수정 후에는 검증한 뒤 커밋/푸시합니다.

현재 Codex 작업 환경은 저장소 내부에 `.codex-work/` 로컬 메모 폴더를 사용합니다. 이 폴더에는 `project-context.md`, `working-notes.md`, `decision-log.md` 같은 작업 참고 문서가 들어가며, 개인 작업 맥락용이므로 Git에는 포함하지 않습니다.

여행지 스팟을 추가하거나 수정할 때는 `data/travel-spots.json`만 갱신합니다. `index.html`은 페이지가 열릴 때 이 JSON을 불러와 지도, 검색, 통계에 사용합니다.

스팟 변경 후에는 JSON 파싱, 중복 ID, 페이지 로드 시 `data/travel-spots.json` fetch 성공 여부를 확인합니다. 로컬에서 확인할 때는 브라우저 보안 정책 때문에 파일을 직접 열지 말고 HTTP 로컬 서버로 접속합니다.

---

## 기술 스택

- Vanilla JS / HTML / CSS
- 공통 Footer 컴포넌트 (`assets/common-footer.css`, `assets/common-footer.js`) — 4개 페이지에서 여행/걷기 요약과 데이터 기준일 표시
- [Chart.js](https://www.chartjs.org/) — 차트
- [Leaflet.js](https://leafletjs.com/) — 인터랙티브 지도 + 시도별 GeoJSON 오버레이 + 스팟 미니맵
- [Lottie](https://lottiefiles.com/) — 캐릭터 애니메이션
- [Open-Meteo](https://open-meteo.com/) — 날씨 API
- GitHub Actions — 걷기 데이터 자동 업데이트
- GitHub Contents API — 방문 기록 동기화
- GitHub Pages — 정적 호스팅
