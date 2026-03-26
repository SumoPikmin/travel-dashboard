/**
 * triplog.test.js — Work Package 4 QA
 *
 * Paste into DevTools console while the Travel Dashboard is open
 * with the Trip Log tab visible and initialized.
 *
 * Mix of automated checks and guided manual steps.
 * Each automated check prints PASS / FAIL.
 * Manual steps are printed as instructions to follow.
 */

(function runTripLogTests() {

  let passed = 0, failed = 0;

  function assert(desc, condition) {
    if (condition) {
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

  // ── Prerequisite check ─────────────────────────────────────────────────────
  section('0. Prerequisites');

  assert('migration.js loaded — window.STORAGE_KEYS exists',       typeof window.STORAGE_KEYS === 'object');
  assert('trips.js loaded — window.TripStore exists',              typeof window.TripStore === 'object');
  assert('triplog.js loaded — window.initTripLog exists',          typeof window.initTripLog === 'function');
  assert('triplog.js loaded — window.openTripForm exists',         typeof window.openTripForm === 'function');
  assert('Trip Log tab container exists in DOM',                   !!el('tripLogContent'));
  assert('Trip Log tab has been initialized (data-built set)',     el('tripLogContent') && el('tripLogContent').dataset.built === 'true');
  assert('New Trip button exists',                                 !!el('tlNewBtn'));
  assert('Trip list container exists',                             !!el('tlList'));

  endSection();

  // ── Section 1: Tab navigation ──────────────────────────────────────────────
  section('1. Tab navigation');

  const tripLogBtn = document.querySelector('[id="tripLogBtn"]') ||
    Array.from(document.querySelectorAll('.nav-btn')).find(b => b.textContent.includes('Trip'));

  assert('Trip Log nav button exists in sidebar', !!tripLogBtn);

  if (tripLogBtn) {
    const tripLogContent = el('tripLogContent');
    assert('Trip Log content panel exists', !!tripLogContent);

    manual('Click the Trip Log tab → verify it becomes active (highlighted) and content shows');
    manual('Click Home tab → verify Trip Log content hides, Home shows');
    manual('Click Countries tab → verify Trip Log content hides, Countries shows');
    manual('Click back to Trip Log → verify content reappears correctly');
  }

  endSection();

  // ── Section 2: Form opens and closes ──────────────────────────────────────
  section('2. Form open / close');

  // Open form programmatically
  if (window.openTripForm) window.openTripForm();

  assert('Form wrapper becomes visible after openTripForm()',
    el('tlFormWrap') && el('tlFormWrap').style.display !== 'none');
  assert('List wrapper hides when form opens',
    el('tlListWrap') && el('tlListWrap').style.display === 'none');
  assert('New Trip button hides when form opens',
    el('tlNewBtn') && el('tlNewBtn').style.display === 'none');
  assert('Form heading says "New Trip"',
    el('tlFormHeading') && el('tlFormHeading').textContent === 'New Trip');

  manual('Click the ✕ button → confirm dialog appears → click OK → form closes, list reappears');
  manual('Open form again → click Cancel → confirm dialog → form closes');

  endSection();

  // ── Section 3: Required field validation ──────────────────────────────────
  section('3. Validation — required fields');

  // Re-open form fresh
  if (window.openTripForm) window.openTripForm();

  // Click save with nothing filled in
  const saveBtn = el('tlSaveBtn');
  if (saveBtn) saveBtn.click();

  assert('Title error shown when title empty',
    el('tlTitleErr') && el('tlTitleErr').style.display !== 'none' && el('tlTitleErr').textContent.length > 0);
  assert('Country error shown when no countries selected',
    el('tlCountryErr') && el('tlCountryErr').style.display !== 'none');
  assert('Date error shown when dates empty',
    el('tlDateErr') && el('tlDateErr').style.display !== 'none');
  assert('Form NOT submitted — still visible after failed validation',
    el('tlFormWrap') && el('tlFormWrap').style.display !== 'none');

  // Fill title, check title error clears
  if (el('tlTitle')) {
    el('tlTitle').value = 'Test Trip';
    saveBtn.click();
    assert('Title error clears once title is filled',
      !el('tlTitleErr').textContent);
  }

  endSection();

  // ── Section 4: Date validation ─────────────────────────────────────────────
  section('4. Validation — date range');

  if (window.openTripForm) window.openTripForm();

  if (el('tlDateFrom') && el('tlDateTo')) {
    el('tlDateFrom').value = '2024-06-14';
    el('tlDateTo').value   = '2024-06-01';
    el('tlDateFrom').dispatchEvent(new Event('change'));
    el('tlDateTo').dispatchEvent(new Event('change'));

    assert('Date error shown when start > end',
      el('tlDateErr') && el('tlDateErr').textContent.includes('before'));

    el('tlDateFrom').value = '2024-06-01';
    el('tlDateTo').value   = '2024-06-14';
    el('tlDateFrom').dispatchEvent(new Event('change'));
    el('tlDateTo').dispatchEvent(new Event('change'));

    assert('Date error clears when dates are valid',
      !el('tlDateErr').textContent);
  }

  endSection();

  // ── Section 5: Country search and chips ───────────────────────────────────
  section('5. Country search and chips');

  if (window.openTripForm) window.openTripForm();

  const csInput = el('tlCountrySearch');
  if (csInput) {
    csInput.value = 'ger';
    csInput.dispatchEvent(new Event('input'));

    setTimeout(() => {
      const suggestions = el('tlCountrySuggestions');
      assert('Suggestions appear after typing "ger"',
        suggestions && suggestions.style.display !== 'none' && suggestions.children.length > 0);

      const germanyItem = Array.from(suggestions.querySelectorAll('.tl-suggestion-item'))
        .find(li => li.textContent.includes('Germany'));
      assert('Germany appears in suggestions for "ger"', !!germanyItem);

      if (germanyItem) {
        germanyItem.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        assert('Germany chip appears after selection',
          el('tlCountryChips') && el('tlCountryChips').textContent.includes('Germany'));
        assert('Search input cleared after selection', csInput.value === '');
        assert('Suggestions hidden after selection',
          suggestions.style.display === 'none');
      }

      // Add a second country to trigger days section
      csInput.value = 'france';
      csInput.dispatchEvent(new Event('input'));
      setTimeout(() => {
        const franceSugg = el('tlCountrySuggestions');
        const franceItem = Array.from(franceSugg.querySelectorAll('.tl-suggestion-item'))
          .find(li => li.textContent.includes('France'));
        if (franceItem) {
          franceItem.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
          assert('Country days section appears after 2+ countries selected',
            el('tlCountryDaysWrap') && el('tlCountryDaysWrap').style.display !== 'none');
        }
      }, 100);
    }, 100);
  }

  endSection();

  // ── Section 6: Days override validation ───────────────────────────────────
  section('6. Days override — all-or-nothing validation');

  manual([
    'In the form:',
    '1. Add 3 countries',
    '2. Set dates 2024-06-01 to 2024-06-09 (9 days)',
    '3. Check "Override equal split"',
    '4. Fill in days for only 2 of 3 countries',
    '5. Click Save',
    '→ Expect: error saying to fill all countries or uncheck override',
  ].join('\n'));

  manual([
    'Now fill all 3 countries but make sum ≠ 9 (e.g. 4+4+4=12)',
    '→ Expect: error saying sum must equal trip duration (9)',
  ].join('\n'));

  manual([
    'Set correct values that sum to 9 (e.g. 3+3+3)',
    '→ Expect: no days error, form saves successfully',
  ].join('\n'));

  endSection();

  // ── Section 7: Wonders auto-suggestion ────────────────────────────────────
  section('7. Wonders auto-suggestion');

  assert('WONDERS_ALL is loaded (required for wonder suggestions)',
    Array.isArray(window.WONDERS_ALL) && window.WONDERS_ALL.length > 0);

  if (window.openTripForm) window.openTripForm();

  manual([
    '1. Add Argentina to countries',
    '→ Expect: Wonders section appears',
    '→ Expect: "Iguazu Falls" and "Patagonia" are in the list',
    '2. Add Brazil to countries',
    '→ Expect: "Amazon Rainforest" now also appears (Brazil-specific wonder)',
    '→ Expect: "Iguazu Falls" still appears (shared Argentina+Brazil wonder)',
    '3. Remove Argentina',
    '→ Expect: Patagonia disappears (Argentina-only)',
    '→ Expect: Iguazu Falls and Amazon stay (Brazil covers them)',
  ].join('\n'));

  manual([
    'Tick "Iguazu Falls" checkbox',
    '→ Expect: row turns green / checked style applied',
    'Untick it',
    '→ Expect: row returns to normal style',
  ].join('\n'));

  endSection();

  // ── Section 8: Companions multi-select ────────────────────────────────────
  section('8. Companions multi-select');

  if (window.openTripForm) window.openTripForm();

  manual([
    '1. Click "partner" option button → should highlight (active)',
    '2. Click "friends" option button → both should be active',
    '3. Click "partner" again → should deselect (not active)',
    '4. Type "colleague" in custom input → click Add',
    '   → "colleague" chip appears above',
    '   → "colleague" button appears in options (saved)',
    '5. Type "Colleague" (capital C) → click Add',
    '   → No duplicate appears (deduplication)',
  ].join('\n'));

  endSection();

  // ── Section 9: Transport single-select ────────────────────────────────────
  section('9. Transport single-select');

  manual([
    '1. Click "flight" → highlights',
    '2. Click "car" → car highlights, flight deselects',
    '3. Click "car" again → deselects (none selected)',
    '4. Add custom "motorbike" → appears in list, auto-selected',
    '5. Re-open form fresh → "motorbike" still appears as saved option',
  ].join('\n'));

  endSection();

  // ── Section 10: Tags ───────────────────────────────────────────────────────
  section('10. Tags');

  manual([
    '1. Type "beach" → Add → chip appears',
    '2. Type "Beach" → Add → no duplicate (deduplication)',
    '3. Type "hiking" → Add → second chip appears',
    '4. Click × on "beach" chip → chip removed',
    '5. Re-open form → "beach" and "hiking" appear as saved tag buttons',
    '   Click "hiking" button → chip appears without typing',
  ].join('\n'));

  endSection();

  // ── Section 11: Mood stars ─────────────────────────────────────────────────
  section('11. Mood stars');

  if (window.openTripForm) window.openTripForm();

  manual([
    '1. Click star 3 → first 3 stars turn yellow, label shows "😐 Okay"',
    '2. Click star 5 → all 5 stars yellow, label shows "🤩 Amazing"',
    '3. Hover star 2 → star grows slightly',
  ].join('\n'));

  endSection();

  // ── Section 12: Budget collapsible ────────────────────────────────────────
  section('12. Budget section');

  if (window.openTripForm) window.openTripForm();

  assert('Budget body is hidden by default',
    el('tlBudgetBody') && el('tlBudgetBody').style.display === 'none');
  assert('Budget chevron shows ▸ (closed) by default',
    el('tlBudgetChevron') && el('tlBudgetChevron').textContent === '▸');

  if (el('tlBudgetToggle')) el('tlBudgetToggle').click();

  assert('Budget body shows after toggle click',
    el('tlBudgetBody') && el('tlBudgetBody').style.display !== 'none');
  assert('Budget chevron shows ▾ (open) after click',
    el('tlBudgetChevron') && el('tlBudgetChevron').textContent === '▾');

  if (el('tlBudgetToggle')) el('tlBudgetToggle').click();
  assert('Budget body hides on second toggle click',
    el('tlBudgetBody') && el('tlBudgetBody').style.display === 'none');

  manual([
    '1. Open budget, fill Currency=EUR, Total=1500, Planned=1200',
    '   Fill Accommodation=800, Food=400',
    '2. Save the trip',
    '3. Re-open the trip for editing',
    '→ Expect: budget section is auto-expanded, all values restored',
  ].join('\n'));

  endSection();

  // ── Section 13: Save a complete trip ──────────────────────────────────────
  section('13. Save a complete trip end-to-end');

  // Programmatic save test
  const snap = JSON.parse(localStorage.getItem(window.STORAGE_KEYS.trips) || '[]');

  // Manually inject a valid trip to test storage round-trip
  const testTrip = {
    title:      'QA Test Trip',
    countries:  ['276'], // Germany
    dateFrom:   '2025-01-10',
    dateTo:     '2025-01-17',
    companions: ['partner'],
    transport:  'flight',
    tags:       ['city'],
    mood:       4,
    notes:      'QA test note',
    budget:     null,
  };

  const { success, trip } = window.TripStore.saveTrip(testTrip);
  assert('TripStore.saveTrip succeeds for valid trip', success);

  // Re-render list to pick it up
  // (renderTripList is internal — trigger by re-initializing)
  const tlListEl = el('tlList');
  assert('tlList element exists', !!tlListEl);

  // Verify it saved to localStorage
  const savedTrips = JSON.parse(localStorage.getItem(window.STORAGE_KEYS.trips) || '[]');
  assert('Trip appears in localStorage after save',
    savedTrips.some(t => t.title === 'QA Test Trip'));

  // Verify country status synced
  const germanyStatus = window.getCountryStatus('276');
  assert('Germany (276) marked as "been" after saving trip to Germany',
    germanyStatus === 'been');
  assert('Germany source is "trip"',
    window.getCountrySource('276') === 'trip');

  // Clean up the test trip
  if (trip) window.TripStore.deleteTrip(trip.id);
  // Restore any pre-existing trips
  localStorage.setItem(window.STORAGE_KEYS.trips, JSON.stringify(snap));
  window.TripStore.init();

  endSection();

  // ── Section 14: Edit existing trip ────────────────────────────────────────
  section('14. Edit existing trip — form population');

  manual([
    '1. Save a trip with title "Italy 2024", countries Italy + Greece,',
    '   dates 2024-08-01 to 2024-08-14, mood 5, tag "culture"',
    '2. In the trip list, click the ✎ edit button for that trip',
    '→ Expect: form opens with heading "Edit Trip"',
    '→ Expect: title field shows "Italy 2024"',
    '→ Expect: Italy and Greece chips are present',
    '→ Expect: dates are pre-filled',
    '→ Expect: 5 stars are active',
    '→ Expect: "culture" chip is present',
    '3. Change title to "Italy & Greece 2024" → Save',
    '→ Expect: list shows updated title',
    '→ Expect: only one entry (not a duplicate)',
  ].join('\n'));

  endSection();

  // ── Section 15: Delete trip ────────────────────────────────────────────────
  section('15. Delete trip with country sync');

  manual([
    '1. Save a trip to Japan (only trip to Japan)',
    '2. Verify Japan is green on the map',
    '3. Delete the trip → confirm dialog',
    '→ Expect: Japan reverts to white (neutral) on the map',
    '4. Save two trips to France',
    '5. Delete one of them',
    '→ Expect: France stays green (other trip still covers it)',
  ].join('\n'));

  endSection();

  // ── Summary ────────────────────────────────────────────────────────────────

  const total = passed + failed;
  const color = failed === 0 ? '#2a9d8f' : '#e76f51';
  console.log(
    `%c Trip Log Tests: ${passed} / ${total} automated passed${failed > 0 ? ' (' + failed + ' FAILED)' : ' ✓'} — plus manual steps above`,
    `background:${color};color:white;padding:4px 12px;border-radius:4px;font-weight:bold;font-size:14px`
  );

})();
