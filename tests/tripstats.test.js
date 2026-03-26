/**
 * tripstats.test.js — Work Package 6 QA
 *
 * Paste into DevTools console while the Travel Dashboard is open
 * with the Stats tab visible and tripstats.js loaded.
 *
 * Self-contained — snapshots and restores localStorage automatically.
 * Safe to run with real data.
 *
 * Prerequisites in stats.js:
 *   window.renderCountryList = renderCountryList;  ← must be outside both branches
 *
 * Prerequisites in tripstats.js:
 *   patchCountryList() must wrap window.renderCountryList synchronously
 *   (no MutationObserver)
 */

(function runTripStatsTests() {

  let passed = 0, failed = 0;

  function assert(desc, cond) {
    if (cond) {
      console.log('%c PASS %c ' + desc, 'background:#2a9d8f;color:white;padding:2px 6px;border-radius:3px;font-weight:bold', '');
      passed++;
    } else {
      console.error('%c FAIL %c ' + desc, 'background:#e76f51;color:white;padding:2px 6px;border-radius:3px;font-weight:bold', '');
      failed++;
    }
  }

  function manual(desc) {
    console.info('%c TODO %c ' + desc, 'background:#f4a261;color:white;padding:2px 6px;border-radius:3px;font-weight:bold', '');
  }

  function section(title) {
    console.groupCollapsed('%c ' + title, 'font-weight:bold;font-size:14px;color:#8ecae6');
  }

  function endSection() { console.groupEnd(); }

  function el(id) { return document.getElementById(id); }

  // ── Locale-safe number check ───────────────────────────────────────────────
  function containsNumber(text, n) {
    const raw    = String(n);
    const dotSep = n >= 1000 ? raw.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : raw;
    const comSep = n >= 1000 ? raw.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : raw;
    return text.includes(raw) || text.includes(dotSep) || text.includes(comSep);
  }

  // ── Snapshot / restore ─────────────────────────────────────────────────────

  function snap() {
    const s = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      s[k] = localStorage.getItem(k);
    }
    return s;
  }

  function restore(s) {
    localStorage.clear();
    Object.entries(s).forEach(([k, v]) => localStorage.setItem(k, v));
    window.TripStore.init();
    if (window.updateStats) window.updateStats();
  }

  // ── Trip factory ───────────────────────────────────────────────────────────

  function makeTrip(overrides = {}) {
    return {
      title:      'Stats Test Trip',
      countries:  ['276'],
      dateFrom:   '2024-01-01',
      dateTo:     '2024-01-07',
      companions: ['partner'],
      transport:  'flight',
      tags:       ['culture'],
      mood:       4,
      ...overrides,
    };
  }

  // ── Helper: reset trips cleanly ────────────────────────────────────────────
  // Clears trips in both localStorage AND the in-memory window.trips cache.

  function resetTrips() {
    localStorage.setItem(window.STORAGE_KEYS.trips, JSON.stringify([]));
    window.TripStore.init(); // syncs window.trips from localStorage
  }

  const snapshot = snap();

  try {

    // ── Section 1: Prerequisites ───────────────────────────────────────────────
    section('1. Prerequisites');

    assert('window.TripStore exists',              typeof window.TripStore === 'object');
    assert('window.updateStats exists',            typeof window.updateStats === 'function');
    assert('window.renderCountryList exposed',     typeof window.renderCountryList === 'function');
    assert('statsContent exists',                  !!el('statsContent'));
    assert('tripstats patch applied (_tripstatsPatched)',  !!window._tripstatsPatched);

    endSection();

    // ── Section 2: No trips — graceful zero state ──────────────────────────────
    section('2. No trips — graceful zero state');

    resetTrips();

    const statsBtn = document.getElementById('statsBtn');
    if (statsBtn) statsBtn.click();
    if (window.updateStats) window.updateStats();

    assert('Stats tab renders without errors when no trips', !!el('statsContent'));

    const tripStatsEl = el('tsTripStats');
    assert('tsTripStats container exists', !!tripStatsEl);
    assert('Empty state message shown when no trips',
      tripStatsEl && tripStatsEl.textContent.toLowerCase().includes('no trips'));

    endSection();

    // ── Section 3: Total trips, days, average ──────────────────────────────────
    section('3. Total trips, days, average duration');

    resetTrips();

    window.TripStore.saveTrip(makeTrip({
      title:     'Nine Day Trip',
      countries: ['276', '380', '724'],
      dateFrom:  '2024-01-01',
      dateTo:    '2024-01-09',           // 9 days inclusive
    }));

    if (window.updateStats) window.updateStats();

    const s3text = el('tsTripStats') && el('tsTripStats').textContent;
    assert('Total trips shows 1',       s3text && s3text.includes('1'));
    assert('Total days abroad shows 9', s3text && s3text.includes('9'));

    endSection();

    // ── Section 4: Most visited country ───────────────────────────────────────
    section('4. Most visited country');

    resetTrips();

    window.TripStore.saveTrip(makeTrip({ title: 'DE 1', countries: ['276'], dateFrom: '2023-03-01', dateTo: '2023-03-05' }));
    window.TripStore.saveTrip(makeTrip({ title: 'DE 2', countries: ['276', '380'], dateFrom: '2024-06-01', dateTo: '2024-06-07' }));

    if (window.updateStats) window.updateStats();

    const s4text = el('tsTripStats') && el('tsTripStats').textContent;
    assert('Most visited shows Germany', s4text && s4text.toLowerCase().includes('germany'));

    endSection();

    // ── Section 5: Trips per year bar chart ───────────────────────────────────
    section('5. Trips per year');

    resetTrips();

    window.TripStore.saveTrip(makeTrip({ title: '2022 A', dateFrom: '2022-01-01', dateTo: '2022-01-05', countries: ['276'] }));
    window.TripStore.saveTrip(makeTrip({ title: '2022 B', dateFrom: '2022-06-01', dateTo: '2022-06-10', countries: ['380'] }));
    window.TripStore.saveTrip(makeTrip({ title: '2024 A', dateFrom: '2024-03-01', dateTo: '2024-03-07', countries: ['724'] }));

    if (window.updateStats) window.updateStats();

    const bars = document.querySelectorAll('#tsTripStats .ts-bar-group');
    assert('Bar chart rendered with 2 year groups', bars.length === 2);

    const barLabels = Array.from(bars).map(b => {
      const lbl = b.querySelector('.ts-bar-label');
      return lbl ? lbl.textContent.trim() : '';
    });
    assert('2022 bar exists', barLabels.includes('2022'));
    assert('2024 bar exists', barLabels.includes('2024'));

    const bar2022 = Array.from(bars).find(b => b.querySelector('.ts-bar-label').textContent.trim() === '2022');
    const bar2024 = Array.from(bars).find(b => b.querySelector('.ts-bar-label').textContent.trim() === '2024');
    assert('2022 bar (2 trips) renders at 100%', bar2022 && bar2022.querySelector('.ts-bar').style.height === '100%');
    assert('2024 bar (1 trip) renders at 50%',   bar2024 && bar2024.querySelector('.ts-bar').style.height === '50%');

    endSection();

    // ── Section 6: Budget — same currency ─────────────────────────────────────
    section('6. Budget stats — same currency');

    resetTrips();

    window.TripStore.saveTrip(makeTrip({
      title: 'Budget 1', countries: ['276'],
      dateFrom: '2024-01-01', dateTo: '2024-01-10', // 10 days
      budget: { currency: 'EUR', total: 1000, planned: 900 },
    }));
    window.TripStore.saveTrip(makeTrip({
      title: 'Budget 2', countries: ['380'],
      dateFrom: '2024-06-01', dateTo: '2024-06-10', // 10 days
      budget: { currency: 'EUR', total: 2000, planned: 1800 },
    }));

    if (window.updateStats) window.updateStats();

    const s6text = el('tsTripStats') && el('tsTripStats').textContent;
    assert('EUR total (3000) shown', s6text && containsNumber(s6text, 3000));
    assert('Per-day average (150) shown', s6text && s6text.includes('150'));

    endSection();

    // ── Section 7: Budget — different currencies ───────────────────────────────
    section('7. Budget — different currencies shown separately');

    resetTrips();

    window.TripStore.saveTrip(makeTrip({
      title: 'EUR Trip', countries: ['276'],
      dateFrom: '2024-01-01', dateTo: '2024-01-05',
      budget: { currency: 'EUR', total: 500, planned: 450 },
    }));
    window.TripStore.saveTrip(makeTrip({
      title: 'USD Trip', countries: ['840'],
      dateFrom: '2024-06-01', dateTo: '2024-06-05',
      budget: { currency: 'USD', total: 800, planned: 700 },
    }));

    if (window.updateStats) window.updateStats();

    const s7text = el('tsTripStats') && el('tsTripStats').textContent;
    assert('EUR shown separately', s7text && s7text.includes('EUR'));
    assert('USD shown separately', s7text && s7text.includes('USD'));
    assert('Does not combine EUR+USD into 1300',
      s7text && !containsNumber(s7text, 1300));

    endSection();

    // ── Section 8: Travel style ────────────────────────────────────────────────
    section('8. Travel style — companion and transport');

    resetTrips();

    window.TripStore.saveTrip(makeTrip({ title: 'T1', companions: ['partner'],           transport: 'flight', dateFrom: '2024-01-01', dateTo: '2024-01-05', countries: ['276'] }));
    window.TripStore.saveTrip(makeTrip({ title: 'T2', companions: ['partner', 'friends'], transport: 'flight', dateFrom: '2024-02-01', dateTo: '2024-02-05', countries: ['380'] }));
    window.TripStore.saveTrip(makeTrip({ title: 'T3', companions: ['solo'],              transport: 'train',  dateFrom: '2024-03-01', dateTo: '2024-03-05', countries: ['724'] }));

    if (window.updateStats) window.updateStats();

    const s8text = el('tsTripStats') && el('tsTripStats').textContent;
    assert('Top companion is "partner"', s8text && s8text.toLowerCase().includes('partner'));
    assert('Top transport is "flight"',  s8text && s8text.toLowerCase().includes('flight'));

    endSection();

    // ── Section 9: Top tags ────────────────────────────────────────────────────
    section('9. Top tags');

    resetTrips();

    window.TripStore.saveTrip(makeTrip({ title: 'T1', tags: ['beach', 'relax'], dateFrom: '2024-01-01', dateTo: '2024-01-05', countries: ['276'] }));
    window.TripStore.saveTrip(makeTrip({ title: 'T2', tags: ['beach', 'food'],  dateFrom: '2024-02-01', dateTo: '2024-02-05', countries: ['380'] }));
    window.TripStore.saveTrip(makeTrip({ title: 'T3', tags: ['culture'],        dateFrom: '2024-03-01', dateTo: '2024-03-05', countries: ['724'] }));

    if (window.updateStats) window.updateStats();

    const tagChips = document.querySelectorAll('#tsTripStats .ts-tag-chip');
    assert('Tag chips rendered', tagChips.length > 0);

    const beachChip = Array.from(tagChips).find(c => c.textContent.includes('beach'));
    assert('"beach" chip exists (most used)', !!beachChip);
    assert('"beach" chip shows count 2', beachChip && beachChip.textContent.includes('2'));

    endSection();

    // ── Section 10: Stats update immediately after add ─────────────────────────
    section('10. Stats update immediately after adding a trip');

    resetTrips();
    if (window.updateStats) window.updateStats();

    const s10before = el('tsTripStats') && el('tsTripStats').textContent;
    assert('Starts empty', s10before && s10before.toLowerCase().includes('no trips'));

    window.TripStore.saveTrip(makeTrip({ title: 'New Trip', countries: ['276'], dateFrom: '2024-05-01', dateTo: '2024-05-07' }));
    if (window.updateStats) window.updateStats();

    const s10after = el('tsTripStats') && el('tsTripStats').textContent;
    assert('Stats update immediately — no longer empty',
      s10after && !s10after.toLowerCase().includes('no trips'));
    assert('Stats show 1 trip', s10after && s10after.includes('1'));

    endSection();

    // ── Section 11: Stats update immediately after delete ──────────────────────
    section('11. Stats update immediately after deleting a trip');

    const { trip: tripToDelete } = window.TripStore.saveTrip(makeTrip({
      title: 'To Delete', countries: ['380'],
      dateFrom: '2024-06-01', dateTo: '2024-06-05',
    }));

    if (window.updateStats) window.updateStats();
    const s11before = el('tsTripStats') && el('tsTripStats').textContent;
    assert('Two trips shown before delete', s11before && s11before.includes('2'));

    window.TripStore.deleteTrip(tripToDelete.id);
    if (window.updateStats) window.updateStats();

    const s11after = el('tsTripStats') && el('tsTripStats').textContent;
    assert('Stats update immediately after delete — shows 1 trip',
      s11after && s11after.includes('1'));

    endSection();

    // ── Section 12: First visit year in country list ───────────────────────────
    section('12. First visit year in country list');

    resetTrips();

    // Mark Germany as been so it appears in the country list
    window.setCountryState('276', 'been', 'trip');
    localStorage.setItem(window.STORAGE_KEYS.states, JSON.stringify(window.states));

    // Save two trips — 2019 is the first visit
    window.TripStore.saveTrip(makeTrip({
      title: 'First Germany',
      countries: ['276'],
      dateFrom: '2019-08-01', dateTo: '2019-08-07',
    }));
    window.TripStore.saveTrip(makeTrip({
      title: 'Second Germany',
      countries: ['276'],
      dateFrom: '2023-05-01', dateTo: '2023-05-05',
    }));

    // Confirm TripStore has the data before proceeding
    const tripsForDE = window.TripStore.getTripsForCountry('276');
    assert('TripStore has trips for Germany before rendering', tripsForDE.length === 2);
    assert('getFirstVisitYear returns 2019', window.TripStore.getFirstVisitYear('276') === 2019);

    // Render country list with first-visit decoration
    const statsBtn2 = document.getElementById('statsBtn');
    if (statsBtn2) statsBtn2.click();
    if (window.updateStats) window.updateStats();
    if (window.renderCountryList) window.renderCountryList();

    // Expand the G section so Germany's list item is visible
    const gHeader = Array.from(
      document.querySelectorAll('#countryListContainer .cl-letter-header')
    ).find(h => {
      const lbl = h.querySelector('.cl-letter');
      return lbl && lbl.textContent.trim() === 'G';
    });
    if (gHeader) gHeader.click();

    const germanyItems = Array.from(
      document.querySelectorAll('#countryListContainer .cl-item')
    ).filter(item => {
      const nameEl = item.querySelector('.cl-name');
      return nameEl && nameEl.textContent.trim() === 'Germany';
    });

    assert('Germany appears in country list', germanyItems.length > 0);

    if (germanyItems.length > 0) {
      const yearBadge = germanyItems[0].querySelector('.cl-first-year');
      assert('First visit year badge exists on Germany', !!yearBadge);
      assert('First visit year shows 2019',
        yearBadge && yearBadge.textContent.includes('2019'));
      assert('First visit year does NOT show 2023',
        yearBadge && !yearBadge.textContent.includes('2023'));
    }

    endSection();

    // ── Section 13: Manual checks ──────────────────────────────────────────────
    section('13. Manual visual checks');

    manual('Open Stats tab with no trips → "No trips logged yet" message appears in Trip Log Stats section');
    manual('Add a trip via Trip Log → switch to Stats → verify cards update (trips, days, avg)');
    manual('Add trips with tags → verify yellow tag chips appear with counts');
    manual('Add trips with same currency budget → verify total and per-day avg shown');
    manual('Add trips in EUR and USD → verify two separate budget rows, no combined total');
    manual('Open Stats → Countries tab → expand a letter → first-visit year ✈ YYYY shown next to countries with trips');
    manual('Country with no trips → no first-visit badge');
    manual('Trips per year bar chart only appears when 2+ different years exist');
    manual('Sort bar chart — tallest bar corresponds to year with most trips');

    endSection();

  } finally {
    restore(snapshot);
    console.info('[tripstats.test] localStorage restored.');
  }

  const total = passed + failed;
  const color = failed === 0 ? '#2a9d8f' : '#e76f51';
  console.log(
    `%c Trip Stats Tests: ${passed} / ${total} passed ${failed > 0 ? '(' + failed + ' FAILED)' : '✓'}`,
    `background:${color};color:white;padding:4px 12px;border-radius:4px;font-weight:bold;font-size:14px`
  );

})();
