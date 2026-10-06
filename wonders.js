const WONDERS_DATA = {
  natural: [
    { name: "Amazon Rainforest",                land: "Brazil, Peru, Colombia",                  wiki: "https://en.wikipedia.org/wiki/Amazon_rainforest", icon: "🦜", bottle: true },
    { name: "Antarctica",                     land: "Antarctica",                             wiki: "https://en.wikipedia.org/wiki/Antarctica", icon: "🐧", bottle: true },
    { name: "Chocolate Hills",                  land: "Philippines",                             wiki: "https://en.wikipedia.org/wiki/Chocolate_Hills", icon: "🍫" },
    { name: "Dead Sea",                         land: "Jordan, Israel, Palestine",               wiki: "https://en.wikipedia.org/wiki/Dead_Sea", icon: "🧂", bottle: true },
    { name: "Delicate Arch",                    land: "United States of America",                wiki: "https://en.wikipedia.org/wiki/Delicate_Arch", icon: "🌵" },
    { name: "Galapagos Islands",                land: "Ecuador",                                 wiki: "https://en.wikipedia.org/wiki/Gal%C3%A1pagos_Islands", icon: "🐢", bottle: true },
    { name: "Giant's Causeway",                 land: "United Kingdom",                          wiki: "https://en.wikipedia.org/wiki/Giant%27s_Causeway", icon: "🪨" },
    { name: "Grand Canyon",                     land: "United States of America",                wiki: "https://en.wikipedia.org/wiki/Grand_Canyon", icon: "🏜️", bottle: true },
    { name: "Great Barrier Reef",               land: "Australia",                               wiki: "https://en.wikipedia.org/wiki/Great_Barrier_Reef", icon: "🐠", bottle: true },
    { name: "Ha Long Bay",                      land: "Vietnam",                                 wiki: "https://en.wikipedia.org/wiki/Ha_Long_Bay", icon: "🛶", bottle: true },
    { name: "Iceland (Kirkjufell)",           land: "Iceland",                                wiki: "https://en.wikipedia.org/wiki/Kirkjufell", icon: "🧊", bottle: true },
    { name: "Iguazu Falls",                     land: "Argentina, Brazil",                       wiki: "https://en.wikipedia.org/wiki/Iguazu_Falls", icon: "💦" },
    { name: "Ik-Kil Cenote",                    land: "Mexico",                                  wiki: "https://en.wikipedia.org/wiki/Ik_Kil", icon: "🕳️" },
    { name: "Jeju Island",                      land: "South Korea",                             wiki: "https://en.wikipedia.org/wiki/Jeju_Island", icon: "🍊" },
    { name: "Komodo Island",                    land: "Indonesia",                               wiki: "https://en.wikipedia.org/wiki/Komodo_(island)", icon: "🦎" },
    { name: "Krakatoa",                         land: "Indonesia",                               wiki: "https://en.wikipedia.org/wiki/Krakatoa", icon: "🌋" },
    { name: "Kruger National Park",           land: "South Africa",                           wiki: "https://en.wikipedia.org/wiki/Kruger_National_Park", icon: "🐘", bottle: true },
    { name: "Lake Victoria",                    land: "Kenya, Tanzania, Uganda",                 wiki: "https://en.wikipedia.org/wiki/Lake_Victoria", icon: "🐟" },
    { name: "Mato Tipila (Devils Tower)",       land: "United States of America",                wiki: "https://en.wikipedia.org/wiki/Devils_Tower", icon: "🛸" },
    { name: "Matterhorn",                       land: "Switzerland, Italy",                      wiki: "https://en.wikipedia.org/wiki/Matterhorn", icon: "🏔️", bottle: true },
    { name: "Milford Sound",                    land: "New Zealand",                             wiki: "https://en.wikipedia.org/wiki/Milford_Sound_/_Piopiotahi", icon: "🏞️", bottle: true },
    { name: "Mount Everest",                    land: "Nepal, China",                            wiki: "https://en.wikipedia.org/wiki/Mount_Everest", icon: "🧗", bottle: true },
    { name: "Mount Fuji",                       land: "Japan",                                   wiki: "https://en.wikipedia.org/wiki/Mount_Fuji", icon: "🗻", bottle: true },
    { name: "Mount Kailash",                    land: "China",                                   wiki: "https://en.wikipedia.org/wiki/Mount_Kailash", icon: "⛰️" },
    { name: "Mount Kilimanjaro",                land: "Tanzania",                                wiki: "https://en.wikipedia.org/wiki/Mount_Kilimanjaro", icon: "🦒", bottle: true },
    { name: "Mount Roraima",                    land: "Venezuela, Brazil, Guyana",               wiki: "https://en.wikipedia.org/wiki/Mount_Roraima", icon: "☁️" },
    { name: "Mount Sinai",                      land: "Egypt",                                   wiki: "https://en.wikipedia.org/wiki/Mount_Sinai", icon: "📜" },
    { name: "Niagara Falls",                    land: "Canada, United States of America",        wiki: "https://en.wikipedia.org/wiki/Niagara_Falls", icon: "🌊", bottle: true },
    { name: "Northern Lights",                  land: "Norway, Iceland, Finland",                wiki: "https://en.wikipedia.org/wiki/Aurora", icon: "🌌", bottle: true },
    { name: "Old Faithful",                     land: "United States of America",                wiki: "https://en.wikipedia.org/wiki/Old_Faithful", icon: "⛲" },
    { name: "Pamukkale",                        land: "Turkey",                                  wiki: "https://en.wikipedia.org/wiki/Pamukkale", icon: "🛁" },
    { name: "Pantanal",                         land: "Brazil, Bolivia, Paraguay",               wiki: "https://en.wikipedia.org/wiki/Pantanal", icon: "🐊" },
    { name: "Patagonia",                        land: "Argentina, Chile",                        wiki: "https://en.wikipedia.org/wiki/Patagonia", icon: "🌬️", bottle: true },
    { name: "Puerto Princesa Underground River",land: "Philippines",                             wiki: "https://en.wikipedia.org/wiki/Puerto_Princesa_Subterranean_River_National_Park", icon: "🦇" },
    { name: "Rock of Gibraltar",                land: "United Kingdom",                          wiki: "https://en.wikipedia.org/wiki/Rock_of_Gibraltar", icon: "🐒" },
    { name: "Sahara Desert",                    land: "Algeria, Morocco, Tunisia, Egypt",        wiki: "https://en.wikipedia.org/wiki/Sahara", icon: "🐪", bottle: true },
    { name: "Sri Pada (Adam's Peak)",           land: "Sri Lanka",                               wiki: "https://en.wikipedia.org/wiki/Adam%27s_Peak", icon: "👣" },
    { name: "Table Mountain",                   land: "South Africa",                            wiki: "https://en.wikipedia.org/wiki/Table_Mountain", icon: "🍽️" },
    { name: "Torres del Paine",                 land: "Chile",                                   wiki: "https://en.wikipedia.org/wiki/Torres_del_Paine_National_Park", icon: "🏕️" },
    { name: "Tsingy de Bemaraha",               land: "Madagascar",                              wiki: "https://en.wikipedia.org/wiki/Tsingy_de_Bemaraha_Strict_Nature_Reserve", icon: "🗡️" },
    { name: "Uluru",                            land: "Australia",                               wiki: "https://en.wikipedia.org/wiki/Uluru", icon: "🪃" },
    { name: "Victoria Falls",                   land: "Zambia, Zimbabwe",                        wiki: "https://en.wikipedia.org/wiki/Victoria_Falls", icon: "🌈" },
    { name: "White Desert",                     land: "Egypt",                                   wiki: "https://en.wikipedia.org/wiki/White_Desert_National_Park", icon: "🍄" },
    { name: "Yosemite National Park",           land: "United States of America",                wiki: "https://en.wikipedia.org/wiki/Yosemite_National_Park", icon: "🐻", bottle: true },
    { name: "Zugspitze",                        land: "Germany, Austria",                        wiki: "https://en.wikipedia.org/wiki/Zugspitze", icon: "🚠" }
  ],
  cultural: [
    { name: "Acropolis of Athens",              land: "Greece",                                  wiki: "https://en.wikipedia.org/wiki/Acropolis_of_Athens", icon: "🦉", bottle: true },
    { name: "Alhambra",                         land: "Spain",                                   wiki: "https://en.wikipedia.org/wiki/Alhambra", icon: "💃" },
    { name: "Angkor Wat",                       land: "Cambodia",                                wiki: "https://en.wikipedia.org/wiki/Angkor_Wat", icon: "🛕", bottle: true },
    { name: "Bali (Pura Lempuyang)",          land: "Indonesia",                              wiki: "https://en.wikipedia.org/wiki/Pura_Lempuyang_Luhur", icon: "🌺", bottle: true },
    { name: "Barcelona (Sagrada Família)",    land: "Spain",                                  wiki: "https://en.wikipedia.org/wiki/Sagrada_Fam%C3%ADlia", icon: "🏗️", bottle: true },
    { name: "Big Ben",                          land: "United Kingdom",                          wiki: "https://en.wikipedia.org/wiki/Big_Ben", icon: "⏰", bottle: true },
    { name: "Borobudur",                        land: "Indonesia",                               wiki: "https://en.wikipedia.org/wiki/Borobudur", icon: "🧘" },
    { name: "Brandenburg Gate",                 land: "Germany",                                 wiki: "https://en.wikipedia.org/wiki/Brandenburg_Gate", icon: "🚪", bottle: true },
    { name: "Cappadocia",                       land: "Turkey",                                  wiki: "https://en.wikipedia.org/wiki/Cappadocia", icon: "🎈", bottle: true },
    { name: "Chichén Itzá",                     land: "Mexico",                                  wiki: "https://en.wikipedia.org/wiki/Chichen_Itza", icon: "🐍" },
    { name: "Christ the Redeemer",              land: "Brazil",                                  wiki: "https://en.wikipedia.org/wiki/Christ_the_Redeemer_(statue)", icon: "✝️", bottle: true },
    { name: "CN Tower",                         land: "Canada",                                  wiki: "https://en.wikipedia.org/wiki/CN_Tower", icon: "📡" },
    { name: "Colosseum",                        land: "Italy",                                   wiki: "https://en.wikipedia.org/wiki/Colosseum", icon: "🏟️", bottle: true },
    { name: "Dubai (Burj Khalifa)",           land: "United Arab Emirates",                   wiki: "https://en.wikipedia.org/wiki/Burj_Khalifa", icon: "🏙️", bottle: true },
    { name: "Dubrovnik Old Town",             land: "Croatia",                                wiki: "https://en.wikipedia.org/wiki/Dubrovnik", icon: "🍷", bottle: true },
    { name: "Dutch Windmills (Kinderdijk)",   land: "Netherlands",                            wiki: "https://en.wikipedia.org/wiki/Kinderdijk", icon: "🌷", bottle: true },
    { name: "Easter Island (Rapa Nui)",         land: "Chile",                                   wiki: "https://en.wikipedia.org/wiki/Easter_Island", icon: "🗿", bottle: true },
    { name: "Eiffel Tower",                     land: "France",                                  wiki: "https://en.wikipedia.org/wiki/Eiffel_Tower", icon: "🗼", bottle: true },
    { name: "Forbidden City",                   land: "China",                                   wiki: "https://en.wikipedia.org/wiki/Forbidden_City", icon: "👑" },
    { name: "Gardens by the Bay",             land: "Singapore",                              wiki: "https://en.wikipedia.org/wiki/Gardens_by_the_Bay", icon: "🌳", bottle: true },
    { name: "Golden Gate Bridge",               land: "United States of America",                wiki: "https://en.wikipedia.org/wiki/Golden_Gate_Bridge", icon: "🌉" },
    { name: "Great Mosque of Djenné",           land: "Mali",                                    wiki: "https://en.wikipedia.org/wiki/Great_Mosque_of_Djenn%C3%A9", icon: "🧱" },
    { name: "Great Wall of China",              land: "China",                                   wiki: "https://en.wikipedia.org/wiki/Great_Wall_of_China", icon: "🐉", bottle: true },
    { name: "Hagia Sophia",                     land: "Turkey",                                  wiki: "https://en.wikipedia.org/wiki/Hagia_Sophia", icon: "🕌", bottle: true },
    { name: "Hermitage Museum",                 land: "Russia",                                  wiki: "https://en.wikipedia.org/wiki/Hermitage_Museum", icon: "🐈" },
    { name: "Himeji Castle",                    land: "Japan",                                   wiki: "https://en.wikipedia.org/wiki/Himeji_Castle", icon: "🏯" },
    { name: "Hong Kong Skyline",              land: "China",                                  wiki: "https://en.wikipedia.org/wiki/Victoria_Harbour", icon: "🌃", bottle: true },
    { name: "Kyoto Temples",                  land: "Japan",                                  wiki: "https://en.wikipedia.org/wiki/Historic_Monuments_of_Ancient_Kyoto", icon: "⛩️", bottle: true },
    { name: "Leaning Tower of Pisa",            land: "Italy",                                   wiki: "https://en.wikipedia.org/wiki/Leaning_Tower_of_Pisa", icon: "📐" },
    { name: "Machu Picchu",                     land: "Peru",                                    wiki: "https://en.wikipedia.org/wiki/Machu_Picchu", icon: "🦙", bottle: true },
    { name: "Mont Saint-Michel",                land: "France",                                  wiki: "https://en.wikipedia.org/wiki/Mont_Saint-Michel", icon: "🏰" },
    { name: "Neuschwanstein Castle",            land: "Germany",                                 wiki: "https://en.wikipedia.org/wiki/Neuschwanstein_Castle", icon: "🦢" },
    { name: "Notre-Dame de Paris",              land: "France",                                  wiki: "https://en.wikipedia.org/wiki/Notre-Dame_de_Paris", icon: "🔔" },
    { name: "Oracle of Delphi",                 land: "Greece",                                  wiki: "https://en.wikipedia.org/wiki/Delphi", icon: "🔮" },
    { name: "Országház",                        land: "Hungary",                                 wiki: "https://en.wikipedia.org/wiki/Hungarian_Parliament_Building", icon: "⚖️" },
    { name: "Oxford University",                land: "United Kingdom",                          wiki: "https://en.wikipedia.org/wiki/University_of_Oxford", icon: "🎓" },
    { name: "Petra",                            land: "Jordan",                                  wiki: "https://en.wikipedia.org/wiki/Petra", icon: "🐫", bottle: true },
    { name: "Potala Palace",                    land: "China",                                   wiki: "https://en.wikipedia.org/wiki/Potala_Palace", icon: "🙏" },
    { name: "Prague Old Town",                land: "Czech Republic",                         wiki: "https://en.wikipedia.org/wiki/Old_Town_(Prague)", icon: "🕰️", bottle: true },
    { name: "Pyramids of Giza",                 land: "Egypt",                                   wiki: "https://en.wikipedia.org/wiki/Giza_pyramid_complex", icon: "🔺", bottle: true },
    { name: "Red Fort",                         land: "India",                                   wiki: "https://en.wikipedia.org/wiki/Red_Fort", icon: "🐅" },
    { name: "Santorini",                      land: "Greece",                                 wiki: "https://en.wikipedia.org/wiki/Santorini", icon: "🌅", bottle: true },
    { name: "Sistine Chapel",                   land: "Vatican City",                            wiki: "https://en.wikipedia.org/wiki/Sistine_Chapel", icon: "🖌️", bottle: true },
    { name: "Statue of Liberty",                land: "United States of America",                wiki: "https://en.wikipedia.org/wiki/Statue_of_Liberty", icon: "🗽", bottle: true },
    { name: "Stonehenge",                       land: "United Kingdom",                          wiki: "https://en.wikipedia.org/wiki/Stonehenge", icon: "🌘" },
    { name: "Sydney Opera House",               land: "Australia",                               wiki: "https://en.wikipedia.org/wiki/Sydney_Opera_House", icon: "🎶", bottle: true },
    { name: "Taj Mahal",                        land: "India",                                   wiki: "https://en.wikipedia.org/wiki/Taj_Mahal", icon: "💍", bottle: true },
    { name: "Terracotta Army",                  land: "China",                                   wiki: "https://en.wikipedia.org/wiki/Terracotta_Army", icon: "⚔️" },
    { name: "The Kremlin",                      land: "Russia",                                  wiki: "https://en.wikipedia.org/wiki/Moscow_Kremlin", icon: "⭐", bottle: true },
    { name: "The Louvre",                       land: "France",                                  wiki: "https://en.wikipedia.org/wiki/Louvre", icon: "🖼️" },
    { name: "Torre de Belém",                   land: "Portugal",                                wiki: "https://en.wikipedia.org/wiki/Bel%C3%A9m_Tower", icon: "⛵" },
    { name: "Uffizi Gallery",                   land: "Italy",                                   wiki: "https://en.wikipedia.org/wiki/Uffizi", icon: "🎨", bottle: true },
    { name: "Venice",                         land: "Italy",                                  wiki: "https://en.wikipedia.org/wiki/Venice", icon: "🚣", bottle: true }
  ]
};

