const WONDERS_DATA = {
  natural: [
    { name: "Amazon Rainforest",                land: "Brazil, Peru, Colombia",                  wiki: "https://en.wikipedia.org/wiki/Amazon_rainforest" },
    { name: "Barringer Crater",                 land: "United States of America",                wiki: "https://en.wikipedia.org/wiki/Meteor_Crater" },
    { name: "Cerro de Potosí",                  land: "Bolivia",                                 wiki: "https://en.wikipedia.org/wiki/Cerro_Rico" },
    { name: "Chicxulub-Crater",                 land: "Mexico",                                  wiki: "https://en.wikipedia.org/wiki/Chicxulub_crater" },
    { name: "Chocolate Hills",                  land: "Philippines",                             wiki: "https://en.wikipedia.org/wiki/Chocolate_Hills" },
    { name: "Dead Sea",                         land: "Jordan, Israel, Palestine",               wiki: "https://en.wikipedia.org/wiki/Dead_Sea" },
    { name: "Delicate Arch",                    land: "United States of America",                wiki: "https://en.wikipedia.org/wiki/Delicate_Arch" },
    { name: "Eye of the Sahara",                land: "Mauritania",                              wiki: "https://en.wikipedia.org/wiki/Richat_Structure" },
    { name: "Galapagos Islands",                land: "Ecuador",                                 wiki: "https://en.wikipedia.org/wiki/Gal%C3%A1pagos_Islands" },
    { name: "Giant's Causeway",                 land: "United Kingdom",                          wiki: "https://en.wikipedia.org/wiki/Giant%27s_Causeway" },
    { name: "Grand Canyon",                     land: "United States of America",                wiki: "https://en.wikipedia.org/wiki/Grand_Canyon" },
    { name: "Grand Mesa",                       land: "United States of America",                wiki: "https://en.wikipedia.org/wiki/Grand_Mesa" },
    { name: "Great Barrier Reef",               land: "Australia",                               wiki: "https://en.wikipedia.org/wiki/Great_Barrier_Reef" },
    { name: "Ha Long Bay",                      land: "Vietnam",                                 wiki: "https://en.wikipedia.org/wiki/Ha_Long_Bay" },
    { name: "Iguazu Falls",                     land: "Argentina, Brazil",                       wiki: "https://en.wikipedia.org/wiki/Iguazu_Falls" },
    { name: "Ik-Kil Cenote",                    land: "Mexico",                                  wiki: "https://en.wikipedia.org/wiki/Ik_Kil" },
    { name: "Jeju Island",                      land: "South Korea",                             wiki: "https://en.wikipedia.org/wiki/Jeju_Island" },
    { name: "Komodo Island",                    land: "Indonesia",                               wiki: "https://en.wikipedia.org/wiki/Komodo_(island)" },
    { name: "Krakatoa",                         land: "Indonesia",                               wiki: "https://en.wikipedia.org/wiki/Krakatoa" },
    { name: "Lake Victoria",                    land: "Kenya, Tanzania, Uganda",                 wiki: "https://en.wikipedia.org/wiki/Lake_Victoria" },
    { name: "Mato Tipila (Devils Tower)",       land: "United States of America",                wiki: "https://en.wikipedia.org/wiki/Devils_Tower" },
    { name: "Matterhorn",                       land: "Switzerland, Italy",                      wiki: "https://en.wikipedia.org/wiki/Matterhorn" },
    { name: "Milford Sound",                    land: "New Zealand",                             wiki: "https://en.wikipedia.org/wiki/Milford_Sound_/_Piopiotahi" },
    { name: "Mount Everest",                    land: "Nepal, China",                            wiki: "https://en.wikipedia.org/wiki/Mount_Everest" },
    { name: "Mount Fuji",                       land: "Japan",                                   wiki: "https://en.wikipedia.org/wiki/Mount_Fuji" },
    { name: "Mount Kailash",                    land: "China",                                   wiki: "https://en.wikipedia.org/wiki/Mount_Kailash" },
    { name: "Mount Kilimanjaro",                land: "Tanzania",                                wiki: "https://en.wikipedia.org/wiki/Mount_Kilimanjaro" },
    { name: "Mount Roraima",                    land: "Venezuela, Brazil, Guyana",               wiki: "https://en.wikipedia.org/wiki/Mount_Roraima" },
    { name: "Mount Sinai",                      land: "Egypt",                                   wiki: "https://en.wikipedia.org/wiki/Mount_Sinai" },
    { name: "Niagara Falls",                    land: "Canada, United States of America",        wiki: "https://en.wikipedia.org/wiki/Niagara_Falls" },
    { name: "Northern Lights",                  land: "Norway, Iceland, Finland",                wiki: "https://en.wikipedia.org/wiki/Aurora" },
    { name: "Old Faithful",                     land: "United States of America",                wiki: "https://en.wikipedia.org/wiki/Old_Faithful" },
    { name: "Pamukkale",                        land: "Turkey",                                  wiki: "https://en.wikipedia.org/wiki/Pamukkale" },
    { name: "Pantanal",                         land: "Brazil, Bolivia, Paraguay",               wiki: "https://en.wikipedia.org/wiki/Pantanal" },
    { name: "Patagonia",                        land: "Argentina, Chile",                        wiki: "https://en.wikipedia.org/wiki/Patagonia" },
    { name: "Puerto Princesa Underground River",land: "Philippines",                             wiki: "https://en.wikipedia.org/wiki/Puerto_Princesa_Subterranean_River_National_Park" },
    { name: "Rock of Gibraltar",                land: "United Kingdom",                          wiki: "https://en.wikipedia.org/wiki/Rock_of_Gibraltar" },
    { name: "Sahara Desert",                    land: "Algeria, Morocco, Tunisia, Egypt",        wiki: "https://en.wikipedia.org/wiki/Sahara" },
    { name: "Sri Pada (Adam's Peak)",           land: "Sri Lanka",                               wiki: "https://en.wikipedia.org/wiki/Adam%27s_Peak" },
    { name: "Table Mountain",                   land: "South Africa",                            wiki: "https://en.wikipedia.org/wiki/Table_Mountain" },
    { name: "Torres del Paine",                 land: "Chile",                                   wiki: "https://en.wikipedia.org/wiki/Torres_del_Paine_National_Park" },
    { name: "Tsingy de Bemaraha",               land: "Madagascar",                              wiki: "https://en.wikipedia.org/wiki/Tsingy_de_Bemaraha_Strict_Nature_Reserve" },
    { name: "Uluru",                            land: "Australia",                               wiki: "https://en.wikipedia.org/wiki/Uluru" },
    { name: "Victoria Falls",                   land: "Zambia, Zimbabwe",                        wiki: "https://en.wikipedia.org/wiki/Victoria_Falls" },
    { name: "White Desert",                     land: "Egypt",                                   wiki: "https://en.wikipedia.org/wiki/White_Desert_National_Park" },
    { name: "Yosemite National Park",           land: "United States of America",                wiki: "https://en.wikipedia.org/wiki/Yosemite_National_Park" },
    { name: "Zugspitze",                        land: "Germany, Austria",                        wiki: "https://en.wikipedia.org/wiki/Zugspitze" }
  ],
  cultural: [
    { name: "Acropolis of Athens",              land: "Greece",                                  wiki: "https://en.wikipedia.org/wiki/Acropolis_of_Athens" },
    { name: "Alhambra",                         land: "Spain",                                   wiki: "https://en.wikipedia.org/wiki/Alhambra" },
    { name: "Angkor Wat",                       land: "Cambodia",                                wiki: "https://en.wikipedia.org/wiki/Angkor_Wat" },
    { name: "Big Ben",                          land: "United Kingdom",                          wiki: "https://en.wikipedia.org/wiki/Big_Ben" },
    { name: "Borobudur",                        land: "Indonesia",                               wiki: "https://en.wikipedia.org/wiki/Borobudur" },
    { name: "Brandenburg Gate",                 land: "Germany",                                 wiki: "https://en.wikipedia.org/wiki/Brandenburg_Gate" },
    { name: "Broadway",                         land: "United States of America",                wiki: "https://en.wikipedia.org/wiki/Broadway_(Manhattan)" },
    { name: "Cappadocia",                       land: "Turkey",                                  wiki: "https://en.wikipedia.org/wiki/Cappadocia" },
    { name: "Chichén Itzá",                     land: "Mexico",                                  wiki: "https://en.wikipedia.org/wiki/Chichen_Itza" },
    { name: "Christ the Redeemer",              land: "Brazil",                                  wiki: "https://en.wikipedia.org/wiki/Christ_the_Redeemer_(statue)" },
    { name: "CN Tower",                         land: "Canada",                                  wiki: "https://en.wikipedia.org/wiki/CN_Tower" },
    { name: "Colosseum",                        land: "Italy",                                   wiki: "https://en.wikipedia.org/wiki/Colosseum" },
    { name: "Easter Island (Rapa Nui)",         land: "Chile",                                   wiki: "https://en.wikipedia.org/wiki/Easter_Island" },
    { name: "Eiffel Tower",                     land: "France",                                  wiki: "https://en.wikipedia.org/wiki/Eiffel_Tower" },
    { name: "Estádio do Maracanã",              land: "Brazil",                                  wiki: "https://en.wikipedia.org/wiki/Maracan%C3%A3_Stadium" },
    { name: "Forbidden City",                   land: "China",                                   wiki: "https://en.wikipedia.org/wiki/Forbidden_City" },
    { name: "Golden Gate Bridge",               land: "United States of America",                wiki: "https://en.wikipedia.org/wiki/Golden_Gate_Bridge" },
    { name: "Great Mosque of Djenné",           land: "Mali",                                    wiki: "https://en.wikipedia.org/wiki/Great_Mosque_of_Djenn%C3%A9" },
    { name: "Great Wall of China",              land: "China",                                   wiki: "https://en.wikipedia.org/wiki/Great_Wall_of_China" },
    { name: "Hagia Sophia",                     land: "Turkey",                                  wiki: "https://en.wikipedia.org/wiki/Hagia_Sophia" },
    { name: "Hermitage Museum",                 land: "Russia",                                  wiki: "https://en.wikipedia.org/wiki/Hermitage_Museum" },
    { name: "Himeji Castle",                    land: "Japan",                                   wiki: "https://en.wikipedia.org/wiki/Himeji_Castle" },
    { name: "Leaning Tower of Pisa",            land: "Italy",                                   wiki: "https://en.wikipedia.org/wiki/Leaning_Tower_of_Pisa" },
    { name: "Machu Picchu",                     land: "Peru",                                    wiki: "https://en.wikipedia.org/wiki/Machu_Picchu" },
    { name: "Mont Saint-Michel",                land: "France",                                  wiki: "https://en.wikipedia.org/wiki/Mont_Saint-Michel" },
    { name: "Neuschwanstein Castle",            land: "Germany",                                 wiki: "https://en.wikipedia.org/wiki/Neuschwanstein_Castle" },
    { name: "Notre-Dame de Paris",              land: "France",                                  wiki: "https://en.wikipedia.org/wiki/Notre-Dame_de_Paris" },
    { name: "Oracle of Delphi",                 land: "Greece",                                  wiki: "https://en.wikipedia.org/wiki/Delphi" },
    { name: "Országház",                        land: "Hungary",                                 wiki: "https://en.wikipedia.org/wiki/Hungarian_Parliament_Building" },
    { name: "Oxford University",                land: "United Kingdom",                          wiki: "https://en.wikipedia.org/wiki/University_of_Oxford" },
    { name: "Petra",                            land: "Jordan",                                  wiki: "https://en.wikipedia.org/wiki/Petra" },
    { name: "Potala Palace",                    land: "China",                                   wiki: "https://en.wikipedia.org/wiki/Potala_Palace" },
    { name: "Pyramids of Giza",                 land: "Egypt",                                   wiki: "https://en.wikipedia.org/wiki/Giza_pyramid_complex" },
    { name: "Red Fort",                         land: "India",                                   wiki: "https://en.wikipedia.org/wiki/Red_Fort" },
    { name: "Saint Basil's Cathedral",          land: "Russia",                                  wiki: "https://en.wikipedia.org/wiki/Saint_Basil%27s_Cathedral" },
    { name: "Sistine Chapel",                   land: "Vatican City",                            wiki: "https://en.wikipedia.org/wiki/Sistine_Chapel" },
    { name: "Statue of Liberty",                land: "United States of America",                wiki: "https://en.wikipedia.org/wiki/Statue_of_Liberty" },
    { name: "Stonehenge",                       land: "United Kingdom",                          wiki: "https://en.wikipedia.org/wiki/Stonehenge" },
    { name: "Sydney Opera House",               land: "Australia",                               wiki: "https://en.wikipedia.org/wiki/Sydney_Opera_House" },
    { name: "Taj Mahal",                        land: "India",                                   wiki: "https://en.wikipedia.org/wiki/Taj_Mahal" },
    { name: "Terracotta Army",                  land: "China",                                   wiki: "https://en.wikipedia.org/wiki/Terracotta_Army" },
    { name: "The Kremlin",                      land: "Russia",                                  wiki: "https://en.wikipedia.org/wiki/Moscow_Kremlin" },
    { name: "The Louvre",                       land: "France",                                  wiki: "https://en.wikipedia.org/wiki/Louvre" },
    { name: "The Parthenon",                    land: "Greece",                                  wiki: "https://en.wikipedia.org/wiki/Parthenon" },
    { name: "The Pentagon",                     land: "United States of America",                wiki: "https://en.wikipedia.org/wiki/The_Pentagon" },
    { name: "Torre de Belém",                   land: "Portugal",                                wiki: "https://en.wikipedia.org/wiki/Bel%C3%A9m_Tower" },
    { name: "Uffizi Gallery",                   land: "Italy",                                   wiki: "https://en.wikipedia.org/wiki/Uffizi" },
    { name: "Venetian Arsenal",                 land: "Italy",                                   wiki: "https://en.wikipedia.org/wiki/Venetian_Arsenal" }
  ]
};

