const TOTAL_COUNTRIES = 195;

const CONTINENTS = {
  'Europe': [
    'Albania', 'Andorra', 'Austria', 'Belarus', 'Belgium', 'Bosnia and Herzegovina', 'Bulgaria', 'Croatia',
    'Cyprus', 'Czech Republic', 'Denmark', 'Estonia', 'Finland', 'France', 'Germany', 'Greece', 'Hungary',
    'Iceland', 'Ireland', 'Italy', 'Kosovo', 'Latvia', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Malta',
    'Moldova', 'Monaco', 'Montenegro', 'Netherlands', 'North Macedonia', 'Norway', 'Poland', 'Portugal',
    'Romania', 'Russia', 'San Marino', 'Serbia', 'Slovakia', 'Slovenia', 'Spain', 'Sweden', 'Switzerland',
    'Ukraine', 'United Kingdom', 'Vatican City'
  ],
  'Asia': [
    'Afghanistan', 'Armenia', 'Azerbaijan', 'Bahrain', 'Bangladesh', 'Bhutan', 'Brunei', 'Cambodia', 'China',
    'Georgia', 'India', 'Indonesia', 'Iran', 'Iraq', 'Israel', 'Japan', 'Jordan', 'Kazakhstan', 'Kuwait',
    'Kyrgyzstan', 'Laos', 'Lebanon', 'Malaysia', 'Maldives', 'Mongolia', 'Myanmar', 'Nepal', 'North Korea',
    'Oman', 'Pakistan', 'Palestine', 'Philippines', 'Qatar', 'Saudi Arabia', 'Singapore', 'South Korea',
    'Sri Lanka', 'Syria', 'Taiwan', 'Tajikistan', 'Thailand', 'Timor-Leste', 'Turkey', 'Turkmenistan',
    'United Arab Emirates', 'Uzbekistan', 'Vietnam', 'Yemen'
  ],
  'Africa': [
    'Algeria', 'Angola', 'Benin', 'Botswana', 'Burkina Faso', 'Burundi', 'Cabo Verde', 'Cameroon',
    'Central African Republic', 'Chad', 'Comoros', 'Congo', 'Democratic Republic of Congo', "Cote d'Ivoire",
    'Djibouti', 'Egypt', 'Equatorial Guinea', 'Eritrea', 'Eswatini', 'Ethiopia', 'Gabon', 'Gambia', 'Ghana',
    'Guinea', 'Guinea-Bissau', 'Kenya', 'Lesotho', 'Liberia', 'Libya', 'Madagascar', 'Malawi', 'Mali',
    'Mauritania', 'Mauritius', 'Morocco', 'Mozambique', 'Namibia', 'Niger', 'Nigeria', 'Rwanda',
    'Sao Tome and Principe', 'Senegal', 'Seychelles', 'Sierra Leone', 'Somalia', 'South Africa', 'South Sudan',
    'Sudan', 'Tanzania', 'Togo', 'Tunisia', 'Uganda', 'Zambia', 'Zimbabwe'
  ],
  'Americas': [
    'Antigua and Barbuda', 'Argentina', 'Bahamas', 'Barbados', 'Belize', 'Bolivia', 'Brazil', 'Canada',
    'Chile', 'Colombia', 'Costa Rica', 'Cuba', 'Dominica', 'Dominican Republic', 'Ecuador', 'El Salvador',
    'Grenada', 'Guatemala', 'Guyana', 'Haiti', 'Honduras', 'Jamaica', 'Mexico', 'Nicaragua', 'Panama',
    'Paraguay', 'Peru', 'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa',
    'Suriname', 'Trinidad and Tobago', 'United States of America', 'Uruguay', 'Venezuela'
  ],
  'Oceania': [
    'Australia', 'Fiji', 'Kiribati', 'Marshall Islands', 'Micronesia', 'Nauru', 'New Zealand', 'Palau',
    'Papua New Guinea', 'Samoa', 'Solomon Islands', 'Tonga', 'Tuvalu', 'Vanuatu'
  ]
};

const ALL_COUNTRIES = Object.values(CONTINENTS).flat()
  .filter((v, i, a) => a.indexOf(v) === i)
  .sort();

function getStateByName(name) {
  if (!window.nameIndex) return 'neutral';
  const feature = window.nameIndex[name.toLowerCase()];
  if (!feature) return 'neutral';
  const id = feature.id;
  return window.states[id] || window.states[String(id)] || window.states[Number(id)] || 'neutral';
}

function buildCircleSVG(id, color) {
  return `
    <svg width="100" height="100" viewBox="0 0 100 100">
      <circle stroke="#e0e0e0" stroke-width="9" fill="none" r="44" cx="50" cy="50"></circle>
      <circle
        class="progress-bar" id="circle-${id}"
        stroke="${color}"
        stroke-width="9"
        fill="none"
        r="44"
        cx="50"
        cy="50"
        stroke-linecap="round"
        transform="rotate(-90, 50, 50)"
      ></circle>
      <text id="text-${id}" x="50" y="55" text-anchor="middle" font-size="16" font-weight="bold" fill="${color}">0%</text>
    </svg>`;
}