// ── Expose flat list for tooltip ──────────────────────────────
window.WONDERS_ALL = [...WONDERS_DATA.natural, ...WONDERS_DATA.cultural];

// ── Wonder states ─────────────────────────────────────────────
const WONDERS_STORAGE_KEY = 'wonders_states_v1';
window.wonderStates = JSON.parse(localStorage.getItem(WONDERS_STORAGE_KEY) || '{}');

// Wonders that were merged or renamed: saved marks move to the new entry
const WONDER_RENAMES = {
  'The Parthenon':           'Acropolis of Athens',
  "St. Peter's Basilica":    'Sistine Chapel',
  "Saint Basil's Cathedral": 'The Kremlin',
  'Florence Cathedral':      'Uffizi Gallery',
  'Venetian Arsenal':        'Venice',
  'Venice Canals':           'Venice'
};

function migrateWonderNames(map, rank) {
  let changed = false;
  Object.entries(WONDER_RENAMES).forEach(([from, to]) => {
    if (!(from in map)) return;
    if (!(to in map) || rank(map[from]) > rank(map[to])) map[to] = map[from];
    delete map[from];
    changed = true;
  });
  return changed;
}

if (migrateWonderNames(window.wonderStates, v => ({ been: 2, want: 1 }[v] || 0))) {
  localStorage.setItem(WONDERS_STORAGE_KEY, JSON.stringify(window.wonderStates));
}

