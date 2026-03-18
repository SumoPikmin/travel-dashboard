const WONDERS_DATA = {
  natural: [
    { name: "Amazon Rainforest",          land: "Brazil, Peru, Colombia" },
    { name: "Barringer Crater",           land: "United States of America" },
    { name: "Cerro de Potosí",            land: "Bolivia" },
    { name: "Dead Sea",                   land: "Jordan, Israel, Palestine" },
    { name: "Galapagos Islands",          land: "Ecuador" },
    { name: "Grand Canyon",               land: "United States of America" },
    { name: "Grand Mesa",                 land: "United States of America" },
    { name: "Great Barrier Reef",         land: "Australia" },
    { name: "Komodo Island",              land: "Indonesia" },
    { name: "Krakatoa",                   land: "Indonesia" },
    { name: "Lake Victoria",              land: "Kenya, Tanzania, Uganda" },
    { name: "Mount Everest",              land: "Nepal, China" },
    { name: "Mount Fuji",                 land: "Japan" },
    { name: "Mount Kailash",              land: "China" },
    { name: "Mount Kilimanjaro",          land: "Tanzania" },
    { name: "Mount Sinai",                land: "Egypt" },
    { name: "Northern Lights",            land: "Norway, Iceland, Finland" },
    { name: "Old Faithful",               land: "United States of America" },
    { name: "Patagonia",                  land: "Argentina, Chile" },
    { name: "Rock of Gibraltar",          land: "United Kingdom" },
    { name: "Sahara Desert",              land: "Algeria, Morocco, Tunisia, Egypt" },
    { name: "Sri Pada (Adam's Peak)",     land: "Sri Lanka" },
    { name: "Table Mountain",             land: "South Africa" },
    { name: "Uluru",                      land: "Australia" },
    { name: "Victoria Falls",             land: "Zambia, Zimbabwe" },
    { name: "Yosemite National Park",     land: "United States of America" }
  ],
  cultural: [
    { name: "Acropolis of Athens",        land: "Greece" },
    { name: "Alhambra",                   land: "Spain" },
    { name: "Angkor Wat",                 land: "Cambodia" },
    { name: "Big Ben",                    land: "United Kingdom" },
    { name: "Borobudur",                  land: "Indonesia" },
    { name: "Brandenburg Gate",           land: "Germany" },
    { name: "Broadway",                   land: "United States of America" },
    { name: "Cappadocia",                 land: "Turkey" },
    { name: "Chichén Itzá",               land: "Mexico" },
    { name: "Christ the Redeemer",        land: "Brazil" },
    { name: "CN Tower",                   land: "Canada" },
    { name: "Easter Island (Rapa Nui)",   land: "Chile" },
    { name: "Eiffel Tower",               land: "France" },
    { name: "Forbidden City",             land: "China" },
    { name: "Great Mosque of Djenné",     land: "Mali" },
    { name: "Great Wall of China",        land: "China" },
    { name: "Hagia Sophia",               land: "Turkey" },
    { name: "Himeji Castle",              land: "Japan" },
    { name: "Leaning Tower of Pisa",      land: "Italy" },
    { name: "Machu Picchu",               land: "Peru" },
    { name: "Mont Saint-Michel",          land: "France" },
    { name: "Neuschwanstein Castle",      land: "Germany" },
    { name: "Notre-Dame de Paris",        land: "France" },
    { name: "Oracle of Delphi",           land: "Greece" },
    { name: "Petra",                      land: "Jordan" },
    { name: "Pyramids of Giza",           land: "Egypt" },
    { name: "Red Fort",                   land: "India" },
    { name: "Sistine Chapel",             land: "Vatican City" },
    { name: "Statue of Liberty",          land: "United States of America" },
    { name: "Stonehenge",                 land: "United Kingdom" },
    { name: "Sydney Opera House",         land: "Australia" },
    { name: "Taj Mahal",                  land: "India" },
    { name: "Terracotta Army",            land: "China" },
    { name: "The Kremlin",                land: "Russia" },
    { name: "The Louvre",                 land: "France" },
    { name: "The Parthenon",              land: "Greece" },
    { name: "The Pentagon",               land: "United States of America" },
    { name: "Uffizi Gallery",             land: "Italy" }
  ]
};

// Expose flat list for tooltip lookup
window.WONDERS_ALL = [...WONDERS_DATA.natural, ...WONDERS_DATA.cultural];

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

let currentWonderSection = 'natural';
let currentWonderFilter  = 'all';

window.initWonders = function() {
  const container = document.getElementById('wondersContent');
  if (!container || container.dataset.built) return;
  container.dataset.built = 'true';

  container.innerHTML = `
    <h2>Wonders of the World</h2>
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
    const status = getWonderState(wonder.name);
    if (currentWonderFilter !== 'all' && status !== currentWonderFilter) return;

    const li = document.createElement('li');
    li.className = `wonders-item cl-${status}`;
    li.innerHTML = `
      <span class="cl-dot"></span>
      <div class="wonders-item-info">
        <span class="wonders-item-name">${wonder.name}</span>
        <span class="wonders-item-land">${wonder.land}</span>
      </div>
      <div class="wonders-item-actions">
        <button class="wonders-status-btn ${status === 'been'    ? 'active-been'    : ''}" data-status="been"    title="Been">✓</button>
        <button class="wonders-status-btn ${status === 'want'    ? 'active-want'    : ''}" data-status="want"    title="Want to go">★</button>
        <button class="wonders-status-btn ${status === 'neutral' ? 'active-neutral' : ''}" data-status="neutral" title="Neutral">✕</button>
      </div>
    `;

    li.querySelectorAll('.wonders-status-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        setWonderState(wonder.name, btn.dataset.status);
        renderWondersList();
      });
    });

    list.appendChild(li);
  });

  if (list.children.length === 0) {
    list.innerHTML = `<li class="wonders-empty">No items match this filter.</li>`;
  }
}
