// Navigation toggle
document.getElementById('homeBtn').addEventListener('click', () => {
  document.getElementById('mapView').style.display = '';
  document.getElementById('statsView').style.display = 'none';
  document.querySelector('.map-wrap').style.display = '';
});
document.getElementById('statsBtn').addEventListener('click', () => {
  document.getElementById('mapView').style.display = 'none';
  document.getElementById('statsView').style.display = '';
  document.querySelector('.map-wrap').style.display = 'none';
});

const COLORS = { neutral: '#ffffff', been: '#8ecae6', want: '#ffd166' };

(async function(){
  const resp = await fetch('data/countries-110m.json');
  if (!resp.ok) {
    alert('Failed to load map data: ' + resp.statusText);
    return;
  }
  const worldData = await resp.json();
  const countries = topojson.feature(worldData, worldData.objects.countries).features;

  const idToName = {
    4: 'Afghanistan', 8: 'Albania', 12: 'Algeria', 20: 'Andorra', 24: 'Angola',
    276: 'Germany', 840: 'United States', 250: 'France', 356: 'India', 724: 'Spain',
    554: 'New Zealand', 36: 'Australia', 124: 'Canada', 528: 'Netherlands',
    196: 'Poland', 643: 'Russia', 156: 'China', 392: 'Japan', 752: 'Sweden'
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
    });

  const tooltip = d3.select('#tooltip');

  function showTooltip(event, d){
    tooltip.style('display','block').html(
      `<div class="country-name">${d.properties.displayName}</div><div style="font-size:13px;margin-top:4px">Status: <strong>${states[d.id] || 'neutral'}</strong></div>`
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

  const input = document.getElementById('searchInput');
  const select = document.getElementById('statusSelect');
  const applyBtn = document.getElementById('applyBtn');
  applyBtn.addEventListener('click', () => {
    const q = input.value.trim().toLowerCase();
    if (!q) return alert('Please enter a country name.');
    const match = Object.keys(nameIndex).find(k => k.includes(q));
    if (!match) return alert('Country not found.');
    const f = nameIndex[match];
    const chosen = select.value;
    if (chosen === 'neutral') delete states[f.id]; else states[f.id] = chosen;
    updateVisual(f);
    saveStates();
    input.value = '';
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') applyBtn.click();
  });

  document.getElementById('resetBtn').addEventListener('click', () => {
    if (!confirm('Do you want to remove all marks?')) return;
    states = {};
    g.selectAll('path.country').attr('fill', COLORS['neutral']);
    saveStates();
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
        const obj = JSON.parse(e.target.result);
        states = obj || {};
        g.selectAll('path.country').each(function(d){
          const col = COLORS[states[d.id] || 'neutral'];
          d3.select(this).attr('fill', col);
        });
        saveStates();
      } catch (err) {
        alert('Invalid JSON file.');
      }
    };
    reader.readAsText(f);
  });

  countryPaths.attr('fill', d => COLORS[states[d.id] || 'neutral']);

  window.addEventListener('resize', () => {
    const w = Math.max(800, window.innerWidth - 380);
    const h = Math.max(400, window.innerHeight - 40);
    svg.attr('viewBox', `0 0 ${w} ${h}`);
    projection.translate([w/2, h/2]).scale((w / 640) * 100);
    countryPaths.attr('d', path);
  });
})();