function updateCircle(id, visited, total, color) {
  const circle = document.getElementById('circle-' + id);
  const text = document.getElementById('text-' + id);
  if (!circle || !text) return;
  const percent = total > 0 ? (visited / total) * 100 : 0;
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  circle.style.stroke = color;
  circle.style.strokeDasharray = `${circumference}`;
  circle.style.strokeDashoffset = `${circumference - (percent / 100) * circumference}`;
  text.textContent = `${Math.round(percent)}%`;
}

const CONTINENT_COLORS = {
  'Worldwide': '#4caf50',
  'Europe':    '#e76f51',
  'Asia':      '#c77dff',
  'Africa':    '#8ecae6',
  'Americas':  '#2f2492',
  'Oceania':   '#f4a261',
};

window.updateStats = function updateStats() {
  const visitedCount = Object.values(window.states || {}).filter(v => v === 'been').length;
  const wantCount    = Object.values(window.states || {}).filter(v => v === 'want').length;
  const percent      = parseFloat(((visitedCount / TOTAL_COUNTRIES) * 100).toFixed(2));

  document.getElementById('statsSummary').innerHTML =
    `<strong>Visited: ${visitedCount} / ${TOTAL_COUNTRIES} (${percent}%)</strong>
     &nbsp;&nbsp;·&nbsp;&nbsp; Want to go: ${wantCount}`;

  // Worldwide circle
  updateCircle('worldwide', visitedCount, TOTAL_COUNTRIES, CONTINENT_COLORS['Worldwide']);

  // Continent circles
  Object.entries(CONTINENTS).forEach(([continent, countries]) => {
    const total   = countries.length;
    const visited = countries.filter(c => getStateByName(c) === 'been').length;
    updateCircle(continent.toLowerCase(), visited, total, CONTINENT_COLORS[continent]);

    const label = document.getElementById('label-' + continent.toLowerCase());
    if (label) label.textContent = `${visited} / ${total}`;
  });

  // Reset filter
  document.querySelectorAll('.cl-filter-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.filter === 'all');
  });

  renderCountryList();
};

function buildStatsHeader() {
  const container = document.getElementById('statsCircles');
  if (!container || container.dataset.built) return;
  container.dataset.built = 'true';

  // Worldwide
  const worldDiv = document.createElement('div');
  worldDiv.className = 'stat-circle-item stat-worldwide';
  worldDiv.innerHTML = `
    ${buildCircleSVG('worldwide', CONTINENT_COLORS['Worldwide'])}
    <div class="stat-circle-label">Worldwide</div>
  `;
  container.appendChild(worldDiv);

  // Continents row
  const row = document.createElement('div');
  row.className = 'stat-circles-row';

  Object.keys(CONTINENTS).forEach(continent => {
    const total = CONTINENTS[continent].length;
    const div = document.createElement('div');
    div.className = 'stat-circle-item';
    div.innerHTML = `
      ${buildCircleSVG(continent.toLowerCase(), CONTINENT_COLORS[continent])}
      <div class="stat-circle-label">${continent}</div>
      <div class="stat-circle-sub" id="label-${continent.toLowerCase()}">0 / ${total}</div>
    `;
    row.appendChild(div);
  });

  container.appendChild(row);
}

function renderCountryList() {
  const container = document.getElementById('countryListContainer');
  if (!container) return;

  const collapsed = {};
  container.querySelectorAll('.cl-letter-header').forEach(h => {
    if (h.getAttribute('aria-expanded') === 'false') {
      collapsed[h.querySelector('.cl-letter').textContent] = true;
    }
  });

  const groups = {};
  ALL_COUNTRIES.forEach(name => {
    const letter = name[0].toUpperCase();
    if (!groups[letter]) groups[letter] = [];
    groups[letter].push(name);
  });

  container.innerHTML = '';

  Object.keys(groups).sort().forEach(letter => {
    const section = document.createElement('div');
    section.className = 'cl-section';
    const isCollapsed = !!collapsed[letter];

    const header = document.createElement('button');
    header.className = 'cl-letter-header';
    header.innerHTML = `<span class="cl-letter">${letter}</span><span class="cl-chevron">${isCollapsed ? '▸' : '▾'}</span>`;
    header.setAttribute('aria-expanded', String(!isCollapsed));

    const list = document.createElement('ul');
    list.className = 'cl-list';
    if (isCollapsed) list.style.display = 'none';

    groups[letter].forEach(name => {
      const status = getStateByName(name);
      const li = document.createElement('li');
      li.className = `cl-item cl-${status}`;
      li.innerHTML = `
        <span class="cl-dot"></span>
        <span class="cl-name">${name}</span>
        <span class="cl-badge">${status === 'neutral' ? '' : status === 'been' ? '✓ Been' : '★ Want'}</span>
      `;
      list.appendChild(li);
    });

    header.addEventListener('click', () => {
      const expanded = header.getAttribute('aria-expanded') === 'true';
      header.setAttribute('aria-expanded', String(!expanded));
      header.querySelector('.cl-chevron').textContent = expanded ? '▸' : '▾';
      list.style.display = expanded ? 'none' : '';
    });

    section.appendChild(header);
    section.appendChild(list);
    container.appendChild(section);
  });
}

// Build circles on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => { buildStatsHeader(); window.updateStats(); });
} else {
  buildStatsHeader();
  window.updateStats();
}
