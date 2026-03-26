/**
 * migration.test.js — Work Package 1 QA
 *
 * Paste this entire file into your browser DevTools console
 * while the travel dashboard is open, AFTER migration.js has run.
 *
 * Each test prints PASS or FAIL with a description.
 * At the end a summary shows total passed / failed.
 */

(function runMigrationTests() {

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
      console.error('  Expected:', expected);
      console.error('  Actual:  ', actual);
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

  // ── Helpers ────────────────────────────────────────────────────────────────

  function load(key) {
    try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
  }

  function save(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function remove(key) {
    localStorage.removeItem(key);
  }

  // Snapshot and restore localStorage around destructive tests
  function snapshotAll() {
    const snap = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      snap[k] = localStorage.getItem(k);
    }
    return snap;
  }

  function restoreAll(snap) {
    localStorage.clear();
    Object.entries(snap).forEach(([k, v]) => localStorage.setItem(k, v));
  }

  // Re-run migration manually (simulates a fresh page load with given states)
  function simulateMigration(rawStates) {
    const snap = snapshotAll();

    // Reset migration version so it will run again
    remove('travel_migration_version');
    if (rawStates !== undefined) save('travel_map_states_v1', rawStates);
    else remove('travel_map_states_v1');

    // Re-execute migration
    window.migrateImportedStates = window.migrateImportedStates; // already defined
    // We can't re-run the IIFE, but we can test migrateImportedStates directly
    // and verify the helper functions independently.

    const result = load('travel_map_states_v1');
    restoreAll(snap);
    return result;
  }

  // ── Test Suite ─────────────────────────────────────────────────────────────

  // ── Section 1: New keys initialized ───────────────────────────────────────
  section('1. New localStorage keys initialized');

  assert(
    'travel_trips_v1 exists and is an array',
    Array.isArray(load('travel_trips_v1'))
  );

  assert(
    'travel_saved_companions_v1 exists and is an array',
    Array.isArray(load('travel_saved_companions_v1'))
  );

  assert(
    'travel_saved_transport_v1 exists and is an array',
    Array.isArray(load('travel_saved_transport_v1'))
  );

  assert(
    'travel_saved_tags_v1 exists and is an array',
    Array.isArray(load('travel_saved_tags_v1'))
  );

  assert(
    'travel_migration_version is set to 1',
    load('travel_migration_version') === 1
  );

  endSection();

  // ── Section 2: migrateImportedStates — old format ─────────────────────────
  section('2. migrateImportedStates — old flat string format');

  const oldFormat = { '191': 'been', '276': 'want', '840': 'been' };
  const converted = window.migrateImportedStates(oldFormat);

  assertEqual(
    'Country 191 becomes { status: "been", source: "manual" }',
    converted['191'],
    { status: 'been', source: 'manual' }
  );

  assertEqual(
    'Country 276 becomes { status: "want", source: "manual" }',
    converted['276'],
    { status: 'want', source: 'manual' }
  );

  assertEqual(
    'Country 840 becomes { status: "been", source: "manual" }',
    converted['840'],
    { status: 'been', source: 'manual' }
  );

  assert(
    'No extra keys introduced',
    Object.keys(converted).length === 3
  );

  endSection();

  // ── Section 3: migrateImportedStates — new format passthrough ─────────────
  section('3. migrateImportedStates — new format passthrough (idempotent)');

  const newFormat = {
    '191': { status: 'been', source: 'trip' },
    '276': { status: 'want', source: 'manual' },
  };
  const passthrough = window.migrateImportedStates(newFormat);

  assertEqual(
    'Already-new format country 191 passed through unchanged',
    passthrough['191'],
    { status: 'been', source: 'trip' }
  );

  assertEqual(
    'Already-new format country 276 passed through unchanged',
    passthrough['276'],
    { status: 'want', source: 'manual' }
  );

  endSection();

  // ── Section 4: migrateImportedStates — mixed format ───────────────────────
  section('4. migrateImportedStates — mixed old and new format');

  const mixed = {
    '191': 'been',                              // old
    '276': { status: 'want', source: 'trip' }, // new
    '840': 'want',                              // old
  };
  const mixedResult = window.migrateImportedStates(mixed);

  assertEqual(
    'Old format entry converted correctly in mixed object',
    mixedResult['191'],
    { status: 'been', source: 'manual' }
  );

  assertEqual(
    'New format entry passed through in mixed object',
    mixedResult['276'],
    { status: 'want', source: 'trip' }
  );

  assertEqual(
    'Second old format entry converted correctly',
    mixedResult['840'],
    { status: 'want', source: 'manual' }
  );

  endSection();

  // ── Section 5: migrateImportedStates — unknown / corrupt values ───────────
  section('5. migrateImportedStates — unknown or corrupt values are silently dropped');

  const corrupt = {
    '191': 'been',           // valid old
    '276': 42,               // invalid — number
    '840': null,             // invalid — null
    '356': { foo: 'bar' },  // invalid — wrong shape
    '724': 'want',           // valid old
  };
  const corruptResult = window.migrateImportedStates(corrupt);

  assert(
    'Valid old entries are converted despite corrupt siblings',
    corruptResult['191'] && corruptResult['724']
  );

  assert(
    'Corrupt number value is dropped',
    corruptResult['276'] === undefined
  );

  assert(
    'Corrupt null value is dropped',
    corruptResult['840'] === undefined
  );

  assert(
    'Corrupt wrong-shape object is dropped',
    corruptResult['356'] === undefined
  );

  assertEqual(
    'Only valid entries survive',
    Object.keys(corruptResult).length,
    2
  );

  endSection();

  // ── Section 6: migrateImportedStates — edge cases ─────────────────────────
  section('6. migrateImportedStates — edge cases');

  assertEqual(
    'Empty object returns empty object',
    window.migrateImportedStates({}),
    {}
  );

  assertEqual(
    'null input returns empty object',
    window.migrateImportedStates(null),
    {}
  );

  assertEqual(
    'undefined input returns empty object',
    window.migrateImportedStates(undefined),
    {}
  );

  assertEqual(
    'String input returns empty object',
    window.migrateImportedStates('been'),
    {}
  );

  endSection();

  // ── Section 7: getCountryStatus helper ────────────────────────────────────
  section('7. window.getCountryStatus helper');

  // Temporarily inject test states
  const originalStates = window.states;
  window.states = {
    '191': { status: 'been', source: 'trip' },
    '276': { status: 'want', source: 'manual' },
    '840': 'been', // old format — should still work safely
  };

  assertEqual(
    'Returns "been" for new-format been entry',
    window.getCountryStatus('191'),
    'been'
  );

  assertEqual(
    'Returns "want" for new-format want entry',
    window.getCountryStatus('276'),
    'want'
  );

  assertEqual(
    'Returns "neutral" for missing country',
    window.getCountryStatus('999'),
    'neutral'
  );

  assertEqual(
    'Returns "been" for old-format string (backwards safe)',
    window.getCountryStatus('840'),
    'been'
  );

  endSection();

  // ── Section 8: getCountrySource helper ────────────────────────────────────
  section('8. window.getCountrySource helper');

  assertEqual(
    'Returns "trip" for trip-sourced entry',
    window.getCountrySource('191'),
    'trip'
  );

  assertEqual(
    'Returns "manual" for manually-sourced entry',
    window.getCountrySource('276'),
    'manual'
  );

  assertEqual(
    'Returns null for missing country',
    window.getCountrySource('999'),
    null
  );

  assertEqual(
    'Returns "manual" for old-format string (backwards safe)',
    window.getCountrySource('840'),
    'manual'
  );

  endSection();

  // ── Section 9: setCountryState helper ─────────────────────────────────────
  section('9. window.setCountryState helper');

  window.setCountryState('500', 'been', 'manual');
  assertEqual(
    'Sets been/manual correctly',
    window.states['500'],
    { status: 'been', source: 'manual' }
  );

  window.setCountryState('500', 'been', 'trip');
  assertEqual(
    'Overwrites source from manual to trip',
    window.states['500'],
    { status: 'been', source: 'trip' }
  );

  window.setCountryState('500', 'neutral', 'manual');
  assert(
    'Setting neutral deletes the entry',
    window.states['500'] === undefined
  );

  window.setCountryState('501', 'want', 'manual');
  assertEqual(
    'Sets want/manual correctly',
    window.states['501'],
    { status: 'want', source: 'manual' }
  );

  // Restore original states
  window.states = originalStates;

  endSection();

  // ── Section 10: STORAGE_KEYS exposed globally ──────────────────────────────
  section('10. window.STORAGE_KEYS exposed correctly');

  assert(
    'window.STORAGE_KEYS is defined',
    typeof window.STORAGE_KEYS === 'object'
  );

  assert(
    'Contains states key',
    window.STORAGE_KEYS.states === 'travel_map_states_v1'
  );

  assert(
    'Contains trips key',
    window.STORAGE_KEYS.trips === 'travel_trips_v1'
  );

  assert(
    'Contains savedCompanions key',
    window.STORAGE_KEYS.savedCompanions === 'travel_saved_companions_v1'
  );

  assert(
    'Contains savedTransport key',
    window.STORAGE_KEYS.savedTransport === 'travel_saved_transport_v1'
  );

  assert(
    'Contains savedTags key',
    window.STORAGE_KEYS.savedTags === 'travel_saved_tags_v1'
  );

  endSection();

  // ── Summary ────────────────────────────────────────────────────────────────

  const total = passed + failed;
  const color = failed === 0 ? '#2a9d8f' : '#e76f51';
  console.log(
    `%c Migration Tests Complete: ${passed} / ${total} passed ${failed > 0 ? '(' + failed + ' failed)' : '✓'}`,
    `background:${color};color:white;padding:4px 12px;border-radius:4px;font-weight:bold;font-size:14px`
  );

})();
