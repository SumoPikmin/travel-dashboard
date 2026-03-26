/**
 * trips.test.js — Work Package 2 QA
 *
 * Paste this entire file into your browser DevTools console
 * while the travel dashboard is open, AFTER migration.js and trips.js have run.
 *
 * IMPORTANT: This test suite is fully self-contained and non-destructive.
 * It snapshots localStorage before running and restores it exactly afterward.
 * Your real data will not be affected.
 *
 * Each test prints PASS or FAIL with a description.
 * At the end a summary shows total passed / failed.
 */

(function runTripStoreTests() {

  // ── Mini test harness ──────────────────────────────────────────────────────

  let passed = 0;
  let failed = 0;

  function assert(description, condition) {
    if (condition) {
      console.log('%c PASS %c ' + description, 'background:#2a9d8f;color:white;padding:2px 6px;border-radius:3px;font-weight:bold', '');
      passed++;
    } else {
      console.error('%c FAIL %c ' + description, 'background:#e76f51;color:white;padding:2px 6px;border-radius:3px;font-weight:bold', '');
      failed++;
    }
  }

  function assertEqual(description, actual, expected) {
    const ok = JSON.stringify(actual) === JSON.stringify(expected);
    if (!ok) {
      console.error('%c FAIL %c ' + description, 'background:#e76f51;color:white;padding:2px 6px;border-radius:3px;font-weight:bold', '');
      console.error('  Expected:', JSON.stringify(expected));
      console.error('  Actual:  ', JSON.stringify(actual));
      failed++;
    } else {
      console.log('%c PASS %c ' + description, 'background:#2a9d8f;color:white;padding:2px 6px;border-radius:3px;font-weight:bold', '');
      passed++;
    }
  }

  function section(title) {
    console.groupCollapsed('%c ' + title, 'font-weight:bold;font-size:14px;color:#8ecae6');
  }

  function endSection() {
    console.groupEnd();
  }

  // ── localStorage snapshot/restore ─────────────────────────────────────────

  function snapshotLocalStorage() {
    const snap = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      snap[k] = localStorage.getItem(k);
    }
    return snap;
  }

  function restoreLocalStorage(snap) {
    localStorage.clear();
    Object.entries(snap).forEach(([k, v]) => localStorage.setItem(k, v));
    // Re-init TripStore from restored data
    window.TripStore.init();
  }

  // ── Test data factories ────────────────────────────────────────────────────

  function makeTrip(overrides = {}) {
    return {
      title:      'Test Trip',
      countries:  ['191', '70'],
      dateFrom:   '2024-06-01',
      dateTo:     '2024-06-14',
      companions: ['partner'],
      transport:  'car',
      tags:       ['road trip'],
      mood:       4,
      notes:      'Great trip',
      ...overrides
    };
}

  // ── Run all tests inside a snapshot bubble ─────────────────────────────────

  const snapshot = snapshotLocalStorage();

  // Clear trips and saved values so tests start clean
  localStorage.setItem(window.STORAGE_KEYS.trips, JSON.stringify([]));
  localStorage.setItem(window.STORAGE_KEYS.savedCompanions, JSON.stringify([]));
  localStorage.setItem(window.STORAGE_KEYS.savedTransport, JSON.stringify([]));
  localStorage.setItem(window.STORAGE_KEYS.savedTags, JSON.stringify([]));
  window.TripStore.init();

  try {

    // ── Section 1: saveTrip — basic insert ──────────────────────────────────
    section('1. saveTrip — basic insert');

    const r1 = window.TripStore.saveTrip(makeTrip());
    assert('saveTrip returns success:true for valid trip', r1.success === true);
    assert('saveTrip returns the saved trip object', r1.trip !== null);
    assert('saveTrip assigns an id if none provided', typeof r1.trip.id === 'string' && r1.trip.id.startsWith('trip_'));
    assert('saveTrip initializes legs array', Array.isArray(r1.trip.legs));

    const allTrips = window.TripStore.getTrips();
    assert('getTrips returns 1 trip after first insert', allTrips.length === 1);

    endSection();

    // ── Section 2: saveTrip — upsert (update) ───────────────────────────────
    section('2. saveTrip — upsert (update existing)');

    const existingId = r1.trip.id;
    const r2 = window.TripStore.saveTrip(makeTrip({ id: existingId, title: 'Updated Title' }));
    assert('saveTrip returns success:true for update', r2.success === true);
    assert('Updated trip has correct title', r2.trip.title === 'Updated Title');

    const afterUpdate = window.TripStore.getTrips();
    assert('getTrips still returns 1 trip after update (not duplicate)', afterUpdate.length === 1);
    assert('getTrips returns updated title', afterUpdate[0].title === 'Updated Title');

    endSection();

    // ── Section 3: getTripById ───────────────────────────────────────────────
    section('3. getTripById');

    const found = window.TripStore.getTripById(existingId);
    assert('getTripById returns trip for valid id', found !== null);
    assert('getTripById returns correct trip', found.id === existingId);

    const notFound = window.TripStore.getTripById('trip_doesnt_exist');
    assert('getTripById returns null for unknown id', notFound === null);

    endSection();

    // ── Section 4: deleteTrip ────────────────────────────────────────────────
    section('4. deleteTrip');

    // Add a second trip to delete
    const r3 = window.TripStore.saveTrip(makeTrip({ title: 'Trip To Delete', countries: ['276'] }));
    const idToDelete = r3.trip.id;

    assert('Two trips exist before deletion', window.TripStore.getTrips().length === 2);

    const del = window.TripStore.deleteTrip(idToDelete);
    assert('deleteTrip returns success:true and found:true', del.success && del.found);
    assert('One trip remains after deletion', window.TripStore.getTrips().length === 1);
    assert('Deleted trip is gone from getTripById', window.TripStore.getTripById(idToDelete) === null);

    const delMissing = window.TripStore.deleteTrip('trip_never_existed');
    assert('deleteTrip returns found:false for unknown id', del.found && !delMissing.found);

    endSection();

    // ── Section 5: saveTrip — validation ────────────────────────────────────
    section('5. saveTrip — validation errors');

    const noTitle = window.TripStore.saveTrip(makeTrip({ title: '' }));
    assert('Rejects trip with empty title', !noTitle.success);
    assert('Returns error message for missing title', noTitle.errors.some(e => e.toLowerCase().includes('title')));

    const noCountries = window.TripStore.saveTrip(makeTrip({ countries: [] }));
    assert('Rejects trip with no countries', !noCountries.success);

    const noDateFrom = window.TripStore.saveTrip(makeTrip({ dateFrom: '' }));
    assert('Rejects trip with no start date', !noDateFrom.success);

    const noDateTo = window.TripStore.saveTrip(makeTrip({ dateTo: '' }));
    assert('Rejects trip with no end date', !noDateTo.success);

    const badDates = window.TripStore.saveTrip(makeTrip({ dateFrom: '2024-06-14', dateTo: '2024-06-01' }));
    assert('Rejects trip where start date is after end date', !badDates.success);

    // Partial countryDays (covers only 1 of 2 countries) — should fail
    const partialDays = window.TripStore.saveTrip(makeTrip({
      countries: ['191', '70'],
      countryDays: { '191': 7 } // missing '70'
    }));
    assert('Rejects partial countryDays (not all-or-nothing)', !partialDays.success);

    // countryDays sum doesn't match trip duration — should fail
    // Trip is 2024-06-01 to 2024-06-14 = 14 days, but countryDays sums to 10
    const badDaysSum = window.TripStore.saveTrip(makeTrip({
      countries: ['191', '70'],
      countryDays: { '191': 6, '70': 4 } // sums to 10, not 14
    }));
    assert('Rejects countryDays where sum does not equal trip duration', !badDaysSum.success);

    // Valid countryDays — should pass
    const goodDays = window.TripStore.saveTrip(makeTrip({
      countries: ['191', '70'],
      countryDays: { '191': 8, '70': 6 } // sums to 14 ✓
    }));
    assert('Accepts valid countryDays where sum equals trip duration', goodDays.success);

    endSection();

    // ── Section 6: getTripsForCountry ────────────────────────────────────────
    section('6. getTripsForCountry');

    // Reset to clean state
    localStorage.setItem(window.STORAGE_KEYS.trips, JSON.stringify([]));
    window.TripStore.init();

    const tA = window.TripStore.saveTrip(makeTrip({ title: 'Trip A', countries: ['191', '70'],  dateFrom: '2023-01-01', dateTo: '2023-01-10' })).trip;
    const tB = window.TripStore.saveTrip(makeTrip({ title: 'Trip B', countries: ['191', '499'], dateFrom: '2024-03-01', dateTo: '2024-03-07' })).trip;
    const tC = window.TripStore.saveTrip(makeTrip({ title: 'Trip C', countries: ['276'],        dateFrom: '2024-07-01', dateTo: '2024-07-05' })).trip;

    const forCroatia = window.TripStore.getTripsForCountry('191'); // Croatia
    assert('getTripsForCountry returns 2 trips for Croatia (191)', forCroatia.length === 2);
    assert('Both trips containing Croatia are returned', forCroatia.some(t => t.id === tA.id) && forCroatia.some(t => t.id === tB.id));

    const forMontenegro = window.TripStore.getTripsForCountry('499');
    assert('getTripsForCountry returns 1 trip for Montenegro (499)', forMontenegro.length === 1);

    const forGermany = window.TripStore.getTripsForCountry('276');
    assert('getTripsForCountry returns 1 trip for Germany (276)', forGermany.length === 1);

    const forNone = window.TripStore.getTripsForCountry('999');
    assert('getTripsForCountry returns empty array for country with no trips', forNone.length === 0);

    // String vs number id consistency
    const forCroatiaNum = window.TripStore.getTripsForCountry(191); // number
    assert('getTripsForCountry handles numeric country id (not just string)', forCroatiaNum.length === 2);

    endSection();

    // ── Section 7: getFirstVisitTrip / getFirstVisitYear ────────────────────
    section('7. getFirstVisitTrip and getFirstVisitYear');

    const firstVisit = window.TripStore.getFirstVisitTrip('191');
    assert('getFirstVisitTrip returns the earliest trip', firstVisit.id === tA.id);
    assert('getFirstVisitTrip returns trip with earlier dateFrom', firstVisit.dateFrom === '2023-01-01');

    const firstYear = window.TripStore.getFirstVisitYear('191');
    assert('getFirstVisitYear returns 2023 for Croatia', firstYear === 2023);

    assert('getFirstVisitTrip returns null for country with no trips', window.TripStore.getFirstVisitTrip('999') === null);
    assert('getFirstVisitYear returns null for country with no trips', window.TripStore.getFirstVisitYear('999') === null);

    endSection();

    // ── Section 8: getTripDuration ───────────────────────────────────────────
    section('8. getTripDuration');

    assertEqual('Same-day trip = 1 day',
      window.TripStore.getTripDuration({ dateFrom: '2024-06-01', dateTo: '2024-06-01' }), 1);

    assertEqual('2-day trip = 2 days',
      window.TripStore.getTripDuration({ dateFrom: '2024-06-01', dateTo: '2024-06-02' }), 2);

    assertEqual('14-day trip = 14 days',
      window.TripStore.getTripDuration({ dateFrom: '2024-06-01', dateTo: '2024-06-14' }), 14);

    assertEqual('Missing dates = 0 days',
      window.TripStore.getTripDuration({ dateFrom: '', dateTo: '' }), 0);

    endSection();

    // ── Section 9: getDaysInCountry ──────────────────────────────────────────
    section('9. getDaysInCountry');

    // Equal split: 9 days across 3 countries = 3 each
    const trip9days3countries = makeTrip({
      countries: ['191', '70', '499'],
      dateFrom: '2024-06-01', dateTo: '2024-06-09', // 9 days
    });
    assertEqual('Equal split: 9 days / 3 countries = 3 days each (country 1)',
      window.TripStore.getDaysInCountry(trip9days3countries, '191'), 3);
    assertEqual('Equal split: 9 days / 3 countries = 3 days each (country 2)',
      window.TripStore.getDaysInCountry(trip9days3countries, '70'), 3);
    assertEqual('Equal split: 9 days / 3 countries = 3 days each (country 3)',
      window.TripStore.getDaysInCountry(trip9days3countries, '499'), 3);

    // Uneven split: 10 days across 3 countries → remainder goes to first
    const trip10days3countries = makeTrip({
      countries: ['191', '70', '499'],
      dateFrom: '2024-06-01', dateTo: '2024-06-10', // 10 days
    });
    const d1 = window.TripStore.getDaysInCountry(trip10days3countries, '191');
    const d2 = window.TripStore.getDaysInCountry(trip10days3countries, '70');
    const d3 = window.TripStore.getDaysInCountry(trip10days3countries, '499');
    assert('Uneven split: total days sum to 10', d1 + d2 + d3 === 10);
    assert('Uneven split: remainder goes to first country', d1 === 4 && d2 === 3 && d3 === 3);

    // Explicit countryDays override
    const tripWithOverride = makeTrip({
      countries: ['191', '70'],
      dateFrom: '2024-06-01', dateTo: '2024-06-14', // 14 days
      countryDays: { '191': 8, '70': 6 }
    });
    assertEqual('Explicit countryDays: Croatia gets 8 days',
      window.TripStore.getDaysInCountry(tripWithOverride, '191'), 8);
    assertEqual('Explicit countryDays: Bosnia gets 6 days',
      window.TripStore.getDaysInCountry(tripWithOverride, '70'), 6);

    endSection();

    // ── Section 10: getTotalDaysAbroad ───────────────────────────────────────
    section('10. getTotalDaysAbroad');

    // Current trips: tA (10 days), tB (7 days), tC (5 days) = 22 days
    const totalDays = window.TripStore.getTotalDaysAbroad();
    assertEqual('getTotalDaysAbroad sums all trip durations correctly', totalDays, 22);

    endSection();

    // ── Section 11: getMostVisitedCountry ────────────────────────────────────
    section('11. getMostVisitedCountry');

    // Croatia (191) appears in 2 trips (tA, tB) — most visited
    const most = window.TripStore.getMostVisitedCountry();
    assert('getMostVisitedCountry returns Croatia (191) as most visited', most === '191' || (Array.isArray(most) && most.includes('191')));

    // No trips case
    localStorage.setItem(window.STORAGE_KEYS.trips, JSON.stringify([]));
    window.TripStore.init();
    assert('getMostVisitedCountry returns null when no trips', window.TripStore.getMostVisitedCountry() === null);

    // Restore trips
    localStorage.setItem(window.STORAGE_KEYS.trips, JSON.stringify([tA, tB, tC]));
    window.TripStore.init();

    endSection();

    // ── Section 12: getTripsPerYear ──────────────────────────────────────────
    section('12. getTripsPerYear');

    const perYear = window.TripStore.getTripsPerYear();
    assertEqual('2023 has 1 trip', perYear['2023'], 1);
    assertEqual('2024 has 2 trips', perYear['2024'], 2);
    assert('No other years present', Object.keys(perYear).length === 2);

    endSection();

    // ── Section 13: getAverageTripDuration ───────────────────────────────────
    section('13. getAverageTripDuration');

    // tA=10, tB=7, tC=5 → avg = 22/3 = 7.3
    const avg = window.TripStore.getAverageTripDuration();
    assertEqual('Average trip duration is 7.3 days', avg, 7.3);

    localStorage.setItem(window.STORAGE_KEYS.trips, JSON.stringify([]));
    window.TripStore.init();
    assertEqual('Average is 0 when no trips', window.TripStore.getAverageTripDuration(), 0);

    localStorage.setItem(window.STORAGE_KEYS.trips, JSON.stringify([tA, tB, tC]));
    window.TripStore.init();

    endSection();

    // ── Section 14: getBudgetStats ───────────────────────────────────────────
    section('14. getBudgetStats');

    // Add a trip with budget
    const tWithBudget = window.TripStore.saveTrip(makeTrip({
      title: 'Budget Trip',
      countries: ['840'],
      dateFrom: '2024-09-01',
      dateTo: '2024-09-10', // 10 days
      budget: { currency: 'USD', total: 2000, planned: 1800 }
    })).trip;

    const budgetStats = window.TripStore.getBudgetStats();
    assert('tripsWithBudget counts trips that have budget data', budgetStats.tripsWithBudget >= 1);
    assert('tripsWithoutBudget counts trips without budget', budgetStats.tripsWithoutBudget >= 3);
    assert('USD currency group exists', budgetStats.byCurrency['USD'] !== undefined);
    assertEqual('USD total is 2000', budgetStats.byCurrency['USD'].total, 2000);
    assertEqual('USD avgPerDay is 200 (2000 / 10 days)', budgetStats.byCurrency['USD'].avgPerDay, 200);

    // Two trips same currency
    window.TripStore.saveTrip(makeTrip({
      title: 'Budget Trip 2',
      countries: ['124'],
      dateFrom: '2024-10-01',
      dateTo: '2024-10-10', // 10 days
      budget: { currency: 'USD', total: 1000, planned: 900 }
    }));
    const budgetStats2 = window.TripStore.getBudgetStats();
    assertEqual('USD total accumulates across trips', budgetStats2.byCurrency['USD'].total, 3000);
    assertEqual('USD avgPerDay recalculates across trips (3000/20 days)', budgetStats2.byCurrency['USD'].avgPerDay, 150);

    // Trips with no budget data
    const noBudgetStats = (() => {
      const backup = JSON.parse(localStorage.getItem(window.STORAGE_KEYS.trips));
      localStorage.setItem(window.STORAGE_KEYS.trips, JSON.stringify([
        { ...tA, budget: null },
        { ...tB, budget: undefined },
      ]));
      window.TripStore.init();
      const stats = window.TripStore.getBudgetStats();
      localStorage.setItem(window.STORAGE_KEYS.trips, JSON.stringify(backup));
      window.TripStore.init();
      return stats;
    })();
    assertEqual('tripsWithBudget is 0 when no budgets set', noBudgetStats.tripsWithBudget, 0);
    assertEqual('tripsWithoutBudget is 2 when no budgets set', noBudgetStats.tripsWithoutBudget, 2);

    endSection();

    // ── Section 15: getSaved / addSaved ──────────────────────────────────────
    section('15. getSaved and addSaved');

    localStorage.setItem(window.STORAGE_KEYS.savedCompanions, JSON.stringify([]));
    localStorage.setItem(window.STORAGE_KEYS.savedTransport, JSON.stringify([]));
    localStorage.setItem(window.STORAGE_KEYS.savedTags, JSON.stringify([]));

    // Adding new values
    const added1 = window.TripStore.addSaved('companions', 'colleague');
    assert('addSaved returns true for new value', added1 === true);
    assert('getSaved returns saved companion', window.TripStore.getSaved('companions').includes('colleague'));

    // Deduplication — same value
    const added2 = window.TripStore.addSaved('companions', 'colleague');
    assert('addSaved returns false for duplicate value (same case)', added2 === false);
    assert('Duplicate not added to saved list', window.TripStore.getSaved('companions').length === 1);

    // Deduplication — different case
    const added3 = window.TripStore.addSaved('companions', 'Colleague');
    assert('addSaved returns false for duplicate with different casing', added3 === false);
    assert('Different-case duplicate not added', window.TripStore.getSaved('companions').length === 1);

    // Empty string rejected
    const added4 = window.TripStore.addSaved('companions', '');
    assert('addSaved returns false for empty string', added4 === false);

    // Tags
    window.TripStore.addSaved('tags', 'foodie');
    window.TripStore.addSaved('tags', 'hiking');
    window.TripStore.addSaved('tags', 'Foodie'); // duplicate different case
    assert('Tags saved correctly', window.TripStore.getSaved('tags').length === 2);

    // Unknown field
    const unknownField = window.TripStore.addSaved('unknown_field', 'value');
    assert('addSaved returns false for unknown field', unknownField === false);

    endSection();

    // ── Section 16: getOptions ───────────────────────────────────────────────
    section('16. getOptions — base + saved merged');

    const companionOptions = window.TripStore.getOptions('companions');
    assert('getOptions includes base companions', ['solo', 'partner', 'family', 'friends'].every(b => companionOptions.includes(b)));
    assert('getOptions includes saved custom companion', companionOptions.includes('colleague'));
    assert('No duplicates in companion options', companionOptions.length === new Set(companionOptions).size);

    const transportOptions = window.TripStore.getOptions('transport');
    assert('getOptions includes all base transport modes', ['flight', 'car', 'train', 'bus', 'cruise', 'motorcycle', 'bicycle'].every(b => transportOptions.includes(b)));

    const tagOptions = window.TripStore.getOptions('tags');
    assert('getOptions for tags includes saved tags', tagOptions.includes('foodie') && tagOptions.includes('hiking'));
    assert('Tag options starts empty (no base)', tagOptions.length === 2); // only the 2 we saved

    endSection();

    // ── Section 17: saveCustomValuesFromTrip ─────────────────────────────────
    section('17. saveCustomValuesFromTrip');

    localStorage.setItem(window.STORAGE_KEYS.savedCompanions, JSON.stringify([]));
    localStorage.setItem(window.STORAGE_KEYS.savedTransport, JSON.stringify([]));
    localStorage.setItem(window.STORAGE_KEYS.savedTags, JSON.stringify([]));

    const tripWithCustom = makeTrip({
      companions: ['partner', 'coworker'],  // 'coworker' is custom
      transport: 'motorbike',               // custom transport
      tags: ['street food', 'temples'],     // all tags are custom
    });
    window.TripStore.saveCustomValuesFromTrip(tripWithCustom);

    assert('Custom companion saved', window.TripStore.getSaved('companions').includes('coworker'));
    assert('Base companion not saved to custom list', !window.TripStore.getSaved('companions').includes('partner'));
    assert('Custom transport saved', window.TripStore.getSaved('transport').includes('motorbike'));
    assert('Tags saved', window.TripStore.getSaved('tags').includes('street food') && window.TripStore.getSaved('tags').includes('temples'));

    endSection();

    // ── Section 18: getWonderSuggestionsForCountries ─────────────────────────
    section('18. getWonderSuggestionsForCountries');

    if (!window.WONDERS_ALL) {
      console.warn('[test] WONDERS_ALL not loaded — skipping wonder suggestion tests. Load wonders.js first.');
    } else {
      const argentinaWonders = window.TripStore.getWonderSuggestionsForCountries(['Argentina']);
      assert('Iguazu Falls suggested for Argentina alone', argentinaWonders.some(w => w.name === 'Iguazu Falls'));
      assert('Patagonia suggested for Argentina', argentinaWonders.some(w => w.name === 'Patagonia'));

      const brazilWonders = window.TripStore.getWonderSuggestionsForCountries(['Brazil']);
      assert('Iguazu Falls suggested for Brazil alone (cross-country wonder)', brazilWonders.some(w => w.name === 'Iguazu Falls'));
      assert('Amazon Rainforest suggested for Brazil', brazilWonders.some(w => w.name === 'Amazon Rainforest'));

      const multiWonders = window.TripStore.getWonderSuggestionsForCountries(['Argentina', 'Chile']);
      assert('Patagonia suggested for Argentina+Chile trip', multiWonders.some(w => w.name === 'Patagonia'));
      assert('Torres del Paine suggested for Argentina+Chile trip', multiWonders.some(w => w.name === 'Torres del Paine'));

      const emptyWonders = window.TripStore.getWonderSuggestionsForCountries([]);
      assert('Empty country list returns no wonders', emptyWonders.length === 0);

      const unknownWonders = window.TripStore.getWonderSuggestionsForCountries(['Nonexistent Country XYZ']);
      assert('Unknown country returns no wonders', unknownWonders.length === 0);
    }

    endSection();

    // ── Section 19: getTrips sort order ──────────────────────────────────────
    section('19. getTrips — sort order (most recent first)');

    const sortedTrips = window.TripStore.getTrips();
    for (let i = 0; i < sortedTrips.length - 1; i++) {
      assert(
        `Trip at index ${i} (${sortedTrips[i].dateFrom}) is same or newer than index ${i+1} (${sortedTrips[i+1].dateFrom})`,
        sortedTrips[i].dateFrom >= sortedTrips[i+1].dateFrom
      );
    }

    endSection();

    // ── Section 20: export/import round-trip ─────────────────────────────────
    section('20. Export / import round-trip integrity');

    const allBefore = window.TripStore.getTrips();
    const exported  = JSON.stringify(allBefore);
    const imported  = JSON.parse(exported);

    // Simulate importing: clear and re-insert
    localStorage.setItem(window.STORAGE_KEYS.trips, JSON.stringify(imported));
    window.TripStore.init();

    const allAfter = window.TripStore.getTrips();
    assertEqual('Same number of trips after round-trip', allAfter.length, allBefore.length);
    assert('All trip ids survive round-trip', allBefore.every(b => allAfter.some(a => a.id === b.id)));
    assert('All trip titles survive round-trip', allBefore.every(b => allAfter.some(a => a.title === b.title)));

    endSection();

  } finally {
    // Always restore original data, even if a test throws
    restoreLocalStorage(snapshot);
    console.info('[trips.test] localStorage restored to original state.');
  }

  // ── Summary ────────────────────────────────────────────────────────────────

  const total = passed + failed;
  const color = failed === 0 ? '#2a9d8f' : '#e76f51';
  console.log(
    `%c Trip Store Tests Complete: ${passed} / ${total} passed ${failed > 0 ? '(' + failed + ' FAILED)' : '✓'}`,
    `background:${color};color:white;padding:4px 12px;border-radius:4px;font-weight:bold;font-size:14px`
  );

})();
