/**
 * planner-form.js — Trip Planner, Work Package P3
 *
 * Plan entry form: create and edit TripPlan objects.
 * Overrides the window.openPlanForm stub set by planner-ui.js.
 *
 * Form fields
 * ───────────
 *  • Plan name (required)
 *  • Date range — start / end (required)
 *  • Tier — budget / mid / luxury (required, default mid)
 *  • Stops — ordered list of { country, nights, dailyRate, flightCost, flightIncluded }
 *      Country search autocomplete reuses window.nameIndex (same as triplog.js)
 *      Live budget preview updates as the user fills in costs
 *  • Wonder addons — checkbox list of relevant wonders with hardcoded fees
 *  • Notes — free text
 *
 * Reuses:
 *   tl-input / tl-label / tl-field / tl-error / tl-hint  (triplog.css)
 *   pp-form-*  (planner.css WP-P3 additions)
 *
 * Strategy: mirrors triplog.js exactly in structure.
 *   openPlanForm(id?) injects ppFormWrap if absent, populates fields,
 *   shows form, hides list. closeForm restores the list.
 *
 * Load order (after planner-ui.js):
 *   … → planner-ui.js → planner-form.js → compat.js
 *
 * Exposes:
 *   window.openPlanForm(planId?)  — overrides the stub in planner-ui.js
 */