// ── Expose flat list for tooltip ──────────────────────────────
window.WONDERS_ALL = [...WONDERS_DATA.natural, ...WONDERS_DATA.cultural];

// ── Wonder states ─────────────────────────────────────────────
const WONDERS_STORAGE_KEY = 'wonders_states_v1';
window.wonderStates = JSON.parse(localStorage.getItem(WONDERS_STORAGE_KEY) || '{}');

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
      <circle stroke="#e0e0e0" stroke-width="9" fill="none" r="44" cx="50" cy="50"></circle>
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
  updateWonderCircle('natural',  naturalVisited,  WONDERS_DATA.natural.length,  '#4caf50');
  updateWonderCircle('cultural', culturalVisited, WONDERS_DATA.cultural.length, '#f4a261');
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
        ${buildWonderCircleSVG('natural', '#4caf50')}
        <div class="stat-circle-label">🌿 Natural</div>
        <div class="stat-circle-sub" id="wonder-label-natural">0 / ${WONDERS_DATA.natural.length}</div>
      </div>
      <div class="stat-circle-item">
        ${buildWonderCircleSVG('cultural', '#f4a261')}
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

  list.innerHTML = '';

  items.forEach(wonder => {
    const status   = getWonderState(wonder.name);
    const priority = getWonderPriority(wonder.name);

    // Apply filter
    let hidden = false;
    if (currentWonderFilter === 'been' || currentWonderFilter === 'want' || currentWonderFilter === 'neutral') {
      hidden = status !== currentWonderFilter;
    } else if (currentWonderFilter === 'next') {
      hidden = priority !== 'next';
    } else if (currentWonderFilter === 'longterm') {
      hidden = priority !== 'longterm';
    }

    if (hidden) return;

    const li = document.createElement('li');
    li.className = `wonders-item cl-${status}`;
    li.innerHTML = `
      <span class="cl-dot"></span>
      <div class="wonders-item-info">
        <span class="wonders-item-name">${wonder.name}</span>
        <span class="wonders-item-land">${wonder.land}</span>
        ${wonder.wiki ? `<a class="wonders-wiki-link" href="${wonder.wiki}" target="_blank" rel="noopener noreferrer">Learn more →</a>` : ''}
      </div>
      <button class="priority-badge-btn" title="Cycle priority">${priorityBadgeHtml(priority)}</button>
      <div class="wonders-item-actions">
        <button class="wonders-status-btn ${status === 'been'    ? 'active-been'    : ''}" data-status="been"    title="Been">✓</button>
        <button class="wonders-status-btn ${status === 'want'    ? 'active-want'    : ''}" data-status="want"    title="Want to go">★</button>
        <button class="wonders-status-btn ${status === 'neutral' ? 'active-neutral' : ''}" data-status="neutral" title="Neutral">✕</button>
      </div>
    `;

    li.querySelector('.priority-badge-btn').addEventListener('click', () => {
      cycleWonderPriority(wonder.name);
      renderWondersList();
    });

    li.querySelectorAll('.wonders-status-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        setWonderState(wonder.name, btn.dataset.status);
        updateWonderCircles();
        renderWondersList();
      });
    });

    list.appendChild(li);
  });

  if (list.children.length === 0) {
    list.innerHTML = `<li class="wonders-empty">No items match this filter.</li>`;
  }
}
