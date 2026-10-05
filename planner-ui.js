/**
 * planner-ui.js — Trip Planner, Work Package P2
 *
 * Tab shell, plan list with expandable detail cards, filter/sort bar,
 * empty state, and delete / mark-complete actions.
 *
 * Strategy: matches the triplog.js + triplist.js split exactly.
 *   - initPlanner()      builds the DOM shell once (like initTripLog)
 *   - renderPlanList()   re-renders the list on every data change
 *   - openPlanForm(id?)  will be implemented in WP-P3 (form)
 *                        stub is exposed here so cards can call it safely
 *
 * Load order in index.html (after planner.js):
 *   migration.js → planner.js → trips.js → map.js → stats.js → wonders.js
 *   → triplog.js → triplist.js → tripstats.js → planner-ui.js → compat.js
 *
 * Exposes:
 *   window.initPlanner()        — called by the tab switcher in index.html
 *   window.renderPlanList()     — called after every save / delete
 *   window.openPlanForm(id?)    — stub, overridden by WP-P3
 */

(function () {

  // ── Country → ISO alpha-2 (shared with triplist.js) ──────────────────────────

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

  let filterStatus  = '';        // '' | 'planned' | 'completed'
  let filterTier    = '';        // '' | 'budget' | 'mid' | 'luxury'
  let sortKey       = 'date_asc'; // 'date_asc' | 'date_desc' | 'budget_desc'
  let expandedPlanId = null;

  // ── DOM helper ───────────────────────────────────────────────────────────────

  function el(id) { return document.getElementById(id); }

  // ── Helpers ──────────────────────────────────────────────────────────────────

  function flagImg(countryName) {
    const code = NAME_TO_CODE[countryName];
    if (!code) return '';
    return `<img class="pp-flag" src="https://flagcdn.com/w20/${code}.png"
                 alt="${countryName}" title="${countryName}"
                 onerror="this.style.display='none'" />`;
  }

  function formatDate(iso) {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  function formatDateRange(start, end) {
    const s = formatDate(start);
    const e = formatDate(end);
    if (!s) return '';
    return e && e !== s ? `${s} – ${e}` : s;
  }

  function fmt(n) {
    return Number(n).toLocaleString('en-GB');
  }

  const TIER_LABELS = { budget: '🎒 Budget', mid: '✈️ Mid-range', luxury: '💎 Luxury' };
  const TIER_CLASSES = { budget: 'pp-tier-budget', mid: 'pp-tier-mid', luxury: 'pp-tier-luxury' };

  // ── Filter / sort helpers ────────────────────────────────────────────────────

  function applyFilters(plans) {
    return plans.filter(p => {
      if (filterStatus && p.status !== filterStatus) return false;
      if (filterTier   && p.tier   !== filterTier)   return false;
      return true;
    });
  }

  function applySort(plans) {
    return plans.slice().sort((a, b) => {
      switch (sortKey) {
        case 'date_desc':
          return a.dateStart > b.dateStart ? -1 : a.dateStart < b.dateStart ? 1 : 0;
        case 'budget_desc': {
          const ba = window.PlanStore.calcBudget(a).total;
          const bb = window.PlanStore.calcBudget(b).total;
          return bb - ba;
        }
        case 'date_asc':
        default:
          return a.dateStart < b.dateStart ? -1 : a.dateStart > b.dateStart ? 1 : 0;
      }
    });
  }

  // ── Filter bar ────────────────────────────────────────────────────────────────

  function ensureFilterBar() {
    if (el('ppFilterBar')) return;

    const listWrap = el('ppListWrap');
    if (!listWrap) return;

    const bar = document.createElement('div');
    bar.id        = 'ppFilterBar';
    bar.className = 'pp-filter-bar';
    bar.innerHTML = `
      <div class="pp-filter-row">
        <select class="pp-filter-select" id="ppFStatus" title="Filter by status">
          <option value="">All statuses</option>
          <option value="planned">Planned</option>
          <option value="completed">Completed</option>
        </select>
        <select class="pp-filter-select" id="ppFTier" title="Filter by tier">
          <option value="">All tiers</option>
          <option value="budget">🎒 Budget</option>
          <option value="mid">✈️ Mid-range</option>
          <option value="luxury">💎 Luxury</option>
        </select>
        <select class="pp-filter-select" id="ppFSort" title="Sort">
          <option value="date_asc">Soonest first</option>
          <option value="date_desc">Latest first</option>
          <option value="budget_desc">Highest budget first</option>
        </select>
      </div>
      <div class="pp-filter-summary" id="ppFilterSummary"></div>
    `;

    listWrap.insertBefore(bar, listWrap.firstChild);

    el('ppFStatus').addEventListener('change', e => { filterStatus = e.target.value; renderPlanList(); });
    el('ppFTier').addEventListener('change',   e => { filterTier   = e.target.value; renderPlanList(); });
    el('ppFSort').addEventListener('change',   e => { sortKey      = e.target.value; renderPlanList(); });
  }

  function updateFilterSummary(shown, total) {
    const summary = el('ppFilterSummary');
    if (!summary) return;
    const hasFilter = filterStatus || filterTier;
    if (!hasFilter) {
      summary.textContent = `${total} plan${total !== 1 ? 's' : ''}`;
      return;
    }
    summary.textContent = `Showing ${shown} of ${total} plan${total !== 1 ? 's' : ''}`;
  }

  // ── Detail panel ─────────────────────────────────────────────────────────────

  function buildDetailPanel(plan) {
    const budget = window.PlanStore.calcBudget(plan);

    // ── Stops ──────────────────────────────────────────────────────────────────
    const stopsHtml = plan.stops && plan.stops.length
      ? plan.stops.map(stop => {
          const flag = flagImg(stop.country);
          const costs = [];
          if (stop.dailyRate > 0) {
            costs.push(`${fmt(stop.nights * stop.dailyRate)} EUR living`);
          }
          if (stop.flightCost > 0) {
            costs.push(`${fmt(stop.flightCost)} EUR flight${stop.flightIncluded ? ' (incl.)' : ''}`);
          }
          return `
            <div class="pp-stop-row">
              <span class="pp-stop-flag-name">${flag}<span>${stop.country}</span></span>
              <div class="pp-stop-right">
                <span class="pp-stop-nights">${stop.nights} night${stop.nights !== 1 ? 's' : ''}</span>
                ${costs.length ? `<div class="pp-stop-costs">${costs.map(c => `<span class="pp-stop-cost-item">${c}</span>`).join('')}</div>` : ''}
              </div>
            </div>`;
        }).join('')
      : '<div style="font-size:13px;color:#aaa;font-style:italic">No stops defined yet.</div>';

    // ── Budget summary ─────────────────────────────────────────────────────────
    const budgetHtml = budget.total > 0
      ? `<div class="pp-budget-grid">
           <div class="pp-budget-card pp-budget-total">
             <div class="pp-budget-card-val">€ ${fmt(budget.total)}</div>
             <div class="pp-budget-card-label">Total est.</div>
           </div>
           ${budget.accommodation > 0 ? `
           <div class="pp-budget-card">
             <div class="pp-budget-card-val">€ ${fmt(budget.accommodation)}</div>
             <div class="pp-budget-card-label">Living</div>
           </div>` : ''}
           ${budget.flights > 0 ? `
           <div class="pp-budget-card">
             <div class="pp-budget-card-val">€ ${fmt(budget.flights)}</div>
             <div class="pp-budget-card-label">Flights</div>
           </div>` : ''}
           ${budget.wonders > 0 ? `
           <div class="pp-budget-card">
             <div class="pp-budget-card-val">€ ${fmt(budget.wonders)}</div>
             <div class="pp-budget-card-label">Wonders</div>
           </div>` : ''}
         </div>`
      : '<div style="font-size:13px;color:#aaa;font-style:italic">No budget data yet.</div>';

    // ── Wonders ────────────────────────────────────────────────────────────────
    const includedWonders = (plan.wonderAddons || []).filter(w => w.included);
    const wondersHtml = includedWonders.length
      ? `<div class="pp-detail-section">
           <div class="pp-detail-section-title">Wonders to visit</div>
           <div class="pp-wonder-tags">
             ${includedWonders.map(w => `<span class="pp-wonder-tag">🏛 ${w.wonderName}</span>`).join('')}
           </div>
         </div>`
      : '';

    // ── Notes ──────────────────────────────────────────────────────────────────
    const notesHtml = plan.notes
      ? `<div class="pp-detail-section">
           <div class="pp-detail-section-title">Notes</div>
           <div class="pp-notes">${plan.notes.replace(/\n/g, '<br>')}</div>
         </div>`
      : '';

    return `
      <div class="pp-detail-panel">
        <div class="pp-detail-section">
          <div class="pp-detail-section-title">Stops</div>
          ${stopsHtml}
        </div>
        <div class="pp-detail-section">
          <div class="pp-detail-section-title">Estimated budget (EUR)</div>
          ${budgetHtml}
        </div>
        ${wondersHtml}
        ${notesHtml}
      </div>`;
  }

  // ── Main render ───────────────────────────────────────────────────────────────

  function renderPlanList() {
    const list  = el('ppList');
    const empty = el('ppEmpty');
    if (!list || !empty) return;

    ensureFilterBar();

    const allPlans  = window.PlanStore.getPlans();
    const sorted    = applySort(allPlans);
    const filtered  = applyFilters(sorted);

    list.innerHTML = '';
    empty.style.display = allPlans.length === 0 ? 'flex' : 'none';
    updateFilterSummary(filtered.length, allPlans.length);

    if (allPlans.length > 0 && filtered.length === 0) {
      list.innerHTML = `<li class="pp-no-results">No plans match the current filters.</li>`;
      return;
    }

    filtered.forEach(plan => {
      const nights     = window.PlanStore.getPlanNights(plan);
      const budget     = window.PlanStore.calcBudget(plan);
      const isExpanded = expandedPlanId === plan.id;
      const isCompleted = plan.status === 'completed';

      // Flag row from stops
      const flagsHtml = (plan.stops || []).map(s => flagImg(s.country)).join('');

      const li = document.createElement('li');
      li.className = [
        'pp-card',
        isExpanded  ? 'pp-expanded'  : '',
        isCompleted ? 'pp-completed' : '',
      ].filter(Boolean).join(' ');
      li.dataset.id = plan.id;

      li.innerHTML = `
        <div class="pp-status-stripe"></div>

        <!-- ── Summary row ── -->
        <div class="pp-summary" role="button" tabindex="0" aria-expanded="${isExpanded}">
          <div class="pp-summary-main">
            <div class="pp-summary-top">
              <span class="pp-card-name">${plan.name}</span>
              <span class="pp-tier-pill ${TIER_CLASSES[plan.tier] || 'pp-tier-mid'}">${TIER_LABELS[plan.tier] || plan.tier}</span>
              <span class="pp-status-pill pp-status-${plan.status}">${isCompleted ? '✓ Done' : '🗓 Planned'}</span>
            </div>
            <div class="pp-card-meta">
              <span class="pp-card-dates">${formatDateRange(plan.dateStart, plan.dateEnd)}</span>
              ${nights ? `<span class="pp-card-nights">${nights} night${nights !== 1 ? 's' : ''}</span>` : ''}
              ${budget.total > 0 ? `<span class="pp-card-budget">€ ${fmt(budget.total)} est.</span>` : ''}
            </div>
            ${flagsHtml ? `<div class="pp-card-flags">${flagsHtml}</div>` : ''}
          </div>
          <div class="pp-summary-right">
            <span class="pp-chevron">${isExpanded ? '▴' : '▾'}</span>
          </div>
        </div>

        <!-- ── Detail panel ── -->
        <div class="pp-detail-wrap" style="display:${isExpanded ? 'block' : 'none'}">
          ${isExpanded ? buildDetailPanel(plan) : ''}
          <div class="pp-detail-actions">
            <button class="pp-complete-btn${isCompleted ? ' pp-is-completed' : ''}" data-id="${plan.id}">
              ${isCompleted ? '↩ Mark planned' : '✓ Mark done'}
            </button>
            <button class="pp-edit-btn"   data-id="${plan.id}">✎ Edit</button>
            <button class="pp-delete-btn" data-id="${plan.id}">🗑 Delete</button>
          </div>
        </div>
      `;

      // Toggle expand / collapse on summary click
      li.querySelector('.pp-summary').addEventListener('click', e => {
        if (e.target.closest('.pp-complete-btn, .pp-edit-btn, .pp-delete-btn')) return;
        expandedPlanId = expandedPlanId === plan.id ? null : plan.id;
        renderPlanList();
      });

      // Keyboard
      li.querySelector('.pp-summary').addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          expandedPlanId = expandedPlanId === plan.id ? null : plan.id;
          renderPlanList();
        }
      });

      // Mark complete / undo
      li.querySelector('.pp-complete-btn').addEventListener('click', e => {
        e.stopPropagation();
        window.PlanStore.markCompleted(plan.id);
        renderPlanList();
      });

      // Edit — opens form (WP-P3 will override window.openPlanForm)
      li.querySelector('.pp-edit-btn').addEventListener('click', e => {
        e.stopPropagation();
        window.openPlanForm(plan.id);
      });

      // Delete
      li.querySelector('.pp-delete-btn').addEventListener('click', e => {
        e.stopPropagation();
        if (!confirm(`Delete "${plan.name}"? This cannot be undone.`)) return;
        if (expandedPlanId === plan.id) expandedPlanId = null;
        window.PlanStore.deletePlan(plan.id);
        renderPlanList();
      });

      list.appendChild(li);
    });
  }

  // ── Tab init (called once by index.html showTab) ─────────────────────────────

  window.initPlanner = function () {
    const container = el('plannerContent');
    if (!container || container.dataset.built) return;
    container.dataset.built = 'true';

    container.innerHTML = `
      <div class="pp-header">
        <h2 class="pp-title">Trip Planner</h2>
        <button class="pp-new-btn" id="ppNewBtn">＋ New Plan</button>
      </div>

      <div class="pp-list-wrap" id="ppListWrap">
        <div class="pp-empty" id="ppEmpty" style="display:none">
          <div class="pp-empty-icon">🗺️</div>
          <p class="pp-empty-text">No plans yet.</p>
          <p class="pp-empty-sub">Hit <strong>+ New Plan</strong> to start planning your next adventure.</p>
        </div>
        <ul class="pp-list" id="ppList"></ul>
      </div>
    `;

    el('ppNewBtn').addEventListener('click', () => window.openPlanForm());

    renderPlanList();
  };

  // ── Stub for WP-P3 (form) ────────────────────────────────────────────────────
  // WP-P3 will replace this with the real implementation.

  if (!window.openPlanForm) {
    window.openPlanForm = function (planId) {
      // Will be overridden by planner-form.js (WP-P3)
      console.info('[planner-ui] openPlanForm stub called — WP-P3 not loaded yet.', planId);
      alert('The plan form is not available yet (coming in WP-P3).');
    };
  }

  // ── Expose ────────────────────────────────────────────────────────────────────

  window.renderPlanList = renderPlanList;

})();