(function () {

  // ── Constants ────────────────────────────────────────────────────────────────

  const TIER_OPTIONS = [
    { value: 'budget',  label: '🎒 Budget'    },
    { value: 'mid',     label: '✈️ Mid-range'  },
    { value: 'luxury',  label: '💎 Luxury'     },
  ];

  /**
   * Hardcoded entrance fees (EUR) per wonder name.
   * Approximate real-world figures; user can still add wonders with fee = 0.
   */
  const WONDER_FEES = {
    'Acropolis of Athens':       20,
    'Alhambra':                  14,
    'Angkor Wat':                37,
    'Borobudur':                 25,
    'Chichén Itzá':              27,
    'Christ the Redeemer':       17,
    'Colosseum':                 18,
    'Easter Island (Rapa Nui)':  80,
    'Eiffel Tower':              29,
    'Forbidden City':            15,
    'Galapagos Islands':        100,
    'Grand Canyon':              35,
    'Great Wall of China':       15,
    'Ha Long Bay':               60,
    'Hagia Sophia':               0,
    'Iguazu Falls':              20,
    'Komodo Island':             30,
    'Leaning Tower of Pisa':     18,
    'Machu Picchu':              45,
    'Mont Saint-Michel':         13,
    'Neuschwanstein Castle':     15,
    'Northern Lights':            0,
    'Pamukkale':                 12,
    'Patagonia':                  0,
    'Petra':                     77,
    'Pyramids of Giza':          16,
    'Sistine Chapel':            17,
    'Stonehenge':                24,
    'Sydney Opera House':        43,
    'Taj Mahal':                 15,
    'Terracotta Army':           24,
    'Torres del Paine':          35,
    'Uluru':                     38,
    'Victoria Falls':            30,
    'Yosemite National Park':    35,
  };

  // ── Form state ───────────────────────────────────────────────────────────────

  let editingPlanId   = null;
  let stops           = [];    // [{ country, nights, dailyRate, flightCost, flightIncluded }]
  let wonderAddons    = [];    // [{ wonderName, entranceFee, included }]

  // ── DOM helper ───────────────────────────────────────────────────────────────

  function el(id) { return document.getElementById(id); }

  // ── Ensure the planner tab shell is built before injecting the form ──────────

  function ensurePlannerShell() {
    if (!el('ppListWrap') && window.initPlanner) {
      // initPlanner is idempotent (dataset.built guard), safe to call
      window.initPlanner();
    }
  }

  // ── Ensure form wrap exists in the DOM ───────────────────────────────────────
  // Injected once between .pp-header and #ppListWrap.

  function ensureFormWrap() {
    if (el('ppFormWrap')) return;

    const container = el('plannerContent');
    if (!container) return;

    const listWrap = el('ppListWrap');

    const wrap = document.createElement('div');
    wrap.id        = 'ppFormWrap';
    wrap.className = 'pp-form-wrap';
    wrap.style.display = 'none';

    wrap.innerHTML = `
      <div class="pp-form-header">
        <span class="pp-form-heading" id="ppFormHeading">New Plan</span>
        <button class="pp-form-close" id="ppFormClose" title="Discard">✕</button>
      </div>

      <div class="pp-form" id="ppForm">

        <!-- Plan name -->
        <div class="tl-field">
          <label class="tl-label" for="ppName">Plan name <span class="tl-req">*</span></label>
          <input class="tl-input" id="ppName" type="text"
                 placeholder="e.g. Japan Spring 2026" maxlength="80" />
          <div class="tl-error" id="ppNameErr"></div>
        </div>

        <!-- Date range -->
        <div class="tl-field">
          <div class="tl-row">
            <div class="tl-col">
              <label class="tl-label" for="ppDateStart">From <span class="tl-req">*</span></label>
              <input class="tl-input" id="ppDateStart" type="date" />
            </div>
            <div class="tl-col">
              <label class="tl-label" for="ppDateEnd">To <span class="tl-req">*</span></label>
              <input class="tl-input" id="ppDateEnd" type="date" />
            </div>
          </div>
          <div class="tl-error" id="ppDateErr"></div>
        </div>

        <!-- Tier -->
        <div class="tl-field">
          <label class="tl-label">Travel tier</label>
          <div class="tl-option-group" id="ppTierOptions"></div>
        </div>

        <!-- Stops -->
        <div class="tl-field">
          <label class="tl-label">Stops <span class="tl-req">*</span></label>
          <p class="tl-hint">Add countries in order. Set nights and daily spend per stop to build your budget estimate.</p>
          <div id="ppStopList" class="pp-stop-list"></div>
          <div class="tl-search-wrap" style="margin-top:8px; position:relative">
            <input class="tl-input" id="ppStopSearch" type="text"
                   placeholder="Search and add a country stop…" autocomplete="off" />
            <ul class="tl-suggestions" id="ppStopSuggestions" style="display:none"></ul>
          </div>
          <div class="tl-error" id="ppStopsErr"></div>
        </div>

        <!-- Live budget preview -->
        <div id="ppBudgetPreview" style="display:none"></div>

        <!-- Wonder addons -->
        <div class="tl-field" id="ppWondersWrap" style="display:none">
          <label class="tl-label">Wonders to visit</label>
          <p class="tl-hint">Tick wonders relevant to your stops to add entrance fees to the estimate.</p>
          <div id="ppWonderAddonList" class="pp-wonder-addon-list"></div>
        </div>

        <!-- Notes -->
        <div class="tl-field">
          <label class="tl-label" for="ppNotes">Notes</label>
          <textarea class="tl-textarea" id="ppNotes" rows="3"
                    placeholder="Ideas, must-sees, reminders…"></textarea>
        </div>

        <!-- Actions -->
        <div class="pp-form-actions">
          <button class="pp-cancel-btn" id="ppCancelBtn" type="button">Cancel</button>
          <button class="pp-save-btn"   id="ppSaveBtn"   type="button">Save Plan</button>
        </div>

      </div>
    `;

    if (listWrap) container.insertBefore(wrap, listWrap);
    else container.appendChild(wrap);

    bindFormEvents();
  }

  // ── Open / close ─────────────────────────────────────────────────────────────

  window.openPlanForm = function (planId) {
    ensurePlannerShell();
    ensureFormWrap();

    editingPlanId = planId || null;
    stops         = [];
    wonderAddons  = [];

    el('ppFormHeading').textContent = editingPlanId ? 'Edit Plan' : 'New Plan';
    clearErrors();
    resetFormFields();

    if (editingPlanId) {
      const plan = window.PlanStore.getPlanById(editingPlanId);
      if (plan) populateForm(plan);
    }

    // Render tier buttons (idempotent)
    renderTierOptions();

    el('ppFormWrap').style.display = 'block';
    el('ppListWrap').style.display = 'none';
    el('ppNewBtn').style.display   = 'none';
  };

  function closeForm() {
    if (el('ppFormWrap')) el('ppFormWrap').style.display = 'none';
    if (el('ppListWrap')) el('ppListWrap').style.display = 'block';
    if (el('ppNewBtn'))   el('ppNewBtn').style.display   = 'flex';
    editingPlanId = null;
  }

  // ── Bind events (once, after ensureFormWrap) ──────────────────────────────────

  function bindFormEvents() {
    el('ppFormClose').addEventListener('click', () => {
      if (confirm('Discard changes?')) closeForm();
    });
    el('ppCancelBtn').addEventListener('click', () => {
      if (confirm('Discard changes?')) closeForm();
    });
    el('ppSaveBtn').addEventListener('click', handleSave);

    el('ppDateStart').addEventListener('change', updateBudgetPreview);
    el('ppDateEnd').addEventListener('change',   updateBudgetPreview);

    // Country stop search
    const searchInput = el('ppStopSearch');
    const suggList    = el('ppStopSuggestions');

    searchInput.addEventListener('input', () => {
      const q = searchInput.value.trim().toLowerCase();
      suggList.innerHTML = '';
      if (!q || !window.nameIndex) { suggList.style.display = 'none'; return; }

      const alreadyAdded = new Set(stops.map(s => s.country));
      const matches = Object.entries(window.nameIndex)
        .filter(([key, f]) => key.includes(q) && !alreadyAdded.has(f.properties.displayName))
        .slice(0, 8);

      if (!matches.length) { suggList.style.display = 'none'; return; }

      matches.forEach(([, f]) => {
        const li = document.createElement('li');
        li.className   = 'tl-suggestion-item';
        li.textContent = f.properties.displayName;
        li.addEventListener('mousedown', e => {
          e.preventDefault();
          addStop(f.properties.displayName);
          searchInput.value       = '';
          suggList.style.display  = 'none';
        });
        suggList.appendChild(li);
      });
      suggList.style.display = 'block';
    });

    searchInput.addEventListener('blur', () => {
      setTimeout(() => { suggList.style.display = 'none'; }, 150);
    });
  }

  // ── Populate form (edit mode) ────────────────────────────────────────────────

  function populateForm(plan) {
    el('ppName').value      = plan.name      || '';
    el('ppDateStart').value = plan.dateStart || '';
    el('ppDateEnd').value   = plan.dateEnd   || '';
    el('ppNotes').value     = plan.notes     || '';

    // Tier
    _currentTier = plan.tier || 'mid';
    renderTierOptions();

    // Stops
    stops = (plan.stops || []).map(s => ({ ...s }));
    renderStopList();

    // Wonders
    wonderAddons = (plan.wonderAddons || []).map(w => ({ ...w }));
    refreshWonderAddons();

    updateBudgetPreview();
  }

  // ── Reset form fields ────────────────────────────────────────────────────────

  let _currentTier = 'mid';

  function resetFormFields() {
    el('ppName').value      = '';
    el('ppDateStart').value = '';
    el('ppDateEnd').value   = '';
    el('ppNotes').value     = '';
    _currentTier = 'mid';
    renderTierOptions();

    stops        = [];
    wonderAddons = [];
    renderStopList();
    refreshWonderAddons();
    updateBudgetPreview();
  }

  // ── Tier selector ────────────────────────────────────────────────────────────

  function renderTierOptions() {
    const wrap = el('ppTierOptions');
    if (!wrap) return;
    wrap.innerHTML = '';
    TIER_OPTIONS.forEach(({ value, label }) => {
      const btn = document.createElement('button');
      btn.type      = 'button';
      btn.className = `tl-option-btn${_currentTier === value ? ' active' : ''}`;
      btn.textContent = label;
      btn.addEventListener('click', () => {
        _currentTier = value;
        renderTierOptions();
      });
      wrap.appendChild(btn);
    });
  }

  // ── Stop management ──────────────────────────────────────────────────────────

  function addStop(countryName) {
    stops.push({
      country:        countryName,
      nights:         3,
      dailyRate:      0,
      flightCost:     0,
      flightIncluded: false,
    });
    renderStopList();
    refreshWonderAddons();
    clearError('ppStopsErr');
  }

  function removeStop(index) {
    stops.splice(index, 1);
    renderStopList();
    refreshWonderAddons();
    updateBudgetPreview();
  }

  function renderStopList() {
    const wrap = el('ppStopList');
    if (!wrap) return;
    wrap.innerHTML = '';

    if (!stops.length) {
      wrap.innerHTML = `<div style="font-size:13px;color:#aaa;font-style:italic;padding:4px 0">No stops yet — search for a country above.</div>`;
      updateBudgetPreview();
      return;
    }

    stops.forEach((stop, i) => {
      const div = document.createElement('div');
      div.className = 'pp-stop-builder';

      div.innerHTML = `
        <div class="pp-stop-builder-header">
          <span class="pp-stop-drag-handle">⠿</span>
          <span class="pp-stop-country-label">${stop.country}</span>
          <button class="pp-stop-remove-btn" type="button" title="Remove stop">✕</button>
        </div>
        <div class="pp-stop-fields">
          <div class="pp-stop-row-inputs">
            <div class="tl-col">
              <label class="tl-label" style="font-size:11px">Nights</label>
              <input class="tl-input" type="number" min="1" step="1"
                     id="ppStop_nights_${i}" value="${stop.nights}" style="width:70px" />
            </div>
            <div class="tl-col">
              <label class="tl-label" style="font-size:11px">Daily spend (€)</label>
              <input class="tl-input" type="number" min="0" step="1"
                     id="ppStop_rate_${i}" value="${stop.dailyRate || ''}" placeholder="0" />
            </div>
            <div class="tl-col">
              <label class="tl-label" style="font-size:11px">Flight cost (€)</label>
              <input class="tl-input" type="number" min="0" step="1"
                     id="ppStop_flight_${i}" value="${stop.flightCost || ''}" placeholder="0" />
            </div>
          </div>
          <label class="pp-flight-toggle">
            <input type="checkbox" id="ppStop_incl_${i}" ${stop.flightIncluded ? 'checked' : ''} />
            Flight already included in another cost
          </label>
          <div class="pp-stop-cost-total" id="ppStop_total_${i}"></div>
        </div>
      `;

      // Remove button
      div.querySelector('.pp-stop-remove-btn').addEventListener('click', () => removeStop(i));

      // Live-sync inputs back to stops[]
      const syncStop = () => {
        stops[i].nights         = Math.max(1, parseInt(el(`ppStop_nights_${i}`).value) || 1);
        stops[i].dailyRate      = parseFloat(el(`ppStop_rate_${i}`).value)    || 0;
        stops[i].flightCost     = parseFloat(el(`ppStop_flight_${i}`).value)  || 0;
        stops[i].flightIncluded = el(`ppStop_incl_${i}`).checked;
        updateStopTotal(i);
        updateBudgetPreview();
      };

      ['nights','rate','flight'].forEach(field => {
        el(`ppStop_${field}_${i}`).addEventListener('input', syncStop);
      });
      el(`ppStop_incl_${i}`).addEventListener('change', syncStop);

      wrap.appendChild(div);
      updateStopTotal(i);
    });

    updateBudgetPreview();
  }

  function updateStopTotal(i) {
    const stop  = stops[i];
    const total = el(`ppStop_total_${i}`);
    if (!total || !stop) return;
    const living = (stop.nights || 0) * (stop.dailyRate || 0);
    const flight = stop.flightIncluded ? 0 : (stop.flightCost || 0);
    const sum    = living + flight;
    total.textContent = sum > 0 ? `Stop total: € ${fmt(sum)}` : '';
  }

  // ── Wonder addons ────────────────────────────────────────────────────────────

  function refreshWonderAddons() {
    const wrap = el('ppWondersWrap');
    const list = el('ppWonderAddonList');
    if (!wrap || !list) return;

    const countryNames = stops.map(s => s.country);
    const suggestions  = window.TripStore
      ? window.TripStore.getWonderSuggestionsForCountries(countryNames)
      : (window.WONDERS_ALL || []).filter(w => {
          const wCountries = w.land.split(',').map(l => l.trim().toLowerCase());
          return countryNames.some(cn => wCountries.includes(cn.toLowerCase()));
        });

    if (!suggestions.length) { wrap.style.display = 'none'; return; }
    wrap.style.display = 'block';

    // Reconcile wonderAddons with current suggestions
    const suggNames = new Set(suggestions.map(w => w.name));

    // Remove addons no longer relevant
    wonderAddons = wonderAddons.filter(a => suggNames.has(a.wonderName));

    // Ensure every suggestion has an addon entry
    suggestions.forEach(w => {
      if (!wonderAddons.find(a => a.wonderName === w.name)) {
        wonderAddons.push({
          wonderName:   w.name,
          entranceFee:  WONDER_FEES[w.name] ?? 0,
          included:     false,
        });
      }
    });

    list.innerHTML = '';
    suggestions.forEach(w => {
      const addon   = wonderAddons.find(a => a.wonderName === w.name);
      const fee     = addon ? addon.entranceFee : (WONDER_FEES[w.name] ?? 0);
      const checked = addon ? addon.included : false;

      const label = document.createElement('label');
      label.className = `pp-wonder-addon-item${checked ? ' pp-wonder-checked' : ''}`;
      label.innerHTML = `
        <input type="checkbox" ${checked ? 'checked' : ''} />
        <span class="pp-wonder-addon-name">${w.name}</span>
        <span class="pp-wonder-addon-fee">${fee > 0 ? `€ ${fee}` : 'free'}</span>
      `;

      label.querySelector('input').addEventListener('change', e => {
        const a = wonderAddons.find(x => x.wonderName === w.name);
        if (a) {
          a.included = e.target.checked;
          label.classList.toggle('pp-wonder-checked', a.included);
          updateBudgetPreview();
        }
      });

      list.appendChild(label);
    });

    updateBudgetPreview();
  }

  // ── Budget preview ────────────────────────────────────────────────────────────

  function fmt(n) { return Number(n).toLocaleString('en-GB'); }

  function updateBudgetPreview() {
    const previewEl = el('ppBudgetPreview');
    if (!previewEl) return;

    const draft = {
      stops:        stops,
      wonderAddons: wonderAddons,
    };
    const b = window.PlanStore ? window.PlanStore.calcBudget(draft) : { accommodation: 0, flights: 0, wonders: 0, total: 0 };

    if (b.total === 0) {
      previewEl.style.display = 'none';
      return;
    }

    previewEl.style.display = 'block';
    previewEl.innerHTML = `
      <div class="pp-budget-preview">
        <div>
          <div class="pp-budget-preview-total">€ ${fmt(b.total)}</div>
          <div style="font-size:11px;color:#888;text-transform:uppercase;letter-spacing:.05em">Est. total</div>
        </div>
        <div class="pp-budget-preview-breakdown">
          ${b.accommodation > 0 ? `<span class="pp-budget-preview-item">Living <strong>€ ${fmt(b.accommodation)}</strong></span>` : ''}
          ${b.flights       > 0 ? `<span class="pp-budget-preview-item">Flights <strong>€ ${fmt(b.flights)}</strong></span>`       : ''}
          ${b.wonders       > 0 ? `<span class="pp-budget-preview-item">Wonders <strong>€ ${fmt(b.wonders)}</strong></span>`       : ''}
        </div>
      </div>
    `;
  }

  // ── Validation ───────────────────────────────────────────────────────────────

  function validate() {
    let ok = true;
    clearErrors();

    if (!el('ppName').value.trim()) {
      showError('ppNameErr', 'Plan name is required.'); ok = false;
    }
    if (!el('ppDateStart').value) {
      showError('ppDateErr', 'Start date is required.'); ok = false;
    }
    if (!el('ppDateEnd').value) {
      showError('ppDateErr', 'End date is required.'); ok = false;
    }
    if (el('ppDateStart').value && el('ppDateEnd').value &&
        el('ppDateStart').value > el('ppDateEnd').value) {
      showError('ppDateErr', 'Start date must be on or before end date.'); ok = false;
    }
    if (stops.length === 0) {
      showError('ppStopsErr', 'Add at least one stop.'); ok = false;
    }

    return ok;
  }

  function showError(id, msg) {
    const e = el(id);
    if (e) { e.textContent = msg; e.style.display = 'block'; }
  }

  function clearError(id) {
    const e = el(id);
    if (e) { e.textContent = ''; e.style.display = 'none'; }
  }

  function clearErrors() {
    ['ppNameErr', 'ppDateErr', 'ppStopsErr'].forEach(clearError);
  }

  // ── Save ─────────────────────────────────────────────────────────────────────

  function handleSave() {
    if (!validate()) return;

    const planData = {
      id:           editingPlanId || undefined,
      name:         el('ppName').value.trim(),
      dateStart:    el('ppDateStart').value,
      dateEnd:      el('ppDateEnd').value,
      tier:         _currentTier,
      status:       editingPlanId
                      ? (window.PlanStore.getPlanById(editingPlanId)?.status || 'planned')
                      : 'planned',
      stops:        stops.map(s => ({ ...s })),
      wonderAddons: wonderAddons.filter(a => a.included).map(a => ({ ...a })),
      notes:        el('ppNotes').value.trim() || null,
    };

    const { success, errors } = window.PlanStore.savePlan(planData);

    if (!success) {
      showError('ppNameErr', errors.join(' · '));
      return;
    }

    closeForm();
    if (window.renderPlanList) window.renderPlanList();
  }

})();
