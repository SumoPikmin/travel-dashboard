function updateStats(states) {
  // Only update if stats content is visible
  const statsContent = document.getElementById('statsContent');
  if (!statsContent || statsContent.style.display === 'none') {
    return; // don't update if stats section is hidden
  }

  const visitedCount = Object.values(states).filter(v => v === 'been').length;
  const percent = ((visitedCount / TOTAL_COUNTRIES) * 100).toFixed(2);

  document.getElementById('statsSummary').innerHTML =
    `<strong>Visited Countries: ${visitedCount} / ${TOTAL_COUNTRIES} (${percent}%)</strong>`;

  // Calculate stroke-dashoffset for progress circle
  const circle = document.querySelector('.progress-bar');
  const radius = 54;
  const circumference = 2 * Math.PI * radius;

  const offset = circumference - (percent / 100) * circumference;
  circle.style.strokeDashoffset = offset;

  // Update text inside the circle
  document.getElementById('progressText').textContent = `${percent}%`;
}
