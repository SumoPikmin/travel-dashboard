const TOTAL_COUNTRIES = 195;

window.updateStats = function updateStats() {
  const statsContent = document.getElementById('statsContent');
  // If stats tab is not visible, skip updating
  // if (!statsContent || statsContent.style.display === 'none') return;

  // Get visited count from global states object
  const visitedCount = Object.values(window.states).filter(v => v === 'been').length;
  const percent = ((visitedCount / TOTAL_COUNTRIES) * 100).toFixed(2);

  // Update text summary
  document.getElementById('statsSummary').innerHTML =
    `<strong>Visited Countries: ${visitedCount} / ${TOTAL_COUNTRIES} (${percent}%)</strong>`;

  // Update progress bar
  const circle = document.querySelector('.progress-bar');
  if (circle) {
    const radius = 54;
    const circumference = 2 * Math.PI * radius;

    // Always set dasharray to full circumference
    circle.style.strokeDasharray = circumference;

    // Calculate dashoffset based on percent
    const offset = circumference - (percent / 100) * circumference;
    circle.style.strokeDashoffset = offset;
  }

  // Update percentage text inside circle
  const progressText = document.getElementById('progressText');
  if (progressText) {
    progressText.textContent = `${percent}%`;
  }
};
