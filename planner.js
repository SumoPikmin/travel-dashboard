/**
 * planner.js — Trip Planner, Work Package P1
 *
 * Core data layer for trip plans.  Mirrors the trips.js / TripStore pattern
 * so the rest of the codebase can rely on the same conventions.
 *
 * Schema
 * ──────
 * TripPlan {
 *   id          string        — timestamp-based unique id ("plan_<ts>_<hex>")
 *   name        string        — user-defined name, e.g. "Japan Spring 2026"
 *   dateStart   string        — ISO date "YYYY-MM-DD"
 *   dateEnd     string        — ISO date "YYYY-MM-DD"
 *   tier        string        — "budget" | "mid" | "luxury"
 *   status      string        — "planned" | "completed"
 *   stops       Stop[]        — ordered list of destination stops
 *   wonderAddons WonderAddon[] — optional wonders to visit on this plan
 *   notes       string|null   — free text
 * }
 *
 * Stop {
 *   country         string   — display name matching nameIndex / CONTINENTS
 *   nights          number   — nights in this country (≥ 1)
 *   dailyRate       number   — estimated daily spend in EUR
 *   flightCost      number   — one-way flight cost in EUR (0 if none / included)
 *   flightIncluded  boolean  — true = flight cost is already counted in budget
 * }
 *
 * WonderAddon {
 *   wonderName    string   — must match an entry in window.WONDERS_ALL
 *   entranceFee   number   — EUR, hardcoded per wonder (can be 0)
 *   included      boolean  — user toggles whether to count this in the budget
 * }
 *
 * Storage key : window.STORAGE_KEYS.tripPlans  ("travel_trip_plans_v1")
 * Format      : JSON array of TripPlan objects
 *
 * Load order in index.html:
 *   migration.js → planner.js → trips.js → map.js → …
 *
 * Exposes:
 *   window.PlanStore   — public API (see below)
 */

