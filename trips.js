/**
 * trips.js — Work Package 2
 *
 * Core trip storage and retrieval layer.
 * All trip data lives in localStorage under window.STORAGE_KEYS.trips.
 *
 * Exposes everything on window.TripStore so any other script can call it.
 *
 * Load order in index.html:
 *   migration.js  →  trips.js  →  map.js  →  stats.js  →  wonders.js
 */

(function() {

  // ── Internal helpers ─────────────────────────────────────────────────────────

  const KEYS = () => window.STORAGE_KEYS; // always read live, migration.js sets this

  function loadTrips() {
    try {
      const raw = localStorage.getItem(KEYS().trips);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('[trips] Failed to load trips from localStorage:', e);
      return [];
    }
  }

  function persistTrips(trips) {
    try {
      localStorage.setItem(KEYS().trips, JSON.stringify(trips));
      // Keep in-memory cache in sync
      window.trips = trips;
    } catch (e) {
      console.error('[trips] Failed to persist trips to localStorage:', e);
    }
  }

  function loadSavedList(key) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function persistSavedList(key, list) {
    try {
      localStorage.setItem(key, JSON.stringify(list));
    } catch (e) {
      console.error('[trips] Failed to persist saved list for key', key, e);
    }
  }

  /**
   * Generate a unique trip ID: timestamp + 4 random hex chars.
   * Collision probability is negligible for personal use volumes.
   */
  function generateTripId() {
    const rand = Math.floor(Math.random() * 0xffff).toString(16).padStart(4, '0');
    return `trip_${Date.now()}_${rand}`;
  }

  /**
   * Validate that a trip object has the minimum required fields.
   * Returns { valid: bool, errors: string[] }
   */
  function validateTrip(trip) {
    const errors = [];

    if (!trip || typeof trip !== 'object') {
      return { valid: false, errors: ['Trip must be an object'] };
    }
    if (!trip.title || typeof trip.title !== 'string' || !trip.title.trim()) {
      errors.push('Title is required');
    }
    if (!Array.isArray(trip.countries) || trip.countries.length === 0) {
      errors.push('At least one country is required');
    }
    if (!trip.dateFrom) {
      errors.push('Start date (dateFrom) is required');
    }
    if (!trip.dateTo) {
      errors.push('End date (dateTo) is required');
    }
    if (trip.dateFrom && trip.dateTo && trip.dateFrom > trip.dateTo) {
      errors.push('Start date must be on or before end date');
    }

    // countryDays validation: if present, must cover ALL countries and sum ≈ trip duration
    if (trip.countryDays && typeof trip.countryDays === 'object') {
      const specifiedIds = Object.keys(trip.countryDays);
      const missingIds = trip.countries.filter(id => !specifiedIds.includes(String(id)));
      if (missingIds.length > 0 && specifiedIds.length > 0) {
        errors.push('countryDays must cover all countries or none (all-or-nothing)');
      }
      const total = Object.values(trip.countryDays).reduce((a, b) => a + Number(b), 0);
      const tripDays = TripStore.getTripDuration(trip);
      if (specifiedIds.length > 0 && total !== tripDays) {
        errors.push(`countryDays sum (${total}) must equal trip duration (${tripDays} days)`);
      }
    }

    return { valid: errors.length === 0, errors };
  }

  // ── TripStore public API ─────────────────────────────────────────────────────

  const TripStore = {

    // ── CRUD ──────────────────────────────────────────────────────────────────

    /**
     * Returns all trips, sorted by dateFrom descending (most recent first).
     * @returns {Array}
     */
    getTrips() {
      const trips = loadTrips();
      return trips.slice().sort((a, b) => {
        if (a.dateFrom < b.dateFrom) return 1;
        if (a.dateFrom > b.dateFrom) return -1;
        return 0;
      });
    },

    /**
     * Returns a single trip by id, or null if not found.
     * @param {string} id
     * @returns {Object|null}
     */
    getTripById(id) {
      const trips = loadTrips();
      return trips.find(t => t.id === id) || null;
    },

    /**
     * Saves a trip — inserts if new (no id or id not found), updates if existing.
     * Assigns a generated id if none is provided.
     * Validates before saving; returns { success, errors, trip }.
     *
     * @param {Object} tripData
     * @returns {{ success: boolean, errors: string[], trip: Object|null }}
     */
    saveTrip(tripData) {
      // Assign id if missing
      const trip = { ...tripData };
      if (!trip.id) trip.id = generateTripId();

      // Normalize string fields
      if (trip.title) trip.title = trip.title.trim();

      // Ensure legs array exists (reserved for future WP expansion)
      if (!Array.isArray(trip.legs)) trip.legs = [];

      // Validate
      const { valid, errors } = validateTrip(trip);
      if (!valid) return { success: false, errors, trip: null };

      const trips = loadTrips();
      const existingIndex = trips.findIndex(t => t.id === trip.id);

      if (existingIndex >= 0) {
        trips[existingIndex] = trip; // update
      } else {
        trips.push(trip);           // insert
      }

      persistTrips(trips);
      return { success: true, errors: [], trip };
    },

    /**
     * Deletes a trip by id.
     * Returns { success, found } — found=false if id didn't exist.
     *
     * NOTE: Does NOT handle country status sync here.
     * Country sync is Work Package 3 (syncCountryStatusOnTripDelete).
     * Callers are responsible for calling sync after deleteTrip.
     *
     * @param {string} id
     * @returns {{ success: boolean, found: boolean }}
     */
    deleteTrip(id) {
      const trips = loadTrips();
      const index = trips.findIndex(t => t.id === id);
      if (index < 0) return { success: false, found: false };
      trips.splice(index, 1);
      persistTrips(trips);
      return { success: true, found: true };
    },

    // ── Query helpers ──────────────────────────────────────────────────────────

    /**
     * Returns all trips that include a given country id.
     * Checks both numeric and string representations for safety.
     *
     * @param {string|number} countryId
     * @returns {Array}
     */
    getTripsForCountry(countryId) {
      const id = String(countryId);
      return loadTrips().filter(t =>
        Array.isArray(t.countries) &&
        t.countries.some(c => String(c) === id)
      );
    },

    /**
     * Returns the trip that represents the "first visit" to a country —
     * the trip with the earliest dateFrom that includes that country.
     * Returns null if no trips cover that country.
     *
     * First visit is always derived dynamically, never stored.
     *
     * @param {string|number} countryId
     * @returns {Object|null}
     */
    getFirstVisitTrip(countryId) {
      const trips = this.getTripsForCountry(countryId);
      if (trips.length === 0) return null;
      return trips.reduce((earliest, t) =>
        t.dateFrom < earliest.dateFrom ? t : earliest
      );
    },

    /**
     * Returns the year of first visit to a country, or null.
     *
     * @param {string|number} countryId
     * @returns {number|null}
     */
    getFirstVisitYear(countryId) {
      const trip = this.getFirstVisitTrip(countryId);
      if (!trip || !trip.dateFrom) return null;
      return new Date(trip.dateFrom).getFullYear();
    },

    /**
     * Returns the number of days in a trip (inclusive of start and end day).
     * A same-day trip counts as 1 day.
     *
     * @param {Object} trip
     * @returns {number}
     */
    getTripDuration(trip) {
      if (!trip.dateFrom || !trip.dateTo) return 0;
      const from = new Date(trip.dateFrom);
      const to   = new Date(trip.dateTo);
      const diff = Math.round((to - from) / (1000 * 60 * 60 * 24));
      return diff + 1; // inclusive
    },

    /**
     * Returns the number of days spent in a specific country on a given trip.
     *
     * Rules:
     *   - If trip.countryDays exists and has an entry for this country → use it
     *   - Otherwise → divide total trip days equally across all countries
     *     (rounded down, with any remainder added to the first country)
     *
     * @param {Object} trip
     * @param {string|number} countryId
     * @returns {number}
     */
    getDaysInCountry(trip, countryId) {
      const id = String(countryId);
      const totalDays = this.getTripDuration(trip);
      const countryCount = Array.isArray(trip.countries) ? trip.countries.length : 1;

      // Check for explicit override
      if (
        trip.countryDays &&
        typeof trip.countryDays === 'object' &&
        trip.countryDays[id] !== undefined
      ) {
        return Number(trip.countryDays[id]);
      }

      // Equal split — floor division, remainder goes to first country
      if (countryCount === 0) return 0;
      const base      = Math.floor(totalDays / countryCount);
      const remainder = totalDays % countryCount;
      const isFirst   = Array.isArray(trip.countries) && String(trip.countries[0]) === id;
      return base + (isFirst ? remainder : 0);
    },

    /**
     * Returns total days abroad across ALL trips.
     * Overlapping trips are not de-duplicated (by design — trips are independent).
     *
     * @returns {number}
     */
    getTotalDaysAbroad() {
      return loadTrips().reduce((sum, t) => sum + this.getTripDuration(t), 0);
    },

    /**
     * Returns the country id that appears in the most trips.
     * Returns null if no trips exist.
     * Returns an array if multiple countries are tied.
     *
     * @returns {string|string[]|null}
     */
    getMostVisitedCountry() {
      const trips = loadTrips();
      if (trips.length === 0) return null;

      const counts = {};
      trips.forEach(t => {
        (t.countries || []).forEach(id => {
          const key = String(id);
          counts[key] = (counts[key] || 0) + 1;
        });
      });

      const max = Math.max(...Object.values(counts));
      const winners = Object.keys(counts).filter(id => counts[id] === max);
      return winners.length === 1 ? winners[0] : winners;
    },

    /**
     * Returns a breakdown of trips per calendar year, sorted ascending.
     * e.g. { 2022: 3, 2023: 5, 2024: 2 }
     *
     * @returns {Object}
     */
    getTripsPerYear() {
      const result = {};
      loadTrips().forEach(t => {
        if (!t.dateFrom) return;
        const year = String(new Date(t.dateFrom).getFullYear());
        result[year] = (result[year] || 0) + 1;
      });
      return result;
    },

    /**
     * Returns average trip duration in days across all trips.
     * Returns 0 if no trips.
     *
     * @returns {number}
     */
    getAverageTripDuration() {
      const trips = loadTrips();
      if (trips.length === 0) return 0;
      const total = trips.reduce((sum, t) => sum + this.getTripDuration(t), 0);
      return Math.round((total / trips.length) * 10) / 10; // 1 decimal place
    },

    /**
     * Returns budget stats across all trips that have budget data.
     * Groups by currency since we don't convert between currencies.
     *
     * Returns:
     * {
     *   byCurrency: { EUR: { total, planned, count }, USD: { ... } },
     *   tripsWithBudget: number,
     *   tripsWithoutBudget: number
     * }
     *
     * @returns {Object}
     */
    getBudgetStats() {
      const trips = loadTrips();
      const byCurrency = {};
      let withBudget = 0;
      let withoutBudget = 0;

      trips.forEach(t => {
        if (!t.budget || !t.budget.currency || !t.budget.total) {
          withoutBudget++;
          return;
        }
        withBudget++;
        const cur = t.budget.currency.toUpperCase();
        if (!byCurrency[cur]) {
          byCurrency[cur] = { total: 0, planned: 0, count: 0 };
        }
        byCurrency[cur].total   += Number(t.budget.total)   || 0;
        byCurrency[cur].planned += Number(t.budget.planned) || 0;
        byCurrency[cur].count   += 1;
      });

      // Compute average daily spend per currency
      Object.keys(byCurrency).forEach(cur => {
        const entry = byCurrency[cur];
        // Find all trips with this currency to get total days
        const days = trips
          .filter(t => t.budget && t.budget.currency && t.budget.currency.toUpperCase() === cur && t.budget.total)
          .reduce((sum, t) => sum + this.getTripDuration(t), 0);
        entry.avgPerDay = days > 0 ? Math.round((entry.total / days) * 10) / 10 : 0;
      });

      return {
        byCurrency,
        tripsWithBudget:    withBudget,
        tripsWithoutBudget: withoutBudget,
      };
    },

    // ── Saved custom values ────────────────────────────────────────────────────

    /**
     * Returns saved custom values for a given field.
     * field: 'companions' | 'transport' | 'tags'
     *
     * @param {'companions'|'transport'|'tags'} field
     * @returns {string[]}
     */
    getSaved(field) {
      const keyMap = {
        companions: KEYS().savedCompanions,
        transport:  KEYS().savedTransport,
        tags:       KEYS().savedTags,
      };
      const key = keyMap[field];
      if (!key) {
        console.warn('[trips] getSaved: unknown field', field);
        return [];
      }
      return loadSavedList(key);
    },

    /**
     * Adds a custom value to the saved list for a field.
     * Normalizes to lowercase and deduplicates before saving.
     * Silently ignores empty strings and base options.
     *
     * @param {'companions'|'transport'|'tags'} field
     * @param {string} value
     * @returns {boolean} true if a new value was added, false if duplicate or invalid
     */
    addSaved(field, value) {
      if (!value || typeof value !== 'string') return false;
      const normalized = value.trim().toLowerCase();
      if (!normalized) return false;

      const keyMap = {
        companions: KEYS().savedCompanions,
        transport:  KEYS().savedTransport,
        tags:       KEYS().savedTags,
      };
      const key = keyMap[field];
      if (!key) return false;

      const existing = loadSavedList(key);
      if (existing.includes(normalized)) return false; // already saved

      existing.push(normalized);
      persistSavedList(key, existing);
      return true;
    },

    /**
     * Saves all custom values from a trip entry into the saved lists.
     * Call this after saveTrip to persist any new custom options.
     *
     * @param {Object} trip
     */
    saveCustomValuesFromTrip(trip) {
      const BASE_COMPANIONS = ['solo', 'partner', 'family', 'friends'];
      const BASE_TRANSPORT  = ['flight', 'car', 'train', 'bus', 'cruise', 'motorcycle', 'bicycle'];

      // Companions — multi-select, save any non-base values
      if (Array.isArray(trip.companions)) {
        trip.companions.forEach(c => {
          if (!BASE_COMPANIONS.includes(c.toLowerCase())) {
            this.addSaved('companions', c);
          }
        });
      }

      // Transport — single value, save if non-base
      if (trip.transport && !BASE_TRANSPORT.includes(trip.transport.toLowerCase())) {
        this.addSaved('transport', trip.transport);
      }

      // Tags — all are custom by nature
      if (Array.isArray(trip.tags)) {
        trip.tags.forEach(tag => this.addSaved('tags', tag));
      }
    },

    /**
     * Returns all available options for a field, combining base options
     * with any saved custom values. Custom values are appended after base.
     *
     * @param {'companions'|'transport'|'tags'} field
     * @returns {string[]}
     */
    getOptions(field) {
      const BASE = {
        companions: ['solo', 'partner', 'family', 'friends'],
        transport:  ['flight', 'car', 'train', 'bus', 'cruise', 'motorcycle', 'bicycle'],
        tags:       ['backpacking', 'beach', 'city trip', 'hiking', 'running', 'road trip'],
      };
      const base   = BASE[field] || [];
      const saved  = this.getSaved(field);
      // Merge: base first, then any saved values not already in base
      const merged = [...base];
      saved.forEach(s => { if (!merged.includes(s)) merged.push(s); });
      return merged;
    },

    // ── Wonder suggestions ─────────────────────────────────────────────────────

    /**
     * Returns all wonders that are relevant to a set of country names.
     * A wonder is included if ANY of its countries overlap with the given list.
     *
     * @param {string[]} countryNames - Display names of countries (e.g. ["Argentina", "Brazil"])
     * @returns {Array} - Wonder objects from WONDERS_ALL
     */
    getWonderSuggestionsForCountries(countryNames) {
      if (!window.WONDERS_ALL || !Array.isArray(countryNames) || countryNames.length === 0) {
        return [];
      }
      const nameSet = new Set(countryNames.map(n => n.trim().toLowerCase()));
      return window.WONDERS_ALL.filter(wonder => {
        const wonderCountries = wonder.land.split(',').map(l => l.trim().toLowerCase());
        return wonderCountries.some(wc => nameSet.has(wc));
      });
    },

    // ── Initialization ─────────────────────────────────────────────────────────

    /**
     * Load trips from localStorage into window.trips on startup.
     * Call once after migration.js has run.
     */
    init() {
      window.trips = loadTrips();
      console.info(`[trips] Initialized. ${window.trips.length} trip(s) loaded.`);
    },

  };

  // ── Expose globally ──────────────────────────────────────────────────────────

  window.TripStore = TripStore;

  // Initialize on load
  TripStore.init();

})();
