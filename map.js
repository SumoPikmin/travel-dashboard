(async function(){
  const resp = await fetch('data/countries-110m.json');
  if (!resp.ok) {
    alert('Failed to load map data: ' + resp.statusText);
    return;
  }
  const worldData = await resp.json();
  const countries = topojson.feature(worldData, worldData.objects.countries).features;

  // Mapping country IDs to names (your existing idToName)
  const idToName = { /* your existing mappings */ };

  // Full map from country name to ISO alpha-2 code for flags
  const nameToCode = {
    "Afghanistan":"af","Albania":"al","Algeria":"dz","Andorra":"ad","Angola":"ao","Antigua and Barbuda":"ag","Argentina":"ar","Armenia":"am","Australia":"au","Austria":"at",
    "Azerbaijan":"az","Bahamas":"bs","Bahrain":"bh","Bangladesh":"bd","Barbados":"bb","Belarus":"by","Belgium":"be","Belize":"bz","Benin":"bj","Bhutan":"bt",
    "Bolivia":"bo","Bosnia and Herzegovina":"ba","Botswana":"bw","Brazil":"br","Brunei":"bn","Bulgaria":"bg","Burkina Faso":"bf","Burundi":"bi","Cabo Verde":"cv","Cambodia":"kh",
    "Cameroon":"cm","Canada":"ca","Central African Republic":"cf","Chad":"td","Chile":"cl","China":"cn","Colombia":"co","Comoros":"km","Congo (Brazzaville)":"cg","Congo (Kinshasa)":"cd",
    "Costa Rica":"cr","Cote d'Ivoire":"ci","Croatia":"hr","Cuba":"cu","Cyprus":"cy","Czech Republic":"cz","Denmark":"dk","Djibouti":"dj","Dominica":"dm","Dominican Republic":"do",
    "Ecuador":"ec","Egypt":"eg","El Salvador":"sv","Equatorial Guinea":"gq","Eritrea":"er","Estonia":"ee","Eswatini":"sz","Ethiopia":"et","Fiji":"fj","Finland":"fi",
    "France":"fr","Gabon":"ga","Gambia":"gm","Georgia":"ge","Germany":"de","Ghana":"gh","Greece":"gr","Grenada":"gd","Guatemala":"gt","Guinea":"gn",
    "Guinea-Bissau":"gw","Guyana":"gy","Haiti":"ht","Honduras":"hn","Hungary":"hu","Iceland":"is","India":"in","Indonesia":"id","Iran":"ir","Iraq":"iq",
    "Ireland":"ie","Israel":"il","Italy":"it","Jamaica":"jm","Japan":"jp","Jordan":"jo","Kazakhstan":"kz","Kenya":"ke","Kiribati":"ki","Korea, North":"kp",
    "Korea, South":"kr","Kosovo":"xk","Kuwait":"kw","Kyrgyzstan":"kg","Laos":"la","Latvia":"lv","Lebanon":"lb","Lesotho":"ls","Liberia":"lr","Libya":"ly",
    "Liechtenstein":"li","Lithuania":"lt","Luxembourg":"lu","Madagascar":"mg","Malawi":"mw","Malaysia":"my","Maldives":"mv","Mali":"ml","Malta":"mt","Marshall Islands":"mh",
    "Mauritania":"mr","Mauritius":"mu","Mexico":"mx","Micronesia":"fm","Moldova":"md","Monaco":"mc","Mongolia":"mn","Montenegro":"me","Morocco":"ma","Mozambique":"mz",
    "Myanmar":"mm","Namibia":"na","Nauru":"nr","Nepal":"np","Netherlands":"nl","New Zealand":"nz","Nicaragua":"ni","Niger":"ne","Nigeria":"ng","North Macedonia":"mk",
    "Norway":"no","Oman":"om","Pakistan":"pk","Palau":"pw","Palestine":"ps","Panama":"pa","Papua New Guinea":"pg","Paraguay":"py","Peru":"pe","Philippines":"ph",
    "Poland":"pl","Portugal":"pt","Qatar":"qa","Romania":"ro","Russia":"ru","Rwanda":"rw","Saint Kitts and Nevis":"kn","Saint Lucia":"lc","Saint Vincent and the Grenadines":"vc","Samoa":"ws",
    "San Marino":"sm","Sao Tome and Principe":"st","Saudi Arabia":"sa","Senegal":"sn","Serbia":"rs","Seychelles":"sc","Sierra Leone":"sl","Singapore":"sg","Slovakia":"sk","Slovenia":"si",
    "Solomon Islands":"sb","Somalia":"so","South Africa":"za","South Sudan":"ss","Spain":"es","Sri Lanka":"lk","Sudan":"sd","Suriname":"sr","Sweden":"se","Switzerland":"ch",
    "Syria":"sy","Taiwan":"tw","Tajikistan":"tj","Tanzania":"tz","Thailand":"th","Timor-Leste":"tl","Togo":"tg","Tonga":"to","Trinidad and Tobago":"tt","Tunisia":"tn",
    "Turkey":"tr","Turkmenistan":"tm","Tuvalu":"tv","Uganda":"ug","Ukraine":"ua","United Arab Emirates":"ae","United Kingdom":"gb","United States":"us","Uruguay":"uy","Uzbekistan":"uz",
    "Vanuatu":"vu","Vatican City":"va","Venezuela":"ve","Vietnam":"vn","Yemen":"ye","Zambia":"zm","Zimbabwe":"zw"
  };

  const nameIndex = {};
  countries.forEach(f => {
    const id = f.id;
    const name = idToName[id] || (f.properties && (f.properties.name || f.properties.NAME)) || ('Country ' + id);
    f.properties = f.properties || {};
    f.properties.displayName = name;
    nameIndex[name.toLowerCase()] = f;
  });

  const STORAGE_KEY = 'travel_map_states_v1';
  let states = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');

  const width = Math.max(800, window.innerWidth - 380);
  const height = Math.max(400, window.innerHeight - 40);

  const svg = d3.select('#map')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('preserveAspectRatio', 'xMidYMid meet');

  const g = svg.append('g');
  const projection = d3.geoMercator()
    .scale((width / 640) * 100)
    .translate([width / 2, height / 2]);
  const path = d3.geoPath().projection(projection);

  const zoom = d3.zoom()
    .scaleExtent([1, 8])
    .on('zoom', ({transform}) => g.attr('transform', transform));
  svg.call(zoom);

  const COLORS = { neutral: '#ffffff', been: '#8ecae6', want: '#ffd166' };

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
    .on('mousemove', (event) => moveTooltip(event))
    .on('mouseout', hideTooltip)
    .on('click', (event, d) => {
      cycleState(d);
      updateVisual(d);
      saveStates();
      updateStats(states);
    });

  const tooltip = d3.select('#tooltip');

  function showTooltip(event, d){
    const countryName = d.properties.displayName;
    const code = nameToCode[countryName];
    let flagHtml = '';
    if(code){
      flagHtml = `<img class="flag-icon" src="https://flagcdn.com/w40/${code}.png" alt="${countryName} flag" /> `;
    }
    tooltip.style('display','block').html(
      `<div class="country-name">${flagHtml}${countryName}</div><div style="font-size:13px;margin-top:4px">Status: <strong>${states[d.id] || 'neutral'}</strong></div>`
    );
    moveTooltip(event);
  }
  function moveTooltip(event){
    const [x, y] = d3.pointer(event);
    tooltip.style('left', (x + 20) + 'px').style('top', (y + 20) + 'px');
  }
  function hideTooltip(){
    tooltip.style('display','none');
  }
  function updateVisual(d){
    g.selectAll('path.country').filter(c => c.id === d.id)
      .transition().duration(150)
      .attr('fill', COLORS[states[d.id] || 'neutral']);
  }
  function cycleState(d){
    const order = ['neutral', 'been', 'want'];
    const curr = states[d.id] || 'neutral';
    const next = order[(order.indexOf(curr) + 1) % order.length];
    if (next === 'neutral') delete states[d.id]; else states[d.id] = next;
  }
  function saveStates(){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(states));
  }

  document.getElementById('applyBtn').addEventListener('click', () => {
    const q = document.getElementById('searchInput').value.trim().toLowerCase();
    const select = document.getElementById('statusSelect');
    if (!q) return alert('Please enter a country name.');
    const match = Object.keys(nameIndex).find(k => k.includes(q));
    if (!match) return alert('Country not found.');
    const f = nameIndex[match];
    const chosen = select.value;
    if (chosen === 'neutral') delete states[f.id]; else states[f.id] = chosen;
    updateVisual(f);
    saveStates();
    updateStats(states);
    document.getElementById('searchInput').value = '';
  });

  document.getElementById('resetBtn').addEventListener('click', () => {
    if (!confirm('Do you want to remove all marks?')) return;
    states = {};
    g.selectAll('path.country').attr('fill', COLORS['neutral']);
    saveStates();
    updateStats(states);
  });

  document.getElementById('exportBtn').addEventListener('click', () => {
    const dataStr = JSON.stringify(states);
    const blob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'travel-map-progress.json'; a.click();
    URL.revokeObjectURL(url);
  });

  const fileInput = document.getElementById('fileInput');
  document.getElementById('importBtn').addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (ev) => {
    const f = ev.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = e => {
      try {
        states = JSON.parse(e.target.result) || {};
        g.selectAll('path.country').each(function(d){
          const col = COLORS[states[d.id] || 'neutral'];
          d3.select(this).attr('fill', col);
        });
        saveStates();
        updateStats(states);
      } catch (err) {
        alert('Invalid JSON file.');
      }
    };
    reader.readAsText(f);
  });

  updateStats(states);
  setupStatsNavigation();
})();
