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
    window.nameIndex = nameIndex;
    // Small countries not visible on map — add to nameIndex manually
    const smallCountries = {
      'singapore': 702,
      'liechtenstein': 438,
      'monaco': 492,
      'san marino': 674,
      'maldives': 462,
      'malta': 470,
      'vatican city': 336,
      'andorra': 20,
      'nauru': 520,
      'tuvalu': 798,
      'palau': 585,
      'marshall islands': 584,
      'kiribati': 296,
      'micronesia': 583,
      'saint kitts and nevis': 659,
      'dominica': 212,
      'grenada': 308,
      'saint lucia': 662,
      'saint vincent and the grenadines': 670,
      'antigua and barbuda': 28,
      'barbados': 52,
      'bahrain': 48,
    };

    Object.entries(smallCountries).forEach(([name, id]) => {
      if (!nameIndex[name]) {
        nameIndex[name] = { id, properties: { displayName: name.charAt(0).toUpperCase() + name.slice(1) } };
      }
    });

    window.nameIndex = nameIndex; // make sure this line comes AFTER the block above
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
  svg.on('dblclick.zoom', null);

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

  // Find wonders in this country
  let wondersHtml = '';
  if (window.wonderStates !== undefined && window.WONDERS_ALL) {
    const matches = window.WONDERS_ALL.filter(w =>
      w.land.split(',').some(l => l.trim() === countryName || l.trim().includes(countryName))
    );
    if (matches.length > 0) {
      wondersHtml = `<div style="margin-top:6px;border-top:1px solid rgba(255,255,255,0.3);padding-top:5px;font-size:12px;">
        <div style="opacity:0.7;margin-bottom:3px;">Wonders</div>
        ${matches.map(w => {
          const s = (window.wonderStates && window.wonderStates[w.name]) || 'neutral';
          const icon = s === 'been' ? '✓' : s === 'want' ? '★' : '·';
          return `<div>${icon} ${w.name}</div>`;
        }).join('')}
      </div>`;
    }
  }

  tooltip.style('display', 'block').html(
    `<div class="country-name">${flagHtml}${countryName}</div>
     <div style="font-size:13px;margin-top:4px">Status: <strong>${window.states[d.id] || 'neutral'}</strong></div>
     ${wondersHtml}`
  );
  moveTooltip(event);
}

  function moveTooltip(event) {
    const [x, y] = d3.pointer(event);
    tooltip.style('left', (x + 8) + 'px').style('top', (y + 8) + 'px');
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
    const data = {
      states: window.states,
      wonderStates: window.wonderStates || {}
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
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
      const imported = JSON.parse(e.target.result);

      // Support old format (plain states) and new format (with wonderStates)
      const importedStates  = imported.states || imported;
      const importedWonders = imported.wonderStates || {};

      // Import country states
      Object.keys(importedStates).forEach(id => {
        if (countries.some(c => c.id === Number(id))) {
          const val = importedStates[id];
          if (val === 'been' || val === 'want') window.states[id] = val;
          else delete window.states[id];
        }
      });

      // Import wonder states
      window.wonderStates = {};
      Object.keys(importedWonders).forEach(name => {
        const val = importedWonders[name];
        if (val === 'been' || val === 'want') window.wonderStates[name] = val;
      });
      localStorage.setItem('wonders_states_v1', JSON.stringify(window.wonderStates));

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