function saveWonderStates() {
  localStorage.setItem(WONDERS_STORAGE_KEY, JSON.stringify(window.wonderStates));
}

function getWonderState(name) {
  return window.wonderStates[name] || 'neutral';
}

function setWonderState(name, status) {
  if (status === 'neutral') delete window.wonderStates[name];
  else window.wonderStates[name] = status;
  saveWonderStates();
}

// ── Wonder priorities ─────────────────────────────────────────
const WONDER_PRIORITY_KEY = 'wonder_priorities_v1';
window.wonderPriorities = JSON.parse(localStorage.getItem(WONDER_PRIORITY_KEY) || '{}');

if (migrateWonderNames(window.wonderPriorities, v => ({ next: 2, longterm: 1 }[v] || 0))) {
  localStorage.setItem(WONDER_PRIORITY_KEY, JSON.stringify(window.wonderPriorities));
}

function saveWonderPriorities() {
  localStorage.setItem(WONDER_PRIORITY_KEY, JSON.stringify(window.wonderPriorities));
}

function getWonderPriority(name) {
  return window.wonderPriorities[name] || null;
}

function cycleWonderPriority(name) {
  const current = getWonderPriority(name);
  const next = current === null ? 'next' : current === 'next' ? 'longterm' : null;
  if (!next) delete window.wonderPriorities[name];
  else window.wonderPriorities[name] = next;
  saveWonderPriorities();
}

