/**
 * triplist.js — Work Package 5
 *
 * Replaces the basic renderTripList in triplog.js with a full-featured
 * list view: filters, sort, expandable detail panels, first-visit badges,
 * per-country day breakdown, flags, edit and delete with sync.
 *
 * Strategy: this file patches window.renderTripList so triplog.js
 * automatically picks up the richer version when it calls renderTripList()
 * after saves/deletes. No changes needed to triplog.js.
 *
 * Load order in index.html:
 *   migration.js → trips.js → map.js → stats.js → wonders.js
 *   → triplog.js → triplist.js          ← this file last
 *
 * Exposes:
 *   window.renderTripList()   — called by triplog.js after every save/delete
 *   window.refreshTripList()  — alias, useful from console
 */

(function () {

  // ── Constants ────────────────────────────────────────────────────────────────

  const MOOD_LABELS  = ['', '😞 Terrible', '😕 Poor', '😐 Okay', '😊 Good', '🤩 Amazing'];
  const MOOD_COLORS  = ['', '#e76f51',     '#f4a261',  '#aaa',    '#2a9d8f',  '#8ecae6'  ];

  // Full country → ISO alpha-2 map (same as map.js nameToCode)
  const NAME_TO_CODE = {
    "Afghanistan":"af","Albania":"al","Algeria":"dz","Andorra":"ad","Angola":"ao",
    "Antigua and Barbuda":"ag","Argentina":"ar","Armenia":"am","Australia":"au","Austria":"at",
    "Azerbaijan":"az","Bahamas":"bs","Bahrain":"bh","Bangladesh":"bd","Barbados":"bb",
    "Belarus":"by","Belgium":"be","Belize":"bz","Benin":"bj","Bhutan":"bt","Bolivia":"bo",
    "Bosnia and Herzegovina":"ba","Botswana":"bw","Brazil":"br","Brunei":"bn","Bulgaria":"bg",
    "Burkina Faso":"bf","Burundi":"bi","Cabo Verde":"cv","Cambodia":"kh","Cameroon":"cm",
    "Canada":"ca","Central African Republic":"cf","Chad":"td","Chile":"cl","China":"cn",
    "Colombia":"co","Comoros":"km","Congo":"cg","Democratic Republic of Congo":"cd",
    "Costa Rica":"cr","Cote d'Ivoire":"ci","Croatia":"hr","Cuba":"cu","Cyprus":"cy",
    "Czech Republic":"cz","Denmark":"dk","Djibouti":"dj","Dominica":"dm",
    "Dominican Republic":"do","Ecuador":"ec","Egypt":"eg","El Salvador":"sv",
    "Equatorial Guinea":"gq","Eritrea":"er","Estonia":"ee","Eswatini":"sz","Ethiopia":"et",
    "Fiji":"fj","Finland":"fi","France":"fr","Gabon":"ga","Gambia":"gm","Georgia":"ge",
    "Germany":"de","Ghana":"gh","Greece":"gr","Grenada":"gd","Guatemala":"gt","Guinea":"gn",
    "Guinea-Bissau":"gw","Guyana":"gy","Haiti":"ht","Honduras":"hn","Hungary":"hu",
    "Iceland":"is","India":"in","Indonesia":"id","Iran":"ir","Iraq":"iq","Ireland":"ie",
    "Israel":"il","Italy":"it","Jamaica":"jm","Japan":"jp","Jordan":"jo","Kazakhstan":"kz",
    "Kenya":"ke","Kiribati":"ki","North Korea":"kp","South Korea":"kr","Kosovo":"xk",
    "Kuwait":"kw","Kyrgyzstan":"kg","Laos":"la","Latvia":"lv","Lebanon":"lb","Lesotho":"ls",
    "Liberia":"lr","Libya":"ly","Liechtenstein":"li","Lithuania":"lt","Luxembourg":"lu",
    "Madagascar":"mg","Malawi":"mw","Malaysia":"my","Maldives":"mv","Mali":"ml","Malta":"mt",
    "Marshall Islands":"mh","Mauritania":"mr","Mauritius":"mu","Mexico":"mx","Micronesia":"fm",
    "Moldova":"md","Monaco":"mc","Mongolia":"mn","Montenegro":"me","Morocco":"ma",
    "Mozambique":"mz","Myanmar":"mm","Namibia":"na","Nauru":"nr","Nepal":"np",
    "Netherlands":"nl","New Zealand":"nz","Nicaragua":"ni","Niger":"ne","Nigeria":"ng",
    "North Macedonia":"mk","Norway":"no","Oman":"om","Pakistan":"pk","Palau":"pw",
    "Palestine":"ps","Panama":"pa","Papua New Guinea":"pg","Paraguay":"py","Peru":"pe",
    "Philippines":"ph","Poland":"pl","Portugal":"pt","Qatar":"qa","Romania":"ro",
    "Russia":"ru","Rwanda":"rw","Saint Kitts and Nevis":"kn","Saint Lucia":"lc",
    "Saint Vincent and the Grenadines":"vc","Samoa":"ws","San Marino":"sm",
    "Sao Tome and Principe":"st","Saudi Arabia":"sa","Senegal":"sn","Serbia":"rs",
    "Seychelles":"sc","Sierra Leone":"sl","Singapore":"sg","Slovakia":"sk","Slovenia":"si",
    "Solomon Islands":"sb","Somalia":"so","South Africa":"za","South Sudan":"ss","Spain":"es",
    "Sri Lanka":"lk","Sudan":"sd","Suriname":"sr","Sweden":"se","Switzerland":"ch",
    "Syria":"sy","Taiwan":"tw","Tajikistan":"tj","Tanzania":"tz","Thailand":"th",
    "Timor-Leste":"tl","Togo":"tg","Tonga":"to","Trinidad and Tobago":"tt","Tunisia":"tn",
    "Turkey":"tr","Turkmenistan":"tm","Tuvalu":"tv","Uganda":"ug","Ukraine":"ua",
    "United Arab Emirates":"ae","United Kingdom":"gb","United States of America":"us",
    "Uruguay":"uy","Uzbekistan":"uz","Vanuatu":"vu","Vatican City":"va","Venezuela":"ve",
    "Vietnam":"vn","Yemen":"ye","Zambia":"zm","Zimbabwe":"zw"
  };

  // ── Filter / sort state ──────────────────────────────────────────────────────

  let filterCountry   = '';   // country id string or ''
  let filterCompanion = '';   // lowercase string or ''
  let filterTag       = '';   // lowercase string or ''
  let filterMood      = 0;    // 0 = any, 1–5 = exact
  let filterYear      = '';   // '2024' string or ''
  let sortKey         = 'date_desc'; // 'date_desc' | 'date_asc' | 'duration_desc' | 'mood_desc'
  let expandedTripId  = null; // id of currently expanded detail panel

  // ── DOM helper ───────────────────────────────────────────────────────────────

  function el(id) { return document.getElementById(id); }

  // ── Country helpers ──────────────────────────────────────────────────────────

  function getCountryNameById(id) {
    if (!window.nameIndex) return null;
    const entry = Object.values(window.nameIndex).find(f => String(f.id) === String(id));
    return entry ? entry.properties.displayName : null;
  }

  function flagImg(countryName) {
    const code = NAME_TO_CODE[countryName];
    if (!code) return '';
    return `<img class="tl5-flag" src="https://flagcdn.com/w20/${code}.png"
                 alt="${countryName}" title="${countryName}"
                 onerror="this.style.display='none'" />`;
  }

  // ── Date helpers ─────────────────────────────────────────────────────────────

  function formatDateRange(from, to) {
    if (!from) return '';
    const opts = { year: 'numeric', month: 'short', day: 'numeric' };
    const f = new Date(from).toLocaleDateString('en-GB', opts);
    const t = to ? new Date(to).toLocaleDateString('en-GB', opts) : '';
    return t && t !== f ? `${f} – ${t}` : f;
  }

  // ── WP3 sync bridge ──────────────────────────────────────────────────────────

  function syncOnSave(trip) {
    if (window.syncCountryStatusOnTripSave) {
      window.syncCountryStatusOnTripSave(trip);
    } else {
      (trip.countries || []).forEach(id => window.setCountryState(id, 'been', 'trip'));
      localStorage.setItem(window.STORAGE_KEYS.states, JSON.stringify(window.states));
    }
    refreshMap();
    if (window.updateStats) window.updateStats();
  }

  function syncOnDelete(trip) {
    if (window.syncCountryStatusOnTripDelete) {
      window.syncCountryStatusOnTripDelete(trip);
    } else {
      (trip.countries || []).forEach(id => {
        const remaining = window.TripStore.getTripsForCountry(id);
        if (remaining.length === 0) window.setCountryState(id, 'neutral', 'manual');
      });
      localStorage.setItem(window.STORAGE_KEYS.states, JSON.stringify(window.states));
    }
    refreshMap();
    if (window.updateStats) window.updateStats();
  }

  function refreshMap() {
    if (!window.d3) return;
    const COLORS = { neutral: '#ffffff', been: '#8ecae6', want: '#ffd166' };
    window.d3.selectAll('path.country')
      .attr('fill', d => COLORS[window.getCountryStatus(d.id)]);
  }

  // ── Filter helpers ───────────────────────────────────────────────────────────

  function applyFilters(trips) {
    return trips.filter(trip => {
      // Country filter — id match
      if (filterCountry) {
        if (!Array.isArray(trip.countries) || !trip.countries.includes(filterCountry)) return false;
      }
      // Companion filter — contains check (multi-select array)
      if (filterCompanion) {
        if (!Array.isArray(trip.companions) ||
            !trip.companions.some(c => c.toLowerCase() === filterCompanion)) return false;
      }
      // Tag filter — contains check
      if (filterTag) {
        if (!Array.isArray(trip.tags) ||
            !trip.tags.some(t => t.toLowerCase() === filterTag)) return false;
      }
      // Mood filter — exact match
      if (filterMood) {
        if (trip.mood !== filterMood) return false;
      }
      // Year filter
      if (filterYear) {
        if (!trip.dateFrom || String(new Date(trip.dateFrom).getFullYear()) !== filterYear) return false;
      }
      return true;
    });
  }

  function applySort(trips) {
    return trips.slice().sort((a, b) => {
      switch (sortKey) {
        case 'date_asc':
          return a.dateFrom < b.dateFrom ? -1 : a.dateFrom > b.dateFrom ? 1 : 0;
        case 'duration_desc': {
          const da = window.TripStore.getTripDuration(a);
          const db = window.TripStore.getTripDuration(b);
          return db - da;
        }
        case 'mood_desc':
          return (b.mood || 0) - (a.mood || 0);
        case 'date_desc':
        default:
          return a.dateFrom > b.dateFrom ? -1 : a.dateFrom < b.dateFrom ? 1 : 0;
      }
    });
  }

  // ── Build filter options from current trip data ──────────────────────────────

  function buildFilterOptions() {
    const allTrips  = window.TripStore.getTrips();
    const countries = new Map(); // id → name
    const companions = new Set();
    const tags       = new Set();
    const years      = new Set();

    allTrips.forEach(t => {
      (t.countries || []).forEach(id => {
        const name = getCountryNameById(id);
        if (name) countries.set(id, name);
      });
      (t.companions || []).forEach(c => companions.add(c.toLowerCase()));
      (t.tags || []).forEach(tag => tags.add(tag.toLowerCase()));
      if (t.dateFrom) years.add(String(new Date(t.dateFrom).getFullYear()));
    });

    return {
      countries: [...countries.entries()].sort((a, b) => a[1].localeCompare(b[1])),
      companions: [...companions].sort(),
      tags:       [...tags].sort(),
      years:      [...years].sort().reverse(),
    };
  }

  // ── Ensure filter bar exists in the DOM (built once, reused) ─────────────────

  function ensureFilterBar() {
    if (el('tl5FilterBar')) return;

    const listWrap = el('tlListWrap');
    if (!listWrap) return;

    const bar = document.createElement('div');
    bar.id = 'tl5FilterBar';
    bar.className = 'tl5-filter-bar';
    bar.innerHTML = `
      <div class="tl5-filter-row">
        <select class="tl5-filter-select" id="tl5FCountry" title="Filter by country">
          <option value="">All countries</option>
        </select>
        <select class="tl5-filter-select" id="tl5FCompanion" title="Filter by companion">
          <option value="">All companions</option>
        </select>
        <select class="tl5-filter-select" id="tl5FTag" title="Filter by tag">
          <option value="">All tags</option>
        </select>
        <select class="tl5-filter-select" id="tl5FMood" title="Filter by mood">
          <option value="0">All moods</option>
          <option value="5">🤩 Amazing</option>
          <option value="4">😊 Good</option>
          <option value="3">😐 Okay</option>
          <option value="2">😕 Poor</option>
          <option value="1">😞 Terrible</option>
        </select>
        <select class="tl5-filter-select" id="tl5FYear" title="Filter by year">
          <option value="">All years</option>
        </select>
        <select class="tl5-filter-select" id="tl5FSort" title="Sort">
          <option value="date_desc">Newest first</option>
          <option value="date_asc">Oldest first</option>
          <option value="duration_desc">Longest first</option>
          <option value="mood_desc">Best mood first</option>
        </select>
      </div>
      <div class="tl5-filter-summary" id="tl5FilterSummary"></div>
    `;

    listWrap.insertBefore(bar, listWrap.firstChild);

    // Bind filter controls
    el('tl5FCountry').addEventListener('change',  e => { filterCountry   = e.target.value;              renderTripList(); });
    el('tl5FCompanion').addEventListener('change',e => { filterCompanion = e.target.value.toLowerCase(); renderTripList(); });
    el('tl5FTag').addEventListener('change',       e => { filterTag       = e.target.value.toLowerCase(); renderTripList(); });
    el('tl5FMood').addEventListener('change',      e => { filterMood      = Number(e.target.value);       renderTripList(); });
    el('tl5FYear').addEventListener('change',      e => { filterYear      = e.target.value;               renderTripList(); });
    el('tl5FSort').addEventListener('change',      e => { sortKey         = e.target.value;               renderTripList(); });
  }

  function refreshFilterOptions() {
    const opts = buildFilterOptions();

    // Country
    const cSel = el('tl5FCountry');
    if (cSel) {
      const prev = cSel.value;
      cSel.innerHTML = '<option value="">All countries</option>';
      opts.countries.forEach(([id, name]) => {
        const o = document.createElement('option');
        o.value = id; o.textContent = name;
        cSel.appendChild(o);
      });
      cSel.value = prev;
    }

    // Companion
    const compSel = el('tl5FCompanion');
    if (compSel) {
      const prev = compSel.value;
      compSel.innerHTML = '<option value="">All companions</option>';
      opts.companions.forEach(c => {
        const o = document.createElement('option');
        o.value = c; o.textContent = c;
        compSel.appendChild(o);
      });
      compSel.value = prev;
    }

    // Tags
    const tagSel = el('tl5FTag');
    if (tagSel) {
      const prev = tagSel.value;
      tagSel.innerHTML = '<option value="">All tags</option>';
      opts.tags.forEach(t => {
        const o = document.createElement('option');
        o.value = t; o.textContent = t;
        tagSel.appendChild(o);
      });
      tagSel.value = prev;
    }

    // Years
    const yrSel = el('tl5FYear');
    if (yrSel) {
      const prev = yrSel.value;
      yrSel.innerHTML = '<option value="">All years</option>';
      opts.years.forEach(y => {
        const o = document.createElement('option');
        o.value = y; o.textContent = y;
        yrSel.appendChild(o);
      });
      yrSel.value = prev;
    }
  }

  function updateFilterSummary(shown, total) {
    const summary = el('tl5FilterSummary');
    if (!summary) return;
    const hasFilter = filterCountry || filterCompanion || filterTag || filterMood || filterYear;
    if (!hasFilter) { summary.textContent = `${total} trip${total !== 1 ? 's' : ''}`; return; }
    summary.textContent = `Showing ${shown} of ${total} trip${total !== 1 ? 's' : ''}`;
  }

  // ── Detail panel ─────────────────────────────────────────────────────────────

  function buildDetailPanel(trip) {
    const duration     = window.TripStore.getTripDuration(trip);
    const allTrips     = window.TripStore.getTrips();

    // Per-country day breakdown
    const countryRows = (trip.countries || []).map(id => {
      const name = getCountryNameById(id) || id;
      const days = window.TripStore.getDaysInCountry(trip, id);
      const isFirst = (() => {
        const firstTrip = window.TripStore.getFirstVisitTrip(id);
        return firstTrip && firstTrip.id === trip.id;
      })();
      const flag = flagImg(name);
      return `
        <div class="tl5-detail-country-row">
          <span class="tl5-detail-flag-name">${flag}<span>${name}</span></span>
          <span class="tl5-detail-days">${days} day${days !== 1 ? 's' : ''}</span>
          ${isFirst ? '<span class="tl5-first-badge">⭐ First visit</span>' : ''}
        </div>`;
    }).join('');

    // Wonders
    const wondersHtml = trip.wonders && trip.wonders.length
      ? `<div class="tl5-detail-section">
           <div class="tl5-detail-section-title">Wonders visited</div>
           <div class="tl5-detail-wonders">
             ${trip.wonders.map(w => `<span class="tl5-wonder-tag">🏛 ${w}</span>`).join('')}
           </div>
         </div>`
      : '';

    // Companions
    const companionsHtml = trip.companions && trip.companions.length
      ? `<div class="tl5-detail-meta-item">
           <span class="tl5-detail-meta-label">With</span>
           <span>${trip.companions.join(', ')}</span>
         </div>`
      : '';

    // Transport
    const transportHtml = trip.transport
      ? `<div class="tl5-detail-meta-item">
           <span class="tl5-detail-meta-label">Transport</span>
           <span>${trip.transport}</span>
         </div>`
      : '';

    // Tags
    const tagsHtml = trip.tags && trip.tags.length
      ? `<div class="tl5-detail-meta-item">
           <span class="tl5-detail-meta-label">Tags</span>
           <span>${trip.tags.map(t => `<span class="tl-item-tag">${t}</span>`).join(' ')}</span>
         </div>`
      : '';

    // Notes
    const notesHtml = trip.notes
      ? `<div class="tl5-detail-section">
           <div class="tl5-detail-section-title">Notes</div>
           <div class="tl5-detail-notes">${trip.notes.replace(/\n/g, '<br>')}</div>
         </div>`
      : '';

    // Budget
    let budgetHtml = '';
    if (trip.budget && (trip.budget.total || trip.budget.planned)) {
      const b = trip.budget;
      const daysTotal = duration || 1;
      const perDay = b.total ? Math.round(b.total / daysTotal) : null;
      const diff    = (b.total && b.planned) ? b.total - b.planned : null;
      const diffStr = diff !== null
        ? `<span class="tl5-budget-diff ${diff > 0 ? 'over' : 'under'}">
             ${diff > 0 ? '↑' : '↓'} ${b.currency} ${Math.abs(diff).toLocaleString()}
             ${diff > 0 ? 'over' : 'under'} budget
           </span>`
        : '';

      const breakdownHtml = b.breakdown && Object.keys(b.breakdown).length
        ? `<div class="tl5-budget-breakdown">
             ${Object.entries(b.breakdown).map(([cat, val]) =>
               `<div class="tl5-budget-cat">
                  <span class="tl5-budget-cat-name">${cat}</span>
                  <span class="tl5-budget-cat-val">${b.currency} ${Number(val).toLocaleString()}</span>
                </div>`
             ).join('')}
           </div>`
        : '';

      budgetHtml = `
        <div class="tl5-detail-section">
          <div class="tl5-detail-section-title">Budget</div>
          <div class="tl5-budget-row">
            ${b.total    ? `<div class="tl5-budget-num"><div class="tl5-budget-val">${b.currency} ${Number(b.total).toLocaleString()}</div><div class="tl5-budget-sublabel">total spent</div></div>` : ''}
            ${b.planned  ? `<div class="tl5-budget-num"><div class="tl5-budget-val">${b.currency} ${Number(b.planned).toLocaleString()}</div><div class="tl5-budget-sublabel">planned</div></div>` : ''}
            ${perDay     ? `<div class="tl5-budget-num"><div class="tl5-budget-val">${b.currency} ${perDay}</div><div class="tl5-budget-sublabel">per day</div></div>` : ''}
          </div>
          ${diffStr}
          ${breakdownHtml}
        </div>`;
    }

    return `
      <div class="tl5-detail-panel">

        <!-- Country breakdown -->
        <div class="tl5-detail-section">
          <div class="tl5-detail-section-title">Countries &amp; days</div>
          <div class="tl5-detail-countries">${countryRows}</div>
          ${trip.countryDays
            ? '<div class="tl5-days-note">Days specified manually</div>'
            : '<div class="tl5-days-note">Days split equally across countries</div>'}
        </div>

        <!-- Meta row -->
        <div class="tl5-detail-meta">
          ${companionsHtml}
          ${transportHtml}
          ${tagsHtml}
        </div>

        ${wondersHtml}
        ${notesHtml}
        ${budgetHtml}

      </div>`;
  }

  // ── Main render ──────────────────────────────────────────────────────────────

  function renderTripList() {
    const list  = el('tlList');
    const empty = el('tlEmpty');
    if (!list || !empty) return;

    ensureFilterBar();
    refreshFilterOptions();

    const allTrips     = window.TripStore.getTrips(); // already sorted date_desc
    const sorted       = applySort(allTrips);
    const filtered     = applyFilters(sorted);

    list.innerHTML = '';
    empty.style.display = allTrips.length === 0 ? 'flex' : 'none';
    updateFilterSummary(filtered.length, allTrips.length);

    if (allTrips.length > 0 && filtered.length === 0) {
      list.innerHTML = `<li class="tl5-no-results">No trips match the current filters.</li>`;
      return;
    }

    filtered.forEach(trip => {
      const duration     = window.TripStore.getTripDuration(trip);
      const moodLabel    = trip.mood ? MOOD_LABELS[trip.mood] : '';
      const moodColor    = trip.mood ? MOOD_COLORS[trip.mood] : '';
      const budgetStr    = trip.budget && trip.budget.total
        ? `${trip.budget.currency} ${Number(trip.budget.total).toLocaleString()}` : '';
      const isExpanded   = expandedTripId === trip.id;

      // Country flags row
      const flagsHtml = (trip.countries || []).map(id => {
        const name = getCountryNameById(id) || '';
        return flagImg(name);
      }).join('');

      // First visit badges on list item (subtle)
      const firstBadges = (trip.countries || []).filter(id => {
        const ft = window.TripStore.getFirstVisitTrip(id);
        return ft && ft.id === trip.id;
      });
      const firstBadgeHtml = firstBadges.length
        ? `<span class="tl5-first-pill" title="First visit to ${firstBadges.map(id => getCountryNameById(id)).join(', ')}">⭐ First visit</span>`
        : '';

      const li = document.createElement('li');
      li.className = `tl5-list-item${isExpanded ? ' tl5-expanded' : ''}`;
      li.dataset.id = trip.id;

      li.innerHTML = `
        <!-- ── Summary row (always visible) ── -->
        <div class="tl5-summary" role="button" tabindex="0" aria-expanded="${isExpanded}">
          <div class="tl5-summary-main">
            <div class="tl5-summary-top">
              <span class="tl5-item-title">${trip.title}</span>
              ${firstBadgeHtml}
            </div>
            <div class="tl5-item-meta">
              <span class="tl5-item-dates">${formatDateRange(trip.dateFrom, trip.dateTo)}</span>
              <span class="tl5-item-dur">${duration} day${duration !== 1 ? 's' : ''}</span>
              ${moodLabel  ? `<span class="tl5-item-mood" style="color:${moodColor}">${moodLabel}</span>` : ''}
              ${budgetStr  ? `<span class="tl5-item-budget">💰 ${budgetStr}</span>`                        : ''}
            </div>
            <div class="tl5-item-flags">${flagsHtml}</div>
            ${trip.tags && trip.tags.length
              ? `<div class="tl-item-tags">${trip.tags.map(t =>
                  `<span class="tl-item-tag">${t}</span>`).join('')}</div>`
              : ''}
          </div>
          <div class="tl5-summary-right">
            <span class="tl5-chevron">${isExpanded ? '▴' : '▾'}</span>
          </div>
        </div>

        <!-- ── Detail panel (shown when expanded) ── -->
        <div class="tl5-detail-wrap" style="display:${isExpanded ? 'block' : 'none'}">
          ${isExpanded ? buildDetailPanel(trip) : ''}
          <div class="tl5-detail-actions">
            <button class="tl5-edit-btn"   data-id="${trip.id}">✎ Edit</button>
            <button class="tl5-delete-btn" data-id="${trip.id}">🗑 Delete</button>
          </div>
        </div>
      `;

      // Toggle expand / collapse
      li.querySelector('.tl5-summary').addEventListener('click', e => {
        // Don't toggle if clicking an action button
        if (e.target.closest('.tl5-edit-btn, .tl5-delete-btn')) return;
        const wasExpanded = expandedTripId === trip.id;
        expandedTripId = wasExpanded ? null : trip.id;
        renderTripList();
      });

      // Keyboard support
      li.querySelector('.tl5-summary').addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          expandedTripId = expandedTripId === trip.id ? null : trip.id;
          renderTripList();
        }
      });

      // Edit
      const editBtn = li.querySelector('.tl5-edit-btn');
      if (editBtn) {
        editBtn.addEventListener('click', e => {
          e.stopPropagation();
          // Remember which countries were on the trip BEFORE editing
          const prevCountries = [...(trip.countries || [])];
          window._editingPrevCountries = prevCountries;
          window.openTripForm(trip.id);
        });
      }

      // Delete
      const deleteBtn = li.querySelector('.tl5-delete-btn');
      if (deleteBtn) {
        deleteBtn.addEventListener('click', e => {
          e.stopPropagation();
          if (!confirm(`Delete "${trip.title}"? This cannot be undone.`)) return;
          if (expandedTripId === trip.id) expandedTripId = null;
          window.TripStore.deleteTrip(trip.id);
          syncOnDelete(trip);
          renderTripList();
        });
      }

      list.appendChild(li);
    });
  }

  // ── Handle edit with country change sync ────────────────────────────────────
  // When a trip is edited and countries change, we need to:
  //   1. Sync new countries as 'been'
  //   2. Re-check removed countries — revert if no other trip covers them
  //
  // We patch syncOnSave to handle this automatically by comparing
  // the saved trip's countries vs the previous countries stored before edit.

  const _origSyncOnSave = window.syncCountryStatusOnTripSave;

  window._patchedSyncOnSave = function(trip) {
    // Run the base sync first (marks all trip countries as been/trip)
    if (window.syncCountryStatusOnTripSave) {
      window.syncCountryStatusOnTripSave(trip);
    } else {
      (trip.countries || []).forEach(id => window.setCountryState(id, 'been', 'trip'));
      localStorage.setItem(window.STORAGE_KEYS.states, JSON.stringify(window.states));
    }

    // Now handle removed countries (countries that were in the old version but not the new)
    const prev = window._editingPrevCountries || [];
    const curr = trip.countries || [];
    const removed = prev.filter(id => !curr.includes(id));

    removed.forEach(id => {
      const remaining = window.TripStore.getTripsForCountry(id);
      if (remaining.length === 0) {
        // No other trips cover this country — check if manually marked
        const src = window.getCountrySource(id);
        if (src === 'trip') {
          window.setCountryState(id, 'neutral', 'manual');
        }
        // If src === 'manual', leave it alone
      }
      // If other trips still cover it, status stays 'been'
    });

    window._editingPrevCountries = null;
    localStorage.setItem(window.STORAGE_KEYS.states, JSON.stringify(window.states));
    refreshMap();
    if (window.updateStats) window.updateStats();
  };

  // ── Override triplog.js renderTripList with this richer version ──────────────

  window.renderTripList = renderTripList;

  // Also expose a refresh alias for console use
  window.refreshTripList = renderTripList;

  // ── Initial render when tab is already open ──────────────────────────────────

  // If the trip log tab is already initialized, render immediately
  if (el('tlList')) renderTripList();

})();
