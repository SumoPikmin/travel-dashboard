window.updateStats = function() {
  // Assuming window.states holds the country status info
  const states = window.states || {};
  const totalCountries = Object.keys(states).length || 0;

  let beenCount = 0;
  let wantCount = 0;

  for (const key in states) {
    if (states[key] === 'been') beenCount++;
    else if (states[key] === 'want') wantCount++;
  }

  const totalKnown = beenCount + wantCount;
  const percentBeen = totalCountries > 0 ? Math.round((beenCount / totalCountries) * 100) : 0;

  // Update progress circle
  const progressBar = document.querySelector('.progress-bar');
  const progressText = document.getElementById('progressText');
  const statsSummary = document.getElementById('statsSummary');

  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (circumference * percentBeen) / 100;

  if (progressBar) {
    progressBar.style.strokeDashoffset = offset;
  }

  if (progressText) {
    progressText.textContent = `${percentBeen}%`;
  }

  if (statsSummary) {
    statsSummary.textContent = `You have visited ${beenCount} countries out of ${totalCountries} marked. Want to go: ${wantCount} countries.`;
  }
};
