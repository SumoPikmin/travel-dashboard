/**
 * triplog.js — Work Package 4
 *
 * Trip Log tab: navigation shell, entry form, save / edit / cancel logic.
 * Depends on: migration.js, trips.js, wonders.js (for WONDERS_ALL)
 *
 * Load order in index.html:
 *   migration.js → trips.js → map.js → stats.js → wonders.js → triplog.js
 *
 * Exposes:
 *   window.initTripLog()          — called by tab switcher in index.html
 *   window.openTripForm(tripId?)  — open form for new trip or edit existing
 */

(function () {

  // ── Constants ────────────────────────────────────────────────────────────────

  const BASE_COMPANIONS = ['solo', 'partner', 'family', 'friends'];
  const BASE_TRANSPORT  = ['flight', 'car', 'train', 'bus', 'cruise', 'motorcycle', 'bicycle'];
  const CURRENCIES      = ['EUR','USD','GBP','CHF','JPY','AUD','CAD','SEK','NOK','DKK','SGD','AED','THB','MXN','BRL','INR'];
  const MOOD_LABELS     = ['', '😞 Terrible', '😕 Poor', '😐 Okay', '😊 Good', '🤩 Amazing'];

  // ── Form state ───────────────────────────────────────────────────────────────

  let editingTripId      = null;
  let formVisible        = false;
  let selectedCountries  = [];   // [{ id: string, name: string }]
  let selectedWonders    = [];   // [wonderName: string]
  let selectedCompanions = [];   // [string]
  let selectedTags       = [];   // [string]
  let selectedTransport  = null; // string | null
  let currentMood        = 0;

  // ── DOM helper ───────────────────────────────────────────────────────────────

  function el(id) { return document.getElementById(id); }

  // ── Country name / id lookups ────────────────────────────────────────────────

  function getCountryNameById(id) {
    if (!window.nameIndex) return null;
    const entry = Object.values(window.nameIndex).find(f => String(f.id) === String(id));
    return entry ? entry.properties.displayName : null;
  }

  // ── Date helpers ─────────────────────────────────────────────────────────────

  function tripDays(from, to) {
    if (!from || !to) return 0;
    const diff = Math.round((new Date(to) - new Date(from)) / 86400000);
    return diff + 1;
  }

  function formatDateRange(from, to) {
    if (!from) return '';
    const opts = { year: 'numeric', month: 'short', day: 'numeric' };
    const f = new Date(from).toLocaleDateString(undefined, opts);
    const t = to ? new Date(to).toLocaleDateString(undefined, opts) : '';
    return t && t !== f ? `${f} – ${t}` : f;
  }

  // ── WP3 sync bridge ──────────────────────────────────────────────────────────
  // Full sync lives in syncCountry.js (WP3). We call it if present,
  // otherwise fall back to a minimal inline sync so WP4 works standalone.

  function syncOnSave(trip) {
    if (window.syncCountryStatusOnTripSave) {
      window.syncCountryStatusOnTripSave(trip);
    } else {
      (trip.countries || []).forEach(id => window.setCountryState(id, 'been', 'trip'));
      localStorage.setItem(window.STORAGE_KEYS.states, JSON.stringify(window.states));
    }
    // Refresh map colours
    if (window.d3) {
      const COLORS = { neutral: '#ffffff', been: '#8ecae6', want: '#ffd166' };
      window.d3.selectAll('path.country')
        .attr('fill', d => COLORS[window.getCountryStatus(d.id)]);
    }
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
    if (window.d3) {
      const COLORS = { neutral: '#ffffff', been: '#8ecae6', want: '#ffd166' };
      window.d3.selectAll('path.country')
        .attr('fill', d => COLORS[window.getCountryStatus(d.id)]);
    }
    if (window.updateStats) window.updateStats();
  }

  // ── Tab init ─────────────────────────────────────────────────────────────────

  window.initTripLog = function () {
    const container = el('tripLogContent');
    if (!container || container.dataset.built) return;
    container.dataset.built = 'true';

    container.innerHTML = `
      <div class="tl-header">
        <h2 class="tl-title">Trip Log</h2>
        <button class="tl-new-btn" id="tlNewBtn">＋ New Trip</button>
      </div>

      <!-- ── Entry form ── -->
      <div class="tl-form-wrap" id="tlFormWrap" style="display:none">
        <div class="tl-form-header">
          <span class="tl-form-heading" id="tlFormHeading">New Trip</span>
          <button class="tl-form-close" id="tlFormClose" title="Discard">✕</button>
        </div>

        <div class="tl-form" id="tlForm">

          <!-- Title -->
          <div class="tl-field">
            <label class="tl-label" for="tlTitle">Trip title <span class="tl-req">*</span></label>
            <input class="tl-input" id="tlTitle" type="text" placeholder="e.g. Summer in Japan" maxlength="80" />
            <div class="tl-error" id="tlTitleErr"></div>
          </div>

          <!-- Date range -->
          <div class="tl-field">
            <div class="tl-row">
              <div class="tl-col">
                <label class="tl-label" for="tlDateFrom">From <span class="tl-req">*</span></label>
                <input class="tl-input" id="tlDateFrom" type="date" />
              </div>
              <div class="tl-col">
                <label class="tl-label" for="tlDateTo">To <span class="tl-req">*</span></label>
                <input class="tl-input" id="tlDateTo" type="date" />
              </div>
            </div>
            <div class="tl-error" id="tlDateErr"></div>
          </div>

          <!-- Countries -->
          <div class="tl-field">
            <label class="tl-label">Countries <span class="tl-req">*</span></label>
            <div class="tl-chips" id="tlCountryChips"></div>
            <div class="tl-search-wrap" style="position:relative">
              <input class="tl-input" id="tlCountrySearch" type="text"
                     placeholder="Search and add a country…" autocomplete="off" />
              <ul class="tl-suggestions" id="tlCountrySuggestions" style="display:none"></ul>
            </div>
            <div class="tl-error" id="tlCountryErr"></div>
          </div>

          <!-- Days per country override -->
          <div class="tl-field" id="tlCountryDaysWrap" style="display:none">
            <div class="tl-days-header">
              <label class="tl-label">Days per country</label>
              <label class="tl-toggle-label">
                <input type="checkbox" id="tlDaysOverride" />
                <span>Override equal split</span>
              </label>
            </div>
            <div class="tl-days-equal" id="tlDaysEqualInfo"></div>
            <div id="tlDaysInputs" style="display:none"></div>
            <div class="tl-error" id="tlDaysErr"></div>
          </div>

          <!-- Wonders -->
          <div class="tl-field" id="tlWondersWrap" style="display:none">
            <label class="tl-label">Wonders visited on this trip</label>
            <p class="tl-hint">Only wonders you tick here will count towards your progress.</p>
            <div class="tl-wonder-list" id="tlWonderList"></div>
          </div>

          <!-- Companions -->
          <div class="tl-field">
            <label class="tl-label">Travel companions</label>
            <div class="tl-chips" id="tlCompanionChips"></div>
            <div class="tl-option-group" id="tlCompanionOptions"></div>
            <div class="tl-custom-row">
              <input class="tl-input tl-custom-input" id="tlCompanionCustom"
                     type="text" placeholder="Add custom…" maxlength="40" />
              <button class="tl-add-btn" id="tlCompanionAdd" type="button">Add</button>
            </div>
          </div>

          <!-- Transport -->
          <div class="tl-field">
            <label class="tl-label">Primary transport</label>
            <div class="tl-option-group" id="tlTransportOptions"></div>
            <div class="tl-custom-row">
              <input class="tl-input tl-custom-input" id="tlTransportCustom"
                     type="text" placeholder="Add custom…" maxlength="40" />
              <button class="tl-add-btn" id="tlTransportAdd" type="button">Add</button>
            </div>
          </div>

          <!-- Tags -->
          <div class="tl-field">
            <label class="tl-label">Tags</label>
            <div class="tl-chips" id="tlTagChips"></div>
            <div class="tl-option-group" id="tlTagsPool"></div>
            <div class="tl-custom-row">
              <input class="tl-input tl-custom-input" id="tlTagCustom"
                     type="text" placeholder="Add tag…" maxlength="30" />
              <button class="tl-add-btn" id="tlTagAdd" type="button">Add</button>
            </div>
          </div>

          <!-- Mood -->
          <div class="tl-field">
            <label class="tl-label">Trip mood</label>
            <div class="tl-stars" id="tlStars">
              ${[1,2,3,4,5].map(n =>
                `<button class="tl-star" type="button" data-value="${n}" title="${MOOD_LABELS[n]}">★</button>`
              ).join('')}
            </div>
            <div class="tl-mood-label" id="tlMoodLabel">Not rated</div>
          </div>

          <!-- Notes -->
          <div class="tl-field">
            <label class="tl-label" for="tlNotes">Notes</label>
            <textarea class="tl-textarea" id="tlNotes" rows="4"
                      placeholder="How was it? What stood out?"></textarea>
          </div>

          <!-- Budget (collapsible) -->
          <div class="tl-field tl-budget-section">
            <button class="tl-budget-toggle" id="tlBudgetToggle" type="button">
              <span>💰 Budget <span class="tl-optional">(optional)</span></span>
              <span class="tl-chevron" id="tlBudgetChevron">▸</span>
            </button>
            <div class="tl-budget-body" id="tlBudgetBody" style="display:none">
              <div class="tl-budget-top">
                <div class="tl-col">
                  <label class="tl-label" for="tlCurrency">Currency</label>
                  <select class="tl-input" id="tlCurrency">
                    ${CURRENCIES.map(c => `<option value="${c}">${c}</option>`).join('')}
                  </select>
                </div>
                <div class="tl-col">
                  <label class="tl-label" for="tlBudgetTotal">Total spent</label>
                  <input class="tl-input" id="tlBudgetTotal" type="number" min="0" placeholder="0" />
                </div>
                <div class="tl-col">
                  <label class="tl-label" for="tlBudgetPlanned">Planned</label>
                  <input class="tl-input" id="tlBudgetPlanned" type="number" min="0" placeholder="0" />
                </div>
              </div>
              <div class="tl-breakdown-label">Breakdown <span class="tl-optional">(optional)</span></div>
              <div class="tl-breakdown-grid">
                ${['flights','accommodation','food','transport','activities'].map(cat => `
                  <div class="tl-breakdown-item">
                    <label class="tl-breakdown-cat">${cat[0].toUpperCase() + cat.slice(1)}</label>
                    <input class="tl-input" id="tlBudget_${cat}" type="number" min="0"
                           placeholder="0" data-cat="${cat}" />
                  </div>`).join('')}
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="tl-form-actions">
            <button class="tl-cancel-btn" id="tlCancelBtn" type="button">Cancel</button>
            <button class="tl-save-btn"   id="tlSaveBtn"   type="button">Save Trip</button>
          </div>

        </div><!-- /.tl-form -->
      </div><!-- /.tl-form-wrap -->

      <!-- ── Trip list ── -->
      <div class="tl-list-wrap" id="tlListWrap">
        <div class="tl-empty" id="tlEmpty" style="display:none">
          <div class="tl-empty-icon">✈️</div>
          <p class="tl-empty-text">No trips logged yet.</p>
          <p class="tl-empty-sub">Hit <strong>+ New Trip</strong> to add your first one.</p>
        </div>
        <ul class="tl-list" id="tlList"></ul>
      </div>
    `;

    bindFormEvents();
    if (window.renderTripList) window.renderTripList();
    else renderTripList();
  };

  // ── Open / close form ────────────────────────────────────────────────────────

  window.openTripForm = function (tripId) {
    editingTripId      = tripId || null;
    selectedCountries  = [];
    selectedWonders    = [];
    selectedCompanions = [];
    selectedTags       = [];
    selectedTransport  = null;
    currentMood        = 0;

    el('tlFormHeading').textContent = editingTripId ? 'Edit Trip' : 'New Trip';
    clearErrors();
    resetFormFields();

    if (editingTripId) {
      const trip = window.TripStore.getTripById(editingTripId);
      if (trip) populateForm(trip);
    }

    el('tlFormWrap').style.display = 'block';
    el('tlListWrap').style.display = 'none';
    el('tlNewBtn').style.display   = 'none';
    formVisible = true;
  };

  function closeForm() {
    el('tlFormWrap').style.display = 'none';
    el('tlListWrap').style.display = 'block';
    el('tlNewBtn').style.display   = 'flex';
    formVisible    = false;
    editingTripId  = null;
  }

  // ── Populate form (edit mode) ────────────────────────────────────────────────

  function populateForm(trip) {
    el('tlTitle').value    = trip.title    || '';
    el('tlDateFrom').value = trip.dateFrom || '';
    el('tlDateTo').value   = trip.dateTo   || '';
    el('tlNotes').value    = trip.notes    || '';

    // Countries
    (trip.countries || []).forEach(id => {
      const name = getCountryNameById(id);
      if (name) addCountry(String(id), name, true);
    });

    // Country days override
    if (trip.countryDays && Object.keys(trip.countryDays).length > 0) {
      el('tlDaysOverride').checked = true;
      toggleDaysOverride(true);
      Object.entries(trip.countryDays).forEach(([id, days]) => {
        const inp = document.querySelector(`#tlDaysInputs [data-country-id="${id}"]`);
        if (inp) inp.value = days;
      });
    }

    // Wonders — set before refreshWonderSuggestions so checkboxes render correctly
    selectedWonders = Array.isArray(trip.wonders) ? [...trip.wonders] : [];
    refreshWonderSuggestions();

    // Companions
    (trip.companions || []).forEach(c => addCompanion(c, true));
    renderCompanionOptions();
    renderCompanionChips();

    // Transport
    if (trip.transport) { selectedTransport = trip.transport; renderTransportOptions(); }

    // Tags
    (trip.tags || []).forEach(t => addTag(t, true));
    renderTagsPool();
    renderTagChips();

    // Mood
    setMood(trip.mood || 0);

    // Budget
    if (trip.budget && (trip.budget.total || trip.budget.planned)) {
      el('tlBudgetBody').style.display  = 'block';
      el('tlBudgetChevron').textContent = '▾';
      el('tlCurrency').value            = trip.budget.currency || 'EUR';
      el('tlBudgetTotal').value         = trip.budget.total    || '';
      el('tlBudgetPlanned').value       = trip.budget.planned  || '';
      if (trip.budget.breakdown) {
        Object.entries(trip.budget.breakdown).forEach(([cat, val]) => {
          const inp = el(`tlBudget_${cat}`);
          if (inp) inp.value = val || '';
        });
      }
    }
  }

  // ── Reset form fields ────────────────────────────────────────────────────────

  function resetFormFields() {
    ['tlTitle','tlCountrySearch','tlCompanionCustom',
     'tlTransportCustom','tlTagCustom','tlNotes'].forEach(id => {
      const e = el(id); if (e) e.value = '';
    });
    ['tlDateFrom','tlDateTo'].forEach(id => { const e = el(id); if (e) e.value = ''; });
    ['tlBudgetTotal','tlBudgetPlanned'].forEach(id => { const e = el(id); if (e) e.value = ''; });
    ['flights','accommodation','food','transport','activities'].forEach(cat => {
      const e = el(`tlBudget_${cat}`); if (e) e.value = '';
    });

    el('tlCurrency').value             = 'EUR';
    el('tlDaysOverride').checked       = false;
    el('tlBudgetBody').style.display   = 'none';
    el('tlBudgetChevron').textContent  = '▸';
    el('tlCountryDaysWrap').style.display = 'none';
    el('tlWondersWrap').style.display     = 'none';
    el('tlDaysInputs').style.display      = 'none';
    el('tlDaysEqualInfo').textContent     = '';

    el('tlCountryChips').innerHTML   = '';
    el('tlCompanionChips').innerHTML = '';
    el('tlTagChips').innerHTML       = '';

    renderCompanionOptions();
    renderTransportOptions();
    renderTagsPool();
    setMood(0);
  }

  // ── Bind all form events ─────────────────────────────────────────────────────

  function bindFormEvents() {

    // Open / close
    el('tlNewBtn').addEventListener('click',    () => window.openTripForm());
    el('tlFormClose').addEventListener('click', () => { if (confirm('Discard changes?')) closeForm(); });
    el('tlCancelBtn').addEventListener('click', () => { if (confirm('Discard changes?')) closeForm(); });

    // Dates
    el('tlDateFrom').addEventListener('change', onDatesChange);
    el('tlDateTo').addEventListener('change',   onDatesChange);

    // Country search
    const csInput = el('tlCountrySearch');
    const csList  = el('tlCountrySuggestions');

    csInput.addEventListener('input', () => {
      const q = csInput.value.trim().toLowerCase();
      csList.innerHTML = '';
      if (!q || !window.nameIndex) { csList.style.display = 'none'; return; }

      const already = new Set(selectedCountries.map(c => c.id));
      const matches = Object.entries(window.nameIndex)
        .filter(([key, f]) => key.includes(q) && !already.has(String(f.id)))
        .slice(0, 8);

      if (!matches.length) { csList.style.display = 'none'; return; }

      matches.forEach(([, f]) => {
        const li = document.createElement('li');
        li.className = 'tl-suggestion-item';
        li.textContent = f.properties.displayName;
        li.addEventListener('mousedown', e => {
          e.preventDefault();
          addCountry(String(f.id), f.properties.displayName);
          csInput.value = '';
          csList.style.display = 'none';
        });
        csList.appendChild(li);
      });
      csList.style.display = 'block';
    });

    csInput.addEventListener('blur', () => {
      setTimeout(() => { csList.style.display = 'none'; }, 150);
    });

    // Days override
    el('tlDaysOverride').addEventListener('change', e => toggleDaysOverride(e.target.checked));

    // Budget toggle
    el('tlBudgetToggle').addEventListener('click', () => {
      const body    = el('tlBudgetBody');
      const chevron = el('tlBudgetChevron');
      const open    = body.style.display !== 'none';
      body.style.display    = open ? 'none' : 'block';
      chevron.textContent   = open ? '▸' : '▾';
    });

    // Companions
    el('tlCompanionAdd').addEventListener('click', () => {
      const v = el('tlCompanionCustom').value.trim();
      if (!v) return;
      window.TripStore.addSaved('companions', v);
      addCompanion(v);
      renderCompanionOptions();
      el('tlCompanionCustom').value = '';
    });
    el('tlCompanionCustom').addEventListener('keydown', e => { if (e.key === 'Enter') el('tlCompanionAdd').click(); });

    // Transport
    el('tlTransportAdd').addEventListener('click', () => {
      const v = el('tlTransportCustom').value.trim();
      if (!v) return;
      window.TripStore.addSaved('transport', v);
      selectedTransport = v.toLowerCase();
      renderTransportOptions();
      el('tlTransportCustom').value = '';
    });
    el('tlTransportCustom').addEventListener('keydown', e => { if (e.key === 'Enter') el('tlTransportAdd').click(); });

    // Tags
    el('tlTagAdd').addEventListener('click', () => {
      const v = el('tlTagCustom').value.trim();
      if (!v) return;
      window.TripStore.addSaved('tags', v);
      addTag(v);
      renderTagsPool();
      el('tlTagCustom').value = '';
    });
    el('tlTagCustom').addEventListener('keydown', e => { if (e.key === 'Enter') el('tlTagAdd').click(); });

    // Stars
    el('tlStars').addEventListener('click', e => {
      const btn = e.target.closest('.tl-star');
      if (btn) setMood(Number(btn.dataset.value));
    });

    // Save
    el('tlSaveBtn').addEventListener('click', handleSave);
  }

  // ── Date change ──────────────────────────────────────────────────────────────

  function onDatesChange() {
    clearError('tlDateErr');
    const from = el('tlDateFrom').value;
    const to   = el('tlDateTo').value;
    if (from && to) {
      if (from > to) {
        showError('tlDateErr', 'Start date must be on or before end date.');
      } else {
        updateDaysInfo();
      }
    }
  }

  // ── Country management ───────────────────────────────────────────────────────

  // silent = true skips redundant re-renders during bulk populate
  function addCountry(id, name, silent) {
    if (selectedCountries.some(c => c.id === id)) return;
    selectedCountries.push({ id, name });
    if (!silent) {
      renderCountryChips();
      updateCountryDaysSection();
      refreshWonderSuggestions();
      clearError('tlCountryErr');
    }
  }

  function removeCountry(id) {
    selectedCountries = selectedCountries.filter(c => c.id !== id);
    renderCountryChips();
    updateCountryDaysSection();
    refreshWonderSuggestions();
  }

  function renderCountryChips() {
    const wrap = el('tlCountryChips');
    wrap.innerHTML = '';
    selectedCountries.forEach(({ id, name }) => {
      const chip = document.createElement('span');
      chip.className = 'tl-chip tl-chip-country';
      chip.innerHTML = `${name} <button class="tl-chip-remove" title="Remove">×</button>`;
      chip.querySelector('.tl-chip-remove').addEventListener('click', () => removeCountry(id));
      wrap.appendChild(chip);
    });
    // After bulk populate, ensure downstream sections update
    updateCountryDaysSection();
    refreshWonderSuggestions();
  }

  // ── Country days ─────────────────────────────────────────────────────────────

  function updateCountryDaysSection() {
    const wrap = el('tlCountryDaysWrap');
    if (selectedCountries.length < 2) { wrap.style.display = 'none'; return; }
    wrap.style.display = 'block';
    updateDaysInfo();
    if (el('tlDaysOverride').checked) renderDaysInputs();
  }

  function updateDaysInfo() {
    const total = tripDays(el('tlDateFrom').value, el('tlDateTo').value);
    const n     = selectedCountries.length;
    if (!total || !n) { el('tlDaysEqualInfo').textContent = ''; return; }
    const base = Math.floor(total / n);
    const rem  = total % n;
    el('tlDaysEqualInfo').textContent = rem
      ? `Equal split: ${base}–${base+1} days per country (${total} days total)`
      : `Equal split: ${base} days per country (${total} days total)`;
  }

  function toggleDaysOverride(enabled) {
    el('tlDaysInputs').style.display = enabled ? 'block' : 'none';
    if (enabled) renderDaysInputs();
  }

  function renderDaysInputs() {
    const wrap  = el('tlDaysInputs');
    const total = tripDays(el('tlDateFrom').value, el('tlDateTo').value);
    wrap.innerHTML = '';
    selectedCountries.forEach(({ id, name }) => {
      const row = document.createElement('div');
      row.className = 'tl-days-row';
      row.innerHTML = `
        <span class="tl-days-country">${name}</span>
        <input class="tl-input tl-days-input" type="number" min="1"
               max="${total || 999}" data-country-id="${id}" placeholder="days" />
      `;
      row.querySelector('input').addEventListener('input', validateDaysSum);
      wrap.appendChild(row);
    });
  }

  function validateDaysSum() {
    clearError('tlDaysErr');
    const inputs = document.querySelectorAll('#tlDaysInputs .tl-days-input');
    const total  = tripDays(el('tlDateFrom').value, el('tlDateTo').value);
    const sum    = Array.from(inputs).reduce((a, i) => a + (Number(i.value) || 0), 0);
    if (total && inputs.length && sum !== total) {
      showError('tlDaysErr', `Days sum (${sum}) must equal trip duration (${total} days).`);
      return false;
    }
    return true;
  }

  function getCountryDays() {
    if (!el('tlDaysOverride').checked) return null;
    const inputs = document.querySelectorAll('#tlDaysInputs .tl-days-input');
    if (!inputs.length) return null;
    const result = {};
    inputs.forEach(i => { result[i.dataset.countryId] = Number(i.value) || 0; });
    return result;
  }

  // ── Wonder suggestions ───────────────────────────────────────────────────────

  function refreshWonderSuggestions() {
    const names = selectedCountries.map(c => c.name);
    const suggestions = window.TripStore
      ? window.TripStore.getWonderSuggestionsForCountries(names)
      : [];

    const wrap = el('tlWondersWrap');
    if (!wrap) return;

    if (!suggestions.length) { wrap.style.display = 'none'; return; }
    wrap.style.display = 'block';

    // Drop wonders no longer relevant
    selectedWonders = selectedWonders.filter(wn => suggestions.some(w => w.name === wn));
    renderWonderList(suggestions);
  }

  function renderWonderList(suggestions) {
    const list = el('tlWonderList');
    if (!list) return;
    if (!suggestions) {
      suggestions = window.TripStore
        ? window.TripStore.getWonderSuggestionsForCountries(selectedCountries.map(c => c.name))
        : [];
    }
    list.innerHTML = '';
    suggestions.forEach(wonder => {
      const checked = selectedWonders.includes(wonder.name);
      const label   = document.createElement('label');
      label.className = `tl-wonder-item${checked ? ' tl-wonder-checked' : ''}`;
      label.innerHTML = `
        <input type="checkbox" class="tl-wonder-check" value="${wonder.name}" ${checked ? 'checked' : ''} />
        <span class="tl-wonder-name">${wonder.name}</span>
        <span class="tl-wonder-land">${wonder.land}</span>
      `;
      label.querySelector('input').addEventListener('change', e => {
        if (e.target.checked) {
          if (!selectedWonders.includes(wonder.name)) selectedWonders.push(wonder.name);
          label.classList.add('tl-wonder-checked');
        } else {
          selectedWonders = selectedWonders.filter(n => n !== wonder.name);
          label.classList.remove('tl-wonder-checked');
        }
      });
      list.appendChild(label);
    });
  }

  // ── Companions ───────────────────────────────────────────────────────────────

  function addCompanion(val, silent) {
    const norm = val.trim().toLowerCase();
    if (!norm || selectedCompanions.includes(norm)) return;
    selectedCompanions.push(norm);
    if (!silent) { renderCompanionOptions(); renderCompanionChips(); }
  }

  function removeCompanion(val) {
    selectedCompanions = selectedCompanions.filter(c => c !== val);
    renderCompanionOptions();
    renderCompanionChips();
  }

  function renderCompanionChips() {
    const wrap = el('tlCompanionChips');
    wrap.innerHTML = '';
    selectedCompanions.forEach(val => {
      const chip = document.createElement('span');
      chip.className = 'tl-chip';
      chip.innerHTML = `${val} <button class="tl-chip-remove" title="Remove">×</button>`;
      chip.querySelector('.tl-chip-remove').addEventListener('click', () => removeCompanion(val));
      wrap.appendChild(chip);
    });
  }

  function renderCompanionOptions() {
    const wrap = el('tlCompanionOptions');
    if (!wrap) return;
    wrap.innerHTML = '';
    window.TripStore.getOptions('companions').forEach(opt => {
      const btn = document.createElement('button');
      btn.type      = 'button';
      btn.className = `tl-option-btn${selectedCompanions.includes(opt) ? ' active' : ''}`;
      btn.textContent = opt;
      btn.addEventListener('click', () => {
        if (selectedCompanions.includes(opt)) removeCompanion(opt);
        else addCompanion(opt);
      });
      wrap.appendChild(btn);
    });
  }

  // ── Transport ────────────────────────────────────────────────────────────────

  function renderTransportOptions() {
    const wrap = el('tlTransportOptions');
    if (!wrap) return;
    wrap.innerHTML = '';
    window.TripStore.getOptions('transport').forEach(opt => {
      const btn = document.createElement('button');
      btn.type      = 'button';
      btn.className = `tl-option-btn${selectedTransport === opt.toLowerCase() ? ' active' : ''}`;
      btn.textContent = opt;
      btn.addEventListener('click', () => {
        selectedTransport = selectedTransport === opt.toLowerCase() ? null : opt.toLowerCase();
        renderTransportOptions();
      });
      wrap.appendChild(btn);
    });
  }

  // ── Tags ─────────────────────────────────────────────────────────────────────

  function addTag(val, silent) {
    const norm = val.trim().toLowerCase();
    if (!norm || selectedTags.includes(norm)) return;
    selectedTags.push(norm);
    if (!silent) { renderTagsPool(); renderTagChips(); }
  }

  function removeTag(val) {
    selectedTags = selectedTags.filter(t => t !== val);
    renderTagsPool();
    renderTagChips();
  }

  function renderTagChips() {
    const wrap = el('tlTagChips');
    wrap.innerHTML = '';
    selectedTags.forEach(val => {
      const chip = document.createElement('span');
      chip.className = 'tl-chip tl-chip-tag';
      chip.innerHTML = `${val} <button class="tl-chip-remove" title="Remove">×</button>`;
      chip.querySelector('.tl-chip-remove').addEventListener('click', () => removeTag(val));
      wrap.appendChild(chip);
    });
  }

    function renderTagsPool() {
    const wrap = el('tlTagsPool');
    if (!wrap) return;
    wrap.innerHTML = '';
    window.TripStore.getOptions('tags').forEach(tag => {  // ← getOptions not getSaved
      const btn = document.createElement('button');
      btn.type      = 'button';
      btn.className = `tl-option-btn${selectedTags.includes(tag) ? ' active' : ''}`;
      btn.textContent = tag;
      btn.addEventListener('click', () => {
        if (selectedTags.includes(tag)) removeTag(tag); else addTag(tag);
      });
      wrap.appendChild(btn);
    });
  }

  // ── Mood ─────────────────────────────────────────────────────────────────────

  function setMood(value) {
    currentMood = value;
    document.querySelectorAll('.tl-star').forEach(btn => {
      btn.classList.toggle('tl-star-active', Number(btn.dataset.value) <= currentMood);
    });
    const label = el('tlMoodLabel');
    if (label) label.textContent = value ? MOOD_LABELS[value] : 'Not rated';
  }

  // ── Validation ───────────────────────────────────────────────────────────────

  function validate() {
    let ok = true;
    clearErrors();

    if (!el('tlTitle').value.trim()) {
      showError('tlTitleErr', 'Title is required.'); ok = false;
    }
    if (selectedCountries.length === 0) {
      showError('tlCountryErr', 'At least one country is required.'); ok = false;
    }
    if (!el('tlDateFrom').value) {
      showError('tlDateErr', 'Start date is required.'); ok = false;
    }
    if (!el('tlDateTo').value) {
      showError('tlDateErr', 'End date is required.'); ok = false;
    }
    if (el('tlDateFrom').value && el('tlDateTo').value &&
        el('tlDateFrom').value > el('tlDateTo').value) {
      showError('tlDateErr', 'Start date must be on or before end date.'); ok = false;
    }

    if (el('tlDaysOverride').checked) {
      const inputs   = document.querySelectorAll('#tlDaysInputs .tl-days-input');
      const anyEmpty = Array.from(inputs).some(i => !i.value);
      if (anyEmpty) {
        showError('tlDaysErr', 'Fill in days for every country or uncheck the override.'); ok = false;
      } else if (!validateDaysSum()) {
        ok = false;
      }
    }

    return ok;
  }

  function showError(id, msg) {
    const e = el(id); if (e) { e.textContent = msg; e.style.display = 'block'; }
  }

  function clearError(id) {
    const e = el(id); if (e) { e.textContent = ''; e.style.display = 'none'; }
  }

  function clearErrors() {
    ['tlTitleErr','tlDateErr','tlCountryErr','tlDaysErr'].forEach(clearError);
  }

  // ── Save ─────────────────────────────────────────────────────────────────────

  function handleSave() {
    if (!validate()) return;

    const budgetTotal   = Number(el('tlBudgetTotal').value)   || 0;
    const budgetPlanned = Number(el('tlBudgetPlanned').value) || 0;
    const hasBudget     = budgetTotal > 0 || budgetPlanned > 0;

    const breakdown = {};
    ['flights','accommodation','food','transport','activities'].forEach(cat => {
      const v = Number(el(`tlBudget_${cat}`).value) || 0;
      if (v) breakdown[cat] = v;
    });

    const countryDays = getCountryDays();

    const tripData = {
      id:         editingTripId || undefined,
      title:      el('tlTitle').value.trim(),
      countries:  selectedCountries.map(c => c.id),
      dateFrom:   el('tlDateFrom').value,
      dateTo:     el('tlDateTo').value,
      wonders:    [...selectedWonders],
      companions: [...selectedCompanions],
      transport:  selectedTransport   || null,
      tags:       [...selectedTags],
      mood:       currentMood         || null,
      notes:      el('tlNotes').value.trim() || null,
      budget:     hasBudget ? {
        currency: el('tlCurrency').value,
        total:    budgetTotal   || null,
        planned:  budgetPlanned || null,
        breakdown: Object.keys(breakdown).length ? breakdown : null,
      } : null,
    };

    if (countryDays) tripData.countryDays = countryDays;

    const { success, errors, trip } = window.TripStore.saveTrip(tripData);

    if (!success) {
      showError('tlTitleErr', errors.join(' · '));
      return;
    }

    window.TripStore.saveCustomValuesFromTrip(trip);
    if (window._patchedSyncOnSave) window._patchedSyncOnSave(trip);
    else syncOnSave(trip);
    closeForm();
    if (window.renderTripList) window.renderTripList();
    else renderTripList();
  }

  // ── Trip list ────────────────────────────────────────────────────────────────

  function renderTripList() {
    const list  = el('tlList');
    const empty = el('tlEmpty');
    if (!list || !empty) return;

    const trips = window.TripStore.getTrips();
    list.innerHTML = '';

    empty.style.display = trips.length === 0 ? 'flex' : 'none';

    trips.forEach(trip => {
      const duration     = window.TripStore.getTripDuration(trip);
      const countryNames = (trip.countries || []).map(id => getCountryNameById(id)).filter(Boolean).join(', ');
      const moodLabel    = trip.mood ? MOOD_LABELS[trip.mood] : '';
      const budgetStr    = trip.budget && trip.budget.total
        ? `${trip.budget.currency} ${Number(trip.budget.total).toLocaleString()}` : '';

      const li = document.createElement('li');
      li.className = 'tl-list-item';
      li.innerHTML = `
        <div class="tl-item-main">
          <div class="tl-item-title">${trip.title}</div>
          <div class="tl-item-meta">
            <span class="tl-item-dates">${formatDateRange(trip.dateFrom, trip.dateTo)}</span>
            <span class="tl-item-dur">${duration} day${duration !== 1 ? 's' : ''}</span>
            ${moodLabel  ? `<span class="tl-item-mood">${moodLabel}</span>`      : ''}
            ${budgetStr  ? `<span class="tl-item-budget">💰 ${budgetStr}</span>` : ''}
          </div>
          <div class="tl-item-countries">${countryNames}</div>
          ${trip.tags && trip.tags.length
            ? `<div class="tl-item-tags">${trip.tags.map(t =>
                `<span class="tl-item-tag">${t}</span>`).join('')}</div>`
            : ''}
        </div>
        <div class="tl-item-btns">
          <button class="tl-edit-btn"   data-id="${trip.id}" title="Edit">✎</button>
          <button class="tl-delete-btn" data-id="${trip.id}" title="Delete">🗑</button>
        </div>
      `;

      li.querySelector('.tl-edit-btn').addEventListener('click', () => {
        window.openTripForm(trip.id);
      });

      li.querySelector('.tl-delete-btn').addEventListener('click', () => {
        if (!confirm(`Delete "${trip.title}"? This cannot be undone.`)) return;
        window.TripStore.deleteTrip(trip.id);
        syncOnDelete(trip);
        if (window.renderTripList) window.renderTripList();
        else renderTripList();
      });

      list.appendChild(li);
    });
  }

})();
