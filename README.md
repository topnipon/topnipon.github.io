# 땡굴이의 발자국

개인 여행 스팟, 방문 기록, 걷기 데이터를 한곳에서 보는 GitHub Pages 아카이브입니다.

https://topnipon.github.io

---

## 페이지 구성

### 여행 지도 (`index.html`)

전국 여행 스팟 567곳을 지도 위에서 탐색하고, 방문 완료 상태와 개인 방문 기록을 함께 확인하는 메인 페이지입니다.

- 방문 완료 스팟과 미방문 스팟을 지도에서 구분 표시
- 13개 카테고리 필터와 지역별 필터 제공
- 시도별 색상 오버레이와 지역 방문 통계 제공
- 스팟 클릭 시 상세 패널, 미니맵, 구글 지도 이동 버튼 제공
- 방문 기록이 있는 스팟은 방문일, 평점, 메모를 요약 표시
- 미방문 스팟은 소유자 확인 후 방문일, 평점, 메모를 모두 입력해야 발자국 저장 가능
- 방문 기록이 있는 스팟은 정보 수정 버튼과 소유자 확인을 거쳐 상세 기록 수정 가능
- 발자국 취소 시 해당 스팟의 상세 방문 기록도 함께 초기화
- 다음 발자국 후보 추천 패널 제공
- 온라인 배포 환경에서 GitHub Contents API를 통한 방문 기록 동기화 지원

### 방문 타임라인 (`timeline.html`)

방문 완료한 여행지를 날짜 흐름으로 모아보는 개인 발자국 타임라인입니다.

- 방문일이 있는 기록은 월별 타임라인으로 정렬
- 방문일이 없는 기록은 별도 섹션으로 분리
- 지역, 테마, 검색 필터 제공
- 지역별, 테마별 방문 현황 요약 제공

### 발자국 도감 (`atlas.html`)

지역별, 테마별 여행 완성도를 한눈에 보는 진행 현황 페이지입니다.

- 지역 모드와 테마 모드 전환
- 완성률, 남은 스팟, 이름순 정렬
- 각 항목별 방문/미방문 수와 완성률 표시
- 선택한 지역 또는 테마의 스팟 목록 표시

### 걷기 기록 (`walking.html`)

2025년 4월 이후의 일별 걷기 데이터를 시각화한 대시보드입니다.

- 캘린더 히트맵으로 일별 걷기 거리 표시
- 누적 거리 라인 차트 제공
- 월별 km와 걸음 수 전환 차트 제공
- 요일별 평균 패턴 분석
- 총 거리, 활동 일수, 최고 기록 요약 카드 제공
- 걷기 거리와 여행 완성도를 연결한 요약 섹션 제공
- 성남 현재 날씨 패널 제공

---

## 공통 Footer

4개 페이지는 `assets/common-footer.css`와 `assets/common-footer.js`를 공유합니다.

Footer는 카드형 박스가 아니라 얇은 아카이브 바 형태로 구성되어 있으며, 다음 정보를 공통으로 표시합니다.