function priorityBadgeHtml(priority) {
  if (priority === 'next')     return `<span class="priority-badge priority-next">🎯 Next Up</span>`;
  if (priority === 'longterm') return `<span class="priority-badge priority-longterm">🗓️ Long Term</span>`;
  return `<span class="priority-badge priority-none">＋ Priority</span>`;
}

// ── Tab state ─────────────────────────────────────────────────
let currentWonderSection = 'natural';
let currentWonderFilter  = 'all';

// ── Circle helpers ────────────────────────────────────────────
function buildWonderCircleSVG(id, color) {
  return `
    <svg width="100" height="100" viewBox="0 0 100 100">
      <circle stroke="#ece6da" stroke-width="9" fill="none" r="44" cx="50" cy="50"></circle>
      <circle id="wonder-circle-${id}" stroke="${color}" stroke-width="9" fill="none"
        r="44" cx="50" cy="50" stroke-linecap="round" transform="rotate(-90, 50, 50)"></circle>
      <text id="wonder-text-${id}" x="50" y="55" text-anchor="middle" font-size="16" font-weight="bold" fill="${color}">0%</text>
    </svg>`;
}

function updateWonderCircle(id, visited, total, color) {
  const circle = document.getElementById('wonder-circle-' + id);
  const text   = document.getElementById('wonder-text-' + id);
  if (!circle || !text) return;
  const percent       = total > 0 ? (visited / total) * 100 : 0;
  const circumference = 2 * Math.PI * 44;
  circle.style.stroke           = color;
  circle.style.strokeDasharray  = `${circumference}`;
  circle.style.strokeDashoffset = `${circumference - (percent / 100) * circumference}`;
  text.textContent = `${Math.round(percent)}%`;
}

