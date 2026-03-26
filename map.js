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
  const idToName = {
    4:   'Afghanistan',
    8:   'Albania',
    12:  'Algeria',
    20:  'Andorra',
    24:  'Angola',
    28:  'Antigua and Barbuda',
    32:  'Argentina',
    51:  'Armenia',
    36:  'Australia',
    40:  'Austria',
    31:  'Azerbaijan',
    44:  'Bahamas',
    48:  'Bahrain',
    50:  'Bangladesh',
    52:  'Barbados',
    112: 'Belarus',
    56:  'Belgium',
    84:  'Belize',
    204: 'Benin',
    64:  'Bhutan',
    68:  'Bolivia',
    70:  'Bosnia and Herzegovina',
    72:  'Botswana',
    76:  'Brazil',
    96:  'Brunei',
    100: 'Bulgaria',
    854: 'Burkina Faso',
    108: 'Burundi',
    132: 'Cabo Verde',
    116: 'Cambodia',
    120: 'Cameroon',
    124: 'Canada',
    140: 'Central African Republic',
    148: 'Chad',
    152: 'Chile',
    156: 'China',
    170: 'Colombia',
    174: 'Comoros',
    178: 'Congo',
    180: 'Democratic Republic of Congo',
    188: 'Costa Rica',
    384: "Cote d'Ivoire",
    191: 'Croatia',
    192: 'Cuba',
    196: 'Cyprus',
    203: 'Czech Republic',
    208: 'Denmark',
    262: 'Djibouti',
    212: 'Dominica',
    214: 'Dominican Republic',
    218: 'Ecuador',
    818: 'Egypt',
    222: 'El Salvador',
    226: 'Equatorial Guinea',
    232: 'Eritrea',
    233: 'Estonia',
    748: 'Eswatini',
    231: 'Ethiopia',
    242: 'Fiji',
    246: 'Finland',
    250: 'France',
    266: 'Gabon',
    270: 'Gambia',
    268: 'Georgia',
    276: 'Germany',
    288: 'Ghana',
    300: 'Greece',
    308: 'Grenada',
    320: 'Guatemala',
    324: 'Guinea',
    624: 'Guinea-Bissau',
    328: 'Guyana',
    332: 'Haiti',
    340: 'Honduras',
    348: 'Hungary',
    352: 'Iceland',
    356: 'India',
    360: 'Indonesia',
    364: 'Iran',
    368: 'Iraq',
    372: 'Ireland',
    376: 'Israel',
    380: 'Italy',
    388: 'Jamaica',
    392: 'Japan',
    400: 'Jordan',
    398: 'Kazakhstan',
    404: 'Kenya',
    296: 'Kiribati',
    408: 'North Korea',
    410: 'South Korea',
    383: 'Kosovo',
    414: 'Kuwait',
    417: 'Kyrgyzstan',
    418: 'Laos',
    428: 'Latvia',
    422: 'Lebanon',
    426: 'Lesotho',
    430: 'Liberia',
    434: 'Libya',
    438: 'Liechtenstein',
    440: 'Lithuania',
    442: 'Luxembourg',
    450: 'Madagascar',
    454: 'Malawi',
    458: 'Malaysia',
    462: 'Maldives',
    466: 'Mali',
    470: 'Malta',
    584: 'Marshall Islands',
    478: 'Mauritania',
    480: 'Mauritius',
    484: 'Mexico',
    583: 'Micronesia',
    498: 'Moldova',
    492: 'Monaco',
    496: 'Mongolia',
    499: 'Montenegro',
    504: 'Morocco',
    508: 'Mozambique',
    104: 'Myanmar',
    516: 'Namibia',
    520: 'Nauru',
    524: 'Nepal',
    528: 'Netherlands',
    554: 'New Zealand',
    558: 'Nicaragua',
    562: 'Niger',
    566: 'Nigeria',
    807: 'North Macedonia',
    578: 'Norway',
    512: 'Oman',
    586: 'Pakistan',
    585: 'Palau',
    275: 'Palestine',
    591: 'Panama',
    598: 'Papua New Guinea',
    600: 'Paraguay',
    604: 'Peru',
    608: 'Philippines',
    616: 'Poland',
    620: 'Portugal',
    634: 'Qatar',
    642: 'Romania',
    643: 'Russia',
    646: 'Rwanda',
    659: 'Saint Kitts and Nevis',
    662: 'Saint Lucia',
    670: 'Saint Vincent and the Grenadines',
    882: 'Samoa',
    674: 'San Marino',
    678: 'Sao Tome and Principe',
    682: 'Saudi Arabia',
    686: 'Senegal',
    688: 'Serbia',
    690: 'Seychelles',
    694: 'Sierra Leone',
    702: 'Singapore',
    703: 'Slovakia',
    705: 'Slovenia',
    90:  'Solomon Islands',
    706: 'Somalia',
    710: 'South Africa',
    728: 'South Sudan',
    724: 'Spain',
    144: 'Sri Lanka',
    729: 'Sudan',
    740: 'Suriname',
    752: 'Sweden',
    756: 'Switzerland',
    760: 'Syria',
    158: 'Taiwan',
    762: 'Tajikistan',
    834: 'Tanzania',
    764: 'Thailand',
    626: 'Timor-Leste',
    768: 'Togo',
    776: 'Tonga',
    780: 'Trinidad and Tobago',
    788: 'Tunisia',
    792: 'Turkey',
    795: 'Turkmenistan',
    798: 'Tuvalu',
    800: 'Uganda',
    804: 'Ukraine',
    784: 'United Arab Emirates',
    826: 'United Kingdom',
    840: 'United States of America',
    858: 'Uruguay',
    860: 'Uzbekistan',
    548: 'Vanuatu',
    336: 'Vatican City',
    862: 'Venezuela',
    704: 'Vietnam',
    887: 'Yemen',
    894: 'Zambia',
    716: 'Zimbabwe',
  };

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

  window.nameIndex = nameIndex;

  // Retrieve saved states or initialize empty
  const STORAGE_KEY = 'travel_map_states_v1';
  window.states = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');

  // Retrieve saved priorities
  const PRIORITY_STORAGE_KEY = 'travel_priorities_v1';
  window.priorities = JSON.parse(localStorage.getItem(PRIORITY_STORAGE_KEY) || '{}');

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
    .attr('fill', d => COLORS[window.getCountryStatus(d.id)])
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
      if (window.updateStats) window.updateStats();
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

    // Priority badge
    const prio = window.priorities && (window.priorities[d.id] || window.priorities[String(d.id)]);
    const prioHtml = prio
      ? `<div style="font-size:12px;margin-top:3px">${prio === 'next' ? '🎯 Next Up' : '🗓️ Long Term'}</div>`
      : '';

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
       <div style="font-size:13px;margin-top:4px">Status: <strong>${window.getCountryStatus(d.id)}</strong>
       ${prioHtml}
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
    const curr  = window.getCountryStatus(d.id);          // ← use helper
    const next  = order[(order.indexOf(curr) + 1) % order.length];
    if (next === 'neutral') {
      delete window.states[String(d.id)];
    } else {
      window.setCountryState(d.id, next, 'manual');        // ← use helper
    }
  }

  function updateVisual(d) {
    g.selectAll('path.country').filter(c => c.id === d.id)
      .transition().duration(150)
      .attr('fill', COLORS[window.getCountryStatus(d.id)]); // ← use helper
  }

  function saveStates() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(window.states));
  }

  function savePriorities() {
    localStorage.setItem(PRIORITY_STORAGE_KEY, JSON.stringify(window.priorities));
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

    window.setCountryState(f.id, chosen, 'manual');

    updateVisual(f);
    saveStates();
    if (window.updateStats) window.updateStats();

    searchInput.value = '';
  });

  // Reset — clears all states, wonders and priorities
  document.getElementById('resetBtn').addEventListener('click', () => {
    if (!confirm('Do you want to remove all marks?')) return;
    window.states           = {};
    window.wonderStates     = {};
    window.priorities       = {};
    window.wonderPriorities = {};
    localStorage.removeItem('wonders_states_v1');
    localStorage.removeItem('travel_priorities_v1');
    localStorage.removeItem('wonder_priorities_v1');
    g.selectAll('path.country').attr('fill', COLORS.neutral);
    saveStates();
    if (window.updateStats) window.updateStats();
  });

  // Export — includes states, wonders and priorities
  document.getElementById('exportBtn').addEventListener('click', () => {
    const data = {
      states:           window.states,
      wonderStates:     window.wonderStates     || {},
      priorities:       window.priorities       || {},
      wonderPriorities: window.wonderPriorities || {}
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'travel-map-progress.json';
    a.click();
    URL.revokeObjectURL(url);
  });

  // Import — restores states, wonders and priorities
  const fileInput = document.getElementById('fileInput');
  document.getElementById('importBtn').addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const imported = JSON.parse(e.target.result);
        const importedStates          = imported.states          !== undefined ? imported.states          : imported;
        const importedWonders         = imported.wonderStates    !== undefined ? imported.wonderStates    : {};
        const importedPriorities      = imported.priorities      !== undefined ? imported.priorities      : {};
        const importedWonderPriorities = imported.wonderPriorities !== undefined ? imported.wonderPriorities : {};

        // Import country states
        window.states = {};
        Object.keys(importedStates).forEach(id => {
          const val = importedStates[id];
          if (val === 'been' || val === 'want') window.states[id] = val;
        });

        // Import wonder states
        window.wonderStates = {};
        Object.keys(importedWonders).forEach(name => {
          const val = importedWonders[name];
          if (val === 'been' || val === 'want') window.wonderStates[name] = val;
        });

        // Import country priorities
        window.priorities = {};
        Object.keys(importedPriorities).forEach(id => {
          const val = importedPriorities[id];
          if (val === 'next' || val === 'longterm') window.priorities[id] = val;
        });

        // Import wonder priorities
        window.wonderPriorities = {};
        Object.keys(importedWonderPriorities).forEach(name => {
          const val = importedWonderPriorities[name];
          if (val === 'next' || val === 'longterm') window.wonderPriorities[name] = val;
        });

        // Persist everything
        saveStates();
        localStorage.setItem('wonders_states_v1',    JSON.stringify(window.wonderStates));
        localStorage.setItem('travel_priorities_v1', JSON.stringify(window.priorities));
        localStorage.setItem('wonder_priorities_v1', JSON.stringify(window.wonderPriorities));

        // Redraw map
        g.selectAll('path.country')
          .attr('fill', d => COLORS[window.states[String(d.id)] || window.states[d.id] || 'neutral']);

        // Refresh stats tab
        if (window.updateStats) window.updateStats();

        // Force rebuild wonders tab
        const wc = document.getElementById('wondersContent');
        if (wc) {
          wc.innerHTML = '';
          delete wc.dataset.built;
        }
        if (window.initWonders) window.initWonders();

        alert('Import successful.');
      } catch(err) {
        console.error('Import error:', err);
        alert('Failed to import data. Please ensure the file format is correct.');
      }
      fileInput.value = '';
    };
    reader.readAsText(file);
  });

  // Initial stats update on load
  if (window.updateStats) window.updateStats();

})();
