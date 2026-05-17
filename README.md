# 땡굴이의 발자국

개인 활동 기록을 시각화한 GitHub Pages 대시보드입니다.

🔗 **https://topnipon.github.io**

---

## 페이지 구성

### 🗺 대한민국 여행 지도 (`index.html`)

전국 363개 관광지를 지도 위에 표시하는 스티커 여행 기록 시스템입니다.

- 방문한 곳은 컬러/발광 표시, 미방문은 어둡게 표시
- 13개 카테고리 필터 (산/자연, 해변, 역사/문화, 도시, 섬, 자연, 특별, 트래킹, 놀이동산, 리조트, 공원, 사찰, 박물관)
- 카테고리 범례 — 스팟 수 내림차순 정렬
- 시도별 색상 오버레이 + 방문율 통계 (세종 포함 17개 시도)
- 스팟 클릭 시 상세 패널 — Leaflet 미니맵 + 구글 지도 연동 버튼
- 발자국 남기기 / 방문 완료 버튼 — 소유자 인증 후 사용 가능
- ⚙ 설정에서 GitHub Token 입력 후 전체 방문 기록을 GitHub에 즉시 동기화 가능

### 🚶 걷기 기록 (`walking.html`)

**2025.04 – 현재**까지의 일별 걷기 데이터를 시각화한 대시보드입니다.

- **캘린더 히트맵** — 날짜별 걷기 거리를 색상으로 표시
- **누적 거리 라인 차트** — 기간 누적 km 추이
- **월별 통계** — 월별 km / 걸음 수 전환 차트
- **요일별 평균** — 요일 패턴 분석
- **지도 오버레이** — 총 거리, 활동 일수, 최고 기록 요약 카드
- **실시간 날씨** — 성남 현재 날씨 패널 (Open-Meteo API)

---

## 데이터 구조

```
data/
├── walking-data.json     # 일별 걷기 기록 (km, 걸음 수)
├── travel-spots.json     # 여행지 목록 363개 (위치, 카테고리 등)
├── visited-spots.json    # 방문한 여행지 ID 목록
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

### 여행지 방문 기록

사이트 우측 하단 ⚙ 버튼에서 GitHub Token을 입력한 뒤, **"☁ 전체 방문 기록 GitHub에 동기화"** 버튼을 누르면 현재 방문 목록 전체를 GitHub Contents API(PUT)로 한 번에 업로드합니다.

> 개별 스팟 클릭 시 로컬(localStorage)에 먼저 저장되고, 동기화 버튼으로 GitHub에 반영합니다.

---

## 기술 스택

- Vanilla JS / HTML / CSS
- [Chart.js](https://www.chartjs.org/) — 차트
- [Leaflet.js](https://leafletjs.com/) — 인터랙티브 지도 + 시도별 GeoJSON 오버레이 + 스팟 미니맵
- [Lottie](https://lottiefiles.com/) — 캐릭터 애니메이션
- [Open-Meteo](https://open-meteo.com/) — 날씨 API
- GitHub Actions — 걷기 데이터 자동 업데이트
- GitHub Contents API — 방문 기록 동기화
- GitHub Pages — 정적 호스팅