function updateWonderCircles() {
  const naturalVisited  = WONDERS_DATA.natural.filter(w => getWonderState(w.name) === 'been').length;
  const culturalVisited = WONDERS_DATA.cultural.filter(w => getWonderState(w.name) === 'been').length;
  updateWonderCircle('natural',  naturalVisited,  WONDERS_DATA.natural.length,  '#3f8f5a');
  updateWonderCircle('cultural', culturalVisited, WONDERS_DATA.cultural.length, '#c9772a');
  const nl = document.getElementById('wonder-label-natural');
  const cl = document.getElementById('wonder-label-cultural');
  if (nl) nl.textContent = `${naturalVisited} / ${WONDERS_DATA.natural.length}`;
  if (cl) cl.textContent = `${culturalVisited} / ${WONDERS_DATA.cultural.length}`;
}

// ── Init ──────────────────────────────────────────────────────
window.initWonders = function() {
  const container = document.getElementById('wondersContent');
  if (!container || container.dataset.built) return;
  container.dataset.built = 'true';

  container.innerHTML = `
    <h2>Wonders of the World</h2>

    <div class="stat-circles-row" style="margin: 16px 0;">
      <div class="stat-circle-item">
        ${buildWonderCircleSVG('natural', '#3f8f5a')}
        <div class="stat-circle-label">🌿 Natural</div>
        <div class="stat-circle-sub" id="wonder-label-natural">0 / ${WONDERS_DATA.natural.length}</div>
      </div>
      <div class="stat-circle-item">
        ${buildWonderCircleSVG('cultural', '#c9772a')}
        <div class="stat-circle-label">🏛️ Cultural</div>
        <div class="stat-circle-sub" id="wonder-label-cultural">0 / ${WONDERS_DATA.cultural.length}</div>
      </div>
    </div>

    <hr />

    <div class="wonders-section-toggle">
      <button class="wonders-seg-btn active" data-section="natural">🌿 Natural Wonders</button>
      <button class="wonders-seg-btn" data-section="cultural">🏛️ Cultural Sites</button>
    </div>

    <p id="wondersSummary" class="wonders-summary"></p>

    <div class="cl-toolbar">
      <div class="cl-filters" id="wonderFilters">
        <button class="cl-filter-btn active" data-filter="all">All</button>
        <button class="cl-filter-btn" data-filter="been">Been</button>
        <button class="cl-filter-btn" data-filter="want">Want</button>
        <button class="cl-filter-btn" data-filter="neutral">Neutral</button>
        <button class="cl-filter-btn" data-filter="next">🎯 Next Up</button>
        <button class="cl-filter-btn" data-filter="longterm">🗓️ Long Term</button>
        <button class="cl-filter-btn" data-filter="bottle" title="The 50 Let's Wander World Explorer bottle destinations">🍶 Bottle</button>
      </div>
    </div>

    <ul class="wonders-list" id="wondersList"></ul>
  `;

  container.querySelectorAll('.wonders-seg-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.wonders-seg-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentWonderSection = btn.dataset.section;
      currentWonderFilter  = 'all';
      container.querySelectorAll('.cl-filter-btn').forEach(b => b.classList.toggle('active', b.dataset.filter === 'all'));
      renderWondersList();
    });
  });

  container.querySelectorAll('.cl-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.cl-filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentWonderFilter = btn.dataset.filter;
      renderWondersList();
    });
  });

  updateWonderCircles();
  renderWondersList();
};

