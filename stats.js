const TOTAL_COUNTRIES = 195;

function updateStats(states) {
  const visitedCount = Object.values(states).filter(v => v === 'been').length;
  const percent = ((visitedCount / TOTAL_COUNTRIES) * 100).toFixed(2);
  document.getElementById('statsSummary').textContent =
    `Visited: ${visitedCount} / ${TOTAL_COUNTRIES} (${percent}%)`;
}

function setupStatsNavigation() {
  document.getElementById('homeBtn').addEventListener('click', () => {
    document.getElementById('mapView').style.display = '';
    document.getElementById('statsView').style.display = 'none';
  });

  document.getElementById('statsBtn').addEventListener('click', () => {
    document.getElementById('mapView').style.display = 'none';
    document.getElementById('statsView').style.display = '';
  });
}
