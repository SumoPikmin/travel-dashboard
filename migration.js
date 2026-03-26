/**
 * migration.js — Work Package 1
 *
 * Runs once on app load, before any other script touches localStorage.
 * Converts the old flat state format  { "countryId": "been" | "want" }
 * to the new rich format              { "countryId": { status, source } }
 *
 * Also sets up the new localStorage keys if they don't exist yet.
 *
 * Load this script FIRST in index.html, before map.js / stats.js / wonders.js.
 */

(function runMigrations() {

  // ── Constants ────────────────────────────────────────────────────────────────

  const KEYS = {
    states:           'travel_map_states_v1',
    trips:            'travel_trips_v1',
    priorities:       'travel_priorities_v1',
    wonderStates:     'wonders_states_v1',
    wonderPriorities: 'wonder_priorities_v1',
    savedCompanions:  'travel_saved_companions_v1',
    savedTransport:   'travel_saved_transport_v1',
    savedTags:        'travel_saved_tags_v1',
    migrationVersion: 'travel_migration_version',
  };

  // Bump this number whenever a new migration step is added.
  const CURRENT_MIGRATION_VERSION = 1;

  // ── Helpers ──────────────────────────────────────────────────────────────────

  /**
   * Safely parse a localStorage key. Returns null on missing or invalid JSON.
   */
  function load(key) {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return null;
      return JSON.parse(raw);
    } catch (e) {
      console.warn('[migration] Failed to parse localStorage key:', key, e);
      return null;
    }
  }

  /**
   * Safely write a value to localStorage.
   */
  function save(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('[migration] Failed to write localStorage key:', key, e);
    }
  }

  /**
   * Returns true if a country state value is already in the new format.
   * New format: { status: 'been' | 'want' | 'neutral', source: 'manual' | 'trip' }
   */
  function isNewFormat(value) {
    return (
      value !== null &&
      typeof value === 'object' &&
      typeof value.status === 'string' &&
      typeof value.source === 'string'
    );
  }

  /**
   * Returns true if a country state value is in the old flat format.
   * Old format: 'been' | 'want'
   */
  function isOldFormat(value) {
    return typeof value === 'string' && (value === 'been' || value === 'want');
  }

  // ── Migration steps ──────────────────────────────────────────────────────────

  /**
   * Migration v1 — Convert flat country states to rich { status, source } objects.
   *
   * Before: { "191": "been", "276": "want" }
   * After:  { "191": { "status": "been", "source": "manual" },
   *           "276": { "status": "want", "source": "manual" } }
   *
   * Handles three cases:
   *   1. Key doesn't exist yet       → initialize as empty object, nothing to migrate
   *   2. All values already new format → no-op, already migrated
   *   3. Some or all values old format → convert old ones, leave new ones untouched
   *
   * Also initializes all new localStorage keys introduced in this version.
   */
  function migrateV1() {
    console.info('[migration] Running v1 migration…');

    // ── 1. Country states ──────────────────────────────────────────────────────

    const rawStates = load(KEYS.states);

    if (rawStates === null) {
      // First ever load — initialize with empty object in new format
      save(KEYS.states, {});
      console.info('[migration] v1: Initialized empty country states.');
    } else if (typeof rawStates === 'object' && !Array.isArray(rawStates)) {
      let mutated = false;
      const converted = {};

      Object.entries(rawStates).forEach(([id, value]) => {
        if (isOldFormat(value)) {
          // Convert old string to new object, source = 'manual' for all legacy data
          converted[id] = { status: value, source: 'manual' };
          mutated = true;
        } else if (isNewFormat(value)) {
          // Already converted — pass through untouched
          converted[id] = value;
        } else {
          // Unknown format — log warning and skip to avoid corrupting state
          console.warn('[migration] v1: Skipping unknown state format for country', id, value);
        }
      });

      if (mutated) {
        save(KEYS.states, converted);
        const count = Object.keys(converted).length;
        console.info(`[migration] v1: Converted ${count} country state(s) to new format.`);
      } else {
        console.info('[migration] v1: Country states already in new format, no changes needed.');
      }
    } else {
      // Corrupted data — reset to empty rather than crash
      console.warn('[migration] v1: Country states in unexpected format, resetting to empty.');
      save(KEYS.states, {});
    }

    // ── 2. Initialize new keys if not present ──────────────────────────────────

    if (load(KEYS.trips) === null) {
      save(KEYS.trips, []);
      console.info('[migration] v1: Initialized empty trips array.');
    }

    if (load(KEYS.savedCompanions) === null) {
      save(KEYS.savedCompanions, []);
      console.info('[migration] v1: Initialized empty saved companions.');
    }

    if (load(KEYS.savedTransport) === null) {
      save(KEYS.savedTransport, []);
      console.info('[migration] v1: Initialized empty saved transport.');
    }

    if (load(KEYS.savedTags) === null) {
      save(KEYS.savedTags, []);
      console.info('[migration] v1: Initialized empty saved tags.');
    }

    // Priorities and wonder keys already existed — only initialize if missing
    if (load(KEYS.priorities) === null) {
      save(KEYS.priorities, {});
    }

    if (load(KEYS.wonderStates) === null) {
      save(KEYS.wonderStates, {});
    }

    if (load(KEYS.wonderPriorities) === null) {
      save(KEYS.wonderPriorities, {});
    }

    console.info('[migration] v1 complete.');
  }

  // ── Runner ───────────────────────────────────────────────────────────────────

  /**
   * Runs all pending migrations in order.
   * Tracks which version has already been applied so migrations never run twice.
   */
  function run() {
    const appliedVersion = load(KEYS.migrationVersion) || 0;

    if (appliedVersion >= CURRENT_MIGRATION_VERSION) {
      console.info('[migration] Already at current version', CURRENT_MIGRATION_VERSION, '— nothing to do.');
      return;
    }

    console.info(
      '[migration] Upgrading from version', appliedVersion,
      'to', CURRENT_MIGRATION_VERSION
    );

    // Run each migration step that hasn't been applied yet.
    // As you add future migrations, add them here as:
    //   if (appliedVersion < 2) migrateV2();
    //   if (appliedVersion < 3) migrateV3();
    if (appliedVersion < 1) migrateV1();

    // Record the new version so this never runs again
    save(KEYS.migrationVersion, CURRENT_MIGRATION_VERSION);
    console.info('[migration] All migrations complete. Now at version', CURRENT_MIGRATION_VERSION);
  }

  // ── Also handle import-time migration ────────────────────────────────────────
  //
  // When the user imports an old-format JSON file, the import handler in map.js
  // calls window.migrateImportedStates(rawStates) before writing to localStorage.
  // This ensures imported data is also converted without needing to reload.

  /**
   * Converts a raw imported states object to the new format.
   * Safe to call with either old or new format — idempotent.
   *
   * @param {Object} rawStates - The states object from an imported JSON file
   * @returns {Object} - States object guaranteed to be in new { status, source } format
   */
  window.migrateImportedStates = function(rawStates) {
    if (!rawStates || typeof rawStates !== 'object') return {};

    const converted = {};
    Object.entries(rawStates).forEach(([id, value]) => {
      if (isOldFormat(value)) {
        converted[id] = { status: value, source: 'manual' };
      } else if (isNewFormat(value)) {
        converted[id] = value;
      }
      // Unknown formats silently dropped
    });
    return converted;
  };

  /**
   * Exposed helper so map.js and other scripts can read status cleanly
   * without needing to know the internal format.
   *
   * @param {string|number} countryId
   * @returns {'been' | 'want' | 'neutral'}
   */
  window.getCountryStatus = function(countryId) {
    const states = window.states || {};
    const entry = states[countryId] || states[String(countryId)];
    if (!entry) return 'neutral';
    if (isNewFormat(entry)) return entry.status;
    if (isOldFormat(entry)) return entry; // shouldn't happen post-migration, but safe
    return 'neutral';
  };

  /**
   * Exposed helper so map.js and other scripts can read source cleanly.
   *
   * @param {string|number} countryId
   * @returns {'manual' | 'trip' | null}
   */
  window.getCountrySource = function(countryId) {
    const states = window.states || {};
    const entry = states[countryId] || states[String(countryId)];
    if (!entry) return null;
    if (isNewFormat(entry)) return entry.source;
    return 'manual'; // old format implies manual
  };

  /**
   * Exposed helper to write a country state cleanly from anywhere.
   * Always writes in new format.
   *
   * @param {string|number} countryId
   * @param {'been' | 'want' | 'neutral'} status
   * @param {'manual' | 'trip'} source
   */
  window.setCountryState = function(countryId, status, source) {
    if (!window.states) window.states = {};
    const id = String(countryId);
    if (status === 'neutral') {
      delete window.states[id];
    } else {
      window.states[id] = { status, source };
    }
  };

  // ── Run on load ──────────────────────────────────────────────────────────────

  run();

  // Expose KEYS globally so other modules don't hardcode key names
  window.STORAGE_KEYS = KEYS;

})();