function renderWondersList() {
  const list    = document.getElementById('wondersList');
  const summary = document.getElementById('wondersSummary');
  if (!list) return;

  const items = WONDERS_DATA[currentWonderSection];
  const total = items.length;
  const been  = items.filter(w => getWonderState(w.name) === 'been').length;
  const want  = items.filter(w => getWonderState(w.name) === 'want').length;

  summary.innerHTML = `<strong>Visited: ${been} / ${total}</strong> &nbsp;·&nbsp; Want to go: ${want}`;

  const visible = items.filter(wonderMatchesFilter);
  list.innerHTML = '';

  visible.forEach(wonder => {
    const status   = getWonderState(wonder.name);
    const priority = getWonderPriority(wonder.name);

    const li = document.createElement('li');
    li.className = `wonders-item cl-${status}`;
    li.innerHTML = `
      <span class="cl-dot"></span>
      <span class="wonders-item-icon" aria-hidden="true">${wonder.icon || '📍'}</span>
      <div class="wonders-item-info">
        <span class="wonders-item-name">${wonder.name}</span>
        <span class="wonders-item-land">${wonder.land}</span>
        ${wonder.wiki ? `<a class="wonders-wiki-link" href="${wonder.wiki}" target="_blank" rel="noopener noreferrer">Learn more →</a>` : ''}
      </div>
      <button class="priority-badge-btn" title="Cycle priority">${priorityBadgeHtml(priority)}</button>
      <div class="wonders-item-actions">
        <button class="wonders-status-btn ${status === 'been'    ? 'active-been'    : ''}" data-status="been"    title="Been (click again to reset)">✓</button>
        <button class="wonders-status-btn ${status === 'want'    ? 'active-want'    : ''}" data-status="want"    title="Want to go (click again to reset)">★</button>
        <button class="wonders-status-btn ${status === 'neutral' ? 'active-neutral' : ''}" data-status="neutral" title="Neutral">✕</button>
      </div>
    `;

    li.querySelector('.priority-badge-btn').addEventListener('click', () => {
      cycleWonderPriority(wonder.name);
      renderWondersList();
    });

    li.querySelectorAll('.wonders-status-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        // Clicking the already-active ✓ or ★ again resets the wonder to neutral
        const clicked = btn.dataset.status;
        const next    = clicked !== 'neutral' && clicked === getWonderState(wonder.name) ? 'neutral' : clicked;
        setWonderState(wonder.name, next);
        updateWonderCircles();
        renderWondersList();
        if (window.refreshBadges) window.refreshBadges();
      });
    });

    list.appendChild(li);
  });

  if (list.children.length === 0) {
    list.innerHTML = `<li class="wonders-empty">No items match this filter.</li>`;
  }
}

function wonderMatchesFilter(wonder) {
  const status   = getWonderState(wonder.name);
  const priority = getWonderPriority(wonder.name);
  switch (currentWonderFilter) {
    case 'been':
    case 'want':
    case 'neutral':  return status === currentWonderFilter;
    case 'next':     return priority === 'next';
    case 'longterm': return priority === 'longterm';
    case 'bottle':   return !!wonder.bottle;
    default:         return true;
  }
}
