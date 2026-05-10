# My Walking Record · 땡굴이의 걷기 기록

**2025.04 – 2026.05** 1년간의 걷기 데이터를 시각화한 개인 대시보드입니다.  
GitHub Pages로 배포되며, Pacer 앱 데이터를 기반으로 합니다.

🔗 **https://topnipon.github.io**

---

## 주요 기능

- **캘린더 히트맵** — 날짜별 걷기 거리를 색상으로 표시
- **누적 거리 라인 차트** — 기간 누적 km 추이
- **월별 통계** — 월별 km / 걸음 수 전환 차트
- **요일별 평균** — 요일 패턴 분석
- **지도 오버레이** — 총 거리, 활동 일수, 최고 기록 등 요약 카드
- **실시간 날씨** — 성남 현재 날씨 패널 (Open-Meteo API)

---

## 데이터 구조

```json
// data/walking-data.json
{
  "2025-04-07": { "km": 4.271, "steps": 6054 },
  "2025-04-08": { "km": 4.038, "steps": 5733 }
}
```

---

## 자동 업데이트

GitHub Actions 워크플로우(`.github/workflows/update-walking.yml`)를 통해  
`repository_dispatch` 이벤트로 날짜별 km/걸음 수를 자동으로 커밋합니다.

```bash
# 예시: 외부에서 데이터 업데이트 트리거
curl -X POST https://api.github.com/repos/topnipon/topnipon.github.io/dispatches \
  -H "Authorization: token <TOKEN>" \
  -d '{"event_type":"update-walking","client_payload":{"date":"2026-05-10","km":7.5,"steps":9500}}'
```

---

## 기술 스택

- Vanilla JS / HTML / CSS
- [Chart.js](https://www.chartjs.org/) — 차트
- [Leaflet.js](https://leafletjs.com/) — 지도
- [Lottie](https://lottiefiles.com/) — 캐릭터 애니메이션
- [Open-Meteo](https://open-meteo.com/) — 날씨 API
