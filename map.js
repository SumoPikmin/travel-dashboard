
const TOTAL_COUNTRIES = 195;

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
  const nameToCode = {
    "Afghanistan":"af","Albania":"al","Algeria":"dz","Andorra":"ad","Angola":"ao","Antigua and Barbuda":"ag","Argentina":"ar","Armenia":"am","Australia":"au","Austria":"at",
    "Azerbaijan":"az","Bahamas":"bs","Bahrain":"bh","Bangladesh":"bd","Barbados":"bb","Belarus":"by","Belgium":"be","Belize":"bz","Benin":"bj","Bhutan":"bt",
    "Bolivia":"bo","Bosnia and Herzegovina":"ba","Botswana":"bw","Brazil":"br","Brunei":"bn","Bulgaria":"bg","Burkina Faso":"bf","Burundi":"bi","Cabo Verde":"cv","Cambodia":"kh",
    "Cameroon":"cm","Canada":"ca","Central African Republic":"cf","Chad":"td","Chile":"cl","China":"cn","Colombia":"co","Comoros":"km","Congo":"cg","Democratic Republic of Congo":"cd",
    "Costa Rica":"cr","Cote d'Ivoire":"ci","Croatia":"hr","Cuba":"cu","Cyprus":"cy","Czech Republic":"cz","Denmark":"dk","Djibouti":"dj","Dominica":"dm","Dominican Republic":"do",
    "Ecuador":"ec","Egypt":"eg","El Salvador":"sv","Equatorial Guinea":"gq","Eritrea":"er","Estonia":"ee","Eswatini":"sz","Ethiopia":"et","Fiji":"fj","Finland":"fi",
    "France":"fr","Gabon":"ga","Gambia":"gm","Georgia":"ge","Germany":"de","Ghana":"gh","Greece":"gr","Grenada":"gd","Guatemala":"gt","Guinea":"gn",
    "Guinea-Bissau":"gw","Guyana":"gy","Haiti":"ht","Honduras":"hn","Hungary":"hu","Iceland":"is","India":"in","Indonesia":"id","Iran":"ir","Iraq":"iq",
    "Ireland":"ie","Israel":"il","Italy":"it","Jamaica":"jm","Japan":"jp","Jordan":"jo","Kazakhstan":"kz","Kenya":"ke","Kiribati":"ki","North Korea":"kp",
    "South":"kr","Kosovo":"xk","Kuwait":"kw","Kyrgyzstan":"kg","Laos":"la","Latvia":"lv","Lebanon":"lb","Lesotho":"ls","Liberia":"lr","Libya":"ly",
    "Liechtenstein":"li","Lithuania":"lt","Luxembourg":"lu","Madagascar":"mg","Malawi":"mw","Malaysia":"my","Maldives":"mv","Mali":"ml","Malta":"mt","Marshall Islands":"mh",
    "Mauritania":"mr","Mauritius":"mu","Mexico":"mx","Micronesia":"fm","Moldova":"md","Monaco":"mc","Mongolia":"mn","Montenegro":"me","Morocco":"ma","Mozambique":"mz",
    "Myanmar":"mm","Namibia":"na","Nauru":"nr","Nepal":"np","Netherlands":"nl","New Zealand":"nz","Nicaragua":"ni","Niger":"ne","Nigeria":"ng","North Macedonia":"mk",
    "Norway":"no","Oman":"om","Pakistan":"pk","Palau":"pw","Palestine":"ps","Panama":"pa","Papua New Guinea":"pg","Paraguay":"py","Peru":"pe","Philippines":"ph",
    "Poland":"pl","Portugal":"pt","Qatar":"qa","Romania":"ro","Russia":"ru","Rwanda":"rw","Saint Kitts and Nevis":"kn","Saint Lucia":"lc","Saint Vincent and the Grenadines":"vc","Samoa":"ws",
    "San Marino":"sm","Sao Tome and Principe":"st","Saudi Arabia":"sa","Senegal":"sn","Serbia":"rs","Seychelles":"sc","Sierra Leone":"sl","Singapore":"sg","Slovakia":"sk","Slovenia":"si",
    "Solomon Islands":"sb","Somalia":"so","South Africa":"za","South Sudan":"ss","Spain":"es","Sri Lanka":"lk","Sudan":"sd","Suriname":"sr","Sweden":"se","Switzerland":"ch",
    "Syria":"sy","Taiwan":"tw","Tajikistan":"tj","Tanzania":"tz","Thailand":"th","Timor-Leste":"tl","Togo":"tg","Tonga":"to","Trinidad and Tobago":"tt","Tunisia":"tn",
    "Turkey":"tr","Turkmenistan":"tm","Tuvalu":"tv","Uganda":"ug","Ukraine":"ua","United Arab Emirates":"ae","United Kingdom":"gb","United States of America":"us","Uruguay":"uy","Uzbekistan":"uz",
    "Vanuatu":"vu","Vatican City":"va","Venezuela":"ve","Vietnam":"vn","Yemen":"ye","Zambia":"zm","Zimbabwe":"zw"
  };

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
  let states = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');

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
  const countryPaths = g.selectAll('path.country')
    .data(countries)
    .join('path')
    .attr('class', 'country')
    .attr('d', path)
    .attr('fill', d => COLORS[states[d.id] || 'neutral'])
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
      updateStats(states);
    });

  // Tooltip element
  const tooltip = d3.select('#tooltip');

  // Tooltip functions
  function showTooltip(event, d) {
    const countryName = d.properties.displayName;
    const code = nameToCode[countryName];
    let flagHtml = '';
    if (code) {
      flagHtml = `<img class="flag-icon" src="https://flagcdn.com/w40/${code}.png" alt="${countryName} flag" /> `;
    }
    tooltip.style('display', 'block').html(
      `<div class="country-name">${flagHtml}${countryName}</div>
       <div style="font-size:13px;margin-top:4px">Status: <strong>${states[d.id] || 'neutral'}</strong></div>`
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

  // Update country fill color based on state
  function updateVisual(d) {
    g.selectAll('path.country').filter(c => c.id === d.id)
      .transition().duration(150)
      .attr('fill', COLORS[states[d.id] || 'neutral']);
  }

  // Cycle through states: neutral -> been -> want -> neutral
  function cycleState(d) {
    const order = ['neutral', 'been', 'want'];
    const curr = states[d.id] || 'neutral';
    const next = order[(order.indexOf(curr) + 1) % order.length];
    if (next === 'neutral') delete states[d.id];
    else states[d.id] = next;
  }

  // Save current states to localStorage
  function saveStates() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(states));
  }

  // Elements for search and suggestions
  const searchInput = document.getElementById('searchInput');
  const suggestions = document.getElementById('suggestions');

  // Search input event listener for autocomplete suggestions
  searchInput.addEventListener('input', () => {
    const query = searchInput.value.trim().toLowerCase();
    suggestions.innerHTML = '';
    if (!query) {
      suggestions.style.display = 'none';
      return;
    }

    // Find matching country names
    const matches = Object.keys(nameIndex).filter(name => name.includes(query));
    if (matches.length === 0) {
      suggestions.style.display = 'none';
      return;
    }

    // Populate suggestions list
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

  // Hide suggestions when clicking outside
  document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !suggestions.contains(e.target)) {
      suggestions.style.display = 'none';
    }
  });

  // Apply button: set state for searched country
  document.getElementById('applyBtn').addEventListener('click', () => {
    const q = searchInput.value.trim().toLowerCase();
    const select = document.getElementById('statusSelect');
    if (!q) return alert('Please enter a country name.');

    // Find matching country name
    const match = Object.keys(nameIndex).find(k => k.includes(q));
    if (!match) return alert('Country not found.');

    const f = nameIndex[match];
    const chosen = select.value;

    if (chosen === 'neutral') delete states[f.id];
    else states[f.id] = chosen;

    updateVisual(f);
    saveStates();
    updateStats(states);

    searchInput.value = '';
  });

  // Reset button: clear all states
  document.getElementById('resetBtn').addEventListener('click', () => {
    if (!confirm('Do you want to remove all marks?')) return;
    states = {};
    g.selectAll('path.country').attr('fill', COLORS.neutral);
    saveStates();
    updateStats(states);
  });

  // Export button: download states as JSON
  document.getElementById('exportBtn').addEventListener('click', () => {
    const dataStr = JSON.stringify(states);
    const blob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'travel-map-progress.json';
    a.click();
    URL.revokeObjectURL(url);
  });

  // Import button and file input
  const fileInput = document.getElementById('fileInput');
  document.getElementById('importBtn').addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const importedStates = JSON.parse(e.target.result);
        // Validate and update states
        Object.keys(importedStates).forEach(id => {
          if (countries.some(c => c.id === Number(id))) {
            const val = importedStates[id];
            if (val === 'been' || val === 'want' || val === 'neutral') {
              if (val === 'neutral') delete states[id];
              else states[id] = val;
            }
          }
        });
        saveStates();
        // Update all visuals
        g.selectAll('path.country')
          .attr('fill', d => COLORS[states[d.id] || 'neutral']);
        updateStats(states);
        alert('Import successful.');
      } catch {
        alert('Failed to import data. Please ensure the file format is correct.');
      }
      fileInput.value = ''; // Reset input
    };
    reader.readAsText(file);
  });
a

function updateStats(states) {
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
window.updateStats = updateStats;
})();

