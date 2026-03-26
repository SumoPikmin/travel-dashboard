/**
 * tripstats.js — Work Package 6
 *
 * Extends the existing Stats tab with trip-derived statistics and
 * patches the country list to show first-visit years.
 *
 * Strategy: patches window.updateStats so the existing call in stats.js,
 * map.js and triplog.js automatically picks up the richer version.
 * No changes needed to stats.js itself.
 *
 * Load order in index.html (must be AFTER stats.js and triplist.js):
 *   migration.js → trips.js → map.js → stats.js → wonders.js
 *   → triplog.js → triplist.js → tripstats.js
 *
 * Exposes:
 *   window.updateStats()  — patched version, safe drop-in replacement
 */

(function () {

  // ── Helpers ──────────────────────────────────────────────────────────────────

  function el(id) { return document.getElementById(id); }

  function pluralise(n, word) {
    return `${n} ${word}${n !== 1 ? 's' : ''}`;
  }

  // Locale-safe number formatter — always uses en-GB to avoid German dot separators
  function fmt(n) {
    return Number(n).toLocaleString('en-GB');
  }

  function fmtDecimal(n, decimals = 1) {
    return Number(n).toLocaleString('en-GB', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }

  // ── Derived stat helpers ──────────────────────────────────────────────────────

  /**
   * Returns the most common value(s) from an array of strings.
   * Returns { value, count } or null if array is empty.
   * If multiple values tie, returns the first alphabetically.
   */
  function mostCommon(arr) {
    if (!arr.length) return null;
    const counts = {};
    arr.forEach(v => { counts[v] = (counts[v] || 0) + 1; });
    const max = Math.max(...Object.values(counts));
    const winners = Object.keys(counts).filter(k => counts[k] === max).sort();
    return { value: winners[0], count: max, all: winners };
  }

  /**
   * Collects all companion values across all trips into a flat array.
   * Used for "most common companion" stat.
   */
  function getAllCompanions(trips) {
    return trips.flatMap(t => Array.isArray(t.companions) ? t.companions : []);
  }

  /**
   * Collects all tags across all trips.
   */
  function getAllTags(trips) {
    return trips.flatMap(t => Array.isArray(t.tags) ? t.tags : []);
  }

  /**
   * Collects all transport values.
   */
  function getAllTransports(trips) {
    return trips.map(t => t.transport).filter(Boolean);
  }

  /**
   * Returns a country name from its id using the global nameIndex.
   */
  function countryName(id) {
    if (!window.nameIndex) return id;
    const entry = Object.values(window.nameIndex).find(f => String(f.id) === String(id));
    return entry ? entry.properties.displayName : String(id);
  }

  // ── Build the trip stats section HTML ────────────────────────────────────────

  function buildTripStatsHTML(trips) {
    if (!trips.length) {
      return `
        <div class="ts-empty">
          No trips logged yet — add your first trip in the
          <strong>Trip Log</strong> tab to see stats here.
        </div>`;
    }

    const totalTrips    = trips.length;
    const totalDays     = window.TripStore.getTotalDaysAbroad();
    const avgDuration   = window.TripStore.getAverageTripDuration();
    const perYear       = window.TripStore.getTripsPerYear();
    const budgetStats   = window.TripStore.getBudgetStats();
    const mostVisited   = window.TripStore.getMostVisitedCountry();
    const companions    = getAllCompanions(trips);
    const tags          = getAllTags(trips);
    const transports    = getAllTransports(trips);

    const topCompanion  = mostCommon(companions);
    const topTag        = mostCommon(tags);
    const topTransport  = mostCommon(transports);
    const mostVisitedName = mostVisited
      ? (Array.isArray(mostVisited) ? mostVisited.map(countryName).join(', ') : countryName(mostVisited))
      : '—';

    // ── Trips per year bar chart ──────────────────────────────────────────────

    const years      = Object.keys(perYear).sort();
    const maxPerYear = years.length ? Math.max(...Object.values(perYear)) : 1;

    const barsHTML = years.length
      ? `<div class="ts-bars">
           ${years.map(yr => {
             const count  = perYear[yr];
             const pct    = Math.round((count / maxPerYear) * 100);
             return `
               <div class="ts-bar-group">
                 <div class="ts-bar-wrap">
                   <div class="ts-bar" style="height:${pct}%" title="${count} trip${count !== 1 ? 's' : ''}"></div>
                 </div>
                 <div class="ts-bar-label">${yr}</div>
                 <div class="ts-bar-count">${count}</div>
               </div>`;
           }).join('')}
         </div>`
      : '';

    // ── Budget section ────────────────────────────────────────────────────────

    const budgetRows = Object.entries(budgetStats.byCurrency).map(([cur, data]) => `
      <div class="ts-budget-row">
        <span class="ts-budget-cur">${cur}</span>
        <span class="ts-budget-total">${cur} ${fmt(data.total)} total</span>
        <span class="ts-budget-perday">${cur} ${fmtDecimal(data.avgPerDay)} / day avg</span>
        <span class="ts-budget-count">${pluralise(data.count, 'trip')}</span>
      </div>`).join('');

    const budgetHTML = Object.keys(budgetStats.byCurrency).length
      ? `<div class="ts-budget-list">${budgetRows}</div>
         ${budgetStats.tripsWithoutBudget
           ? `<div class="ts-budget-note">${budgetStats.tripsWithoutBudget} trip${budgetStats.tripsWithoutBudget !== 1 ? 's' : ''} without budget data</div>`
           : ''}`
      : `<div class="ts-budget-note">No budget data logged yet.</div>`;

    // ── Top tags ─────────────────────────────────────────────────────────────

    const tagCounts = {};
    tags.forEach(t => { tagCounts[t] = (tagCounts[t] || 0) + 1; });
    const topTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);

    const tagsHTML = topTags.length
      ? topTags.map(([tag, count]) =>
          `<span class="ts-tag-chip" title="${count} trip${count !== 1 ? 's' : ''}">${tag} <span class="ts-tag-count">${count}</span></span>`
        ).join('')
      : '<span class="ts-none">No tags logged yet.</span>';

    // ── Assemble ──────────────────────────────────────────────────────────────

    return `
      <!-- Key numbers -->
      <div class="ts-grid">
        <div class="ts-card">
          <div class="ts-card-val">${fmt(totalTrips)}</div>
          <div class="ts-card-label">trips</div>
        </div>
        <div class="ts-card">
          <div class="ts-card-val">${fmt(totalDays)}</div>
          <div class="ts-card-label">days abroad</div>
        </div>
        <div class="ts-card">
          <div class="ts-card-val">${fmtDecimal(avgDuration)}</div>
          <div class="ts-card-label">avg days / trip</div>
        </div>
        <div class="ts-card">
          <div class="ts-card-val ts-card-country">${mostVisitedName}</div>
          <div class="ts-card-label">most visited</div>
        </div>
      </div>

      <!-- Trips per year -->
      ${years.length > 1 ? `
        <div class="ts-section">
          <div class="ts-section-title">Trips per year</div>
          ${barsHTML}
        </div>` : ''}

      <!-- Budget -->
      <div class="ts-section">
        <div class="ts-section-title">Budget</div>
        ${budgetHTML}
      </div>

      <!-- Travel style -->
      <div class="ts-section">
        <div class="ts-section-title">Travel style</div>
        <div class="ts-style-grid">
          <div class="ts-style-item">
            <div class="ts-style-label">Top companion</div>
            <div class="ts-style-val">${topCompanion ? topCompanion.value : '—'}</div>
            ${topCompanion ? `<div class="ts-style-sub">${topCompanion.count} trip${topCompanion.count !== 1 ? 's' : ''}</div>` : ''}
          </div>
          <div class="ts-style-item">
            <div class="ts-style-label">Top transport</div>
            <div class="ts-style-val">${topTransport ? topTransport.value : '—'}</div>
            ${topTransport ? `<div class="ts-style-sub">${topTransport.count} trip${topTransport.count !== 1 ? 's' : ''}</div>` : ''}
          </div>
        </div>
      </div>

      <!-- Tags -->
      <div class="ts-section">
        <div class="ts-section-title">Top tags</div>
        <div class="ts-tags-wrap">${tagsHTML}</div>
      </div>
    `;
  }

  // ── Ensure the trip stats container exists in the stats tab ──────────────────

  function ensureTripStatsContainer() {
    if (el('tsTripStats')) return;

    const statsContent = el('statsContent');
    if (!statsContent) return;

    // Insert after the hr that follows statsCircles
    const hr = statsContent.querySelector('hr');
    const container = document.createElement('div');
    container.id        = 'tsTripStats';
    container.className = 'ts-trip-stats';

    if (hr) {
      statsContent.insertBefore(container, hr);
    } else {
      // Fallback: insert before the country list toolbar
      const toolbar = statsContent.querySelector('.cl-toolbar');
      if (toolbar) statsContent.insertBefore(container, toolbar);
      else statsContent.appendChild(container);
    }

    // Insert a visual divider label
    const divider = document.createElement('div');
    divider.className = 'ts-divider';
    divider.textContent = 'Trip Log Stats';
    container.before(divider);
  }

  // ── Patch renderCountryList to add first-visit years ─────────────────────────
  // We wrap the existing function so it runs normally then decorates each item.

  function patchCountryList() {
  if (!window.renderCountryList || window._tripstatsPatched) return;
  window._tripstatsPatched = true;

  const original = window.renderCountryList;

  window.renderCountryList = function () {
    // Run the original first so all .cl-item elements exist
    original();
    // Then decorate synchronously — no observer needed
    decorateCountryListWithFirstVisit();
  };
}

  function decorateCountryListWithFirstVisit() {
    if (!window.TripStore || !window.nameIndex) return;

    document.querySelectorAll('#countryListContainer .cl-item').forEach(item => {
      if (item.querySelector('.cl-first-year')) return;

      const nameEl = item.querySelector('.cl-name');
      if (!nameEl) return;
      const name = nameEl.textContent.trim();

      const entry = window.nameIndex[name.toLowerCase()];
      if (!entry) return;

      const year = window.TripStore.getFirstVisitYear(entry.id);
      if (!year) return;

      const badge = document.createElement('span');
      badge.className   = 'cl-first-year';
      badge.textContent = `✈ ${year}`;
      badge.title       = `First visited ${year}`;
      item.appendChild(badge);
    });
  }

  /**
   * After renderCountryList runs, find each country list item and
   * append a first-visit year badge if TripStore has data for it.
   */
  function decorateCountryListWithFirstVisit() {
    if (!window.TripStore || !window.nameIndex) return;

    document.querySelectorAll('#countryListContainer .cl-item').forEach(item => {
      // Avoid double-decorating
      if (item.querySelector('.cl-first-year')) return;

      const nameEl = item.querySelector('.cl-name');
      if (!nameEl) return;
      const name = nameEl.textContent.trim();

      // Look up country id via nameIndex
      const entry = window.nameIndex[name.toLowerCase()];
      if (!entry) return;
      const id = entry.id;

      const year = window.TripStore.getFirstVisitYear(id);
      if (!year) return;

      const badge = document.createElement('span');
      badge.className   = 'cl-first-year';
      badge.textContent = `✈ ${year}`;
      badge.title       = `First visited ${year}`;
      item.appendChild(badge);
    });
  }

  // ── Wonders stats — trip vs manual breakdown ──────────────────────────────────

  function buildWondersStatsBreakdown() {
    if (!window.WONDERS_ALL || !window.TripStore) return;

    const trips = window.TripStore.getTrips();

    // Collect all wonder names logged via trips
    const viaTrips = new Set(
      trips.flatMap(t => Array.isArray(t.wonders) ? t.wonders : [])
    );

    // Collect all wonder names marked manually (wonderStates)
    const manualStates = window.wonderStates || {};
    const viaBeen      = Object.keys(manualStates).filter(n => manualStates[n] === 'been');

    // Items that are in both — counted once
    const allBeen = new Set([...viaTrips, ...viaBeen]);

    const totalNatural  = window.WONDERS_DATA ? window.WONDERS_DATA.natural.length  : 0;
    const totalCultural = window.WONDERS_DATA ? window.WONDERS_DATA.cultural.length : 0;
    const total         = totalNatural + totalCultural;

    const viaTripsOnly    = [...viaTrips].filter(n => !viaBeen.includes(n) || manualStates[n] !== 'been');
    const manualOnly      = viaBeen.filter(n => !viaTrips.has(n));
    const both            = [...viaTrips].filter(n => viaBeen.includes(n));

    // Only inject if the wonders summary element exists
    const summary = el('wondersSummary');
    if (!summary) return;

    // Add a small breakdown note under the existing summary
    let breakdown = el('tsWondersBreakdown');
    if (!breakdown) {
      breakdown = document.createElement('div');
      breakdown.id        = 'tsWondersBreakdown';
      breakdown.className = 'ts-wonders-breakdown';
      summary.after(breakdown);
    }

    if (!allBeen.size) {
      breakdown.innerHTML = '';
      return;
    }

    breakdown.innerHTML = `
      ${viaTrips.size ? `<span class="ts-wb-chip ts-wb-trip">✈ ${viaTrips.size} via trips</span>` : ''}
      ${manualOnly.length ? `<span class="ts-wb-chip ts-wb-manual">✓ ${manualOnly.length} manually marked</span>` : ''}
    `;
  }

  // ── Patched updateStats ───────────────────────────────────────────────────────

  const _originalUpdateStats = window.updateStats;

  window.updateStats = function updateStats() {
    // Run the original stats.js logic first (circles, summary, country list)
    if (_originalUpdateStats) _originalUpdateStats();

    // Ensure our container exists
    ensureTripStatsContainer();

    // Render trip stats
    const container = el('tsTripStats');
    if (container && window.TripStore) {
      const trips = window.TripStore.getTrips();
      container.innerHTML = buildTripStatsHTML(trips);
    }

    // Patch country list decorator (runs once)
    patchCountryList();

    // Update wonders breakdown if wonders tab is open
    buildWondersStatsBreakdown();
  };

  // ── Run immediately if stats tab is already visible ───────────────────────────

  if (el('statsContent') && el('statsContent').style.display !== 'none') {
    window.updateStats();
  }

  // Also hook into the stats tab becoming visible via the tab switcher.
  // The tab switcher in index.html calls window.updateStats() on first open —
  // our patch above means it will automatically run the richer version.

})();
