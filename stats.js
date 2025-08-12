const TOTAL_COUNTRIES = 195;


window.updateStats = function updateStats(states) {
  const statsContent = document.getElementById('statsContent');
  if (!statsContent || !statsContent.classList.contains('active')) {
  return;
}

  const visitedCount = Object.values(states).filter(v => v === 'been').length;
  const percent = ((visitedCount / TOTAL_COUNTRIES) * 100).toFixed(2);

  document.getElementById('statsSummary').innerHTML =
    `<strong>Visited Countries: ${visitedCount} / ${TOTAL_COUNTRIES} (${percent}%)</strong>`;

  const circle = document.querySelector('.progress-bar');
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;
  circle.style.strokeDashoffset = offset;

  document.getElementById('progressText').textContent = `${percent}%`;
}

// Expose globally so other scripts can call it


