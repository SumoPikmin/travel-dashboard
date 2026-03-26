/**
 * compat.js — Work Package 7
 *
 * Patches the existing export and import handlers in map.js to include
 * trips, savedCompanions, savedTransport and savedTags in the file format.
 *
 * Strategy: patches the exportBtn click handler and the fileInput change
 * handler that map.js already registered, replacing them with richer versions.
 * No changes needed to map.js itself.
 *
 * Load order in index.html (must be LAST — after all other scripts):
 *   migration.js → trips.js → map.js → stats.js → wonders.js
 *   → triplog.js → triplist.js → tripstats.js → compat.js
 *
 * After import, triggers a full sync:
 *   1. All trip countries are marked been/trip
 *   2. Manual states are applied on top
 *   3. Trip-source beats manual where they conflict
 *   4. Map colours, stats and trip list are refreshed
 */

(function () {

  // ── Wait for DOM ready ───────────────────────────────────────────────────────

  function init() {

    const exportBtn = document.getElementById('exportBtn');
    const importBtn = document.getElementById('importBtn');
    const fileInput = document.getElementById('fileInput');

    if (!exportBtn || !importBtn || !fileInput) {
      console.warn('[compat] Could not find export/import buttons — skipping patch.');
      return;
    }

    // ── Patch export ───────────────────────────────────────────────────────────
    // Remove the existing listener map.js added by cloning the node,
    // then add our richer version.

    const newExportBtn = exportBtn.cloneNode(true);
    exportBtn.parentNode.replaceChild(newExportBtn, exportBtn);

    newExportBtn.addEventListener('click', handleExport);

    // ── Patch import ───────────────────────────────────────────────────────────
    // importBtn just triggers fileInput.click() — no need to patch it.
    // We only need to replace the fileInput change handler.

    const newFileInput = fileInput.cloneNode(true);
    fileInput.parentNode.replaceChild(newFileInput, fileInput);

    // importBtn still points to the old fileInput — rewire it
    const newImportBtn = importBtn.cloneNode(true);
    importBtn.parentNode.replaceChild(newImportBtn, importBtn);
    newImportBtn.addEventListener('click', () => newFileInput.click());

    newFileInput.addEventListener('change', handleImport);

    console.info('[compat] Export/import handlers patched.');
  }

  // ── Export handler ───────────────────────────────────────────────────────────

  function handleExport() {
    const KEYS = window.STORAGE_KEYS;

    const data = {
      // Existing fields — preserved for backwards compatibility
      states:           window.states           || {},
      wonderStates:     window.wonderStates     || {},
      priorities:       window.priorities       || {},
      wonderPriorities: window.wonderPriorities || {},

      // New fields — WP7
      trips:            window.TripStore ? window.TripStore.getTrips() : [],
      savedCompanions:  loadKey(KEYS.savedCompanions, []),
      savedTransport:   loadKey(KEYS.savedTransport,  []),
      savedTags:        loadKey(KEYS.savedTags,        []),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = 'travel-map-progress.json';
    a.click();
    URL.revokeObjectURL(url);

    console.info('[compat] Exported', data.trips.length, 'trip(s).');
  }

  // ── Import handler ───────────────────────────────────────────────────────────

  function handleImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => {
      try {
        const raw = JSON.parse(e.target.result);
        importData(raw);
      } catch (err) {
        console.error('[compat] JSON parse error:', err);
        alert('Failed to import: the file is not valid JSON.');
      }
      event.target.value = '';
    };
    reader.readAsText(file);
  }

  // ── Core import logic ────────────────────────────────────────────────────────

  function importData(raw) {
    const KEYS = window.STORAGE_KEYS;
    const report = { tripsImported: 0, tripsSkipped: 0, errors: [] };

    // ── 1. Country states ──────────────────────────────────────────────────────
    // Support both old format (plain strings) and new format ({ status, source })

    const rawStates = raw.states !== undefined ? raw.states : raw;
    const importedStates = window.migrateImportedStates
      ? window.migrateImportedStates(rawStates)
      : sanitiseStates(rawStates);

    // ── 2. Wonder states ───────────────────────────────────────────────────────

    const importedWonders = sanitiseStringMap(raw.wonderStates, ['been', 'want']);

    // ── 3. Priorities ──────────────────────────────────────────────────────────

    const importedPriorities      = sanitiseStringMap(raw.priorities,       ['next', 'longterm']);
    const importedWonderPriorities = sanitiseStringMap(raw.wonderPriorities, ['next', 'longterm']);

    // ── 4. Trips ───────────────────────────────────────────────────────────────

    const rawTrips = Array.isArray(raw.trips) ? raw.trips : [];
    const validTrips = [];

    rawTrips.forEach((trip, index) => {
      const { valid, reason } = validateTripObject(trip);
      if (valid) {
        validTrips.push(sanitiseTrip(trip));
        report.tripsImported++;
      } else {
        report.tripsSkipped++;
        report.errors.push(`Trip at index ${index} skipped: ${reason}`);
        console.warn(`[compat] Skipping malformed trip at index ${index}:`, reason, trip);
      }
    });

    // ── 5. Saved custom values ─────────────────────────────────────────────────

    const importedCompanions = sanitiseStringArray(raw.savedCompanions);
    const importedTransport  = sanitiseStringArray(raw.savedTransport);
    const importedTags       = sanitiseStringArray(raw.savedTags);

    // ── 6. Rebuild country states from trips (trip-source beats manual) ─────────

    // Start from imported manual states
    const mergedStates = { ...importedStates };

    // Apply trip-sourced states on top — trips always win
    validTrips.forEach(trip => {
      (trip.countries || []).forEach(id => {
        const key      = String(id);
        const existing = mergedStates[key];
        // Only upgrade — never downgrade a trip-source to manual
        if (!existing || existing.source !== 'trip') {
          mergedStates[key] = { status: 'been', source: 'trip' };
        }
      });
    });

    // ── 7. Persist everything ──────────────────────────────────────────────────

    window.states = mergedStates;
    localStorage.setItem(KEYS.states, JSON.stringify(mergedStates));

    window.wonderStates = importedWonders;
    localStorage.setItem(KEYS.wonderStates, JSON.stringify(importedWonders));

    window.priorities = importedPriorities;
    localStorage.setItem(KEYS.priorities, JSON.stringify(importedPriorities));

    window.wonderPriorities = importedWonderPriorities;
    localStorage.setItem(KEYS.wonderPriorities, JSON.stringify(importedWonderPriorities));

    localStorage.setItem(KEYS.trips,           JSON.stringify(validTrips));
    localStorage.setItem(KEYS.savedCompanions, JSON.stringify(importedCompanions));
    localStorage.setItem(KEYS.savedTransport,  JSON.stringify(importedTransport));
    localStorage.setItem(KEYS.savedTags,       JSON.stringify(importedTags));

    // Sync in-memory caches
    if (window.TripStore) window.TripStore.init();

    // ── 8. Refresh UI ──────────────────────────────────────────────────────────

    // Redraw map colours
    if (window.d3) {
      const COLORS = { neutral: '#ffffff', been: '#8ecae6', want: '#ffd166' };
      window.d3.selectAll('path.country')
        .attr('fill', d => COLORS[window.getCountryStatus(d.id)]);
    }

    // Rebuild wonders tab
    const wondersContent = document.getElementById('wondersContent');
    if (wondersContent) {
      wondersContent.innerHTML = '';
      delete wondersContent.dataset.built;
    }
    if (window.initWonders) window.initWonders();

    // Rebuild trip log tab
    const tripLogContent = document.getElementById('tripLogContent');
    if (tripLogContent) {
      tripLogContent.innerHTML = '';
      delete tripLogContent.dataset.built;
      window._tripstatsPatched = false; // allow re-patching
    }
    if (window.initTripLog) window.initTripLog();

    // Refresh stats
    if (window.updateStats) window.updateStats();

    // Refresh trip list
    if (window.renderTripList) window.renderTripList();

    // ── 9. Report ──────────────────────────────────────────────────────────────

    const skippedMsg = report.tripsSkipped > 0
      ? `\n${report.tripsSkipped} malformed trip(s) were skipped.`
      : '';

    alert(
      `Import successful.\n` +
      `${report.tripsImported} trip(s) imported.${skippedMsg}`
    );

    console.info('[compat] Import complete:', report);
  }

  // ── Validation ───────────────────────────────────────────────────────────────

  /**
   * Validates a raw trip object from an imported file.
   * Returns { valid: boolean, reason: string }
   *
   * Rules — a trip must have:
   *   - id: non-empty string
   *   - title: non-empty string
   *   - countries: non-empty array of strings
   *   - dateFrom: valid date string
   *   - dateTo: valid date string, >= dateFrom
   */
  function validateTripObject(trip) {
    if (!trip || typeof trip !== 'object' || Array.isArray(trip)) {
      return { valid: false, reason: 'not an object' };
    }
    if (!trip.id || typeof trip.id !== 'string' || !trip.id.trim()) {
      return { valid: false, reason: 'missing or empty id' };
    }
    if (!trip.title || typeof trip.title !== 'string' || !trip.title.trim()) {
      return { valid: false, reason: 'missing or empty title' };
    }
    if (!Array.isArray(trip.countries) || trip.countries.length === 0) {
      return { valid: false, reason: 'countries must be a non-empty array' };
    }
    if (!trip.dateFrom || !isValidDate(trip.dateFrom)) {
      return { valid: false, reason: 'missing or invalid dateFrom' };
    }
    if (!trip.dateTo || !isValidDate(trip.dateTo)) {
      return { valid: false, reason: 'missing or invalid dateTo' };
    }
    if (trip.dateFrom > trip.dateTo) {
      return { valid: false, reason: 'dateFrom is after dateTo' };
    }
    return { valid: true, reason: '' };
  }

  function isValidDate(str) {
    if (typeof str !== 'string') return false;
    const d = new Date(str);
    return !isNaN(d.getTime());
  }

  // ── Sanitisers ───────────────────────────────────────────────────────────────

  /**
   * Sanitises a trip object — keeps all valid fields, strips unknown junk.
   * Does not re-validate (caller already did that).
   */
  function sanitiseTrip(trip) {
    return {
      id:          String(trip.id).trim(),
      title:       String(trip.title).trim(),
      countries:   trip.countries.map(String),
      dateFrom:    trip.dateFrom,
      dateTo:      trip.dateTo,
      wonders:     Array.isArray(trip.wonders)    ? trip.wonders.filter(w => typeof w === 'string')    : [],
      companions:  Array.isArray(trip.companions) ? trip.companions.filter(c => typeof c === 'string') : [],
      transport:   typeof trip.transport === 'string' ? trip.transport : null,
      tags:        Array.isArray(trip.tags)       ? trip.tags.filter(t => typeof t === 'string')        : [],
      mood:        typeof trip.mood === 'number' && trip.mood >= 1 && trip.mood <= 5 ? trip.mood : null,
      notes:       typeof trip.notes === 'string' ? trip.notes : null,
      budget:      sanitiseBudget(trip.budget),
      countryDays: sanitiseCountryDays(trip.countryDays),
      legs:        Array.isArray(trip.legs) ? trip.legs : [],
    };
  }

  function sanitiseBudget(budget) {
    if (!budget || typeof budget !== 'object') return null;
    if (!budget.currency || typeof budget.currency !== 'string') return null;
    return {
      currency: String(budget.currency).toUpperCase(),
      total:    typeof budget.total   === 'number' ? budget.total   : null,
      planned:  typeof budget.planned === 'number' ? budget.planned : null,
      breakdown: sanitiseBreakdown(budget.breakdown),
    };
  }

  function sanitiseBreakdown(bd) {
    if (!bd || typeof bd !== 'object') return null;
    const CATS = ['flights', 'accommodation', 'food', 'transport', 'activities'];
    const result = {};
    CATS.forEach(cat => {
      if (typeof bd[cat] === 'number') result[cat] = bd[cat];
    });
    return Object.keys(result).length ? result : null;
  }

  function sanitiseCountryDays(cd) {
    if (!cd || typeof cd !== 'object' || Array.isArray(cd)) return undefined;
    const result = {};
    Object.entries(cd).forEach(([id, days]) => {
      if (typeof days === 'number' && days > 0) result[String(id)] = days;
    });
    return Object.keys(result).length ? result : undefined;
  }

  /**
   * Sanitises a states object — keeps only valid { status, source } entries
   * or plain 'been'/'want' strings (old format, passed through for migration).
   */
  function sanitiseStates(raw) {
    if (!raw || typeof raw !== 'object') return {};
    const result = {};
    Object.entries(raw).forEach(([id, val]) => {
      if (typeof val === 'string' && (val === 'been' || val === 'want')) {
        result[id] = { status: val, source: 'manual' };
      } else if (
        val && typeof val === 'object' &&
        (val.status === 'been' || val.status === 'want') &&
        (val.source === 'manual' || val.source === 'trip')
      ) {
        result[id] = val;
      }
    });
    return result;
  }

  /**
   * Sanitises a simple string-value map (wonderStates, priorities).
   * Only keeps entries whose values are in the allowedValues list.
   */
  function sanitiseStringMap(raw, allowedValues) {
    if (!raw || typeof raw !== 'object') return {};
    const result = {};
    Object.entries(raw).forEach(([k, v]) => {
      if (typeof v === 'string' && allowedValues.includes(v)) result[k] = v;
    });
    return result;
  }

  /**
   * Sanitises a saved-values array — keeps only non-empty lowercase strings.
   * Deduplicates.
   */
  function sanitiseStringArray(raw) {
    if (!Array.isArray(raw)) return [];
    const seen = new Set();
    return raw
      .filter(v => typeof v === 'string' && v.trim())
      .map(v => v.trim().toLowerCase())
      .filter(v => { if (seen.has(v)) return false; seen.add(v); return true; });
  }

  // ── localStorage helper ──────────────────────────────────────────────────────

  function loadKey(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return fallback;
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  }

  // ── Expose importData for testing ────────────────────────────────────────────

  window._compatImportData       = importData;
  window._compatValidateTrip     = validateTripObject;
  window._compatHandleExport     = handleExport;

  // ── Boot ─────────────────────────────────────────────────────────────────────

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
