(async function() {
  // Fetch map data
  const resp = await fetch('data/countries-110m.json');
  if (!resp.ok) {
    alert('Failed to load map data: ' + resp.statusText);
    return;
  }
  const worldData = await resp.json();

  // Extract countries from topojson data
  const countries = topojson.feature(worldData, worldData.objects.countries).features;

  // Your existing id-to-name mapping (replace with actual content)
  const idToName = { /* your existing mappings */ };

  // Full mapping of country names to ISO alpha-2 codes for flags
  const nameToCode = { /* your mapping */ };

  // Create nameIndex to quickly find countries by lowercase name
  const nameIndex = {};
  countries.forEach(f => {
    const id = f.id;
    const name = idToName[id] || (f.properties && (f.properties.name || f.properties.NAME)) || ('Country ' + id);
    f.properties = f.properties || {};
    f.properties.displayName = name;
    nameIndex[name.toLowerCase()] = f;
  });

  // Retrieve saved states or initialize empty
  const STORAGE_KEY = 'travel_map_states_v1';
  window.states = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); // make global

  // Setup dimensions based on window size
  const width = Math.max(800, window.innerWidth - 380);
  const height = Math.max(400, window.innerHeight - 40);

  // Setup SVG and group element
  const svg = d3.select('#map')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('preserveAspectRatio', 'xMidYMid meet');
  const g = svg.append('g');

  // Setup projection and path generator
  const projection = d3.geoMercator()
    .scale((width / 640) * 100)
    .translate([width / 2, height / 2]);
  const path = d3.geoPath().projection(projection);

  // Setup zoom behavior
  const zoom = d3.zoom()
    .scaleExtent([1, 8])
    .on('zoom', ({transform}) => g.attr('transform', transform));
  svg.call(zoom);

  // Define colors for states
  const COLORS = { neutral: '#ffffff', been: '#8ecae6', want: '#ffd166' };

  // Draw countries paths
  g.selectAll('path.country')
    .data(countries)
    .join('path')
    .attr('class', 'country')
    .attr('d', path)
    .attr('fill', d => COLORS[window.states[d.id] || 'neutral'])
    .attr('stroke', '#bfbfbf')
    .attr('stroke-width', 0.4)
    .style('cursor', 'pointer')
    .on('mouseover', (event, d) => showTooltip(event, d))
    .on('mousemove', event => moveTooltip(event))
    .on('mouseout', () => hideTooltip())
    .on('click', (event, d) => {
      cycleState(d);
      updateVisual(d);
      saveStates();
      updateStats(window.states);
    });

  // Tooltip element
  const tooltip = d3.select('#tooltip');

  function showTooltip(event, d) {
    const countryName = d.properties.displayName;
    const code = nameToCode[countryName];
    let flagHtml = '';
    if (code) {
      flagHtml = `<img class="flag-icon" src="https://flagcdn.com/w40/${code}.png" alt="${countryName} flag" /> `;
    }
    tooltip.style('display', 'block').html(
      `<div class="country-name">${flagHtml}${countryName}</div>
       <div style="font-size:13px;margin-top:4px">Status: <strong>${window.states[d.id] || 'neutral'}</strong></div>`
    );
    moveTooltip(event);
  }

  function moveTooltip(event) {
    const [x, y] = d3.pointer(event);
    tooltip.style('left', (x + 20) + 'px').style('top', (y + 20) + 'px');
  }

  function hideTooltip() {
    tooltip.style('display', 'none');
  }

  function updateVisual(d) {
    g.selectAll('path.country').filter(c => c.id === d.id)
      .transition().duration(150)
      .attr('fill', COLORS[window.states[d.id] || 'neutral']);
  }

  function cycleState(d) {
    const order = ['neutral', 'been', 'want'];
    const curr = window.states[d.id] || 'neutral';
    const next = order[(order.indexOf(curr) + 1) % order.length];
    if (next === 'neutral') delete window.states[d.id];
    else window.states[d.id] = next;
  }

  function saveStates() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(window.states));
  }

  // Search/autocomplete handlers
  const searchInput = document.getElementById('searchInput');
  const suggestions = document.getElementById('suggestions');

  searchInput.addEventListener('input', () => {
    const query = searchInput.value.trim().toLowerCase();
    suggestions.innerHTML = '';
    if (!query) {
      suggestions.style.display = 'none';
      return;
    }

    const matches = Object.keys(nameIndex).filter(name => name.includes(query));
    if (!matches.length) {
      suggestions.style.display = 'none';
      return;
    }

    matches.forEach(match => {
      const li = document.createElement('li');
      li.textContent = match.charAt(0).toUpperCase() + match.slice(1);
      li.addEventListener('click', () => {
        searchInput.value = li.textContent;
        suggestions.style.display = 'none';
      });
      suggestions.appendChild(li);
    });

    suggestions.style.display = 'block';
  });

  document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !suggestions.contains(e.target)) {
      suggestions.style.display = 'none';
    }
  });

  document.getElementById('applyBtn').addEventListener('click', () => {
    const q = searchInput.value.trim().toLowerCase();
    const select = document.getElementById('statusSelect');
    if (!q) return alert('Please enter a country name.');

    const match = Object.keys(nameIndex).find(k => k.includes(q));
    if (!match) return alert('Country not found.');

    const f = nameIndex[match];
    const chosen = select.value;

    if (chosen === 'neutral') delete window.states[f.id];
    else window.states[f.id] = chosen;

    updateVisual(f);
    saveStates();
    updateStats(window.states);

    searchInput.value = '';
  });

  document.getElementById('resetBtn').addEventListener('click', () => {
    if (!confirm('Do you want to remove all marks?')) return;
    window.states = {};
    g.selectAll('path.country').attr('fill', COLORS.neutral);
    saveStates();
    updateStats(window.states);
  });

  document.getElementById('exportBtn').addEventListener('click', () => {
    const dataStr = JSON.stringify(window.states);
    const blob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'travel-map-progress.json';
    a.click();
    URL.revokeObjectURL(url);
  });

  const fileInput = document.getElementById('fileInput');
  document.getElementById('importBtn').addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const importedStates = JSON.parse(e.target.result);
        Object.keys(importedStates).forEach(id => {
          if (countries.some(c => c.id === Number(id))) {
            const val = importedStates[id];
            if (val === 'been' || val === 'want' || val === 'neutral') {
              if (val === 'neutral') delete window.states[id];
              else window.states[id] = val;
            }
          }
        });
        saveStates();
        g.selectAll('path.country')
          .attr('fill', d => COLORS[window.states[d.id] || 'neutral']);
        updateStats(window.states);
        alert('Import successful.');
      } catch {
        alert('Failed to import data. Please ensure the file format is correct.');
      }
      fileInput.value = '';
    };
    reader.readAsText(file);
  });

  // Initial stats update on load
  updateStats(window.states);

})();