(function () {

  // ── Constants ────────────────────────────────────────────────────────────────

  const VALID_TIERS    = ['budget', 'mid', 'luxury'];
  const VALID_STATUSES = ['planned', 'completed'];

  // ── Internal helpers ─────────────────────────────────────────────────────────

  /** Always read STORAGE_KEYS live — migration.js sets it before us. */
  function key() { return window.STORAGE_KEYS.tripPlans; }

  function loadPlans() {
    try {
      const raw = localStorage.getItem(key());
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('[planner] Failed to load plans from localStorage:', e);
      return [];
    }
  }

  function savePlans(plans) {
    try {
      localStorage.setItem(key(), JSON.stringify(plans));
      window.tripPlans = plans;   // keep in-memory cache in sync
    } catch (e) {
      console.error('[planner] Failed to persist plans to localStorage:', e);
    }
  }

  function generatePlanId() {
    const rand = Math.floor(Math.random() * 0xffff).toString(16).padStart(4, '0');
    return `plan_${Date.now()}_${rand}`;
  }

  // ── Validation ───────────────────────────────────────────────────────────────

  /**
   * Validates a TripPlan object.
   * Returns { valid: boolean, errors: string[] }
   */
  function validatePlan(plan) {
    const errors = [];

    if (!plan || typeof plan !== 'object') {
      return { valid: false, errors: ['Plan must be an object'] };
    }
    if (!plan.name || typeof plan.name !== 'string' || !plan.name.trim()) {
      errors.push('Name is required');
    }
    if (!plan.dateStart) {
      errors.push('Start date is required');
    }
    if (!plan.dateEnd) {
      errors.push('End date is required');
    }
    if (plan.dateStart && plan.dateEnd && plan.dateStart > plan.dateEnd) {
      errors.push('Start date must be on or before end date');
    }
    if (!VALID_TIERS.includes(plan.tier)) {
      errors.push(`tier must be one of: ${VALID_TIERS.join(', ')}`);
    }
    if (!VALID_STATUSES.includes(plan.status)) {
      errors.push(`status must be one of: ${VALID_STATUSES.join(', ')}`);
    }
    if (!Array.isArray(plan.stops)) {
      errors.push('stops must be an array');
    } else {
      plan.stops.forEach((stop, i) => {
        const se = validateStop(stop);
        se.forEach(msg => errors.push(`Stop ${i + 1}: ${msg}`));
      });
    }
    if (!Array.isArray(plan.wonderAddons)) {
      errors.push('wonderAddons must be an array');
    }

    return { valid: errors.length === 0, errors };
  }

  function validateStop(stop) {
    const errors = [];
    if (!stop || typeof stop !== 'object') return ['must be an object'];
    if (!stop.country || typeof stop.country !== 'string' || !stop.country.trim()) {
      errors.push('country is required');
    }
    if (typeof stop.nights !== 'number' || stop.nights < 1) {
      errors.push('nights must be a number ≥ 1');
    }
    if (typeof stop.dailyRate !== 'number' || stop.dailyRate < 0) {
      errors.push('dailyRate must be a non-negative number');
    }
    if (typeof stop.flightCost !== 'number' || stop.flightCost < 0) {
      errors.push('flightCost must be a non-negative number');
    }
    if (typeof stop.flightIncluded !== 'boolean') {
      errors.push('flightIncluded must be a boolean');
    }
    return errors;
  }

  // ── Sanitisers ───────────────────────────────────────────────────────────────

  /**
   * Sanitises a raw plan object — strips unknown fields, normalises types.
   * Does NOT re-validate (caller did that).
   */
  function sanitisePlan(raw) {
    return {
      id:           String(raw.id || generatePlanId()).trim(),
      name:         String(raw.name).trim(),
      dateStart:    raw.dateStart,
      dateEnd:      raw.dateEnd,
      tier:         VALID_TIERS.includes(raw.tier)       ? raw.tier    : 'mid',
      status:       VALID_STATUSES.includes(raw.status)  ? raw.status  : 'planned',
      stops:        Array.isArray(raw.stops)
                      ? raw.stops.map(sanitiseStop).filter(Boolean)
                      : [],
      wonderAddons: Array.isArray(raw.wonderAddons)
                      ? raw.wonderAddons.map(sanitiseWonderAddon).filter(Boolean)
                      : [],
      notes:        typeof raw.notes === 'string' ? raw.notes : null,
    };
  }

  function sanitiseStop(raw) {
    if (!raw || typeof raw !== 'object') return null;
    return {
      country:        typeof raw.country === 'string' ? raw.country.trim() : '',
      nights:         typeof raw.nights   === 'number' && raw.nights >= 1 ? raw.nights : 1,
      dailyRate:      typeof raw.dailyRate  === 'number' && raw.dailyRate  >= 0 ? raw.dailyRate  : 0,
      flightCost:     typeof raw.flightCost === 'number' && raw.flightCost >= 0 ? raw.flightCost : 0,
      flightIncluded: raw.flightIncluded === true,
    };
  }

  function sanitiseWonderAddon(raw) {
    if (!raw || typeof raw !== 'object') return null;
    if (!raw.wonderName || typeof raw.wonderName !== 'string') return null;
    return {
      wonderName:   raw.wonderName.trim(),
      entranceFee:  typeof raw.entranceFee === 'number' && raw.entranceFee >= 0 ? raw.entranceFee : 0,
      included:     raw.included === true,
    };
  }

  // ── Budget calculation ────────────────────────────────────────────────────────

  /**
   * Computes the total estimated budget for a plan in EUR.
   *
   * Breakdown:
   *   accommodation + living : sum of (stop.nights × stop.dailyRate) per stop
   *   flights                : sum of stop.flightCost for stops where !flightIncluded
   *   wonders                : sum of addon.entranceFee for addons where addon.included
   *
   * Returns { accommodation, flights, wonders, total }
   */
  function calcBudget(plan) {
    let accommodation = 0;
    let flights       = 0;
    let wonders       = 0;

    (plan.stops || []).forEach(stop => {
      accommodation += (stop.nights || 0) * (stop.dailyRate || 0);
      if (!stop.flightIncluded) flights += (stop.flightCost || 0);
    });

    (plan.wonderAddons || []).forEach(addon => {
      if (addon.included) wonders += (addon.entranceFee || 0);
    });

    return {
      accommodation: Math.round(accommodation),
      flights:       Math.round(flights),
      wonders:       Math.round(wonders),
      total:         Math.round(accommodation + flights + wonders),
    };
  }

  // ── Duration ──────────────────────────────────────────────────────────────────

  /**
   * Returns the total number of nights across all stops.
   * Falls back to the date range when stops are empty.
   */
  function getPlanNights(plan) {
    if (plan.stops && plan.stops.length > 0) {
      return plan.stops.reduce((sum, s) => sum + (s.nights || 0), 0);
    }
    if (!plan.dateStart || !plan.dateEnd) return 0;
    return Math.max(0, Math.round(
      (new Date(plan.dateEnd) - new Date(plan.dateStart)) / 86400000
    ));
  }

  // ── Public API ────────────────────────────────────────────────────────────────

  const PlanStore = {

    // ── CRUD ──────────────────────────────────────────────────────────────────

    /**
     * Returns all plans, newest (by dateStart) first.
     * @returns {TripPlan[]}
     */
    getPlans() {
      return loadPlans().slice().sort((a, b) => {
        if (a.dateStart > b.dateStart) return -1;
        if (a.dateStart < b.dateStart) return  1;
        return 0;
      });
    },

    /**
     * Returns a single plan by id, or null.
     * @param {string} id
     * @returns {TripPlan|null}
     */
    getPlanById(id) {
      return loadPlans().find(p => p.id === id) || null;
    },

    /**
     * Saves a plan — inserts if new, updates if existing.
     * Assigns a generated id when none is provided.
     * Returns { success, errors, plan }.
     *
     * @param {Object} planData
     * @returns {{ success: boolean, errors: string[], plan: TripPlan|null }}
     */
    savePlan(planData) {
      const plan = {
        // Defaults for optional fields
        tier:         'mid',
        status:       'planned',
        stops:        [],
        wonderAddons: [],
        notes:        null,
        ...planData,
      };

      if (!plan.id) plan.id = generatePlanId();
      if (plan.name) plan.name = String(plan.name).trim();

      const { valid, errors } = validatePlan(plan);
      if (!valid) return { success: false, errors, plan: null };

      const plans = loadPlans();
      const idx   = plans.findIndex(p => p.id === plan.id);

      if (idx >= 0) plans[idx] = plan;
      else           plans.push(plan);

      savePlans(plans);
      return { success: true, errors: [], plan };
    },

    /**
     * Deletes a plan by id.
     * @param {string} id
     * @returns {{ success: boolean, found: boolean }}
     */
    deletePlan(id) {
      const plans = loadPlans();
      const idx   = plans.findIndex(p => p.id === id);
      if (idx < 0) return { success: false, found: false };
      plans.splice(idx, 1);
      savePlans(plans);
      return { success: true, found: true };
    },

    /**
     * Updates specific fields of an existing plan without a full replace.
     * Useful for small UI patches (e.g. toggling a wonder addon).
     * Validates after merge and rejects if invalid.
     *
     * @param {string} id
     * @param {Partial<TripPlan>} patch
     * @returns {{ success: boolean, errors: string[], plan: TripPlan|null }}
     */
    updatePlan(id, patch) {
      const existing = this.getPlanById(id);
      if (!existing) return { success: false, errors: ['Plan not found'], plan: null };
      return this.savePlan({ ...existing, ...patch, id });
    },

    /**
     * Marks a plan as completed (or back to planned if already completed).
     * @param {string} id
     * @returns {{ success: boolean, errors: string[], plan: TripPlan|null }}
     */
    markCompleted(id) {
      const plan = this.getPlanById(id);
      if (!plan) return { success: false, errors: ['Plan not found'], plan: null };
      const newStatus = plan.status === 'completed' ? 'planned' : 'completed';
      return this.updatePlan(id, { status: newStatus });
    },

    // ── Query helpers ──────────────────────────────────────────────────────────

    /**
     * Returns all plans that include a given country name in their stops.
     * @param {string} countryName
     * @returns {TripPlan[]}
     */
    getPlansForCountry(countryName) {
      const norm = countryName.trim().toLowerCase();
      return loadPlans().filter(p =>
        Array.isArray(p.stops) &&
        p.stops.some(s => s.country.trim().toLowerCase() === norm)
      );
    },

    /**
     * Returns all plans with a given status.
     * @param {'planned'|'completed'} status
     * @returns {TripPlan[]}
     */
    getPlansByStatus(status) {
      return loadPlans().filter(p => p.status === status);
    },

    /**
     * Calculates the estimated budget for a plan.
     * @param {TripPlan} plan
     * @returns {{ accommodation: number, flights: number, wonders: number, total: number }}
     */
    calcBudget,

    /**
     * Returns total nights for a plan (sum of stop nights, or from dates).
     * @param {TripPlan} plan
     * @returns {number}
     */
    getPlanNights,

    // ── Sanitise (used by compat.js on import) ────────────────────────────────

    sanitisePlan,

    // ── Initialization ─────────────────────────────────────────────────────────

    /**
     * Loads plans from localStorage into window.tripPlans.
     * Called by migration.js / compat.js after import.
     */
    init() {
      window.tripPlans = loadPlans();
      console.info(`[planner] Initialized. ${window.tripPlans.length} plan(s) loaded.`);
    },
  };

  // ── Expose globally ──────────────────────────────────────────────────────────

  window.PlanStore = PlanStore;

  PlanStore.init();

})();
