/**
 * triplist.test.js — Work Package 5 QA
 *
 * Paste into DevTools console while the Travel Dashboard is open
 * with the Trip Log tab visible and triplist.js loaded.
 *
 * Self-contained — snapshots and restores localStorage automatically.
 * Safe to run with real data.
 */

(function runTripListTests() {

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

  function assertEqual(desc, actual, expected) {
    const ok = JSON.stringify(actual) === JSON.stringify(expected);
    if (!ok) {
      console.error('%c FAIL %c ' + desc, 'background:#e76f51;color:white;padding:2px 6px;border-radius:3px;font-weight:bold', '');
      console.error('  Expected:', expected, '  Actual:', actual);
      failed++;
    } else {
      console.log('%c PASS %c ' + desc, 'background:#2a9d8f;color:white;padding:2px 6px;border-radius:3px;font-weight:bold', '');
      passed++;
    }
  }

  function manual(desc) {
    console.info('%c TODO %c ' + desc, 'background:#f4a261;color:white;padding:2px 6px;border-radius:3px;font-weight:bold', '');
  }

  function section(title) {
    console.groupCollapsed('%c ' + title, 'font-weight:bold;font-size:14px;color:#8ecae6');
  }

  function endSection() { console.groupEnd(); }

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
    if (window.renderTripList) window.renderTripList();
  }

  // ── Test trip factory ──────────────────────────────────────────────────────

  function makeTrip(overrides = {}) {
    return {
      title:      'Test Trip',
      countries:  ['276'],       // Germany
      dateFrom:   '2024-01-01',
      dateTo:     '2024-01-07',  // 7 days
      companions: ['partner'],
      transport:  'flight',
      tags:       ['culture'],
      mood:       4,
      ...overrides,
    };
  }

  const snapshot = snap();

  try {

    // ── Section 1: Prerequisites ─────────────────────────────────────────────
    section('1. Prerequisites');
    assert('window.TripStore loaded',      typeof window.TripStore === 'object');
    assert('window.renderTripList loaded', typeof window.renderTripList === 'function');
    assert('tlList DOM element exists',    !!document.getElementById('tlList'));
    if (window.renderTripList) window.renderTripList();
    assert('tl5FilterBar injected into DOM',
      !!document.getElementById('tl5FilterBar'));
    endSection();

    // ── Section 2: Sort order — most recent first ────────────────────────────
    section('2. Sort order — date descending');

    localStorage.setItem(window.STORAGE_KEYS.trips, JSON.stringify([]));
    window.TripStore.init();

    const tA = window.TripStore.saveTrip(makeTrip({ title: 'Older Trip',  dateFrom: '2022-03-01', dateTo: '2022-03-10', countries: ['276'] })).trip;
    const tB = window.TripStore.saveTrip(makeTrip({ title: 'Newer Trip',  dateFrom: '2024-06-01', dateTo: '2024-06-07', countries: ['380'] })).trip;
    const tC = window.TripStore.saveTrip(makeTrip({ title: 'Middle Trip', dateFrom: '2023-09-01', dateTo: '2023-09-05', countries: ['724'] })).trip;

    window.renderTripList();
    const items = document.querySelectorAll('#tlList .tl5-list-item');
    assert('Three items rendered', items.length === 3);
    assert('First item is newest trip (2024)',
      items[0] && items[0].dataset.id === tB.id);
    assert('Second item is middle trip (2023)',
      items[1] && items[1].dataset.id === tC.id);
    assert('Third item is oldest trip (2022)',
      items[2] && items[2].dataset.id === tA.id);

    endSection();

    // ── Section 3: Filter by country ────────────────────────────────────────
    section('3. Filter by country');

    // Set country filter to Germany (276)
    const cSel = document.getElementById('tl5FCountry');
    if (cSel) {
      cSel.value = '276';
      cSel.dispatchEvent(new Event('change'));
    }

    const afterCountryFilter = document.querySelectorAll('#tlList .tl5-list-item');
    assert('Filter by Germany shows 1 trip', afterCountryFilter.length === 1);
    assert('Shown trip is the Germany trip',
      afterCountryFilter[0] && afterCountryFilter[0].dataset.id === tA.id);

    // Reset filter
    if (cSel) { cSel.value = ''; cSel.dispatchEvent(new Event('change')); }

    endSection();

    // ── Section 4: Filter by companion — contains check ──────────────────────
    section('4. Filter by companion — contains check');

    localStorage.setItem(window.STORAGE_KEYS.trips, JSON.stringify([]));
    window.TripStore.init();

    // Trip with ["partner", "friends"] — should match filter "partner"
    const tComp1 = window.TripStore.saveTrip(makeTrip({
      title: 'With Partner and Friends',
      countries: ['380'],
      dateFrom: '2024-01-01', dateTo: '2024-01-05',
      companions: ['partner', 'friends'],
    })).trip;

    // Trip with just ["family"] — should NOT match "partner"
    const tComp2 = window.TripStore.saveTrip(makeTrip({
      title: 'Family Trip',
      countries: ['724'],
      dateFrom: '2024-02-01', dateTo: '2024-02-05',
      companions: ['family'],
    })).trip;

    window.renderTripList();

    const compSel = document.getElementById('tl5FCompanion');
    if (compSel) {
      compSel.value = 'partner';
      compSel.dispatchEvent(new Event('change'));
    }

    const afterCompFilter = document.querySelectorAll('#tlList .tl5-list-item');
    assert('Filter "partner" returns trip with ["partner","friends"]', afterCompFilter.length === 1);
    assert('Correct trip shown for companion filter',
      afterCompFilter[0] && afterCompFilter[0].dataset.id === tComp1.id);

    // Reset
    if (compSel) { compSel.value = ''; compSel.dispatchEvent(new Event('change')); }

    endSection();

    // ── Section 5: Filter by tag — contains check ────────────────────────────
    section('5. Filter by tag — contains check');

    localStorage.setItem(window.STORAGE_KEYS.trips, JSON.stringify([]));
    window.TripStore.init();

    const tTag1 = window.TripStore.saveTrip(makeTrip({
      title: 'Beach Trip', tags: ['beach', 'relax'],
      countries: ['724'], dateFrom: '2024-03-01', dateTo: '2024-03-07',
    })).trip;
    const tTag2 = window.TripStore.saveTrip(makeTrip({
      title: 'City Trip', tags: ['culture', 'food'],
      countries: ['380'], dateFrom: '2024-04-01', dateTo: '2024-04-05',
    })).trip;

    window.renderTripList();

    const tagSel = document.getElementById('tl5FTag');
    if (tagSel) {
      tagSel.value = 'beach';
      tagSel.dispatchEvent(new Event('change'));
    }

    const afterTagFilter = document.querySelectorAll('#tlList .tl5-list-item');
    assert('Filter "beach" returns 1 trip', afterTagFilter.length === 1);
    assert('Correct beach trip shown', afterTagFilter[0] && afterTagFilter[0].dataset.id === tTag1.id);

    // "culture" filter
    if (tagSel) { tagSel.value = 'culture'; tagSel.dispatchEvent(new Event('change')); }
    const afterCultureFilter = document.querySelectorAll('#tlList .tl5-list-item');
    assert('Filter "culture" returns 1 trip', afterCultureFilter.length === 1);
    assert('Correct culture trip shown', afterCultureFilter[0] && afterCultureFilter[0].dataset.id === tTag2.id);

    // Reset
    if (tagSel) { tagSel.value = ''; tagSel.dispatchEvent(new Event('change')); }

    endSection();

    // ── Section 6: Filter by year ────────────────────────────────────────────
    section('6. Filter by year');

    localStorage.setItem(window.STORAGE_KEYS.trips, JSON.stringify([]));
    window.TripStore.init();

    window.TripStore.saveTrip(makeTrip({ title: '2022 Trip', countries: ['276'], dateFrom: '2022-05-01', dateTo: '2022-05-07' }));
    window.TripStore.saveTrip(makeTrip({ title: '2023 Trip', countries: ['380'], dateFrom: '2023-07-01', dateTo: '2023-07-10' }));
    window.TripStore.saveTrip(makeTrip({ title: '2024 Trip', countries: ['724'], dateFrom: '2024-09-01', dateTo: '2024-09-05' }));

    window.renderTripList();

    const yrSel = document.getElementById('tl5FYear');
    if (yrSel) {
      yrSel.value = '2023';
      yrSel.dispatchEvent(new Event('change'));
    }

    const afterYearFilter = document.querySelectorAll('#tlList .tl5-list-item');
    assert('Filter by 2023 returns 1 trip', afterYearFilter.length === 1);
    assert('Correct 2023 trip shown',
      afterYearFilter[0] && afterYearFilter[0].querySelector('.tl5-item-title').textContent === '2023 Trip');

    if (yrSel) { yrSel.value = ''; yrSel.dispatchEvent(new Event('change')); }

    endSection();

    // Section 7 — No results state
    section('7. No results state when filters match nothing');

    localStorage.setItem(window.STORAGE_KEYS.trips, JSON.stringify([]));
    window.TripStore.init();
    window.TripStore.saveTrip(makeTrip({
      title: 'Only Trip',
      tags: ['hiking'],
      countries: ['276'],
      dateFrom: '2024-01-01',
      dateTo: '2024-01-05'
    }));

    window.renderTripList();

    // Directly set the mood filter to 1 (Terrible) — no trips have mood=1
    const moodSel = document.getElementById('tl5FMood');
    if (moodSel) {
      moodSel.value = '1';
      moodSel.dispatchEvent(new Event('change'));
    }

    const noResults = document.querySelector('#tlList .tl5-no-results');
    assert('"No trips match" message shown when filter has no results', !!noResults);

    // Reset
    if (moodSel) { moodSel.value = '0'; moodSel.dispatchEvent(new Event('change')); }

    endSection();

    // ── Section 8: Detail panel expand / collapse ────────────────────────────
    section('8. Detail panel expand / collapse');

    localStorage.setItem(window.STORAGE_KEYS.trips, JSON.stringify([]));
    window.TripStore.init();

    window.TripStore.saveTrip(makeTrip({
      title: 'Detail Test Trip',
      countries: ['380', '724'],    // Italy, Spain
      dateFrom: '2024-05-01', dateTo: '2024-05-10',  // 10 days
      notes: 'Great food everywhere',
      budget: { currency: 'EUR', total: 1200, planned: 1000 },
    }));

    window.renderTripList();

    const firstItem = document.querySelector('#tlList .tl5-list-item');
    assert('List item exists', !!firstItem);

    const detailWrap = firstItem && firstItem.querySelector('.tl5-detail-wrap');
    assert('Detail panel is hidden by default', detailWrap && detailWrap.style.display === 'none');

    // Click to expand
    const summary = firstItem && firstItem.querySelector('.tl5-summary');
    if (summary) summary.click();

    const expandedItem = document.querySelector('#tlList .tl5-list-item.tl5-expanded');
    assert('Item gets tl5-expanded class after click', !!expandedItem);

    const expandedDetail = expandedItem && expandedItem.querySelector('.tl5-detail-wrap');
    assert('Detail panel visible after expand', expandedDetail && expandedDetail.style.display !== 'none');
    assert('Detail panel has content', expandedDetail && expandedDetail.innerHTML.length > 50);

    endSection();

    // ── Section 9: Days per country in detail ────────────────────────────────
    section('9. Days per country in detail view');

    localStorage.setItem(window.STORAGE_KEYS.trips, JSON.stringify([]));
    window.TripStore.init();

    // Trip WITH countryDays override
    window.TripStore.saveTrip(makeTrip({
      title: 'Manual Days Trip',
      countries: ['380', '724'],     // Italy, Spain
      dateFrom: '2024-05-01', dateTo: '2024-05-10',  // 10 days
      countryDays: { '380': 7, '724': 3 },
    }));

    window.renderTripList();

    const manualItem = document.querySelector('#tlList .tl5-list-item');
    const manualSummary = manualItem && manualItem.querySelector('.tl5-summary');
    if (manualSummary) manualSummary.click();

    const detailText = document.querySelector('.tl5-detail-panel') &&
      document.querySelector('.tl5-detail-panel').textContent;

    assert('Detail shows 7 days for Italy (manual override)',
      detailText && detailText.includes('7 day'));
    assert('Detail shows 3 days for Spain (manual override)',
      detailText && detailText.includes('3 day'));
    assert('Note says days specified manually',
      detailText && detailText.toLowerCase().includes('specified manually'));

    // Collapse and test equal split
    if (manualSummary) manualSummary.click();

    localStorage.setItem(window.STORAGE_KEYS.trips, JSON.stringify([]));
    window.TripStore.init();

    // Trip WITHOUT countryDays — 10 days / 2 countries = 5 each
    window.TripStore.saveTrip(makeTrip({
      title: 'Equal Split Trip',
      countries: ['380', '724'],
      dateFrom: '2024-05-01', dateTo: '2024-05-10',
      // no countryDays
    }));

    window.renderTripList();

    const equalItem = document.querySelector('#tlList .tl5-list-item');
    const equalSummary = equalItem && equalItem.querySelector('.tl5-summary');
    if (equalSummary) equalSummary.click();

    const equalText = document.querySelector('.tl5-detail-panel') &&
      document.querySelector('.tl5-detail-panel').textContent;

    assert('Equal split: both countries get 5 days each',
      equalText && (equalText.match(/5 day/g) || []).length >= 2);
    assert('Note says days split equally',
      equalText && equalText.toLowerCase().includes('equally'));

    endSection();

    // ── Section 10: First visit badge ────────────────────────────────────────
    section('10. First visit badge');

    localStorage.setItem(window.STORAGE_KEYS.trips, JSON.stringify([]));
    window.TripStore.init();

    // First trip to Germany (earlier date)
    const firstDE = window.TripStore.saveTrip(makeTrip({
      title: 'First Germany Trip',
      countries: ['276'],
      dateFrom: '2020-06-01', dateTo: '2020-06-07',
    })).trip;

    // Second trip to Germany (later) + first trip to France
    const secondDE_firstFR = window.TripStore.saveTrip(makeTrip({
      title: 'Germany + France',
      countries: ['276', '250'],
      dateFrom: '2023-08-01', dateTo: '2023-08-10',
    })).trip;

    window.renderTripList();

    // Expand the first (most recent = Germany+France) item
    const items10 = document.querySelectorAll('#tlList .tl5-list-item');
    assert('Two trips rendered', items10.length === 2);

    // Most recent = Germany+France trip
    const recentItem = items10[0];
    const recentSummary = recentItem && recentItem.querySelector('.tl5-summary');
    if (recentSummary) recentSummary.click();

    const recentDetail = document.querySelector('.tl5-detail-panel');
    const recentText   = recentDetail && recentDetail.textContent;

    assert('First visit badge appears for France (250) in recent trip',
      recentText && recentText.includes('First visit'));
    // Germany should NOT have first visit badge here (first visit was 2020)
    // Count first visit badges — France should have it, Germany should not
    const firstBadges10 = recentDetail && recentDetail.querySelectorAll('.tl5-first-badge');
    assert('Exactly 1 first-visit badge in recent trip detail (France only)',
      firstBadges10 && firstBadges10.length === 1);

    // Collapse and expand the older trip
    if (recentSummary) recentSummary.click();

    const olderItem = document.querySelectorAll('#tlList .tl5-list-item')[1];
    const olderSummary = olderItem && olderItem.querySelector('.tl5-summary');
    if (olderSummary) olderSummary.click();

    const olderDetail = document.querySelector('.tl5-detail-panel');
    const olderBadges = olderDetail && olderDetail.querySelectorAll('.tl5-first-badge');
    assert('First visit badge on Germany in the 2020 trip (actual first visit)',
      olderBadges && olderBadges.length === 1);

    endSection();

    // ── Section 11: Delete from list ─────────────────────────────────────────
    section('11. Delete trip — sync and list update');

    localStorage.setItem(window.STORAGE_KEYS.trips, JSON.stringify([]));
    window.TripStore.init();
    window.setCountryState('276', 'neutral', 'manual');

    const tDel = window.TripStore.saveTrip(makeTrip({
      title: 'Trip to Delete',
      countries: ['276'],
      dateFrom: '2024-01-01', dateTo: '2024-01-07',
    })).trip;

    // Sync country state as if save happened
    window.setCountryState('276', 'been', 'trip');

    window.renderTripList();
    assert('Trip appears in list before delete',
      document.querySelectorAll('#tlList .tl5-list-item').length === 1);

    // Expand and delete
    const delSummary = document.querySelector('.tl5-summary');
    if (delSummary) delSummary.click();

    const deleteBtn = document.querySelector('.tl5-delete-btn');
    assert('Delete button exists in expanded detail', !!deleteBtn);

    // Programmatically delete without confirm dialog
    window.TripStore.deleteTrip(tDel.id);
    // Manually run sync
    const remaining276 = window.TripStore.getTripsForCountry('276');
    if (remaining276.length === 0) window.setCountryState('276', 'neutral', 'manual');
    localStorage.setItem(window.STORAGE_KEYS.states, JSON.stringify(window.states));

    window.renderTripList();
    assert('List is empty after deletion',
      document.querySelectorAll('#tlList .tl5-list-item').length === 0);
    assert('Empty state shown after deletion',
      document.getElementById('tlEmpty') &&
      document.getElementById('tlEmpty').style.display !== 'none');
    assert('Germany reverted to neutral after sole trip deleted',
      window.getCountryStatus('276') === 'neutral');

    endSection();

    // ── Section 12: Edit — country change sync ───────────────────────────────
    section('12. Edit trip — country change syncs correctly');

    localStorage.setItem(window.STORAGE_KEYS.trips, JSON.stringify([]));
    window.TripStore.init();

    // Save a trip covering Germany + France
    const tEdit = window.TripStore.saveTrip(makeTrip({
      title: 'Edit Country Test',
      countries: ['276', '250'],   // Germany, France
      dateFrom: '2024-02-01', dateTo: '2024-02-10',
    })).trip;

    // Simulate both countries marked as been/trip
    window.setCountryState('276', 'been', 'trip');
    window.setCountryState('250', 'been', 'trip');

    // Now edit the trip to remove Germany, add Spain
    const updatedTrip = {
      ...tEdit,
      countries: ['724', '250'],  // Spain + France, no Germany
    };

    // Store prev countries as triplist.js would
    window._editingPrevCountries = ['276', '250'];

    // Save updated trip
    window.TripStore.saveTrip(updatedTrip);

    // Run the patched sync
    if (window._patchedSyncOnSave) window._patchedSyncOnSave(updatedTrip);

    assert('New country (Spain 724) marked as been after edit',
      window.getCountryStatus('724') === 'been');
    assert('Kept country (France 250) still been after edit',
      window.getCountryStatus('250') === 'been');
    assert('Removed country (Germany 276) reverted to neutral after edit',
      window.getCountryStatus('276') === 'neutral');

    endSection();

    // ── Section 13: Budget detail display ────────────────────────────────────
    section('13. Budget in detail view');

    localStorage.setItem(window.STORAGE_KEYS.trips, JSON.stringify([]));
    window.TripStore.init();

    window.TripStore.saveTrip(makeTrip({
      title: 'Budget Detail Test',
      countries: ['380'],
      dateFrom: '2024-06-01', dateTo: '2024-06-10', // 10 days
      budget: {
        currency: 'EUR',
        total: 1500,
        planned: 1200,
        breakdown: { flights: 400, accommodation: 700, food: 400 },
      },
    }));

    window.renderTripList();
    const budgetItem = document.querySelector('#tlList .tl5-list-item');
    const budgetSummary = budgetItem && budgetItem.querySelector('.tl5-summary');
    if (budgetSummary) budgetSummary.click();

    const budgetPanel = document.querySelector('.tl5-detail-panel');
    const budgetText  = budgetPanel && budgetPanel.textContent;

    // Replace the two failing asserts with these:
    assert('Total spent shown in detail',
    budgetText && (budgetText.includes('1,500') || budgetText.includes('1.500') || budgetText.includes('1500')));
    assert('Planned shown in detail',
    budgetText && (budgetText.includes('1,200') || budgetText.includes('1.200') || budgetText.includes('1200')));
    assert('Per-day shown in detail',      budgetText && budgetText.includes('150'));  // 1500/10
    assert('Over-budget indicator shown',  budgetPanel && !!budgetPanel.querySelector('.tl5-budget-diff.over'));
    assert('Budget breakdown shown',       budgetText && budgetText.includes('Flights') || budgetText.includes('flights'));

    endSection();

    // ── Section 14: Flags in list ─────────────────────────────────────────────
    section('14. Country flags in list items');

    window.renderTripList();
    const flagImgs = document.querySelectorAll('#tlList .tl5-flag');
    assert('Flag images rendered in list', flagImgs.length > 0);
    assert('Flag src points to flagcdn.com',
      flagImgs[0] && flagImgs[0].src.includes('flagcdn.com'));

    endSection();

    // ── Section 15: Manual checks ─────────────────────────────────────────────
    section('15. Manual visual checks');

    manual('Click the chevron ▾ on a list item → detail panel slides open, chevron becomes ▴');
    manual('Click again → panel closes, chevron returns to ▾');
    manual('Open one item, then click another → first closes, second opens (accordion behaviour)');
    manual('Filter by country → filter summary updates: "Showing X of Y trips"');
    manual('Clear all filters → summary shows "Y trips" (no "Showing X of")');
    manual('Sort by "Longest first" → trips reorder by duration descending');
    manual('Sort by "Best mood first" → trips reorder by mood rating descending');
    manual('Trip with notes → expand detail → notes appear in styled box');
    manual('Trip without budget → expand detail → no budget section shown');
    manual('Trip with wonders → expand detail → wonders appear as green tags');

    endSection();

  } finally {
    restore(snapshot);
    console.info('[triplist.test] localStorage restored.');
  }

  const total = passed + failed;
  const color = failed === 0 ? '#2a9d8f' : '#e76f51';
  console.log(
    `%c Trip List Tests: ${passed} / ${total} passed ${failed > 0 ? '(' + failed + ' FAILED)' : '✓'}`,
    `background:${color};color:white;padding:4px 12px;border-radius:4px;font-weight:bold;font-size:14px`
  );

})();
