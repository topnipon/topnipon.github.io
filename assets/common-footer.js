(function () {
  const footer = document.getElementById('site-footer');
  if (!footer) return;

  const nf = new Intl.NumberFormat('ko-KR');

  function toKm(value) {
    return typeof value === 'object' && value !== null ? Number(value.km || 0) : Number(value || 0);
  }

  function toSteps(value) {
    return typeof value === 'object' && value !== null ? Number(value.steps || 0) : 0;
  }

  function latestDate(values) {
    return values.filter(Boolean).sort().pop() || '';
  }

  function formatDate(value) {
    if (!value) return '-';
    const date = new Date(value + 'T00:00:00');
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString('ko-KR', {year:'numeric', month:'2-digit', day:'2-digit'});
  }

  function formatDateTime(date = new Date()) {
    return date.toLocaleString('ko-KR', {
      year:'numeric', month:'2-digit', day:'2-digit',
      hour:'2-digit', minute:'2-digit', hour12:false
    });
  }

  async function readJson(url, fallback) {
    try {
      const res = await fetch(url + '?v=' + Date.now());
      if (!res.ok) throw new Error(String(res.status));
      return await res.json();
    } catch (error) {
      return fallback;
    }
  }

  function stat(value, label) {
    return `<span class="site-footer-stat"><span class="site-footer-value">${value}</span><span class="site-footer-label">${label}</span></span>`;
  }

  Promise.all([
    readJson('data/travel-spots.json', {spots:[]}),
    readJson('data/visited-spots.json', {visited:[], records:{}}),
    readJson('data/walking-data.json', {})
  ]).then(([travelData, visitData, walkingData]) => {
    const spots = Array.isArray(travelData.spots) ? travelData.spots : [];
    const visited = Array.isArray(visitData.visited) ? visitData.visited : [];
    const walkingEntries = Object.entries(walkingData || {}).sort(([a], [b]) => a.localeCompare(b));
    const totalKm = Math.round(walkingEntries.reduce((sum, [, value]) => sum + toKm(value), 0));
    const totalSteps = walkingEntries.reduce((sum, [, value]) => sum + toSteps(value), 0);
    const completion = spots.length ? Math.round(visited.length / spots.length * 100) : 0;
    const walkingLastDate = walkingEntries.length ? walkingEntries[walkingEntries.length - 1][0] : '';
    const dataDate = latestDate([visitData.lastUpdated, walkingLastDate]);

    const copyright = `© ${new Date().getFullYear()} topnipon`;
    const dataMeta = `최종 데이터 기준: ${formatDate(dataDate)} · 확인 시간: ${formatDateTime()}`;
    const instagram = `<a href="https://www.instagram.com/seonggyu/" target="_blank" rel="noopener">@seonggyu</a>`;
    const compactMeta = `${dataMeta} · ${copyright} · Instagram ${instagram}`;

    footer.innerHTML = `
      <div class="site-footer-inner">
        <div class="site-footer-main">
          <div class="site-footer-title">땡굴이의 발자국</div>
          <div class="site-footer-summary">
            여행 스팟 ${nf.format(spots.length)}곳과 방문 ${nf.format(visited.length)}곳, 걷기 ${nf.format(totalKm)}km를 함께 기록하는 개인 아카이브입니다.
            <span class="site-footer-compact-meta">· ${compactMeta}</span>
          </div>
        </div>
        <div class="site-footer-stats">
          ${stat(`${nf.format(visited.length)}/${nf.format(spots.length)}`, 'Spots')}
          ${stat(`${completion}%`, 'Complete')}
          ${stat(`${nf.format(totalKm)}km`, 'Walking')}
          ${stat(totalSteps ? `${(totalSteps / 10000).toFixed(1)}만 보` : '-', 'Steps')}
        </div>
      </div>
      <div class="site-footer-bottom">
        <div>${dataMeta}</div>
        <div>${copyright} · Instagram ${instagram}</div>
      </div>
    `;
  });
})();