- 전체 여행 스팟 수와 방문 완료 수
- 여행 완성률
- 누적 걷기 거리
- 누적 걸음 수
- 최종 데이터 기준일과 화면 확인 시간
- copyright 및 Instagram 링크: [@seonggyu](https://www.instagram.com/seonggyu/)

지도 페이지에서는 화면 하단에 고정된 슬림 바 형태로 표시하고, 나머지 페이지에서는 본문 하단의 정적 footer로 표시합니다.

---

## 데이터 구조

```text
assets/
  images/
    footprint-mascot.png   # 발자국 마스코트 UI 이미지
    visit-stamp.png        # 방문 완료 스탬프 이미지
  common-footer.css        # 4개 페이지 공통 footer 스타일
  common-footer.js         # 공통 footer 데이터 집계 및 렌더링

data/
  walking-data.json        # 일별 걷기 기록, km, steps
  travel-spots.json        # 여행 스팟 567곳
  visited-spots.json       # 방문 완료 ID 목록과 개인 방문 기록
  korea-regions.json       # 시도별 GeoJSON 경계

tools/
  validate-data.mjs        # JSON 데이터 검증 스크립트
```

`visited-spots.json`은 단순 방문 여부와 상세 방문 기록을 함께 관리합니다.
상세 기록은 방문일, 메모, 평점만 저장하며, 스팟 대표 이미지는 지도 패널의 이미지 검색 흐름에서 별도로 표시합니다.

```json
{
  "visited": ["hallasan", "bukhansan"],
  "records": {
    "hallasan": {
      "visitedAt": "2026-05-17",
      "memo": "",
      "rating": null
    }
  },
  "lastUpdated": "2026-05-25"
}
```

---

## 검증

데이터 변경 후에는 아래 명령으로 JSON 구조를 검증합니다.

```bash
node tools/validate-data.mjs
```

검증 항목:

- 여행 스팟 ID 중복 여부
- 필수 필드, 좌표, 반경, 지역, 카테고리 값
- 방문 완료 ID가 실제 여행 스팟에 존재하는지 여부
- 방문 기록의 날짜, 메모, 평점 형식
- 걷기 데이터의 날짜, km, 걸음 수 형식
- 시도 GeoJSON 기본 구조

---

## 자동 업데이트

걷기 기록은 GitHub Actions(`.github/workflows/update-walking.yml`)의 `repository_dispatch` 이벤트로 자동 커밋할 수 있습니다.

```bash
curl -X POST https://api.github.com/repos/topnipon/topnipon.github.io/dispatches \
  -H "Authorization: token <TOKEN>" \
  -d '{"event_type":"update-walking","client_payload":{"date":"2026-05-25","km":7.5,"steps":9500}}'
```

방문 기록 저장은 온라인 배포 환경(`topnipon.github.io`)에서만 활성화됩니다. 로컬 개발 환경에서는 GitHub 동기화가 비활성화되어 데이터가 실수로 변경되지 않습니다.

---

## 작업 메모

이 저장소는 Codex 로컬 작업 환경에서 관리합니다.

일반 작업 흐름:

1. `git pull origin main`으로 원격 최신 상태를 반영합니다.
2. 로컬에서 기능과 데이터를 수정합니다.
3. `node tools/validate-data.mjs`로 데이터를 검증합니다.
4. 브라우저에서 `index.html`, `timeline.html`, `atlas.html`, `walking.html`을 확인합니다.
5. 확인이 끝나면 커밋하고 `main` 브랜치로 푸시합니다.

---

## 기술 스택

- Vanilla JS / HTML / CSS
- Leaflet.js: 지도, 스팟 마커, 시도별 GeoJSON 오버레이
- Chart.js: 걷기 기록 차트
- Lottie: 캐릭터 애니메이션
- Open-Meteo: 날씨 API
- GitHub Actions: 걷기 데이터 자동 업데이트
- GitHub Contents API: 온라인 방문 기록 동기화
- GitHub Pages: 정적 사이트 호스팅

---

## 최근 업데이트

### 2026-05-26

- 여행 지도 스팟 패널에 발자국 상세 기록 입력/수정 UI 추가
- `이곳에 발자국 남기기` 클릭 시 소유자 확인 후 입력폼을 열고, 방문일·평점·메모를 모두 입력해야 저장되도록 변경
- 이미 방문한 스팟은 입력폼을 바로 노출하지 않고 저장된 방문일·평점·메모만 표시하도록 정리
- 방문 기록 수정은 `정보 수정` 버튼과 소유자 확인 후 가능하도록 변경
- 발자국 취소 시 `visited` 목록뿐 아니라 해당 스팟의 상세 방문 기록도 함께 삭제되도록 보강
- GitHub 방문 기록 저장 시 원격 최신 데이터와 병합하고 409 충돌을 재시도하도록 저장 흐름 개선
- 사진 URL 입력, 사진 개수 표시, `photos` 저장 필드를 제거

### 2026-05-25

- 공통 footer를 4개 페이지에 적용
- footer를 카드형 박스에서 슬림 아카이브 바 디자인으로 개선
- footer에 전체 스팟, 방문 수, 완성률, 걷기 거리, 걸음 수, 최종 데이터 기준일 표시
- footer에서 GitHub Pages/Repository 문구 제거
- Instagram 링크 `@seonggyu` 추가
- README 한글 인코딩 깨짐을 복구하고 현재 기능 기준으로 문서 재정리
